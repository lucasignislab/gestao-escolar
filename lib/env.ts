// lib/env.ts
import { z } from 'zod';

/**
 * Especifica o schema para validação das variáveis de ambiente
 */
const envSchema = z.object({
  // Variáveis do Banco de Dados
  DATABASE_URL: z.string().url(),

  // Variáveis do Appwrite
  NEXT_PUBLIC_APPWRITE_ENDPOINT: z.string().url(),
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: z.string().min(1),
  APPWRITE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_APPWRITE_BUCKET_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_APPWRITE_DATABASE_ID: z.string().optional(),
  NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID: z.string().optional(),
  NEXT_PUBLIC_APPWRITE_STORAGE_ID: z.string().optional(),

  // Variáveis da Aplicação
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Variáveis de Email (opcionais)
  EMAIL_SERVICE: z.string().optional(),
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  EMAIL_FROM_NAME: z.string().optional(),
});

/**
 * Valida todas as variáveis de ambiente necessárias
 * Lança um erro se alguma variável obrigatória estiver faltando
 */
function validateEnv() {
  try {
    const parsedEnv = envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      APPWRITE_API_KEY: process.env.APPWRITE_API_KEY,
      NEXT_PUBLIC_APPWRITE_BUCKET_ID: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
      NEXT_PUBLIC_APPWRITE_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID: process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID,
      NEXT_PUBLIC_APPWRITE_STORAGE_ID: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV,
      EMAIL_SERVICE: process.env.EMAIL_SERVICE,
      EMAIL_API_KEY: process.env.EMAIL_API_KEY,
      EMAIL_FROM: process.env.EMAIL_FROM,
      EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    });

    return parsedEnv;
  } catch (error) {
    console.error('❌ Variáveis de ambiente inválidas:', error);
    throw new Error('Variáveis de ambiente inválidas. Verifique o arquivo .env');
  }
}

/**
 * Objeto com todas as variáveis de ambiente validadas
 */
export const env = validateEnv();
