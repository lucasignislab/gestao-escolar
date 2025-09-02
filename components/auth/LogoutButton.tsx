// components/auth/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/**
 * Componente de botão para logout do usuário
 * Realiza o logout via Supabase e redireciona para a página de login
 */
export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  /**
   * Manipula o processo de logout do usuário
   * Encerra a sessão no Supabase e redireciona para login
   */
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Erro ao sair: " + error.message);
    } else {
      router.push('/login');
      router.refresh();
    }
  };

  return <Button variant="destructive" onClick={handleLogout}>Sair</Button>;
}