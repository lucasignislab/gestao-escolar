// components/layout/Header.tsx
import LogoutButton from '@/components/auth/LogoutButton';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Componente de cabeçalho do dashboard
 * Exibe informações do usuário logado e botão de logout
 * Utiliza Server Component para buscar dados do usuário
 */
export default async function Header() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div /> {/* Espaço à esquerda */}
      <div className="flex items-center gap-4">
        <span>{user ? `Olá, ${user.email}` : ''}</span>
        <LogoutButton />
      </div>
    </header>
  );
}