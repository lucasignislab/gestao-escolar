// app/dashboard/administradores/AdministradorForm.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Profile } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { administradorSchema, AdministradorFormData } from '@/lib/schemas';
import { createAdministrador, updateAdministrador } from './actions';
import { toast } from 'sonner';
import { useState } from 'react';
import { client, storage } from '@/lib/appwrite';

/**
 * Interface para as propriedades do componente AdministradorForm
 */
interface AdministradorFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  administrador: Profile | null;
}

/**
 * Componente de formulário modal para adicionar/editar administradores
 * @param isOpen - Estado de visibilidade do modal
 * @param onOpenChange - Função para controlar a abertura/fechamento do modal
 * @param administrador - Dados do administrador para edição (null para novo administrador)
 */
export default function AdministradorForm({ isOpen, onOpenChange, administrador }: AdministradorFormProps) {
  const formTitle = administrador ? 'Editar Administrador' : 'Adicionar Novo Administrador';
  const [avatarUrl, setAvatarUrl] = useState<string>(administrador?.avatarUrl || '');
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AdministradorFormData>({
    resolver: zodResolver(administradorSchema),
    defaultValues: administrador ? {
      username: administrador.username || '',
    } : {
      username: '',
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
  const onSubmit = async (data: AdministradorFormData) => {
    const formData = new FormData();
    
    // Se estiver editando, adicionar o ID do administrador
    if (administrador) {
      formData.append('id', administrador.id);
    }
    
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    // Adicionar URL do avatar se foi feito upload ou se já existia
    if (avatarUrl) {
      formData.append('avatarUrl', avatarUrl);
    }

    // Chamar a action apropriada (create ou update)
    const result = administrador 
      ? await updateAdministrador(formData)
      : await createAdministrador(formData);

    if (result.success) {
      toast.success(administrador ? 'Administrador atualizado com sucesso!' : 'Administrador criado com sucesso!');
      onOpenChange(false);
    } else {
      toast.error(result.message || (administrador ? 'Falha ao atualizar administrador.' : 'Falha ao criar administrador.'));
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
            <Label htmlFor="username">Nome de Usuário</Label>
            <Input id="username" {...register('username')} />
            {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
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
            {administrador ? 'Atualizar' : 'Criar'} Administrador
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}