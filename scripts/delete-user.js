// scripts/delete-user.js
const { PrismaClient } = require('@prisma/client');
const { Client, Users } = require('node-appwrite');

const prisma = new PrismaClient();

// Configuração do Appwrite (usando API key para operações admin)
const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const appwriteProject = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
const appwriteApiKey = process.env.APPWRITE_API_KEY; // Chave de API necessária para operações admin

if (!appwriteEndpoint || !appwriteProject || !appwriteApiKey) {
  console.error('❌ Variáveis de ambiente NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT e APPWRITE_API_KEY são necessárias');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(appwriteEndpoint)
  .setProject(appwriteProject)
  .setKey(appwriteApiKey);

const users = new Users(client);

async function deleteUser(email) {
  try {
    console.log(`🗑️  Deletando usuário com email: ${email}`);
    
    // 1. Buscar o usuário no Appwrite Auth pelo email
    console.log('🔍 Buscando usuário no Appwrite Auth...');
    const usersList = await users.list();
    
    const user = usersList.users.find(u => u.email === email);
    
    if (!user) {
      console.log('⚠️  Usuário não encontrado no Appwrite Auth');
    } else {
      console.log(`✅ Usuário encontrado no Appwrite Auth: ${user.$id}`);
      
      // 2. Deletar dados relacionados no banco local primeiro
      console.log('🗑️  Deletando dados do banco local...');
      
      // Buscar o profile do usuário
      const profile = await prisma.profile.findUnique({
        where: { id: user.$id },
        include: {
          teacher: true,
          student: true,
          parent: true
        }
      });
      
      if (profile) {
        console.log(`📋 Profile encontrado: ${profile.username} (${profile.role})`);
        
        // Deletar registros relacionados baseado no role
        if (profile.teacher) {
          console.log('🗑️  Deletando dados de professor...');
          await prisma.teacher.delete({ where: { id: profile.teacher.id } });
        }
        
        if (profile.student) {
          console.log('🗑️  Deletando dados de aluno...');
          await prisma.student.delete({ where: { id: profile.student.id } });
        }
        
        if (profile.parent) {
          console.log('🗑️  Deletando dados de responsável...');
          await prisma.parent.delete({ where: { id: profile.parent.id } });
        }
        
        // Deletar o profile
        await prisma.profile.delete({ where: { id: user.$id } });
        console.log('✅ Dados do banco local deletados');
      } else {
        console.log('⚠️  Profile não encontrado no banco local');
      }
      
      // 3. Deletar o usuário do Appwrite Auth
      console.log('🗑️  Deletando usuário do Appwrite Auth...');
      try {
        await users.delete(user.$id);
        console.log('✅ Usuário deletado do Appwrite Auth');
      } catch (deleteError) {
        console.error('❌ Erro ao deletar usuário do Appwrite Auth:', deleteError.message);
      }
    }
    
    console.log('🎉 Processo de deleção concluído!');
    console.log('📝 Agora você pode criar uma nova conta com este email.');
    
  } catch (error) {
    console.error('❌ Erro durante o processo de deleção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a função com o email fornecido
const emailToDelete = 'lucascoelho.cps@gmail.com';
deleteUser(emailToDelete);