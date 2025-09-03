// app/dashboard/alunos/page.tsx
import { PrismaClient } from '@prisma/client'; 
import AlunoPageClient from './AlunoPageClient';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

/**
 * Página principal para gerenciamento de alunos
 * Inclui listagem, adição, edição e exclusão de alunos
 */
export default async function AlunosPage() {
  // Busca os dados principais e os dados para os relacionamentos 
  const alunos = await prisma.student.findMany({ 
    include: { 
      class: true, 
      parent: true,
      grade: true // Incluindo a relação grade para corresponder ao tipo StudentWithRelations
    } 
  }); 
  const turmas = await prisma.class.findMany(); 
  const responsaveis = await prisma.parent.findMany(); 

  // E passa para um componente de cliente que gerencia a interatividade 
  return ( 
    <AlunoPageClient 
      alunos={alunos} 
      turmas={turmas} 
      responsaveis={responsaveis} 
    /> 
  );

}