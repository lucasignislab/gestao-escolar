// app/dashboard/professores/page.tsx 
import { PrismaClient } from '@prisma/client'; 
import { columns } from './columns'; 
import { DataTable } from '@/components/DataTable'; 
import ProfessorPageClient from './ProfessorPageClient';

const prisma = new PrismaClient();

export default async function ProfessoresPage() {
  // Esta página busca os dados no servidor 
  const professores = await prisma.teacher.findMany();

  // E passa para um componente de cliente que gerencia a interatividade 
  return <ProfessorPageClient professores={professores} />;
}