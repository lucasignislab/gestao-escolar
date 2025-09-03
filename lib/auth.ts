// lib/auth.ts
import { Client, Account } from 'appwrite';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

/**
 * Cria um cliente Appwrite para uso no servidor
 */
const createServerAppwriteClient = async () => {
  const client = new Client();
  
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
  
  // Configurar sessão do usuário a partir dos cookies
  const cookieStore = await cookies();
  const session = cookieStore.get('appwrite-session');
  
  if (session) {
    client.setSession(session.value);
  }
  
  return new Account(client);
};

/**
 * Busca o perfil do usuário autenticado
 * Combina autenticação do Appwrite com dados do perfil no Prisma
 * Cria automaticamente um perfil se o usuário estiver autenticado mas não tiver perfil
 * @returns Profile do usuário ou null se não autenticado
 */
export const getUserProfile = async () => {
  try {
    const account = await createServerAppwriteClient();
    
    const user = await account.get();
    
    if (!user) {
      console.log('❌ [getUserProfile] Nenhum usuário autenticado encontrado');
      return null;
    }
    
    console.log('✅ [getUserProfile] Usuário autenticado:', user.email);

    let profile = await prisma.profile.findUnique({
      where: { id: user.$id },
    });

    // Se o usuário está autenticado mas não tem perfil, criar um perfil padrão
    if (!profile && user) {
      profile = await prisma.profile.create({
        data: {
          id: user.$id,
          username: user.email?.split('@')[0] || `user_${user.$id.slice(0, 8)}`,
          role: 'ADMIN', // Perfil padrão como ADMIN para facilitar o acesso inicial
        },
      });
    }

    return profile;
  } catch (error) {
    console.error('❌ [getUserProfile] Erro ao obter perfil do usuário:', error);
    console.error('❌ [getUserProfile] Stack trace:', error instanceof Error ? error.stack : 'N/A');
    return null;
  }
};