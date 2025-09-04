// app/dashboard/professores/columns.tsx
'use client';

import { ColumnDef, Row } from '@tanstack/react-table';
import { Teacher as PrismaTeacher } from '@prisma/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit } from 'lucide-react';
import { getAvatarUrl } from '@/lib/appwrite';
import Image from 'next/image';

/**
 * Interface extendida para incluir o perfil
 */
interface TeacherWithProfile extends PrismaTeacher {
  profile?: {
    avatarUrl?: string | null;
  };
}

/**
 * Interface para as props das colunas
 */
interface ColumnsProps {
  onEdit: (teacher: TeacherWithProfile) => void;
  onDelete: (teacher: TeacherWithProfile) => void;
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
// Definição básica das colunas sem ações
const baseColumns: ColumnDef<TeacherWithProfile>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
    cell: ({ row }) => {
      const avatarUrl = row.original.profile?.avatarUrl;
      return (
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100">
            {avatarUrl ? (
              <Image
                src={getAvatarUrl(avatarUrl)}
                alt={`Avatar de ${row.original.name}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                {row.original.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span>{`${row.original.name} ${row.original.surname}`}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'E-mail',
  },
  {
    accessorKey: 'phone',
    header: 'Telefone',
  }
];

// Exportação para o novo código com função de edição
export const columns = (onEdit: (teacher: TeacherWithProfile) => void) => {
  return [
    ...baseColumns,
    {
      id: 'actions',
      cell: ({ row }: { row: Row<TeacherWithProfile> }) => {
        const professor = row.original;
        
        return (
          <Button variant="ghost" size="sm" onClick={() => onEdit(professor)}>
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        );
      },
    },
  ];
};

// Exportação para compatibilidade com o código antigo (com ações)
export const createColumns = ({ onEdit, onDelete, canEdit, canDelete, isAdmin }: ColumnsProps): ColumnDef<TeacherWithProfile>[] => [
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