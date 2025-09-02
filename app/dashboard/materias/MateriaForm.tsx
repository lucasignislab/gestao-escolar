// app/dashboard/materias/MateriaForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Teacher } from '@prisma/client';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { toast } from 'sonner';
import { createMateria, updateMateria } from './actions';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { materiaSchema, type MateriaFormData } from '@/lib/schemas';

interface MateriaFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  professores: Teacher[];
  materia?: {
    id: string;
    name: string;
    teachers: Teacher[];
  } | null;
  onSuccess?: () => void;
}

export default function MateriaForm({
  isOpen,
  onOpenChange,
  professores,
  materia,
  onSuccess,
}: MateriaFormProps) {
  const [selectedProfessores, setSelectedProfessores] = useState<Teacher[]>([]);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MateriaFormData>({
    resolver: zodResolver(materiaSchema),
    defaultValues: {
      name: '',
      teacherIds: [],
    },
  });

  // Resetar formulário quando abrir/fechar ou mudar matéria
  useEffect(() => {
    if (isOpen) {
      if (materia) {
        // Modo edição
        form.reset({
          id: materia.id,
          name: materia.name,
          teacherIds: materia.teachers.map(t => t.id),
        });
        setSelectedProfessores(materia.teachers);
      } else {
        // Modo criação
        form.reset({
          name: '',
          teacherIds: [],
        });
        setSelectedProfessores([]);
      }
    }
  }, [isOpen, materia, form]);

  // Sincronizar professores selecionados com o formulário
  useEffect(() => {
    form.setValue('teacherIds', selectedProfessores.map(p => p.id));
  }, [selectedProfessores, form]);

  const handleSelectProfessor = (professor: Teacher) => {
    const isAlreadySelected = selectedProfessores.some(p => p.id === professor.id);
    
    if (isAlreadySelected) {
      // Remover professor
      setSelectedProfessores(prev => prev.filter(p => p.id !== professor.id));
    } else {
      // Adicionar professor
      setSelectedProfessores(prev => [...prev, professor]);
    }
  };

  const handleRemoveProfessor = (professorId: string) => {
    setSelectedProfessores(prev => prev.filter(p => p.id !== professorId));
  };

  const onSubmit = async (data: MateriaFormData) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      if (data.id) {
        formData.append('id', data.id);
      }
      
      formData.append('name', data.name);
      
      // Adicionar IDs dos professores
      data.teacherIds.forEach(teacherId => {
        formData.append('teacherIds', teacherId);
      });

      // Chamar as Server Actions
      const result = materia 
        ? await updateMateria(formData)
        : await createMateria(formData);
      
      if (!result.success) {
         throw new Error(result.message || 'Erro ao salvar matéria');
       }
      
      toast.success(
        materia 
          ? 'Matéria atualizada com sucesso!' 
          : 'Matéria criada com sucesso!'
      );
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar matéria:', error);
      toast.error('Erro ao salvar matéria. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {materia ? 'Editar Matéria' : 'Nova Matéria'}
          </DialogTitle>
          <DialogDescription>
            {materia 
              ? 'Edite as informações da matéria e selecione os professores que irão lecioná-la.'
              : 'Preencha as informações da nova matéria e selecione os professores que irão lecioná-la.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo Nome */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Matéria</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Matemática, Português, História..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Professores */}
            <FormField
              control={form.control}
              name="teacherIds"
              render={() => (
                <FormItem>
                  <FormLabel>Professores</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      {/* Seletor com Command */}
                      <Popover open={isCommandOpen} onOpenChange={setIsCommandOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isCommandOpen}
                            className="w-full justify-between"
                          >
                            {selectedProfessores.length === 0
                              ? 'Selecione os professores...'
                              : `${selectedProfessores.length} professor(es) selecionado(s)`
                            }
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar professor..." />
                            <CommandList>
                              <CommandEmpty>Nenhum professor encontrado.</CommandEmpty>
                              <CommandGroup>
                                {professores.map((professor) => {
                                  const isSelected = selectedProfessores.some(p => p.id === professor.id);
                                  return (
                                    <CommandItem
                                      key={professor.id}
                                      value={`${professor.name} ${professor.surname}`}
                                      onSelect={() => handleSelectProfessor(professor)}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          isSelected ? 'opacity-100' : 'opacity-0'
                                        )}
                                      />
                                      {professor.name} {professor.surname}
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {/* Lista de professores selecionados */}
                      {selectedProfessores.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedProfessores.map((professor) => (
                            <Badge
                              key={professor.id}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {professor.name} {professor.surname}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 ml-1 hover:bg-transparent"
                                onClick={() => handleRemoveProfessor(professor.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Salvando...'
                  : materia
                  ? 'Atualizar'
                  : 'Criar'
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}