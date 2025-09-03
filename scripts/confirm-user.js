// scripts/confirm-user.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function confirmAndTestUser() {
  try {
    console.log('🔧 Tentando confirmar usuário existente...');
    
    // Primeiro, vamos tentar fazer login para ver o erro específico
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@gestaoescolar.com',
      password: '123456'
    });
    
    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
      
      if (loginError.message.includes('Email not confirmed')) {
        console.log('📧 Tentando reenviar email de confirmação...');
        
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: 'admin@gestaoescolar.com'
        });
        
        if (resendError) {
          console.log('❌ Erro ao reenviar email:', resendError.message);
        } else {
          console.log('✅ Email de confirmação reenviado!');
          console.log('📬 Verifique sua caixa de entrada e clique no link de confirmação.');
        }
      }
      return;
    }
    
    if (loginData.user) {
      console.log('✅ Login bem-sucedido!');
      console.log('👤 Usuário:', loginData.user.email);
      console.log('🆔 ID:', loginData.user.id);
      console.log('✅ Email confirmado:', loginData.user.email_confirmed_at ? 'Sim' : 'Não');
      
      // Verificar se existe perfil no banco local
      const profile = await prisma.profile.findUnique({
        where: { id: loginData.user.id }
      });
      
      if (!profile) {
        console.log('🔧 Criando perfil no banco local...');
        const newProfile = await prisma.profile.create({
          data: {
            id: loginData.user.id,
            username: 'admin',
            role: 'ADMIN'
          }
        });
        console.log('✅ Perfil criado:', newProfile);
      } else {
        console.log('✅ Perfil já existe no banco local:', profile);
      }
      
      // Fazer logout
      await supabase.auth.signOut();
      console.log('🚪 Logout realizado');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o processo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

confirmAndTestUser();