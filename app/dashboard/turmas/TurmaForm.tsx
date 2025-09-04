'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grade, Teacher } from '@prisma/client';
import { createTurmaAction, updateTurmaAction } from './actions';
import { TurmaComRelacoes } from './columns';
import * as z from 'zod';

// Definindo o schema do formulário
const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "O nome da turma deve ter no mínimo 2 caracteres." }),
  capacity: z.number().min(1, { message: "A capacidade deve ser de no mínimo 1." }),
  gradeId: z.string().min(1, { message: "Selecione um ano escolar." }),
  supervisorId: z.string().min(1, { message: "Selecione um professor supervisor." }),
});

type FormData = z.infer<typeof formSchema>;

interface TurmaFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  turma: TurmaComRelacoes | null;
  anosEscolares: Grade[];
  professores: Teacher[];
}

export default function TurmaForm({ isOpen, onOpenChange, turma, anosEscolares, professores }: TurmaFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: turma?.name || "",
      capacity: turma?.capacity || 25,
      gradeId: turma?.gradeId || "",
      supervisorId: turma?.supervisorId || "",
      id: turma?.id
    },
  });

  async function onSubmit(data: FormData) {
    try {
      const action = turma ? updateTurmaAction : createTurmaAction;
      const result = await action(turma ? { ...data, id: turma.id } : data);

      if (result.success) {
        toast.success(`Turma ${turma ? 'atualizada' : 'criada'} com sucesso!`);
        onOpenChange(false);
      } else {
        toast.error(result.message || 'Ocorreu um erro.');
      }
    } catch {
      toast.error('Ocorreu um erro ao processar a requisição.');
    }
  }

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
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="capacity">Capacidade de Alunos</Label>
            <Input id="capacity" type="number" {...form.register('capacity', { valueAsNumber: true })} />
            {form.formState.errors.capacity && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.capacity.message}</p>
            )}
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
            {form.formState.errors.gradeId && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.gradeId.message}</p>
            )}
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
            {form.formState.errors.supervisorId && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.supervisorId.message}</p>
            )}
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
            {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
