// app/dashboard/page.tsx 
import { getUserProfile } from '@/lib/auth'; 
import AdminDashboard from '@/components/dashboards/AdminDashboard'; 
// Futuramente, importaremos os outros dashboards aqui 
// import ProfessorDashboard from '@/components/dashboard/ProfessorDashboard'; 
// import AlunoDashboard from '@/components/dashboard/AlunoDashboard';

// Adicionar suporte para requisições POST
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Função para lidar com requisições POST
export async function POST() {
  // Apenas retorna a mesma página que GET
  const profile = await getUserProfile();
  return Response.json({ success: true, role: profile?.role });
} 

export default async function DashboardPage() { 
  const profile = await getUserProfile(); 

  // Se não encontrar um perfil, mostra uma mensagem de erro. 
  if (!profile) { 
    return <div>Não foi possível carregar as informações do usuário.</div>; 
  } 

  // Renderiza o dashboard correspondente ao papel do usuário 
  switch (profile.role) { 
    case 'ADMIN': 
      return <AdminDashboard />; 
    case 'PROFESSOR': 
      // return <ProfessorDashboard profile={profile} />; 
      return <div>Dashboard do Professor em construção...</div>; 
    case 'ALUNO': 
      // return <AlunoDashboard profile={profile} />; 
      return <div>Dashboard do Aluno em construção...</div>; 
    case 'RESPONSAVEL': 
      // return <ResponsavelDashboard profile={profile} />; 
      return <div>Dashboard do Responsável em construção...</div>; 
    default: 
      return <div>Seu dashboard não está disponível.</div>; 
  } 
}