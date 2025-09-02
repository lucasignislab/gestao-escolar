// app/dashboard/alunos/columns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Student } from '@prisma/client'; // Importe o tipo gerado pelo Prisma
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
/**
 * Tipo para aluno com relações incluídas
 */
type StudentWithRelations = Student & {
  parent: {
    name: string;
    surname: string;
  };
  class: {
    name: string;
  };
  grade: {
    level: number;
  };
};

/**
 * Interface para as props das colunas
 */
interface ColumnsProps {
  onEdit: (student: StudentWithRelations) => void;
  onDelete: (student: StudentWithRelations) => void;
  canEdit: boolean;
  canDelete: boolean;
  isAdmin: boolean;
  isResponsavel: boolean;
  userId?: string;
}

/**
 * Função que retorna as definições das colunas para a tabela de alunos
 * Utiliza tipos gerados pelo Prisma para garantir type safety
 * @param onEdit - Função para editar um aluno
 * @param onDelete - Função para excluir um aluno
 */
export const createColumns = ({ onEdit, onDelete, canEdit, canDelete, isAdmin, isResponsavel, userId }: ColumnsProps): ColumnDef<StudentWithRelations>[] => [
  {
    accessorKey: 'name',
    header: 'Nome',
    cell: ({ row }) => `${row.original.name} ${row.original.surname}`,
  },
  {
    accessorKey: 'grade',
    header: 'Ano',
    cell: ({ row }) => `${row.original.grade.level}º Ano`,
  },
  {
    accessorKey: 'class',
    header: 'Turma',
    cell: ({ row }) => row.original.class.name,
  },
  {
    accessorKey: 'parent',
    header: 'Responsável',
    cell: ({ row }) => `${row.original.parent.name} ${row.original.parent.surname}`,
  },
  {
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => {
      const aluno = row.original;
      
      // Verificar se o usuário pode editar este aluno
      // Responsáveis podem editar apenas seus próprios filhos
      const canEditAluno = isAdmin || (isResponsavel && aluno.parentId === userId);
      const canDeleteAluno = canDelete;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(aluno.id)}>
                Copiar ID
              </DropdownMenuItem>
            )}
            {canEditAluno && (
              <DropdownMenuItem onClick={() => onEdit(aluno)}>Editar</DropdownMenuItem>
            )}
            {canDeleteAluno && (
              <DropdownMenuItem 
                className="text-red-500" 
                onClick={() => onDelete(aluno)}
              >
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Exportar o tipo para uso em outros componentes
export type { StudentWithRelations };