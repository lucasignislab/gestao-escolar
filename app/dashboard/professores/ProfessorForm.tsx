// app/dashboard/professores/ProfessorForm.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Teacher } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { professorSchema, ProfessorFormData } from '@/lib/schemas';
import { createProfessorAction, updateProfessorAction } from './actions';
import { toast } from 'sonner';
import { useState } from 'react';
import ImageUploader from '@/components/upload/ImageUploader';
import Image from 'next/image';

/**
 * Interface para as propriedades do componente ProfessorForm
 */
interface ProfessorFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  teacher: (Teacher & { profile?: { avatarUrl?: string | null } }) | null;
}

/**
 * Componente de formulário modal para adicionar/editar professores
 * @param isOpen - Estado de visibilidade do modal
 * @param onOpenChange - Função para controlar a abertura/fechamento do modal
 * @param teacher - Dados do professor para edição (null para novo professor)
 */
export default function ProfessorForm({ isOpen, onOpenChange, teacher }: ProfessorFormProps) {
  const formTitle = teacher ? 'Editar Professor' : 'Adicionar Novo Professor';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, getValues, setError, formState: { errors }, reset } = useForm<ProfessorFormData>({
    resolver: zodResolver(professorSchema),
    defaultValues: teacher ? {
      name: teacher.name,
      surname: teacher.surname,
      email: teacher.email,
      phone: teacher.phone || '',
      avatarUrl: '',
    } : {
      name: '',
      surname: '',
      email: '',
      phone: '',
      avatarUrl: '',
    },
  });

  /**
   * Função para lidar com o envio do formulário
   * @param data - Dados validados do formulário
   */
  const onSubmit = async (data: ProfessorFormData) => {
    setIsSubmitting(true);
    try {
      // Se estiver editando, usar a nova action de atualização
      if (teacher) {
        // Preparar dados para atualização
        const updateData = {
          ...data,
          id: teacher.id
        };
        
        // Adicionar URL do avatar se foi feito upload
        const avatarUrl = getValues('avatarUrl');
        if (avatarUrl) {
          // O ID do arquivo do Appwrite será atualizado no perfil
          updateData.avatarUrl = avatarUrl;
        }

        const result = await updateProfessorAction(updateData);

        if (result.success) {
          toast.success('Professor atualizado com sucesso!');
          onOpenChange(false);
          reset(); // Resetar o formulário
        } else {
          toast.error(result.message || 'Falha ao atualizar professor.');
          
          // Exibir erros de validação nos campos específicos
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              if (messages && messages.length > 0) {
                setError(field as keyof ProfessorFormData, {
                  type: 'server',
                  message: messages[0]
                });
              }
            });
          }
        }
      } else {
        // Para criação, usar a action de criação
        const result = await createProfessorAction(data);

        if (result.success) {
          toast.success('Professor criado com sucesso!');
          reset(); // Resetar o formulário
          onOpenChange(false); // Fecha o modal
        } else {
          // Mostra uma mensagem de erro geral
          toast.error(result.message || 'Houve um erro.');
          
          // Exibir erros de validação nos campos específicos
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              if (messages && messages.length > 0) {
                setError(field as keyof ProfessorFormData, {
                  type: 'server',
                  message: messages[0]
                });
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar formulário:', error);
      toast.error('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="surname">Sobrenome</Label>
            <Input id="surname" {...register('surname')} />
            {errors.surname && <p className="text-sm text-red-500">{errors.surname.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" type="tel" {...register('phone')} />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>
          {/* Campo de upload de imagem */}
          <ImageUploader
            onUploadSuccess={(url) => {
              setValue('avatarUrl', url);
            }}
            label="Foto do Professor"
          />
          {teacher?.profile?.avatarUrl && (
            <div className="mt-2">
              <Image 
                src={teacher.profile.avatarUrl} 
                alt={`${teacher.name} ${teacher.surname}`}
                width={80}
                height={80}
                className="object-cover rounded-full"
              />
            </div>
          )}
          <input type="hidden" {...register('avatarUrl')} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting 
              ? 'Salvando...' 
              : teacher ? 'Salvar Alterações' : 'Criar Professor'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}