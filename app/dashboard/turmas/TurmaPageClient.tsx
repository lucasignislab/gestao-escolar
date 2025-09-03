// app/dashboard/turmas/TurmaPageClient.tsx 
'use client'; 

import { useState } from 'react'; 
import { toast } from 'sonner'; 
import { DataTable } from '@/components/DataTable'; 
import { Button } from '@/components/ui/button'; 
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'; 
import { Grade, Teacher } from '@prisma/client'; 
import { columns, TurmaComRelacoes } from './columns'; 
import TurmaForm from './TurmaForm'; 
import { deleteTurmaAction } from './actions'; 

interface ClientProps { 
  turmas: TurmaComRelacoes[]; 
  anosEscolares: Grade[]; 
  professores: Teacher[]; 
}

export default function TurmaPageClient({ turmas, anosEscolares, professores }: ClientProps) { 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isAlertOpen, setIsAlertOpen] = useState(false); 
  const [selectedTurma, setSelectedTurma] = useState<TurmaComRelacoes | null>(null); 

  const handleOpenModal = (turma: TurmaComRelacoes | null = null) => { 
    setSelectedTurma(turma); 
    setIsModalOpen(true); 
  }; 

  const handleOpenAlert = (turma: TurmaComRelacoes) => { 
    setSelectedTurma(turma); 
    setIsAlertOpen(true); 
  }; 

  const handleDelete = async () => { 
    if (!selectedTurma) return; 
    const result = await deleteTurmaAction(selectedTurma.id); 
    if (result.success) { 
      toast.success('Turma excluída com sucesso!'); 
    } else { 
      toast.error(result.message || 'Erro ao excluir turma.'); 
    } 
    setIsAlertOpen(false); 
  }; 

  const dynamicColumns = columns(handleOpenModal, handleOpenAlert);
  return ( 
    <div> 
      <div className="flex justify-between items-center mb-4"> 
        <h1 className="text-3xl font-bold">Turmas</h1> 
        <Button onClick={() => handleOpenModal()}>Adicionar Turma</Button> 
      </div> 
      <DataTable columns={dynamicColumns} data={turmas} /> 

      <TurmaForm 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        turma={selectedTurma} 
        anosEscolares={anosEscolares} 
        professores={professores} 
      /> 

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}> 
        <AlertDialogContent> 
          <AlertDialogHeader> 
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle> 
            <AlertDialogDescription> 
              Esta ação não pode ser desfeita. Isso irá excluir permanentemente a turma. 
            </AlertDialogDescription> 
          </AlertDialogHeader> 
          <AlertDialogFooter> 
            <AlertDialogCancel>Cancelar</AlertDialogCancel> 
            <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction> 
          </AlertDialogFooter> 
        </AlertDialogContent> 
      </AlertDialog> 
    </div> 
  );
}