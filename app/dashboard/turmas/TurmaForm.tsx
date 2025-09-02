// app/dashboard/turmas/TurmaForm.tsx
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { turmaSchema } from "@/lib/schemas";
import { createTurma, updateTurma } from "./actions";
import { toast } from "sonner";
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

// Tipo para professor
type Professor = {
  id: string;
  name: string;
  surname: string;
};

// Tipo para ano escolar
type AnoEscolar = {
  id: string;
  level: number;
};

interface TurmaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  turma?: TurmaWithRelations;
  professores: Professor[];
  anosEscolares: AnoEscolar[];
}

export default function TurmaForm({
  isOpen,
  onClose,
  onSuccess,
  turma,
  professores,
  anosEscolares,
}: TurmaFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!turma;

  const form = useForm<z.infer<typeof turmaSchema>>({
    resolver: zodResolver(turmaSchema),
    defaultValues: {
      name: turma?.name || "",
      capacity: turma?.capacity || 30,
      gradeId: turma?.gradeId || "",
      supervisorId: turma?.supervisorId || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof turmaSchema>) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('capacity', values.capacity.toString());
      formData.append('gradeId', values.gradeId);
      if (values.supervisorId) {
        formData.append('supervisorId', values.supervisorId);
      }

      if (isEditing) {
        formData.append('id', turma.id);
        const result = await updateTurma(formData);
        if (result.success) {
          toast.success("Turma editada com sucesso!");
          onSuccess();
          onClose();
        } else {
          toast.error(result.message || "Erro ao editar turma");
        }
      } else {
        const result = await createTurma(formData);
        if (result.success) {
          toast.success("Turma criada com sucesso!");
          onSuccess();
          onClose();
        } else {
          toast.error(result.message || "Erro ao criar turma");
        }
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Turma" : "Nova Turma"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite as informações da turma."
              : "Preencha as informações para criar uma nova turma."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: ControllerRenderProps<z.infer<typeof turmaSchema>, "name"> }) => (
                <FormItem>
                  <FormLabel>Nome da Turma</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Turma A, Turma B..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }: { field: ControllerRenderProps<z.infer<typeof turmaSchema>, "capacity"> }) => (
                <FormItem>
                  <FormLabel>Capacidade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="30"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gradeId"
              render={({ field }: { field: ControllerRenderProps<z.infer<typeof turmaSchema>, "gradeId"> }) => (
                <FormItem>
                  <FormLabel>Ano Escolar</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o ano escolar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {anosEscolares.map((ano) => (
                        <SelectItem key={ano.id} value={ano.id}>
                          {ano.level}º Ano
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supervisorId"
              render={({ field }: { field: ControllerRenderProps<z.infer<typeof turmaSchema>, "supervisorId"> }) => (
                <FormItem>
                  <FormLabel>Professor Supervisor (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um professor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Nenhum professor</SelectItem>
                      {professores.map((professor) => (
                        <SelectItem key={professor.id} value={professor.id}>
                          {professor.name} {professor.surname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Salvando..."
                  : isEditing
                  ? "Salvar Alterações"
                  : "Criar Turma"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}