import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import AlunoDashboard from '@/components/dashboards/AlunoDashboard';
import { redirect } from 'next/navigation';

export default async function AlunoPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  // Busca o perfil do aluno
  const profile = await prisma.profile.findFirst({
    where: {
      username: session.user.email,
    },
  });

  if (!profile || profile.role !== 'ALUNO') {
    redirect('/dashboard'); // Redireciona para o dashboard geral se não for aluno
  }

  // Busca os dados do aluno para descobrir sua turma
  const aluno = await prisma.student.findFirst({
    where: { profileId: profile.id },
  });

  if (!aluno) {
    throw new Error('Dados do aluno não encontrados');
  }

  // Busca todas as aulas da turma do aluno
  const aulas = await prisma.lesson.findMany({
    where: {
      classId: aluno.classId,
    },
    include: {
      subject: true,
      class: true,
    },
  });

  return <AlunoDashboard profile={profile} aulas={aulas} />;
}
