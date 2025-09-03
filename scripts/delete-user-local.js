// scripts/delete-user-local.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteUserLocal(email) {
  try {
    console.log(`🗑️  Deletando usuário local com email: ${email}`);
    
    // 1. Buscar usuários relacionados ao email no banco local
    console.log('🔍 Buscando dados no banco local...');
    
    // Buscar em Teacher
    const teacher = await prisma.teacher.findUnique({
      where: { email },
      include: { profile: true }
    });
    
    if (teacher) {
      console.log(`👨‍🏫 Professor encontrado: ${teacher.name} ${teacher.surname}`);
      console.log('🗑️  Deletando dados de professor...');
      await prisma.teacher.delete({ where: { id: teacher.id } });
      
      if (teacher.profile) {
        console.log('🗑️  Deletando profile do professor...');
        await prisma.profile.delete({ where: { id: teacher.profileId } });
      }
      console.log('✅ Professor deletado com sucesso');
    }
    
    // Modelo Student não possui campo email, então não precisamos buscar aqui
    
    // Buscar em Parent
    const parents = await prisma.parent.findMany({
      where: { email },
      include: { profile: true }
    });
    
    for (const parent of parents) {
      console.log(`👨‍👩‍👧‍👦 Responsável encontrado: ${parent.name} ${parent.surname}`);
      console.log('🗑️  Deletando dados de responsável...');
      await prisma.parent.delete({ where: { id: parent.id } });
      
      if (parent.profile) {
        console.log('🗑️  Deletando profile do responsável...');
        await prisma.profile.delete({ where: { id: parent.profileId } });
      }
      console.log('✅ Responsável deletado com sucesso');
    }
    
    // Buscar profiles órfãos que possam ter o email como username
    const emailUsername = email.split('@')[0];
    const orphanProfiles = await prisma.profile.findMany({
      where: {
        username: emailUsername,
        teacher: null,
        student: null,
        parent: null
      }
    });
    
    for (const profile of orphanProfiles) {
      console.log(`👤 Profile órfão encontrado: ${profile.username}`);
      console.log('🗑️  Deletando profile órfão...');
      await prisma.profile.delete({ where: { id: profile.id } });
      console.log('✅ Profile órfão deletado com sucesso');
    }
    
    if (!teacher && parents.length === 0 && orphanProfiles.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado no banco local com este email');
      console.log('💡 Isso pode significar que:');
      console.log('   - O usuário existe apenas no Appwrite Auth');
      console.log('   - O email está incorreto');
      console.log('   - O usuário já foi deletado');
    }
    
    console.log('🎉 Limpeza do banco local concluída!');
    console.log('📝 Agora você pode tentar criar uma nova conta.');
    console.log('⚠️  NOTA: Se o usuário ainda existir no Appwrite Auth, você precisará deletá-lo manualmente no console do Appwrite.');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza do banco local:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a função com o email fornecido
const emailToDelete = 'lucascoelho.cps@gmail.com';
deleteUserLocal(emailToDelete);