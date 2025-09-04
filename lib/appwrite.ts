// lib/appwrite.ts
import { Client, Account, Databases, Storage } from 'appwrite';
import { env } from './env';

/**
 * Configuração do cliente Appwrite
 * Utiliza as variáveis de ambiente validadas para configurar a conexão
 */
const client = new Client()
  .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

// Serviços do Appwrite
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Cliente principal para uso em outros módulos
export { client };

/**
 * Função para obter a URL pública de visualização de um arquivo no Appwrite Storage
 * @param fileId - ID do arquivo no Appwrite Storage
 * @returns URL pública para visualização do arquivo
 */
export const getAvatarUrl = (fileId: string) => {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
};

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
  storageId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID || 'files',
  avatarsBucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'avatars'
};