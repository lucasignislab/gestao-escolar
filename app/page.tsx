import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    // Tenta obter o perfil do usuário
    const profile = await getUserProfile();
    
    if (profile) {
      // Se o usuário está logado, redireciona para o dashboard
      redirect('/dashboard');
    } else {
      // Se não está logado, redireciona para a página de login
      redirect('/login');
    }
  } catch (error) {
    // Em caso de erro, redireciona para a página de login
    redirect('/login');
  }

  // Esta parte nunca será executada devido aos redirects acima
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Sistema de Gestão Escolar</h1>
        <p className="text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}
