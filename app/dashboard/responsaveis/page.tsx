// app/dashboard/responsaveis/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/DataTable';
import { createColumns, ResponsavelWithRelations } from './columns';
import ResponsavelForm from './ResponsavelForm';
import { buscarResponsaveis, deleteResponsavel } from './actions';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import { usePermissions } from '@/hooks/usePermissions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * Página principal para gerenciamento de responsáveis
 * Inclui listagem, adição, edição e exclusão de responsáveis
 */
export default function ResponsaveisPage() {
  // Estados para controle da interface
  const [responsaveis, setResponsaveis] = useState<ResponsavelWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedResponsavel, setSelectedResponsavel] = useState<ResponsavelWithRelations | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [responsavelToDelete, setResponsavelToDelete] = useState<ResponsavelWithRelations | null>(null);
  const { canEdit, canDelete, isAdmin } = usePermissions();

  /**
   * Carregar lista de responsáveis ao montar o componente
   */
  useEffect(() => {
    loadResponsaveis();
  }, []);

  /**
   * Função para carregar responsáveis do servidor
   */
  const loadResponsaveis = async () => {
    try {
      setLoading(true);
      const result = await buscarResponsaveis({});
      setResponsaveis(result.responsaveis as ResponsavelWithRelations[]);
    } catch (error) {
      console.error('Erro ao carregar responsáveis:', error);
      toast.error('Erro ao carregar responsáveis');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abrir modal para adicionar novo responsável
   */
  const handleAddResponsavel = () => {
    setSelectedResponsavel(null);
    setIsFormOpen(true);
  };

  /**
   * Abrir modal para editar responsável existente
   */
  const handleEditResponsavel = (responsavel: ResponsavelWithRelations) => {
    setSelectedResponsavel(responsavel);
    setIsFormOpen(true);
  };

  /**
   * Fechar modal do formulário
   */
  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setSelectedResponsavel(null);
    }
  };

  /**
   * Abrir diálogo de confirmação de exclusão
   */
  const handleOpenDeleteDialog = (id: string) => {
    const responsavel = responsaveis.find(r => r.id === id);
    if (responsavel) {
      setResponsavelToDelete(responsavel);
      setIsDeleteDialogOpen(true);
    }
  };

  /**
   * Confirmar e executar exclusão do responsável
   */
  const handleConfirmDelete = async () => {
    if (!responsavelToDelete) return;

    try {
      const result = await deleteResponsavel(responsavelToDelete.id);
      if (result.success) {
        setResponsaveis(prev => prev.filter(r => r.id !== responsavelToDelete.id));
        toast.success('Responsável excluído com sucesso');
      } else {
        toast.error(result.message || 'Erro ao excluir responsável');
      }
    } catch (error) {
      console.error('Erro ao excluir responsável:', error);
      toast.error('Erro ao excluir responsável');
    } finally {
      setIsDeleteDialogOpen(false);
      setResponsavelToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <PageHeader 
        title="Responsáveis" 
        buttonLabel="Adicionar Responsável" 
        onButtonClick={handleAddResponsavel}
        entityType="responsavel"
      />
      <p className="text-muted-foreground mb-6">
        Gerencie os responsáveis pelos alunos
      </p>

      {/* Tabela de responsáveis */}
      <div className="rounded-md border">
        <DataTable
          columns={createColumns({
            onEdit: handleEditResponsavel,
            onDelete: handleOpenDeleteDialog,
            canEdit: canEdit('responsavel'),
            canDelete: canDelete('responsavel'),
            isAdmin: isAdmin(),
          })}
          data={responsaveis}
        />
      </div>

      {/* Modal do formulário de responsável */}
      <ResponsavelForm
        isOpen={isFormOpen}
        onOpenChange={handleFormOpenChange}
        responsavel={selectedResponsavel}
      />

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir o responsável{' '}
              <strong>
                {responsavelToDelete?.name} {responsavelToDelete?.surname}
              </strong>
              ? Esta ação não pode ser desfeita.
              {responsavelToDelete?._count && responsavelToDelete._count.children > 0 && (
                <span className="block mt-2 text-sm text-amber-600">
                  Atenção: Este responsável possui {responsavelToDelete._count.children} filho(s) vinculado(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}