// app/dashboard/alunos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/DataTable';
import { createColumns, StudentWithRelations } from './columns';
import AlunoForm from './AlunoForm';
import { buscarAlunos, deleteAluno } from './actions';
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
 * Página principal para gerenciamento de alunos
 * Inclui listagem, adição, edição e exclusão de alunos
 */
export default function AlunosPage() {
  const [students, setStudents] = useState<StudentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithRelations | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentWithRelations | null>(null);
  const { canEdit, canDelete, isAdmin, isResponsavel, user } = usePermissions();

  /**
   * Carregar lista de alunos ao montar o componente
   */
  useEffect(() => {
    loadStudents();
  }, []);

  /**
   * Função para carregar a lista de alunos
   */
  const loadStudents = async () => {
    try {
      setLoading(true);
      const result = await buscarAlunos({});
      setStudents(result.alunos);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      toast.error('Erro ao carregar lista de alunos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Função para abrir o formulário de adição de novo aluno
   */
  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsFormOpen(true);
  };

  /**
   * Função para abrir o formulário de edição de aluno
   * @param student - Dados do aluno a ser editado
   */
  const handleEditStudent = (student: StudentWithRelations) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
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
        // Recarregar a lista de alunos
        await loadStudents();
      } else {
        toast.error(result.message || 'Erro ao excluir aluno');
      }
    } catch (error) {
      console.error('Erro ao excluir aluno:', error);
      toast.error('Erro inesperado ao excluir aluno');
    }
  };

  /**
   * Função para lidar com o fechamento do formulário
   * Recarrega a lista se o formulário foi fechado após uma operação bem-sucedida
   * @param isOpen - Estado de abertura do formulário
   */
  const handleFormOpenChange = (isOpen: boolean) => {
    setIsFormOpen(isOpen);
    if (!isOpen) {
      // Recarregar a lista quando o formulário for fechado
      loadStudents();
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <PageHeader 
        title="Alunos" 
        buttonLabel="Adicionar Aluno" 
        onButtonClick={handleAddStudent}
        entityType="aluno"
      />
      <p className="text-muted-foreground mb-6">
        Gerencie os alunos da escola
      </p>

      {/* Tabela de alunos */}
      <div className="rounded-md border">
        <DataTable
          columns={createColumns({
            onEdit: handleEditStudent,
            onDelete: handleOpenDeleteDialog,
            canEdit: canEdit('aluno'),
            canDelete: canDelete('aluno'),
            isAdmin: isAdmin(),
            isResponsavel: isResponsavel(),
            userId: user?.id
          })}
          data={students}
        />
      </div>

      {/* Modal do formulário de aluno */}
      <AlunoForm
        isOpen={isFormOpen}
        onOpenChange={handleFormOpenChange}
        student={selectedStudent}
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