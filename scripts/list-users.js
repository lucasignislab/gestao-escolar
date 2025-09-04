// scripts/list-users.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('📋 Listando usuários no banco de dados...');
    
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        avatarUrl: true,
        teacher: {
          select: {
            name: true,
            surname: true,
            email: true
          }
        },
        student: {
          select: {
            name: true,
            surname: true
          }
        },
        parent: {
          select: {
            name: true,
            surname: true,
            email: true
          }
        }
      }
    });
    
    if (profiles.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados');
    } else {
      console.log(`✅ Encontrados ${profiles.length} usuário(s):`);
      profiles.forEach((profile, index) => {
        console.log(`\n${index + 1}. ID: ${profile.id}`);
        console.log(`   Username: ${profile.username}`);
        console.log(`   Role: ${profile.role}`);
        
        if (profile.teacher) {
          console.log(`   Nome: ${profile.teacher.name} ${profile.teacher.surname}`);
          console.log(`   Email: ${profile.teacher.email}`);
        } else if (profile.student) {
          console.log(`   Nome: ${profile.student.name} ${profile.student.surname}`);
        } else if (profile.parent) {
          console.log(`   Nome: ${profile.parent.name} ${profile.parent.surname}`);
          console.log(`   Email: ${profile.parent.email}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();