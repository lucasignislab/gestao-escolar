// scripts/create-admin-user.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Usar a service role key para operações administrativas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createAdminUser() {
  try {
    console.log('👤 Criando usuário administrador...');
    
    const email = 'admin@sistema.com';
    const password = '123456';
    const username = 'admin';
    
    // Primeiro, verificar se o usuário já existe no banco local
    const existingProfile = await prisma.profile.findFirst({
      where: { username }
    });
    
    if (existingProfile) {
      console.log('❌ Usuário já existe no banco local');
      return;
    }
    
    // Criar usuário no Supabase com confirmação automática
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        username,
        role: 'ADMIN'
      }
    });
    
    if (authError) {
      console.log('❌ Erro ao criar usuário no Supabase:', authError.message);
      return;
    }
    
    if (!authData.user) {
      console.log('❌ Usuário não foi criado no Supabase');
      return;
    }
    
    console.log('✅ Usuário criado no Supabase:', authData.user.id);
    
    // Criar perfil no banco local
    const profile = await prisma.profile.create({
      data: {
        id: authData.user.id,
        username,
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Perfil criado no banco local:', profile);
    console.log('🎉 Usuário administrador criado com sucesso!');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    
  } catch (error) {
    console.error('❌ Erro durante a criação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();