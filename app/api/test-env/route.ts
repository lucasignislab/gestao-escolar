// app/api/test-env/route.ts
import { NextResponse } from 'next/server';

/**
 * Endpoint para testar se as variáveis de ambiente estão sendo carregadas
 * em produção. Remove informações sensíveis antes de retornar.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const databaseUrl = process.env.DATABASE_URL;

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      supabaseUrl: supabaseUrl ? 'DEFINIDA' : 'NÃO DEFINIDA',
      supabaseKey: supabaseKey ? 'DEFINIDA' : 'NÃO DEFINIDA',
      databaseUrl: databaseUrl ? 'DEFINIDA' : 'NÃO DEFINIDA',
      // Mostrar apenas os primeiros caracteres para debug
      supabaseUrlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'N/A',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao verificar variáveis de ambiente', details: (error as Error).message },
      { status: 500 }
    );
  }
}