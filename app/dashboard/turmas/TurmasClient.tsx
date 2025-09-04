// app/dashboard/turmas/TurmasClient.tsx
"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";
import { deleteTurmaAction as deleteTurma } from "./actions";
import TurmaForm from "./TurmaForm";
import { Class } from "@prisma/client";

// Tipo para turma com relações incluídas
import { TurmaComRelacoes } from './columns';



// Tipo para ano escolar
type AnoEscolar = {
  id: string;
  level: number;
};

interface TurmasClientProps {
  initialTurmas: TurmaComRelacoes[];
  professores: {
    id: string;
    name: string;
    surname: string;
    profileId: string;
    email: string;
    phone: string | null;
  }[];
  anosEscolares: AnoEscolar[];
}

export default function TurmasClient({ 
  initialTurmas, 
  professores, 
  anosEscolares 
}: TurmasClientProps) {
  const [turmas, setTurmas] = useState<TurmaComRelacoes[]>(initialTurmas);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [turmaToEdit, setTurmaToEdit] = useState<TurmaComRelacoes | null>(null);
  const [deletingTurmaId, setDeletingTurmaId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // Função para adicionar nova turma
  const handleAdd = () => {
    setTurmaToEdit(null);
    setIsFormOpen(true);
  };

  // Função para editar turma
  const handleEdit = (turma: TurmaComRelacoes) => {
    setTurmaToEdit(turma);
    setIsFormOpen(true);
  };

  // Função para fechar formulário
  const handleFormClose = () => {
    setIsFormOpen(false);
    setTurmaToEdit(null);
  };

  // Função para sucesso do formulário
  const handleFormSuccess = async () => {
    // Recarregar a lista de turmas
    try {
      // Por enquanto, vamos apenas recarregar a página
      window.location.reload();
    } catch (error) {
      console.error('Erro ao recarregar turmas:', error);
    }
  };

  // Função para confirmar exclusão
  const handleDeleteTurma = (id: string) => {
    setDeletingTurmaId(id);
    setIsDeleteDialogOpen(true);
  };

  // Função para executar exclusão
  const confirmDeleteTurma = async () => {
    if (!deletingTurmaId) return;

    try {
      const result = await deleteTurma(deletingTurmaId);
      
      if (result.success) {
        // Remover a turma da lista local
        setTurmas(prev => prev.filter(turma => turma.id !== deletingTurmaId));
        setIsDeleteDialogOpen(false);
        setDeletingTurmaId(null);
      } else {
        alert(result.message || "Erro ao excluir turma");
      }
    } catch (error) {
      console.error("Erro ao excluir turma:", error);
      alert("Erro ao excluir turma");
    }
  };





  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <PageHeader 
        title="Turmas" 
        buttonLabel="Adicionar Turma" 
        onButtonClick={handleAdd}
        entityType="turma"
      />
      <p className="text-muted-foreground mb-6">
        Gerencie as turmas da escola
      </p>

      {/* Tabela de turmas */}
      <DataTable
        columns={columns(handleEdit, (turma) => handleDeleteTurma(turma.id))}
        data={turmas}
      />



      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.
              {deletingTurmaId && (
                <span className="block mt-2 text-sm text-muted-foreground">
                  Nota: Turmas com alunos matriculados não podem ser excluídas.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTurma}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TurmaForm
        isOpen={isFormOpen}
        onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) {
            handleFormClose();
            handleFormSuccess();
          }
        }}
        turma={turmaToEdit}
        professores={professores}
        anosEscolares={anosEscolares}
      />
    </div>
  );
}