// app/dashboard/administradores/columns.tsx
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
import { usePermissions } from '@/hooks/usePermissions';
import { Role } from '@prisma/client';

// Tipo para administrador baseado nos dados retornados pela Server Action
type AdministradorWithRelations = {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  role: Role;
};

interface CreateColumnsProps {
  onEdit: (administrador: AdministradorWithRelations) => void;
  onDelete: (id: string) => void;
}

export function createColumns({ onEdit, onDelete }: CreateColumnsProps): ColumnDef<AdministradorWithRelations>[] {
  return [
    {
      accessorKey: "username",
      header: "Nome de Usuário",
      cell: ({ row }) => {
        const administrador = row.original;
        return administrador.username || 'N/A';
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const administrador = row.original;
        const { canEdit, canDelete, isAdmin } = usePermissions();
        
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
              {isAdmin() && (
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(administrador.id)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar ID
                </DropdownMenuItem>
              )}
              {canEdit('administrador') && (
                <DropdownMenuItem onClick={() => onEdit(administrador)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canDelete('administrador') && (
                <DropdownMenuItem
                  onClick={() => onDelete(administrador.id)}
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

export type { AdministradorWithRelations };