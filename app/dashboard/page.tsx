// app/dashboard/page.tsx

import { getUserProfile } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import ProfessorDashboard from '@/components/dashboard/ProfessorDashboard';
import AlunoDashboard from '@/components/dashboard/AlunoDashboard';
import ResponsavelDashboard from '@/components/dashboard/ResponsavelDashboard';

const prisma = new PrismaClient();

/**
 * Página principal do dashboard
 * Renderiza o dashboard correto com base no papel do usuário
 */
export default async function DashboardPage() {
  const profile = await getUserProfile();

  // Se não há perfil, redirecionar para login (isso deveria ser tratado pelo middleware)
  if (!profile) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p>Você precisa estar logado para acessar esta página.</p>
      </div>
    );
  }

  // Dashboard para ADMIN
  if (profile.role === 'ADMIN') {
    const totalAlunos = await prisma.student.count();
    const totalProfessores = await prisma.teacher.count();
    const totalTurmas = await prisma.class.count();

    // Consulta mais complexa: contar alunos por ano escolar usando groupBy
    const alunosPorAno = await prisma.student.groupBy({
      by: ['gradeId'],
      _count: {
        id: true,
      },
    });

    // Buscar os nomes dos anos para exibir no gráfico
    const grades = await prisma.grade.findMany({
      where: {
        id: {
          in: alunosPorAno.map(item => item.gradeId)
        }
      },
      select: {
        id: true,
        level: true
      }
    });

    // Combinar dados para criar estrutura para gráficos
    const dadosGrafico = alunosPorAno.map(item => {
      const grade = grades.find(g => g.id === item.gradeId);
      return {
        anoEscolar: `${grade?.level}º Ano`,
        totalAlunos: item._count.id,
        gradeId: item.gradeId
      };
    }).sort((a, b) => {
      // Ordenar por nível do ano escolar
      const levelA = parseInt(a.anoEscolar.replace('º Ano', ''));
      const levelB = parseInt(b.anoEscolar.replace('º Ano', ''));
      return levelA - levelB;
    });

    return (
      <AdminDashboard 
        stats={{ 
          totalAlunos, 
          totalProfessores, 
          totalTurmas 
        }}
        chartData={dadosGrafico}
      />
    );
  }

  // Dashboard para PROFESSOR
  if (profile.role === 'PROFESSOR') {
    const aulas = await prisma.lesson.findMany({
      where: {
        teacher: {
          profileId: profile.id, // Encontra o professor pelo ID do perfil
        },
      },
      include: { subject: true, class: true },
    });
    
    // Renderize o ProfessorDashboard passando as aulas
    return <ProfessorDashboard aulas={aulas} />;
  }

  // Dashboard para ALUNO
  if (profile.role === 'ALUNO') {
    return <AlunoDashboard profile={profile} />;
  }

  // Dashboard para RESPONSAVEL
  if (profile.role === 'RESPONSAVEL') {
    return <ResponsavelDashboard profile={profile} />;
  }

  // Fallback para papéis não reconhecidos
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Papel de usuário não reconhecido: {profile.role}</p>
    </div>
  );
}