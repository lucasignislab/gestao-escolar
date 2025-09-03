// app/dashboard/alunos/AlunoForm.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Student } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alunoSchema, AlunoFormData } from '@/lib/schemas';
import { createAluno, updateAluno, buscarAnosEscolares } from './actions';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { StudentWithRelations } from './columns';
import { client, storage } from '@/lib/appwrite';

/**
 * Tipos para os dados dos selects
 */
type Responsavel = {
  id: string;
  name: string;
  surname: string;
};

type Turma = {
  id: string;
  name: string;
  grade: {
    level: number;
  };
};

type AnoEscolar = {
  id: string;
  level: number;
};

/**
 * Interface para as propriedades do componente AlunoForm
 */
interface AlunoFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  student: StudentWithRelations | null;
  turmas: Turma[];
  responsaveis: Responsavel[];
}

/**
 * Componente de formulário modal para adicionar/editar alunos
 * @param isOpen - Estado de visibilidade do modal
 * @param onOpenChange - Função para controlar a abertura/fechamento do modal
 * @param student - Dados do aluno para edição (null para novo aluno)
 */
export default function AlunoForm({ isOpen, onOpenChange, student, turmas: turmasProps, responsaveis: responsaveisProps }: AlunoFormProps) {
  const formTitle = student ? 'Editar Aluno' : 'Adicionar Novo Aluno';
  
  // Estados para os dados dos selects
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [anosEscolares, setAnosEscolares] = useState<AnoEscolar[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);


  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<AlunoFormData>({
    resolver: zodResolver(alunoSchema),
    defaultValues: student ? {
      name: student.name,
      surname: student.surname,
      parentId: student.parentId,
      classId: student.classId,
      gradeId: student.gradeId,
    } : {
      name: '',
      surname: '',
      parentId: '',
      classId: '',
      gradeId: '',
    },
  });

  // Observar mudanças no ano escolar para filtrar turmas
  const selectedGradeId = watch('gradeId');

  /**
   * Carregar dados para os selects quando o modal abrir
   */
  useEffect(() => {
    if (isOpen) {
      const carregarDados = async () => {
        try {
          setLoading(true);
          // Usar os dados passados como props
          setResponsaveis(responsaveisProps);
          setTurmas(turmasProps);
          
          // Ainda precisamos buscar os anos escolares
          const anosData = await buscarAnosEscolares();
          setAnosEscolares(anosData);
        } catch (error) {
          console.error('Erro ao carregar dados:', error);
          toast.error('Erro ao carregar dados do formulário');
        } finally {
          setLoading(false);
        }
      };
      
      carregarDados();
    }
  }, [isOpen]);

  /**
   * Filtrar turmas baseado no ano escolar selecionado
   */
  const turmasFiltradas = selectedGradeId 
    ? turmas.filter(turma => turma.grade.level === anosEscolares.find(ano => ano.id === selectedGradeId)?.level)
    : turmas;

  /**
   * Limpar seleção de turma quando o ano escolar mudar
   */
  useEffect(() => {
    if (selectedGradeId && !student) {
      setValue('classId', '');
    }
  }, [selectedGradeId, setValue, student]);

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
  const onSubmit = async (data: AlunoFormData) => {
    const formData = new FormData();
    
    // Se estiver editando, adicionar o ID do aluno
    if (student) {
      formData.append('id', student.id);
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
    const result = student 
      ? await updateAluno(formData)
      : await createAluno(formData);

    if (result.success) {
      toast.success(student ? 'Aluno atualizado com sucesso!' : 'Aluno criado com sucesso!');
      onOpenChange(false);
    } else {
      toast.error(result.message || (student ? 'Falha ao atualizar aluno.' : 'Falha ao criar aluno.'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-sm text-gray-500">Carregando...</div>
          </div>
        ) : (
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
              <Label htmlFor="parentId">Responsável</Label>
              <Select onValueChange={(value) => setValue('parentId', value)} defaultValue={watch('parentId')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  {responsaveis.map((responsavel) => (
                    <SelectItem key={responsavel.id} value={responsavel.id}>
                      {responsavel.name} {responsavel.surname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.parentId && <p className="text-sm text-red-500">{errors.parentId.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="gradeId">Ano Escolar</Label>
              <Select onValueChange={(value) => setValue('gradeId', value)} defaultValue={watch('gradeId')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um ano escolar" />
                </SelectTrigger>
                <SelectContent>
                  {anosEscolares.map((ano) => (
                    <SelectItem key={ano.id} value={ano.id}>
                      {ano.level}º Ano
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gradeId && <p className="text-sm text-red-500">{errors.gradeId.message}</p>}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="classId">Turma</Label>
              <Select 
                onValueChange={(value) => setValue('classId', value)} 
                defaultValue={watch('classId')}
                disabled={!selectedGradeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmasFiltradas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.classId && <p className="text-sm text-red-500">{errors.classId.message}</p>}
              {!selectedGradeId && (
                <p className="text-sm text-gray-500">Selecione um ano escolar primeiro</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="avatar">Foto do Aluno</Label>
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
              {student ? 'Salvar Alterações' : 'Criar Aluno'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}