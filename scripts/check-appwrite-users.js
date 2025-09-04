// scripts/check-appwrite-users.js
require('dotenv').config();
const { Client, Users } = require('node-appwrite');

// Configurar cliente Appwrite com chave de API
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);

async function checkAppwriteUsers() {
  try {
    console.log('🔍 Verificando usuários no Appwrite...');
    
    // Listar todos os usuários
    const usersList = await users.list();
    
    if (usersList.total === 0) {
      console.log('❌ Nenhum usuário encontrado no Appwrite');
    } else {
      console.log(`✅ Encontrados ${usersList.total} usuário(s) no Appwrite:`);
      usersList.users.forEach((user, index) => {
        console.log(`\n${index + 1}. ID: ${user.$id}`);
        console.log(`   Nome: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Status: ${user.status ? 'Ativo' : 'Inativo'}`);
        console.log(`   Email Verificado: ${user.emailVerification ? 'Sim' : 'Não'}`);
        console.log(`   Criado em: ${new Date(user.$createdAt).toLocaleString()}`);
      });
    }
    
    // Verificar usuários específicos do banco local
    const localUserIds = ['lu6980', 'admin-default'];
    
    console.log('\n🔍 Verificando usuários locais no Appwrite...');
    
    for (const userId of localUserIds) {
      try {
        const user = await users.get(userId);
        console.log(`\n✅ Usuário ${userId} encontrado no Appwrite:`);
        console.log(`   Nome: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Status: ${user.status ? 'Ativo' : 'Inativo'}`);
      } catch (error) {
        console.log(`\n❌ Usuário ${userId} NÃO encontrado no Appwrite:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários no Appwrite:', error);
  }
}

checkAppwriteUsers();