// lib/appwrite.ts
import { Client, Account, Databases, Storage } from 'appwrite';

/**
 * Configuração do cliente Appwrite
 * Utiliza as variáveis de ambiente para configurar a conexão
 */
const client = new Client();

// Verificar se as variáveis de ambiente estão definidas antes de configurar o cliente
if (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT && process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
}

// Serviços do Appwrite
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Cliente principal para uso em outros módulos
export { client };

/**
 * Função para criar uma sessão de cliente Appwrite
 * Compatível com o padrão usado anteriormente no Supabase
 */
export function createClient() {
  return {
    client,
    account,
    databases,
    storage
  };
}

/**
 * IDs dos recursos do Appwrite
 * Substitua pelos IDs reais do seu projeto
 */
export const APPWRITE_CONFIG = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'main',
  userCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID || 'users',
  storageId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID || 'files'
};