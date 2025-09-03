// app/dashboard/turmas/actions.ts 
'use server'; 

import { PrismaClient } from '@prisma/client'; 
import { revalidatePath } from 'next/cache'; 
import { turmaSchema } from '@/lib/schemas'; 

const prisma = new PrismaClient(); 

export async function createTurmaAction(data: unknown) { 
  const result = turmaSchema.safeParse(data); 
  if (!result.success) { 
    return { success: false, errors: result.error.flatten().fieldErrors }; 
  } 

  try { 
    await prisma.class.create({ 
      data: result.data, 
    }); 
    revalidatePath('/dashboard/turmas'); 
    return { success: true }; 
  } catch (error) { 
    return { success: false, message: 'Ocorreu um erro ao criar a turma.' }; 
  } 
} 

export async function updateTurmaAction(data: unknown) { 
  const result = turmaSchema.safeParse(data); 
  if (!result.success) { 
    return { success: false, errors: result.error.flatten().fieldErrors }; 
  } 
  const { id, ...dataToUpdate } = result.data; 
  if (!id) return { success: false, message: 'ID da turma é obrigatório para atualização.' }; 

  try { 
    await prisma.class.update({ 
      where: { id }, 
      data: dataToUpdate, 
    }); 
    revalidatePath('/dashboard/turmas'); 
    return { success: true }; 
  } catch (error) { 
    return { success: false, message: 'Ocorreu um erro ao atualizar a turma.' }; 
  } 
} 

export async function deleteTurmaAction(id: string) { 
  try { 
    await prisma.class.delete({ where: { id } }); 
    revalidatePath('/dashboard/turmas'); 
    return { success: true }; 
  } catch (error) { 
    return { success: false, message: 'Ocorreu um erro ao excluir a turma. Verifique se não há alunos vinculados.' }; 
  } 
}