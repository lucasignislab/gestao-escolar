// lib/client-auth.ts
'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Profile } from '@prisma/client';

/**
 * Busca o perfil do usuário autenticado no lado do cliente
 * @returns Profile do usuário ou null se não autenticado
 */
export const getCurrentUserProfileClient = async (): Promise<Profile | null> => {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    // Buscar o perfil através de uma API route
    const response = await fetch('/api/profile');
    if (!response.ok) {
      return null;
    }

    const profile = await response.json();
    return profile;
  } catch (error) {
    console.error('Error getting user profile on client:', error);
    return null;
  }
};