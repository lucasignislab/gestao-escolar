// components/auth/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * Componente de botão para logout do usuário
 * Realiza o logout via Appwrite e redireciona para a página de login
 */
export default function LogoutButton() {
  const router = useRouter();

  /**
   * Manipula o processo de logout do usuário
   * Chama a API route de logout e redireciona para login
   */
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        router.push('/login');
        router.refresh();
      } else {
        const data = await response.json();
        toast.error("Erro ao sair: " + (data.message || 'Erro desconhecido'));
      }
    } catch (error: any) {
      toast.error("Erro ao sair: " + (error.message || 'Erro desconhecido'));
    }
  };

  return <Button variant="destructive" onClick={handleLogout}>Sair</Button>;
}