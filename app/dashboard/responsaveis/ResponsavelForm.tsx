// app/dashboard/responsaveis/ResponsavelForm.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Parent } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { responsavelSchema, ResponsavelFormData } from '@/lib/schemas';
import { createResponsavel, updateResponsavel } from './actions';
import { toast } from 'sonner';
import { useState } from 'react';
import { client, storage } from '@/lib/appwrite';

/**
 * Interface para as propriedades do componente ResponsavelForm
 */
interface ResponsavelFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  responsavel: Parent | null;
}

/**
 * Componente de formulário modal para adicionar/editar responsáveis
 * @param isOpen - Estado de visibilidade do modal
 * @param onOpenChange - Função para controlar a abertura/fechamento do modal
 * @param responsavel - Dados do responsável para edição (null para novo responsável)
 */
export default function ResponsavelForm({ isOpen, onOpenChange, responsavel }: ResponsavelFormProps) {
  const formTitle = responsavel ? 'Editar Responsável' : 'Adicionar Novo Responsável';
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResponsavelFormData>({
    resolver: zodResolver(responsavelSchema),
    defaultValues: responsavel ? {
      name: responsavel.name,
      surname: responsavel.surname,
      email: responsavel.email,
    } : {
      name: '',
      surname: '',
      email: '',
    },
  });

  /**
   * Função para fazer upload de arquivo para o Appwrite Storage
   * @param event - Evento de mudança do input file
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para fazer upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;

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
      toast.error('Erro ao fazer upload da imagem: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Função para lidar com o envio do formulário
   * @param data - Dados validados do formulário
   */
  const onSubmit = async (data: ResponsavelFormData) => {
    const formData = new FormData();
    
    // Se estiver editando, adicionar o ID do responsável
    if (responsavel) {
      formData.append('id', responsavel.id);
    }
    
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    // Adicionar URL do avatar se foi feito upload
    if (avatarUrl) {
      formData.append('avatarUrl', avatarUrl);
    }

    // Chamar a action apropriada (create ou update)
    const result = responsavel 
      ? await updateResponsavel(formData)
      : await createResponsavel(formData);

    if (result.success) {
      toast.success(responsavel ? 'Responsável atualizado com sucesso!' : 'Responsável criado com sucesso!');
      onOpenChange(false);
    } else {
      toast.error(result.message || (responsavel ? 'Falha ao atualizar responsável.' : 'Falha ao criar responsável.'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
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
            <Label htmlFor="avatar">Foto do Perfil</Label>
            <Input 
              id="avatar" 
              type="file" 
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading && <p className="text-sm text-blue-500">Fazendo upload...</p>}
            {avatarUrl && (
              <div className="mt-2">
                <img 
                  src={avatarUrl} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded-full"
                />
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={uploading}>
            {responsavel ? 'Atualizar' : 'Criar'} Responsável
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}