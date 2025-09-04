// app/dashboard/turmas/TurmaForm.tsx 
'use client'; 

import { useForm, SubmitHandler } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod'; 
import { toast } from 'sonner'; 
import { TurmaFormData, turmaSchema } from '@/lib/schemas'; 
import { Button } from '@/components/ui/button'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; 
import { Input } from '@/components/ui/input'; 
import { Label } from '@/components/ui/label'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; 
import { Grade, Teacher } from '@prisma/client'; 
import { createTurmaAction, updateTurmaAction } from './actions'; 
import { TurmaComRelacoes } from './columns'; 

interface TurmaFormProps { 
  isOpen: boolean; 
  onOpenChange: (isOpen: boolean) => void; 
  turma: TurmaComRelacoes | null; 
  anosEscolares: Grade[]; 
  professores: Teacher[]; 
} 

export default function TurmaForm({ isOpen, onOpenChange, turma, anosEscolares, professores }: TurmaFormProps) { 
  const { register, handleSubmit, setValue, formState } = useForm<TurmaFormData>({ 
    resolver: zodResolver(turmaSchema),
    defaultValues: {
      name: turma?.name || "",
      capacity: turma?.capacity || 25,
      gradeId: turma?.gradeId || "",
      supervisorId: turma?.supervisorId || "",
      id: turma?.id
    },
  }); 

  const onSubmit: SubmitHandler<TurmaFormData> = async (data) => { 
    const action = turma ? updateTurmaAction : createTurmaAction; 
    const result = await action(turma ? { ...data, id: turma.id } : data); 

    if (result.success) { 
      toast.success(`Turma ${turma ? 'atualizada' : 'criada'} com sucesso!`); 
      onOpenChange(false); 
    } else { 
      toast.error(result.message || 'Ocorreu um erro.'); 
    } 
  }; 

  return ( 
    <Dialog open={isOpen} onOpenChange={onOpenChange}> 
      <DialogContent> 
        <DialogHeader> 
          <DialogTitle>{turma ? 'Editar Turma' : 'Adicionar Nova Turma'}</DialogTitle> 
        </DialogHeader> 
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Turma (Ex: 1A, 2B)</Label>
            <Input id="name" {...register('name')} />
            {formState.errors.name && <p className="text-sm text-red-500 mt-1">{formState.errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="capacity">Capacidade de Alunos</Label>
            <Input id="capacity" type="number" {...register('capacity', { valueAsNumber: true })} />
            {formState.errors.capacity && <p className="text-sm text-red-500 mt-1">{formState.errors.capacity.message}</p>}
          </div>
          <div>
            <Label>Ano Escolar</Label>
            <Select onValueChange={(value) => setValue('gradeId', value)} defaultValue={turma?.gradeId}>
              <SelectTrigger><SelectValue placeholder="Selecione o ano escolar" /></SelectTrigger>
              <SelectContent>
                {anosEscolares.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>{grade.level}º Ano</SelectItem>
                ))}
              </SelectContent>
            </Select>
             {formState.errors.gradeId && <p className="text-sm text-red-500 mt-1">{formState.errors.gradeId.message}</p>}
          </div>
          <div>
            <Label>Professor Supervisor</Label>
            <Select onValueChange={(value) => setValue('supervisorId', value)} defaultValue={turma?.supervisorId || undefined}>
              <SelectTrigger><SelectValue placeholder="Selecione um professor" /></SelectTrigger>
              <SelectContent>
                {professores.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>{prof.name} {prof.surname}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formState.errors.supervisorId && <p className="text-sm text-red-500 mt-1">{formState.errors.supervisorId.message}</p>}
          </div>
          <Button type="submit" disabled={formState.isSubmitting} className="w-full">
            {formState.isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button> 
        </form> 
      </DialogContent> 
    </Dialog> 
  ); 
}