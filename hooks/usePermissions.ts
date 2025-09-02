// hooks/usePermissions.ts
'use client';

import { useEffect, useState } from 'react';
import { getCurrentUserProfileClient } from '@/lib/client-auth';
import { Profile } from '@prisma/client';

/**
 * Hook personalizado para verificar permissões do usuário no lado do cliente
 * @returns Objeto com informações do usuário e funções de verificação de permissão
 */
export function usePermissions() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const userProfile = await getCurrentUserProfileClient();
        setUser(userProfile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar usuário');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const isAdmin = () => user?.role === 'ADMIN';
  const isProfessor = () => user?.role === 'PROFESSOR';
  const isAluno = () => user?.role === 'ALUNO';
  const isResponsavel = () => user?.role === 'RESPONSAVEL';

  /**
   * Verifica se o usuário pode editar um item específico
   * @param itemOwnerId - ID do proprietário do item (opcional)
   * @returns true se pode editar, false caso contrário
   */
  const canEdit = (itemOwnerId?: string) => {
    if (isAdmin()) return true;
    if (isProfessor() && itemOwnerId && user?.id === itemOwnerId) return true;
    if (isResponsavel() && itemOwnerId && user?.id === itemOwnerId) return true;
    return false;
  };

  /**
   * Verifica se o usuário pode excluir um item específico
   * @param itemOwnerId - ID do proprietário do item (opcional)
   * @returns true se pode excluir, false caso contrário
   */
  const canDelete = (itemOwnerId?: string) => {
    if (isAdmin()) return true;
    // Apenas admins podem excluir por padrão
    return false;
  };

  /**
   * Verifica se o usuário pode criar novos itens
   * @param entityType - Tipo de entidade (professor, aluno, etc.)
   * @returns true se pode criar, false caso contrário
   */
  const canCreate = (entityType: string) => {
    if (isAdmin()) return true;
    
    // Professores podem criar apenas exames, tarefas e notas
    if (isProfessor()) {
      return ['exam', 'assignment', 'result'].includes(entityType.toLowerCase());
    }
    
    return false;
  };

  return {
    user,
    loading,
    error,
    isAdmin,
    isProfessor,
    isAluno,
    isResponsavel,
    canEdit,
    canDelete,
    canCreate,
  };
}