// app/api/test-env/route.ts
import { NextResponse } from 'next/server';

/**
 * Endpoint para testar se as variáveis de ambiente estão sendo carregadas
 * em produção. Remove informações sensíveis antes de retornar.
 */
export async function GET() {
  try {
    // Verificar variáveis do Appwrite
    const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const appwriteProject = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
    const appwriteBucket = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

    return NextResponse.json({
      message: 'Variáveis de ambiente carregadas',
      env: {
        appwriteEndpoint: appwriteEndpoint ? 'DEFINIDA' : 'NÃO DEFINIDA',
        appwriteProject: appwriteProject ? 'DEFINIDA' : 'NÃO DEFINIDA',
        appwriteBucket: appwriteBucket ? 'DEFINIDA' : 'NÃO DEFINIDA',
      },
      preview: {
        appwriteEndpointPreview: appwriteEndpoint ? appwriteEndpoint.substring(0, 30) + '...' : 'N/A',
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao verificar variáveis de ambiente', details: (error as Error).message },
      { status: 500 }
    );
  }
}