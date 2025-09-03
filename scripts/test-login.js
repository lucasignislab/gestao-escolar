// scripts/test-login.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testLogin() {
  try {
    console.log('🔐 Testando login...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@sistema.com',
      password: '123456'
    });
    
    if (error) {
      console.log('❌ Erro no login:', error.message);
      return;
    }
    
    if (data.user) {
      console.log('✅ Login bem-sucedido!');
      console.log('👤 Usuário:', data.user.email);
      console.log('🆔 ID:', data.user.id);
      console.log('🎫 Sessão ativa:', !!data.session);
      
      // Testar se conseguimos obter a sessão
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('📋 Sessão obtida:', !!sessionData.session);
      
      // Fazer logout
      await supabase.auth.signOut();
      console.log('🚪 Logout realizado');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testLogin();