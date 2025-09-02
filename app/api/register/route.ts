import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema de validação para o registro
const registerSchema = z.object({
  username: z.string().min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['ALUNO', 'PROFESSOR', 'RESPONSAVEL', 'ADMIN'])
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados de entrada
    const validatedData = registerSchema.parse(body);
    const { username, email, password, role } = validatedData;

    // Verificar se o usuário já existe (por username ou email)
    const existingUser = await prisma.profile.findFirst({
      where: {
        OR: [
          { username },
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Nome de usuário já está em uso' },
          { status: 400 }
        );
      }
    }

    // Hash da senha (para uso futuro quando implementarmos autenticação própria)
    const hashedPassword = await hash(password, 12);

    // Criar o perfil do usuário
    const user = await prisma.profile.create({
      data: {
        username,
        role,
        avatarUrl: null
      },
      select: {
        id: true,
        username: true,
        role: true,
      }
    });

    return NextResponse.json(
      {
        message: 'Usuário criado com sucesso',
        user
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao criar usuário:', error);

    // Erro de validação do Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.issues.map((err: any) => err.message)
        },
        { status: 400 }
      );
    }

    // Erro do Prisma (violação de constraint, etc.)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Usuário já existe' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}