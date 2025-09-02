// app/dashboard/professores/page.tsx
'use client'; // Esta página precisará de estado para controlar o modal

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Teacher } from '@prisma/client';
import { deleteProfessor } from './actions';
import { createColumns } from './columns';
import { DataTable } from '@/components/DataTable';
import PaginationControls from '@/components/PaginationControls';
import SearchInput from '@/components/SearchInput';
import PageHeader from '@/components/PageHeader';
import ProfessorForm from './ProfessorForm';
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

const ITENS_POR_PAGINA = 10;

/**
 * Componente interno que usa useSearchParams
 */
function ProfessoresPageContent() {
  const searchParams = useSearchParams();
  const [professores, setProfessores] = useState<Teacher[]>([]);
  const [totalProfessores, setTotalProfessores] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Estados para controlar o modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  
  // Estados para controlar o diálogo de confirmação de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const { canEdit, canDelete, isAdmin } = usePermissions();

  // Obter página atual e termo de busca dos parâmetros da URL
  const paginaAtual = Number(searchParams?.get('page')) || 1;
  const termoBusca = searchParams?.get('search') || '';

  /**
   * Função para buscar professores via API
   */
  const buscarProfessores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: paginaAtual.toString(),
        search: termoBusca,
      });
      
      const response = await fetch(`/api/professores?${params}`);
      const data = await response.json();
      
      setProfessores(data.professores);
      setTotalProfessores(data.total);
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
    } finally {
      setLoading(false);
    }
  }, [paginaAtual, termoBusca]);

  /**
   * Função para abrir modal de adicionar/editar professor
   */
  const handleOpenModal = (teacher: Teacher | null = null) => {
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  /**
   * Função para fechar o modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
  };

  /**
   * Função para abrir diálogo de confirmação de exclusão
   */
  const handleOpenDeleteDialog = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Função para fechar o diálogo de confirmação de exclusão
   */
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setTeacherToDelete(null);
  };

  /**
   * Função para confirmar a exclusão do professor
   */
  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;
    
    try {
      await deleteProfessor(teacherToDelete.id);
      handleCloseDeleteDialog();
      // Recarregar a lista de professores
      buscarProfessores();
    } catch (error) {
      console.error('Erro ao excluir professor:', error);
    }
  };

  // Buscar professores quando os parâmetros mudarem
  useEffect(() => {
    buscarProfessores();
  }, [buscarProfessores]);

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
    <div className="p-6">
      <PageHeader 
         title="Professores" 
         buttonLabel="Adicionar Professor" 
         onButtonClick={() => handleOpenModal()}
         entityType="professor"
       />
      <SearchInput placeholder="Buscar por nome ou e-mail..." />
      <DataTable columns={createColumns({ 
        onEdit: handleOpenModal, 
        onDelete: handleOpenDeleteDialog,
        canEdit: canEdit('professor'),
        canDelete: canDelete('professor'),
        isAdmin: isAdmin()
      })} data={professores} />
      <PaginationControls 
        hasNextPage={totalProfessores > paginaAtual * ITENS_POR_PAGINA}
        hasPrevPage={paginaAtual > 1}
      />
      <div className="mt-4 text-sm text-gray-600">
        {termoBusca && (
          <span className="mr-4">
            Resultados para: &quot;{termoBusca}&quot;
          </span>
        )}
        Página {paginaAtual} - Total: {totalProfessores} professores
      </div>
      
      <ProfessorForm
        isOpen={isModalOpen}
        onOpenChange={handleCloseModal}
        teacher={editingTeacher}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o professor {teacherToDelete?.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDeleteDialog}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Página de listagem de professores com paginação
 * Client Component que busca dados via API com paginação baseada em URL
 */
export default function ProfessoresPage() {
  return (
    <Suspense fallback={<div className="p-6"><div className="flex justify-center items-center h-64"><div className="text-lg">Carregando...</div></div></div>}>
      <ProfessoresPageContent />
    </Suspense>
  );
}