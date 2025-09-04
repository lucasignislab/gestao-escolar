import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar Anos Escolares (1º ao 9º ano)
    console.log('📚 Criando Anos Escolares...');
    const anos = Array.from({ length: 9 }, (_, i) => i + 1);
    for (const nivel of anos) {
      await prisma.grade.upsert({
        where: { level: nivel },
        update: {},
        create: {
          level: nivel,
        },
      });
    }
    console.log('✅ Anos Escolares criados com sucesso!');

    // Criar usuário administrador padrão
    console.log('👤 Criando usuário administrador padrão...');
    const adminEmail = 'admin@escola.com';
    const adminPassword = await hash('admin123', 10); // Em produção, use uma senha mais segura

    const adminProfile = await prisma.profile.upsert({
      where: { id: 'admin-default' },
      update: {},
      create: {
        id: 'admin-default',
        username: 'admin',
        role: Role.ADMIN,
      },
    });

    console.log('✅ Usuário administrador criado com sucesso!');

    // Criar algumas turmas padrão
    console.log('🏫 Criando turmas padrão...');
    const turmas = [
      { name: '1A', gradeLevel: 1, capacity: 30 },
      { name: '1B', gradeLevel: 1, capacity: 30 },
      { name: '2A', gradeLevel: 2, capacity: 30 },
      { name: '2B', gradeLevel: 2, capacity: 30 },
      { name: '3A', gradeLevel: 3, capacity: 30 },
      { name: '3B', gradeLevel: 3, capacity: 30 },
    ];

    for (const turma of turmas) {
      const grade = await prisma.grade.findUnique({
        where: { level: turma.gradeLevel },
      });

      if (grade) {
        await prisma.class.upsert({
          where: { name: turma.name },
          update: {},
          create: {
            name: turma.name,
            capacity: turma.capacity,
            gradeId: grade.id,
          },
        });
      }
    }
    console.log('✅ Turmas padrão criadas com sucesso!');

    // Criar algumas matérias padrão
    console.log('📖 Criando matérias padrão...');
    const materias = [
      'Matemática',
      'Português',
      'História',
      'Geografia',
      'Ciências',
      'Educação Física',
      'Artes',
      'Inglês',
    ];

    for (const materia of materias) {
      await prisma.subject.upsert({
        where: { name: materia },
        update: {},
        create: {
          name: materia,
        },
      });
    }
    console.log('✅ Matérias padrão criadas com sucesso!');

    console.log('✨ Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  });
