// app/dashboard/turmas/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Copy, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Class } from "@prisma/client";
// Tipo para turma com relações incluídas
type TurmaWithRelations = Class & {
  grade: {
    id: string;
    level: number;
  };
  supervisor: {
    id: string;
    name: string;
    surname: string;
  } | null;
  _count: {
    students: number;
  };
};

interface ColumnsProps {
  onEdit: (turma: TurmaWithRelations) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
  isAdmin: boolean;
  isProfessor: boolean;
  userId?: string;
}

export function createColumns({ onEdit, onDelete, canDelete, isAdmin, isProfessor, userId }: ColumnsProps): ColumnDef<TurmaWithRelations>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome da Turma",
      cell: ({ row }) => {
        const turma = row.original;
        return (
          <div className="font-medium">
            {turma.name}
          </div>
        );
      },
    },
    {
      accessorKey: "grade",
      header: "Ano Escolar",
      cell: ({ row }) => {
        const turma = row.original;
        return (
          <div>
            {turma.grade.level}
          </div>
        );
      },
    },
    {
      accessorKey: "capacity",
      header: "Capacidade",
      cell: ({ row }) => {
        const turma = row.original;
        return (
          <div>
            {turma.capacity} alunos
          </div>
        );
      },
    },
    {
      accessorKey: "students",
      header: "Alunos Matriculados",
      cell: ({ row }) => {
        const turma = row.original;
        const studentsCount = turma._count.students;
        const capacity = turma.capacity;
        const percentage = capacity > 0 ? Math.round((studentsCount / capacity) * 100) : 0;
        
        return (
          <div className="flex items-center gap-2">
            <span>{studentsCount}/{capacity}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              percentage >= 90 ? 'bg-red-100 text-red-800' :
              percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {percentage}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "supervisor",
      header: "Professor Supervisor",
      cell: ({ row }) => {
        const turma = row.original;
        return (
          <div>
            {turma.supervisor 
              ? `${turma.supervisor.name} ${turma.supervisor.surname}`
              : "Não atribuído"
            }
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const turma = row.original;
        
        // Verificar se o usuário pode editar esta turma
        // Professores podem editar apenas turmas que supervisionam
        const canEditTurma = isAdmin || (isProfessor && turma.supervisor?.id === userId);
        const canDeleteTurma = canDelete;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              {isAdmin && (
                <>
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(turma.id)}
                    className="cursor-pointer"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {canEditTurma && (
                <DropdownMenuItem
                  onClick={() => onEdit(turma)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {canDeleteTurma && (
                <DropdownMenuItem
                  onClick={() => onDelete(turma.id)}
                  className="cursor-pointer text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}