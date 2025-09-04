import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import ProfessorDashboard from '@/components/dashboards/ProfessorDashboard';
import { redirect } from 'next/navigation';

export default async function ProfessorPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  // Busca o perfil do professor
  const profile = await prisma.profile.findFirst({
    where: {
      username: session.user.email,
    },
  });

  if (!profile || profile.role !== 'PROFESSOR') {
    redirect('/dashboard'); // Redireciona para o dashboard geral se não for professor
  }

  // Busca as aulas do professor
  const aulas = await prisma.lesson.findMany({
    where: {
      teacher: {
        profileId: profile.id,
      },
    },
    include: {
      subject: true,
      class: true,
    },
  });

  return <ProfessorDashboard profile={profile} aulas={aulas} />;
}
