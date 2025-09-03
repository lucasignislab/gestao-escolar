// scripts/create-test-user.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createTestUser() {
  try {
    console.log('👤 Criando usuário de teste...');
    
    // Usar um email válido para teste
    const email = 'admin@teste.com';
    const password = '123456';
    const username = 'testuser';
    
    // Primeiro, limpar qualquer usuário existente
    await prisma.profile.deleteMany({
      where: { username }
    });
    
    console.log('🧹 Banco local limpo');
    
    // Tentar criar usuário no Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role: 'ADMIN'
        }
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
    console.log('📧 Email confirmado:', authData.user.email_confirmed_at ? 'Sim' : 'Não');
    
    // Criar perfil no banco local
    const profile = await prisma.profile.create({
      data: {
        id: authData.user.id,
        username,
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Perfil criado no banco local:', profile);
    
    // Tentar fazer login imediatamente
    console.log('🔐 Testando login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
      if (loginError.message.includes('Email not confirmed')) {
        console.log('📧 Email precisa ser confirmado. Reenviando...');
        await supabase.auth.resend({
          type: 'signup',
          email
        });
        console.log('✅ Email de confirmação reenviado para:', email);
      }
    } else {
      console.log('✅ Login bem-sucedido!');
      await supabase.auth.signOut();
    }
    
    console.log('🎉 Processo concluído!');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    
  } catch (error) {
    console.error('❌ Erro durante a criação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();