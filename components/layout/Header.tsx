// components/layout/Header.tsx
import LogoutButton from '@/components/auth/LogoutButton';
import { getUserProfile } from '@/lib/auth';
import { Client, Account } from 'appwrite';
import { cookies } from 'next/headers';

/**
 * Componente de cabeçalho do dashboard
 * Exibe informações do usuário logado e botão de logout
 * Utiliza Server Component para buscar dados do usuário
 */
export default async function Header() {
  const profile = await getUserProfile();
  
  // Se não há perfil, tentar obter dados do usuário diretamente do Appwrite
   let userEmail = '';
   if (profile) {
     userEmail = profile.username || '';
  } else {
    try {
      const cookieStore = await cookies();
      const session = cookieStore.get('appwrite-session');
      
      if (session) {
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
          .setSession(session.value);
        
        const account = new Account(client);
        const user = await account.get();
        userEmail = user.email;
      }
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
    }
  }

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div /> {/* Espaço à esquerda */}
      <div className="flex items-center gap-4">
        <span>{userEmail ? `Olá, ${userEmail}` : ''}</span>
        <LogoutButton />
      </div>
    </header>
  );
}