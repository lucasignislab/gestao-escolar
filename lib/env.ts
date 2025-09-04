// lib/env.ts
import { z } from 'zod';

// Schemas de validação são definidos dentro das funções para evitar duplicação

/**
 * Valida variáveis de ambiente do cliente (NEXT_PUBLIC_*)
 * Estas são acessíveis no navegador
 */
function validateClientEnv() {
  try {
    const clientEnvSchema = z.object({
      NEXT_PUBLIC_APPWRITE_ENDPOINT: z.string().url(),
      NEXT_PUBLIC_APPWRITE_PROJECT_ID: z.string().min(1),
      NEXT_PUBLIC_APPWRITE_BUCKET_ID: z.string().min(1).optional(),
      NEXT_PUBLIC_APPWRITE_DATABASE_ID: z.string().optional(),
      NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID: z.string().optional(),
      NEXT_PUBLIC_APPWRITE_STORAGE_ID: z.string().optional(),
      NEXT_PUBLIC_APP_URL: z.string().url().optional(),
      NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    });

    const parsedEnv = clientEnvSchema.parse({
      NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      NEXT_PUBLIC_APPWRITE_BUCKET_ID: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
      NEXT_PUBLIC_APPWRITE_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID,
      NEXT_PUBLIC_APPWRITE_STORAGE_ID: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
    });

    return parsedEnv;
  } catch (error) {
    console.error('❌ Variáveis de ambiente do cliente inválidas:', error);
    throw new Error('Variáveis de ambiente do cliente inválidas. Verifique o arquivo .env');
  }
}

/**
 * Valida variáveis de ambiente do servidor
 * Estas NÃO são acessíveis no navegador
 */
function validateServerEnv() {
  // Só valida no servidor
  if (typeof window !== 'undefined') {
    return {};
  }

  try {
    const serverEnvSchema = z.object({
      DATABASE_URL: z.string().url(),
      APPWRITE_API_KEY: z.string().min(1),
      EMAIL_SERVICE: z.string().optional(),
      EMAIL_API_KEY: z.string().optional(),
      EMAIL_FROM: z.string().email().optional(),
      EMAIL_FROM_NAME: z.string().optional(),
    });

    const parsedEnv = serverEnvSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      APPWRITE_API_KEY: process.env.APPWRITE_API_KEY,
      EMAIL_SERVICE: process.env.EMAIL_SERVICE,
      EMAIL_API_KEY: process.env.EMAIL_API_KEY,
      EMAIL_FROM: process.env.EMAIL_FROM,
      EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    });

    return parsedEnv;
  } catch (error) {
    console.error('❌ Variáveis de ambiente do servidor inválidas:', error);
    throw new Error('Variáveis de ambiente do servidor inválidas. Verifique o arquivo .env');
  }
}

/**
 * Objeto com todas as variáveis de ambiente validadas
 * Combina variáveis do cliente e servidor
 */
export const env = {
  ...validateClientEnv(),
  ...validateServerEnv(),
};
