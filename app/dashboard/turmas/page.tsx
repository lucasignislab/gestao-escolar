// app/dashboard/turmas/page.tsx 
import { PrismaClient } from '@prisma/client'; 
import TurmaPageClient from './TurmaPageClient'; 

const prisma = new PrismaClient(); 

export default async function TurmasPage() { 
  // Busca os dados principais e os dados para preencher os seletores do formulário 
  const turmas = await prisma.class.findMany({ 
    include: { 
      grade: true,      // Inclui os dados do ano escolar relacionado 
      supervisor: true, // Inclui os dados do professor supervisor relacionado 
      _count: {
        select: {
          students: true // Inclui a contagem de alunos na turma
        }
      }
    }, 
    orderBy: { 
      name: 'asc' 
    } 
  }); 
  const anosEscolares = await prisma.grade.findMany(); 
  const professores = await prisma.teacher.findMany(); 

  return ( 
    <TurmaPageClient 
      turmas={turmas} 
      anosEscolares={anosEscolares} 
      professores={professores} 
    /> 
  ); 
}