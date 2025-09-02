// app/dashboard/professores/columns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Teacher } from '@prisma/client'; // Importe o tipo gerado pelo Prisma
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

/**
 * Interface para as props das colunas
 */
interface ColumnsProps {
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  canEdit: boolean;
  canDelete: boolean;
  isAdmin: boolean;
}

/**
 * Função que retorna as definições das colunas para a tabela de professores
 * Utiliza tipos gerados pelo Prisma para garantir type safety
 * @param onEdit - Função para editar um professor
 * @param onDelete - Função para excluir um professor
 */
export const createColumns = ({ onEdit, onDelete, canEdit, canDelete, isAdmin }: ColumnsProps): ColumnDef<Teacher>[] => [
  {
    accessorKey: 'name',
    header: 'Nome',
    cell: ({ row }) => `${row.original.name} ${row.original.surname}`,
  },
  {
    accessorKey: 'email',
    header: 'E-mail',
  },
  {
    accessorKey: 'phone',
    header: 'Telefone',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const professor = row.original;
      
      // Verificar se o usuário pode editar este professor
      const canEditProfessor = canEdit;
      const canDeleteProfessor = canDelete;
      
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(professor.id)}>
                Copiar ID
              </DropdownMenuItem>
            )}
            {canEditProfessor && (
              <DropdownMenuItem onClick={() => onEdit(professor)}>Editar</DropdownMenuItem>
            )}
            {canDeleteProfessor && (
              <DropdownMenuItem 
                className="text-red-500" 
                onClick={() => onDelete(professor)}
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