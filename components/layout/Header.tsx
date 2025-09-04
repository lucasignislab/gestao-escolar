// components/layout/Header.tsx
import LogoutButton from '@/components/auth/LogoutButton';
import { getUserProfile } from '@/lib/auth';
import { Client, Account } from 'appwrite';
import { cookies } from 'next/headers';
import { getAvatarUrl } from '@/lib/appwrite';
import Image from 'next/image';

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
        const client = new Client();
        
        // Verificar se as variáveis de ambiente estão definidas antes de configurar o cliente
        if (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT && process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
          client
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
            .setSession(session.value);
        }
        
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
        {profile?.avatarUrl && (
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={getAvatarUrl(profile.avatarUrl)}
              alt="Avatar do usuário"
              fill
              className="object-cover"
            />
          </div>
        )}
        <span>{userEmail ? `Olá, ${userEmail}` : ''}</span>
        <LogoutButton />
      </div>
    </header>
  );
}