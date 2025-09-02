// scripts/reset-database.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🗑️  Limpando banco de dados...');
    
    // Deletar todos os registros em ordem (devido às foreign keys)
    await prisma.result.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.exam.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.class.deleteMany();
    await prisma.parent.deleteMany();
    await prisma.student.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.profile.deleteMany();
    
    console.log('✅ Banco de dados limpo com sucesso!');
    console.log('📝 Agora você pode criar uma nova conta.');
  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();