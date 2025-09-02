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
import { createProfessor, updateProfessor } from './actions';
import { toast } from 'sonner';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';

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
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfessorFormData>({
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
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`public/${Date.now()}_${file.name}`, file);

      if (error) {
        toast.error('Falha no upload da imagem.');
        return;
      }

      // Construir a URL pública
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path);
      setAvatarUrl(publicUrl);
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
    const formData = new FormData();
    
    // Se estiver editando, adicionar o ID do professor
    if (teacher) {
      formData.append('id', teacher.id);
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
    const result = teacher 
      ? await updateProfessor(formData)
      : await createProfessor(formData);

    if (result.success) {
      toast.success(teacher ? 'Professor atualizado com sucesso!' : 'Professor criado com sucesso!');
      onOpenChange(false);
    } else {
      toast.error(result.message || (teacher ? 'Falha ao atualizar professor.' : 'Falha ao criar professor.'));
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
          <Button type="submit" className="w-full" disabled={uploading}>
            {teacher ? 'Salvar Alterações' : 'Criar Professor'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}