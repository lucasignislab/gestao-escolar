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
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    let profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    // Se o usuário está autenticado mas não tem perfil, criar um perfil padrão
    if (!profile && user) {
      console.log('Usuário autenticado sem perfil, criando perfil padrão:', user.id);
      profile = await prisma.profile.create({
        data: {
          id: user.id,
          username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
          role: 'ADMIN', // Perfil padrão como ADMIN para facilitar o acesso inicial
        },
      });
      console.log('Perfil criado:', profile);
    }

    return profile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};