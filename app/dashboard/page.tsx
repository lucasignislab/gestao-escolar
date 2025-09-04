// app/dashboard/page.tsx 
import { getUserProfile } from '@/lib/auth'; 
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import ProfessorDashboard from '@/components/dashboards/ProfessorDashboard';
import AlunoDashboard from '@/components/dashboards/AlunoDashboard';
import { prisma } from '@/lib/prisma';

// Função para buscar aulas do professor
async function getProfessorAulas(profileId: string) {
  return prisma.lesson.findMany({
    where: {
      teacher: {
        profileId,
      },
    },
    include: {
      subject: true,
      class: true,
    },
  });
}

// Função para buscar aulas do aluno
async function getAlunoAulas(profileId: string) {
  const aluno = await prisma.student.findFirst({
    where: { profileId },
  });

  if (!aluno) {
    return null;
  }

  return prisma.lesson.findMany({
    where: {
      classId: aluno.classId,
    },
    include: {
      subject: true,
      class: true,
    },
  });
}

// Adicionar suporte para renderização dinâmica
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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
    case 'PROFESSOR': {
      const professorAulas = await getProfessorAulas(profile.id);
      return <ProfessorDashboard profile={profile} aulas={professorAulas} />; 
    }
    case 'ALUNO': {
      const alunoAulas = await getAlunoAulas(profile.id);
      
      if (!alunoAulas) {
        return <div>Não foi possível encontrar os dados do aluno.</div>;
      }
      
      return <AlunoDashboard profile={profile} aulas={alunoAulas} />; 
    }
    case 'RESPONSAVEL': 
      // return <ResponsavelDashboard profile={profile} />; 
      return <div>Dashboard do Responsável em construção...</div>; 
    default: 
      return <div>Seu dashboard não está disponível.</div>; 
  } 
}