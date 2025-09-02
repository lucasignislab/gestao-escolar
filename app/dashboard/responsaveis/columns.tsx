// app/dashboard/responsaveis/columns.tsx
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
// Tipo para responsável com relações incluídas
type ResponsavelWithRelations = {
  id: string;
  name: string;
  surname: string;
  email: string;
  profileId: string;
  profile: {
    avatarUrl: string | null;
  };
  _count: {
    children: number;
  };
};

interface CreateColumnsProps {
  onEdit: (responsavel: ResponsavelWithRelations) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
  isAdmin: boolean;
}

export function createColumns({ onEdit, onDelete, canEdit, canDelete, isAdmin }: CreateColumnsProps): ColumnDef<ResponsavelWithRelations>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => {
        const responsavel = row.original;
        return `${responsavel.name} ${responsavel.surname}`;
      },
    },
    {
      accessorKey: "email",
      header: "E-mail",
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      cell: ({ row }) => {
        const phone = row.getValue("phone") as string;
        return phone || "-";
      },
    },
    {
      accessorKey: "_count",
      header: "Filhos",
      cell: ({ row }) => {
        const count = row.original._count.children;
        return count > 0 ? `${count} filho(s)` : "-";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const responsavel = row.original;
        
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
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(responsavel.id)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar ID
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(responsavel)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(responsavel.id)}
                  className="text-red-600"
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

export type { ResponsavelWithRelations };