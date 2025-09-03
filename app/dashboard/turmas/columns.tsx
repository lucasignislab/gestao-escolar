// app/dashboard/turmas/columns.tsx 
'use client'; 

import { ColumnDef } from '@tanstack/react-table'; 
import { Button } from '@/components/ui/button'; 
import { Class, Grade, Teacher } from '@prisma/client'; 

// Definimos um tipo que inclui as relações para facilitar o acesso 
export type TurmaComRelacoes = Class & { 
  grade: Grade | { id: string; level: number }; 
  supervisor: Teacher | { id: string; name: string; surname: string } | null; 
  _count?: { 
    students: number; 
  }; 
}; 

// Tipo para compatibilidade com os dados retornados pelo Prisma
export type TurmaWithRelations = Class & {
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


export const columns = ( 
  onEdit: (turma: TurmaComRelacoes) => void, 
  onDelete: (turma: TurmaComRelacoes) => void 
): ColumnDef<TurmaComRelacoes>[] => [ 
  { 
    accessorKey: 'name', 
    header: 'Nome da Turma', 
  }, 
  { 
    accessorKey: 'grade.level', 
    header: 'Ano Escolar', 
    cell: ({ row }) => `${row.original.grade.level}º Ano`, 
  }, 
  { 
    accessorKey: 'supervisor.name', 
    header: 'Professor Supervisor', 
    cell: ({ row }) => row.original.supervisor 
      ? `${row.original.supervisor.name} ${row.original.supervisor.surname}` 
      : 'Nenhum', 
  }, 
  { 
    accessorKey: 'capacity', 
    header: 'Capacidade', 
  }, 
  { 
    id: 'actions', 
    cell: ({ row }) => ( 
      <div className="space-x-2 text-right"> 
        <Button variant="outline" size="sm" onClick={() => onEdit(row.original)}> 
          Editar 
        </Button> 
        <Button variant="destructive" size="sm" onClick={() => onDelete(row.original)}> 
          Excluir 
        </Button> 
      </div> 
    ), 
  }, 
];