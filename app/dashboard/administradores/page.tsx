// app/dashboard/administradores/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/DataTable';
import { createColumns, AdministradorWithRelations } from './columns';
import AdministradorForm from './AdministradorForm';
import { buscarAdministradores, deleteAdministrador } from './actions';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
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
 * Página principal para gerenciamento de administradores
 * Inclui listagem, adição, edição e exclusão de administradores
 */
export default function AdministradoresPage() {
  // Estados para controle da interface
  const [administradores, setAdministradores] = useState<AdministradorWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAdministrador, setSelectedAdministrador] = useState<AdministradorWithRelations | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [administradorToDelete, setAdministradorToDelete] = useState<AdministradorWithRelations | null>(null);

  /**
   * Carregar lista de administradores ao montar o componente
   */
  useEffect(() => {
    loadAdministradores();
  }, []);

  /**
   * Função para carregar administradores do servidor
   */
  const loadAdministradores = async () => {
    try {
      setLoading(true);
      const result = await buscarAdministradores({});
      setAdministradores(result.administradores);
    } catch (error) {
      console.error('Erro ao carregar administradores:', error);
      toast.error('Erro ao carregar administradores');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abrir modal para adicionar novo administrador
   */
  const handleAddAdministrador = () => {
    setSelectedAdministrador(null);
    setIsFormOpen(true);
  };

  /**
   * Abrir modal para editar administrador existente
   */
  const handleEditAdministrador = (administrador: AdministradorWithRelations) => {
    setSelectedAdministrador(administrador);
    setIsFormOpen(true);
  };

  /**
   * Fechar modal do formulário
   */
  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setSelectedAdministrador(null);
    }
  };

  /**
   * Abrir diálogo de confirmação de exclusão
   */
  const handleOpenDeleteDialog = (id: string) => {
    const administrador = administradores.find(a => a.id === id);
    if (administrador) {
      setAdministradorToDelete(administrador);
      setIsDeleteDialogOpen(true);
    }
  };

  /**
   * Confirmar e executar exclusão do administrador
   */
  const handleConfirmDelete = async () => {
    if (!administradorToDelete) return;

    try {
      const result = await deleteAdministrador(administradorToDelete.id);
      if (result.success) {
        setAdministradores(prev => prev.filter(a => a.id !== administradorToDelete.id));
        toast.success('Administrador excluído com sucesso');
      } else {
        toast.error(result.message || 'Erro ao excluir administrador');
      }
    } catch (error) {
      console.error('Erro ao excluir administrador:', error);
      toast.error('Erro ao excluir administrador');
    } finally {
      setIsDeleteDialogOpen(false);
      setAdministradorToDelete(null);
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
        title="Administradores" 
        buttonLabel="Adicionar Administrador" 
        onButtonClick={handleAddAdministrador}
        entityType="administrador"
      />
      <p className="text-muted-foreground mb-6">
        Gerencie os administradores do sistema
      </p>

      {/* Tabela de administradores */}
      <div className="rounded-md border">
        <DataTable
          columns={createColumns({
            onEdit: handleEditAdministrador,
            onDelete: handleOpenDeleteDialog,
          })}
          data={administradores}
        />
      </div>

      {/* Modal do formulário de administrador */}
      <AdministradorForm
        isOpen={isFormOpen}
        onOpenChange={handleFormOpenChange}
        administrador={selectedAdministrador}
      />

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir o administrador{' '}
              <strong>
                {administradorToDelete?.username || 'Administrador'}
              </strong>
              ? Esta ação não pode ser desfeita.
              <span className="block mt-2 text-sm text-amber-600">
                Atenção: Certifique-se de que há pelo menos um administrador ativo no sistema.
              </span>
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