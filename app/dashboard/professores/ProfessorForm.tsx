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
import { createProfessor, updateProfessor, createProfessorAction, updateProfessorAction } from './actions';
import { toast } from 'sonner';
import { useState } from 'react';
import { client, storage } from '@/lib/appwrite';

/**
 * Interface para as propriedades do componente ProfessorForm
 */
interface ProfessorFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  teacher: Teacher | null;
}

/**
 * Componente de formulário modal para adicionar/editar professores
 * @param isOpen - Estado de visibilidade do modal
 * @param onOpenChange - Função para controlar a abertura/fechamento do modal
 * @param teacher - Dados do professor para edição (null para novo professor)
 */
export default function ProfessorForm({ isOpen, onOpenChange, teacher }: ProfessorFormProps) {
  const formTitle = teacher ? 'Editar Professor' : 'Adicionar Novo Professor';
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setError } = useForm<ProfessorFormData>({
    resolver: zodResolver(professorSchema),
    defaultValues: teacher ? {
      name: teacher.name,
      surname: teacher.surname,
      email: teacher.email,
      phone: teacher.phone || '',
    } : {
      name: '',
      surname: '',
      email: '',
      phone: '',
    },
  });

  /**
   * Função para fazer upload da imagem do avatar
   * @param file - Arquivo de imagem selecionado
   */
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      
      // Upload para o Appwrite Storage
      const response = await storage.createFile(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
        fileName,
        file
      );

      // Obter a URL pública do arquivo
      const fileUrl = storage.getFileView(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
        response.$id
      );

      setAvatarUrl(fileUrl.toString());
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro no upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

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
        if (avatarUrl) {
          // Nota: avatarUrl será tratado separadamente no backend
          // pois está na tabela Profile, não diretamente em Teacher
          (updateData as any).avatarUrl = avatarUrl;
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
          <div className="grid gap-2">
            <Label htmlFor="avatar">Foto do Professor</Label>
            <Input 
              id="avatar" 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
              disabled={uploading}
            />
            {uploading && <p className="text-sm text-blue-500">Fazendo upload...</p>}
            {avatarUrl && (
              <div className="mt-2">
                <img 
                  src={avatarUrl} 
                  alt="Preview" 
                  className="w-20 h-20 rounded-full object-cover border"
                />
                <p className="text-sm text-green-500 mt-1">Imagem carregada com sucesso!</p>
              </div>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={uploading || isSubmitting}>
            {isSubmitting 
              ? 'Salvando...' 
              : teacher ? 'Salvar Alterações' : 'Criar Professor'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}