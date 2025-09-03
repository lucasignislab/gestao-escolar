// app/dashboard/professores/ProfessorPageClient.tsx 
'use client'; 

import { useState } from 'react'; 
import { Teacher } from '@prisma/client'; 
import { DataTable } from '@/components/DataTable'; 
import { createColumns } from './columns'; 
import ProfessorForm from './ProfessorForm'; 
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { deleteProfessorAction } from './actions';
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

export default function ProfessorPageClient({ professores }: { professores: Teacher[] }) { 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  const handleOpenModal = (teacher: Teacher | null = null) => { 
    setEditingTeacher(teacher); 
    setIsModalOpen(true); 
  }; 

  /**
   * Função para abrir o diálogo de confirmação de exclusão
   * @param teacher - Dados do professor a ser excluído
   */
  const handleOpenDeleteDialog = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Função para confirmar e executar a exclusão do professor
   */
  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;

    try {
      const result = await deleteProfessorAction(teacherToDelete.id, teacherToDelete.profileId);
      
      if (result.success) {
        toast.success('Professor excluído com sucesso!');
        setIsDeleteDialogOpen(false);
        setTeacherToDelete(null);
        // A página será revalidada automaticamente pela action
      } else {
        toast.error(result.message || 'Erro ao excluir professor');
      }
    } catch (error) {
      console.error('Erro ao excluir professor:', error);
      toast.error('Erro inesperado ao excluir professor');
    }
  };
 
  // Criamos as colunas com as funções de edição e exclusão
  const dynamicColumns = createColumns({
    onEdit: handleOpenModal,
    onDelete: handleOpenDeleteDialog,
    canEdit: true,
    canDelete: true,
    isAdmin: true
  });

  return ( 
    <div> 
      <div className="flex justify-between items-center mb-4"> 
        <h1 className="text-3xl font-bold">Professores</h1> 
        <Button onClick={() => handleOpenModal()}>Adicionar Professor</Button> 
      </div> 
      <DataTable columns={dynamicColumns} data={professores} /> 
      <ProfessorForm 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        teacher={editingTeacher} 
      /> 

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir o professor{' '}
              <strong>
                {teacherToDelete?.name} {teacherToDelete?.surname}
              </strong>
              ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div> 
  );
}