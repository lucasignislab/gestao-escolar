// scripts/create-appwrite-admin.js
require('dotenv').config();
const { Client, Users, ID } = require('node-appwrite');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configurar cliente Appwrite com chave de API
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);

async function createAdminUser() {
  try {
    console.log('👤 Criando usuário administrador no Appwrite...');
    
    const email = 'admin@escola.com';
    const password = 'admin123';
    const username = 'admin';
    
    // Primeiro, verificar se o usuário já existe no banco local
    const existingProfile = await prisma.profile.findFirst({
      where: { username }
    });
    
    if (existingProfile) {
      console.log('❌ Usuário já existe no banco local');
      return;
    }
    
    // Criar usuário no Appwrite
    const user = await users.create(
      ID.unique(),
      email,
      undefined, // phone
      password,
      username
    );
    
    console.log('✅ Usuário criado no Appwrite:', user.$id);
    
    // Criar perfil no banco local
    const profile = await prisma.profile.create({
      data: {
        id: user.$id,
        username,
        email,
        role: 'ADMIN',
        nome: 'Administrador',
        sobrenome: 'Sistema'
      }
    });
    
    console.log('✅ Perfil criado no banco local:', profile.id);
    console.log('🎉 Usuário administrador criado com sucesso!');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();