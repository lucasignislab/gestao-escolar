// app/dashboard/turmas/page.tsx
import { PrismaClient } from '@prisma/client';
import TurmasClient from './TurmasClient';

const prisma = new PrismaClient();

export default async function TurmasPage() {
  // Buscar dados necessários no servidor
  const [turmas, professores, anosEscolares] = await Promise.all([
    prisma.class.findMany({
      include: {
        grade: {
          select: {
            id: true,
            level: true,
          },
        },
        supervisor: {
          select: {
            id: true,
            name: true,
            surname: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        surname: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.grade.findMany({
      select: {
        id: true,
        level: true,
      },
      orderBy: {
        level: 'asc',
      },
    }),
  ]);

  return (
    <TurmasClient 
      initialTurmas={turmas}
      professores={professores}
      anosEscolares={anosEscolares}
    />
  );
}