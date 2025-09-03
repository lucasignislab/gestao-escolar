// app/dashboard/materias/page.tsx
'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { deleteMateria, buscarMaterias, buscarProfessores } from './actions';
import { DataTable } from '@/components/DataTable';
import PaginationControls from '@/components/PaginationControls';
import SearchInput from '@/components/SearchInput';
import PageHeader from '@/components/PageHeader';
import MateriaForm from './MateriaForm';
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
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const ITENS_POR_PAGINA = 10;

import { Teacher } from '@prisma/client';

type TeacherSelect = {
  id: string;
  name: string;
  surname: string;
  email: string;
};

type MateriaWithTeachers = {
  id: string;
  name: string;
  teachers: TeacherSelect[];
};

/**
 * Componente interno que usa useSearchParams
 */
function MateriasPageContent() {
  const searchParams = useSearchParams();
  const [materias, setMaterias] = useState<MateriaWithTeachers[]>([]);
  const [totalMaterias, setTotalMaterias] = useState(0);
  const [professores, setProfessores] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para controlar o modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMateria, setEditingMateria] = useState<MateriaWithTeachers | null>(null);
  
  // Estados para controlar o diálogo de confirmação de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [materiaToDelete, setMateriaToDelete] = useState<MateriaWithTeachers | null>(null);
  const { canEdit, canDelete, isAdmin } = usePermissions();

  // Obter página atual e termo de busca dos parâmetros da URL
  const paginaAtual = searchParams?.get('page') || '1';
  const termoBusca = searchParams?.get('search') || '';

  /**
   * Função para buscar matérias
   */
  const buscarMateriasData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await buscarMaterias({
        page: paginaAtual,
        search: termoBusca,
        limit: ITENS_POR_PAGINA.toString(),
      });
      
      setMaterias(result.materias);
      setTotalMaterias(result.total);
    } catch (error) {
      console.error('Erro ao buscar matérias:', error);
      toast.error('Erro ao buscar matérias');
    } finally {
      setLoading(false);
    }
  }, [paginaAtual, termoBusca]);

  /**
   * Função para buscar professores
   */
  const buscarProfessoresData = useCallback(async () => {
    try {
      const result = await buscarProfessores();
      // Mapear para o tipo Teacher completo
      const professoresCompletos = result.map(prof => ({
        ...prof,
        profileId: prof.id, // Usar o id como profileId temporariamente
        phone: null
      }));
      setProfessores(professoresCompletos);
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
    }
  }, []);

  /**
   * Função para abrir modal de adicionar/editar matéria
   */
  const handleOpenModal = (materia: MateriaWithTeachers | null = null) => {
    setEditingMateria(materia);
    setIsModalOpen(true);
  };

  /**
   * Função para fechar o modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMateria(null);
  };

  /**
   * Função para abrir diálogo de confirmação de exclusão
   */
  const handleOpenDeleteDialog = (materia: MateriaWithTeachers) => {
    setMateriaToDelete(materia);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Função para confirmar exclusão
   */
  const handleConfirmDelete = async () => {
    if (!materiaToDelete) return;

    try {
      const result = await deleteMateria(materiaToDelete.id);
      if (result.success) {
        toast.success('Matéria excluída com sucesso!');
        buscarMateriasData(); // Recarregar a lista
      } else {
        toast.error(result.message || 'Erro ao excluir matéria');
      }
    } catch (error) {
      console.error('Erro ao excluir matéria:', error);
      toast.error('Erro ao excluir matéria');
    } finally {
      setIsDeleteDialogOpen(false);
      setMateriaToDelete(null);
    }
  };

  /**
   * Função chamada quando uma matéria é criada/editada com sucesso
   */
  const handleSuccess = () => {
    buscarMateriasData();
    handleCloseModal();
  };

  // Definir colunas da tabela
  const columns: ColumnDef<MateriaWithTeachers>[] = [
    {
      accessorKey: 'name',
      header: 'Nome da Matéria',
    },
    {
      accessorKey: 'teachers',
      header: 'Professores',
      cell: ({ row }) => {
        const teachers = row.getValue('teachers') as TeacherSelect[];
        return (
          <div className="flex flex-wrap gap-1">
            {teachers.length > 0 ? (
              teachers.map((teacher) => (
                <Badge key={teacher.id} variant="secondary">
                  {teacher.name} {teacher.surname}
                </Badge>
              ))
            ) : (
              <span className="text-gray-500">Nenhum professor</span>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const materia = row.original;
        return (
          <div className="flex space-x-2">
            {canEdit() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenModal(materia)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDelete() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDeleteDialog(materia)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // Carregar dados quando o componente montar ou os parâmetros mudarem
  useEffect(() => {
    buscarMateriasData();
  }, [buscarMateriasData]);

  // Carregar professores uma vez
  useEffect(() => {
    buscarProfessoresData();
  }, [buscarProfessoresData]);

  const totalPaginas = Math.ceil(totalMaterias / ITENS_POR_PAGINA);
  const hasNextPage = Number(paginaAtual) < totalPaginas;
  const hasPrevPage = Number(paginaAtual) > 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matérias"
        buttonLabel="Adicionar Matéria"
        onButtonClick={() => handleOpenModal()}
        entityType="MATERIA"
        showButton={isAdmin()}
      />

      <div className="flex items-center space-x-4">
        <SearchInput placeholder="Buscar matérias..." />
      </div>

      <DataTable
        columns={columns}
        data={materias}
      />

      <PaginationControls
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />

      {/* Modal de adicionar/editar matéria */}
      <MateriaForm
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        professores={professores}
        materia={editingMateria ? {
          id: editingMateria.id,
          name: editingMateria.name,
          teachers: editingMateria.teachers.map(t => ({
            id: t.id,
            name: t.name,
            surname: t.surname,
            email: t.email,
            profileId: '',
            phone: null
          } as Teacher)),
        } : null}
        onSuccess={handleSuccess}
      />

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir a matéria &quot;{materiaToDelete?.name}&quot;?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Página principal de Matérias com Suspense
 */
export default function MateriasPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <MateriasPageContent />
    </Suspense>
  );
}