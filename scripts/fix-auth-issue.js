// scripts/fix-auth-issue.js
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixAuthIssue() {
  try {
    console.log('🔍 Verificando usuários no banco local...');
    
    // Buscar todos os usuários no banco local
    const localUsers = await prisma.profile.findMany({
      select: {
        id: true,
        username: true,
        role: true
      }
    });
    
    console.log(`📊 Encontrados ${localUsers.length} usuários no banco local:`);
    localUsers.forEach(user => {
      console.log(`  - ${user.username} (${user.role}) - ID: ${user.id}`);
    });
    
    console.log('\n🔍 Verificando usuários no Supabase Auth...');
    
    // Verificar cada usuário no Supabase Auth
    for (const user of localUsers) {
      try {
        const { data: authUser, error } = await supabase.auth.admin.getUserById(user.id);
        
        if (error || !authUser.user) {
          console.log(`❌ Usuário ${user.username} (${user.id}) não existe no Supabase Auth`);
          console.log(`   Removendo do banco local...`);
          
          await prisma.profile.delete({
            where: { id: user.id }
          });
          
          console.log(`   ✅ Usuário removido do banco local`);
        } else {
          console.log(`✅ Usuário ${user.username} existe no Supabase Auth`);
        }
      } catch (authError) {
        console.log(`❌ Erro ao verificar usuário ${user.username}: ${authError.message}`);
      }
    }
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAuthIssue();