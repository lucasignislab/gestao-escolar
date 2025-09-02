// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createServerClient } from '@supabase/ssr';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema de validação para registro
const registerSchema = z.object({
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email deve ser válido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['ADMIN', 'PROFESSOR', 'ALUNO', 'RESPONSAVEL']),
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== INÍCIO DO REGISTRO ===');
    
    const body = await request.json();
    console.log('Body recebido:', body);
    
    // Validar dados de entrada
    console.log('Validando dados...');
    const validatedData = registerSchema.parse(body);
    const { username, email, password, role } = validatedData;
    console.log('Dados validados:', { username, email, role });

    // Criar cliente Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // No-op for server-side registration
          },
        },
      }
    );

    // Verificar se o usuário já existe no banco local
    console.log('Verificando se usuário existe no banco local...');
    const existingProfile = await prisma.profile.findUnique({
      where: { username },
    });
    console.log('Usuário existente no banco local:', existingProfile);

    if (existingProfile) {
      console.log('Usuário já existe no banco local, retornando erro');
      return NextResponse.json(
        { error: 'Usuário já existe' },
        { status: 400 }
      );
    }

    // Criar usuário no Supabase
    console.log('Criando usuário no Supabase...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.log('Erro ao criar usuário no Supabase:', authError);
      return NextResponse.json(
        { error: 'Erro ao criar usuário: ' + authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      console.log('Usuário não foi criado no Supabase');
      return NextResponse.json(
        { error: 'Erro ao criar usuário no Supabase' },
        { status: 500 }
      );
    }

    console.log('Usuário criado no Supabase:', authData.user.id);

    // Criar perfil no banco local usando o ID do Supabase
    console.log('Criando perfil no banco local...');
    const profile = await prisma.profile.create({
      data: {
        id: authData.user.id, // Usar o ID do Supabase
        username,
        role,
      },
    });
    console.log('Perfil criado no banco local:', profile);

    return NextResponse.json(
      {
        message: 'Usuário criado com sucesso',
        profile: {
          id: profile.id,
          username: profile.username,
          role: profile.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('=== ERRO NO REGISTRO ===');
    console.error('Tipo do erro:', typeof error);
    console.error('Nome do erro:', (error as any)?.constructor?.name);
    console.error('Mensagem do erro:', (error as any)?.message);
    console.error('Stack trace:', (error as any)?.stack);
    console.error('Erro completo:', error);
    
    if (error instanceof z.ZodError) {
      console.log('Erro de validação Zod:', error.issues);
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    // Verificar se é erro do Prisma
    if ((error as any)?.code) {
      console.error('Código do erro Prisma:', (error as any).code);
      console.error('Meta do erro Prisma:', (error as any).meta);
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}