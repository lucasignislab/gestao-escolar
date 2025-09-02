// lib/authorization.ts
import { getUserProfile } from './auth';
import { Role } from '@prisma/client';

/**
 * Tipos de permissões disponíveis no sistema
 */
export type Permission = 
  | 'CREATE_PROFESSOR'
  | 'READ_PROFESSOR'
  | 'UPDATE_PROFESSOR'
  | 'DELETE_PROFESSOR'
  | 'CREATE_ALUNO'
  | 'READ_ALUNO'
  | 'UPDATE_ALUNO'
  | 'DELETE_ALUNO'
  | 'CREATE_RESPONSAVEL'
  | 'READ_RESPONSAVEL'
  | 'UPDATE_RESPONSAVEL'
  | 'DELETE_RESPONSAVEL'
  | 'CREATE_TURMA'
  | 'READ_TURMA'
  | 'UPDATE_TURMA'
  | 'DELETE_TURMA'
  | 'CREATE_MATERIA'
  | 'READ_MATERIA'
  | 'UPDATE_MATERIA'
  | 'DELETE_MATERIA'
  | 'CREATE_EXAM'
  | 'READ_EXAM'
  | 'UPDATE_EXAM'
  | 'DELETE_EXAM'
  | 'CREATE_ASSIGNMENT'
  | 'READ_ASSIGNMENT'
  | 'UPDATE_ASSIGNMENT'
  | 'DELETE_ASSIGNMENT'
  | 'CREATE_RESULT'
  | 'READ_RESULT'
  | 'UPDATE_RESULT'
  | 'DELETE_RESULT'
  | 'READ_ALL_DATA'
  | 'READ_OWN_DATA'
  | 'READ_CHILDREN_DATA';

/**
 * Mapeamento de permissões por role
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    // Administradores têm acesso total
    'CREATE_PROFESSOR', 'READ_PROFESSOR', 'UPDATE_PROFESSOR', 'DELETE_PROFESSOR',
    'CREATE_ALUNO', 'READ_ALUNO', 'UPDATE_ALUNO', 'DELETE_ALUNO',
    'CREATE_RESPONSAVEL', 'READ_RESPONSAVEL', 'UPDATE_RESPONSAVEL', 'DELETE_RESPONSAVEL',
    'CREATE_TURMA', 'READ_TURMA', 'UPDATE_TURMA', 'DELETE_TURMA',
    'CREATE_MATERIA', 'READ_MATERIA', 'UPDATE_MATERIA', 'DELETE_MATERIA',
    'CREATE_EXAM', 'READ_EXAM', 'UPDATE_EXAM', 'DELETE_EXAM',
    'CREATE_ASSIGNMENT', 'READ_ASSIGNMENT', 'UPDATE_ASSIGNMENT', 'DELETE_ASSIGNMENT',
    'CREATE_RESULT', 'READ_RESULT', 'UPDATE_RESULT', 'DELETE_RESULT',
    'READ_ALL_DATA'
  ],
  PROFESSOR: [
    // Professores podem apenas ler dados básicos e gerenciar suas próprias aulas
    'READ_PROFESSOR', 'READ_ALUNO', 'READ_TURMA', 'READ_MATERIA',
    'CREATE_EXAM', 'READ_EXAM', 'UPDATE_EXAM', 'DELETE_EXAM',
    'CREATE_ASSIGNMENT', 'READ_ASSIGNMENT', 'UPDATE_ASSIGNMENT', 'DELETE_ASSIGNMENT',
    'CREATE_RESULT', 'READ_RESULT', 'UPDATE_RESULT', 'DELETE_RESULT',
    'READ_OWN_DATA'
  ],
  ALUNO: [
    // Alunos podem apenas ler seus próprios dados
    'READ_OWN_DATA'
  ],
  RESPONSAVEL: [
    // Responsáveis podem apenas ler dados de seus filhos
    'READ_CHILDREN_DATA'
  ]
};

/**
 * Verifica se o usuário atual tem uma permissão específica
 * @param permission - Permissão a ser verificada
 * @returns Promise<boolean> - true se o usuário tem a permissão
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const profile = await getUserProfile();
  
  if (!profile) {
    return false;
  }
  
  const userPermissions = ROLE_PERMISSIONS[profile.role];
  return userPermissions.includes(permission);
}

/**
 * Verifica se o usuário atual tem múltiplas permissões
 * @param permissions - Array de permissões a serem verificadas
 * @returns Promise<boolean> - true se o usuário tem todas as permissões
 */
export async function hasAllPermissions(permissions: Permission[]): Promise<boolean> {
  const results = await Promise.all(permissions.map(hasPermission));
  return results.every(result => result);
}

/**
 * Verifica se o usuário atual tem pelo menos uma das permissões
 * @param permissions - Array de permissões a serem verificadas
 * @returns Promise<boolean> - true se o usuário tem pelo menos uma permissão
 */
export async function hasAnyPermission(permissions: Permission[]): Promise<boolean> {
  const results = await Promise.all(permissions.map(hasPermission));
  return results.some(result => result);
}

/**
 * Função para verificar autorização e lançar erro se não autorizado
 * @param permission - Permissão necessária
 * @throws Error se o usuário não tem a permissão
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const authorized = await hasPermission(permission);
  
  if (!authorized) {
    throw new Error('Acesso negado: você não tem permissão para executar esta ação.');
  }
}

/**
 * Função para verificar múltiplas permissões e lançar erro se não autorizado
 * @param permissions - Array de permissões necessárias
 * @throws Error se o usuário não tem todas as permissões
 */
export async function requireAllPermissions(permissions: Permission[]): Promise<void> {
  const authorized = await hasAllPermissions(permissions);
  
  if (!authorized) {
    throw new Error('Acesso negado: você não tem todas as permissões necessárias.');
  }
}

/**
 * Obtém o perfil do usuário atual ou lança erro se não autenticado
 * @returns Promise<Profile> - Perfil do usuário
 * @throws Error se o usuário não está autenticado
 */
export async function getCurrentUserProfile() {
  const profile = await getUserProfile();
  
  if (!profile) {
    throw new Error('Usuário não autenticado.');
  }
  
  return profile;
}

/**
 * Verifica se o usuário é administrador
 * @returns Promise<boolean> - true se o usuário é admin
 */
export async function isAdmin(): Promise<boolean> {
  const profile = await getUserProfile();
  return profile?.role === 'ADMIN';
}

/**
 * Verifica se o usuário é professor
 * @returns Promise<boolean> - true se o usuário é professor
 */
export async function isProfessor(): Promise<boolean> {
  const profile = await getUserProfile();
  return profile?.role === 'PROFESSOR';
}

/**
 * Verifica se o usuário é aluno
 * @returns Promise<boolean> - true se o usuário é aluno
 */
export async function isAluno(): Promise<boolean> {
  const profile = await getUserProfile();
  return profile?.role === 'ALUNO';
}

/**
 * Verifica se o usuário é responsável
 * @returns Promise<boolean> - true se o usuário é responsável
 */
export async function isResponsavel(): Promise<boolean> {
  const profile = await getUserProfile();
  return profile?.role === 'RESPONSAVEL';
}