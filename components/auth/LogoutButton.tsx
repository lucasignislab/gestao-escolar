// components/auth/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/appwrite';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * Componente de botão para logout do usuário
 * Realiza o logout via Appwrite e redireciona para a página de login
 */
export default function LogoutButton() {
  const router = useRouter();
  const { account } = createClient();

  /**
   * Manipula o processo de logout do usuário
   * Encerra a sessão no Appwrite e redireciona para login
   */
  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      
      // Remover cookie de sessão
      document.cookie = 'appwrite-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      router.push('/login');
      router.refresh();
    } catch (error: any) {
      toast.error("Erro ao sair: " + (error.message || 'Erro desconhecido'));
    }
  };

  return <Button variant="destructive" onClick={handleLogout}>Sair</Button>;
}