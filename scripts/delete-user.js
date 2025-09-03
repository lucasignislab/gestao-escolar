// scripts/delete-user.js
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

// Configuração do Supabase (usando service role key para operações admin)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Chave de service role necessária

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deleteUser(email) {
  try {
    console.log(`🗑️  Deletando usuário com email: ${email}`);
    
    // 1. Buscar o usuário no Supabase Auth pelo email
    console.log('🔍 Buscando usuário no Supabase Auth...');
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError.message);
      return;
    }
    
    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.log('⚠️  Usuário não encontrado no Supabase Auth');
    } else {
      console.log(`✅ Usuário encontrado no Supabase Auth: ${user.id}`);
      
      // 2. Deletar dados relacionados no banco local primeiro
      console.log('🗑️  Deletando dados do banco local...');
      
      // Buscar o profile do usuário
      const profile = await prisma.profile.findUnique({
        where: { id: user.id },
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
        await prisma.profile.delete({ where: { id: user.id } });
        console.log('✅ Dados do banco local deletados');
      } else {
        console.log('⚠️  Profile não encontrado no banco local');
      }
      
      // 3. Deletar o usuário do Supabase Auth
      console.log('🗑️  Deletando usuário do Supabase Auth...');
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        console.error('❌ Erro ao deletar usuário do Supabase Auth:', deleteError.message);
      } else {
        console.log('✅ Usuário deletado do Supabase Auth');
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