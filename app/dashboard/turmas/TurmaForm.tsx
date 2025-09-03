// app/dashboard/turmas/TurmaForm.tsx 
'use client'; 

import { useForm } from 'react-hook-form'; 
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
  const form = useForm<TurmaFormData>({ 
    resolver: zodResolver(turmaSchema), 
    defaultValues: turma || { name: "", capacity: 25 }, 
  }); 

  const onSubmit = async (data: TurmaFormData) => { 
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"> 
          <div> 
            <Label htmlFor="name">Nome da Turma (Ex: 1A, 2B)</Label> 
            <Input id="name" {...form.register('name')} /> 
            {form.formState.errors.name && <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>} 
          </div> 
          <div> 
            <Label htmlFor="capacity">Capacidade de Alunos</Label> 
            <Input id="capacity" type="number" {...form.register('capacity')} /> 
            {form.formState.errors.capacity && <p className="text-sm text-red-500 mt-1">{form.formState.errors.capacity.message}</p>} 
          </div> 
          <div> 
            <Label>Ano Escolar</Label> 
            <Select onValueChange={(value) => form.setValue('gradeId', value)} defaultValue={turma?.gradeId}> 
              <SelectTrigger><SelectValue placeholder="Selecione o ano escolar" /></SelectTrigger> 
              <SelectContent> 
                {anosEscolares.map((grade) => ( 
                  <SelectItem key={grade.id} value={grade.id}>{grade.level}º Ano</SelectItem> 
                ))} 
              </SelectContent> 
            </Select> 
             {form.formState.errors.gradeId && <p className="text-sm text-red-500 mt-1">{form.formState.errors.gradeId.message}</p>} 
          </div> 
          <div> 
            <Label>Professor Supervisor</Label> 
            <Select onValueChange={(value) => form.setValue('supervisorId', value)} defaultValue={turma?.supervisorId || undefined}> 
              <SelectTrigger><SelectValue placeholder="Selecione um professor" /></SelectTrigger> 
              <SelectContent> 
                {professores.map((prof) => ( 
                  <SelectItem key={prof.id} value={prof.id}>{prof.name} {prof.surname}</SelectItem> 
                ))} 
              </SelectContent> 
            </Select> 
            {form.formState.errors.supervisorId && <p className="text-sm text-red-500 mt-1">{form.formState.errors.supervisorId.message}</p>} 
          </div> 
          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full"> 
            {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'} 
          </Button> 
        </form> 
      </DialogContent> 
    </Dialog> 
  ); 
}