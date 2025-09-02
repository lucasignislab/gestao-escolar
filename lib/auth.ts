// lib/auth.ts
import { createServerClient } from '@supabase/ssr';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

/**
 * Busca o perfil do usuário autenticado
 * Combina autenticação do Supabase com dados do perfil no Prisma
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

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    return profile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};