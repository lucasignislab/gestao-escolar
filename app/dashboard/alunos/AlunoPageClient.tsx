// app/dashboard/alunos/AlunoPageClient.tsx 
'use client'; 

import { useState } from 'react'; 
import { DataTable } from '@/components/DataTable'; 
import { createColumns, StudentWithRelations } from './columns'; 
import AlunoForm from './AlunoForm'; 
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { deleteAluno } from './actions';
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
import PageHeader from '@/components/PageHeader';
import { usePermissions } from '@/hooks/usePermissions';

interface AlunoPageClientProps {
  alunos: StudentWithRelations[];
  turmas: any[];
  responsaveis: any[];
}

export default function AlunoPageClient({ alunos, turmas, responsaveis }: AlunoPageClientProps) { 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [editingStudent, setEditingStudent] = useState<StudentWithRelations | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentWithRelations | null>(null);
  const { canEdit, canDelete, isAdmin, isResponsavel, user } = usePermissions();

  const handleOpenModal = (student: StudentWithRelations | null = null) => { 
    setEditingStudent(student); 
    setIsModalOpen(true); 
  }; 

  /**
   * Função para abrir o diálogo de confirmação de exclusão
   * @param student - Dados do aluno a ser excluído
   */
  const handleOpenDeleteDialog = (student: StudentWithRelations) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Função para confirmar e executar a exclusão do aluno
   */
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      const result = await deleteAluno(studentToDelete.id);
      
      if (result.success) {
        toast.success('Aluno excluído com sucesso!');
        setIsDeleteDialogOpen(false);
        setStudentToDelete(null);
        // A página será revalidada automaticamente pela action
      } else {
        toast.error(result.message || 'Erro ao excluir aluno');
      }
    } catch (error) {
      console.error('Erro ao excluir aluno:', error);
      toast.error('Erro inesperado ao excluir aluno');
    }
  };
 
  // Criamos as colunas com as funções de edição e exclusão
  const dynamicColumns = createColumns({
    onEdit: handleOpenModal,
    onDelete: handleOpenDeleteDialog,
    canEdit: canEdit('aluno'),
    canDelete: canDelete('aluno'),
    isAdmin: isAdmin(),
    isResponsavel: isResponsavel(),
    userId: user?.id
  });

  return ( 
    <div className="space-y-6"> 
      {/* Cabeçalho da página */}
      <PageHeader 
        title="Alunos" 
        buttonLabel="Adicionar Aluno" 
        onButtonClick={() => handleOpenModal()}
        entityType="aluno"
      />
      <p className="text-muted-foreground mb-6">
        Gerencie os alunos da escola
      </p>

      {/* Tabela de alunos */}
      <div className="rounded-md border">
        <DataTable columns={dynamicColumns} data={alunos} />
      </div>

      <AlunoForm 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        student={editingStudent} 
        turmas={turmas}
        responsaveis={responsaveis}
      /> 

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir o aluno{' '}
              <strong>
                {studentToDelete?.name} {studentToDelete?.surname}
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