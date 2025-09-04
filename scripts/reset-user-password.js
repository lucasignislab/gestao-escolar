// scripts/reset-user-password.js
require('dotenv').config();
const { Client, Users } = require('node-appwrite');

// Configurar cliente Appwrite com chave de API
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);

async function resetUserPassword() {
  try {
    const userId = 'lu6980';
    const newPassword = 'admin123';
    
    console.log('🔑 Redefinindo senha do usuário:', userId);
    
    // Atualizar a senha do usuário
    const user = await users.updatePassword(userId, newPassword);
    
    console.log('✅ Senha redefinida com sucesso!');
    console.log('📧 Email:', user.email);
    console.log('🔑 Nova senha: admin123');
    
  } catch (error) {
    console.error('❌ Erro ao redefinir senha:', error);
  }
}

resetUserPassword();