// lib/auth.ts
import { createServerClient } from '@supabase/ssr';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

/**
 * Busca o perfil do usuário autenticado
 * Combina autenticação do Supabase com dados do perfil no Prisma
 * Cria automaticamente um perfil se o usuário estiver autenticado mas não tiver perfil
 * @returns Profile do usuário ou null se não autenticado
 */
export const getUserProfile = async () => {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            // Em server components, não podemos definir cookies diretamente
            // Esta função é necessária para a interface, mas não será usada
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ [getUserProfile] Erro ao obter usuário:', error.message);
      return null;
    }
    
    if (!user) {
      console.log('❌ [getUserProfile] Nenhum usuário autenticado encontrado');
      return null;
    }
    
    console.log('✅ [getUserProfile] Usuário autenticado:', user.email);

    let profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    // Se o usuário está autenticado mas não tem perfil, criar um perfil padrão
    if (!profile && user) {
      profile = await prisma.profile.create({
        data: {
          id: user.id,
          username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
          role: 'ADMIN', // Perfil padrão como ADMIN para facilitar o acesso inicial
        },
      });
    }

    return profile;
  } catch (error) {
    console.error('❌ [getUserProfile] Erro ao obter perfil do usuário:', error);
    console.error('❌ [getUserProfile] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return null;
  }
};