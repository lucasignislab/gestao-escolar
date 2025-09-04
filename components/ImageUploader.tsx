'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ID } from 'appwrite';
import { storage, APPWRITE_CONFIG } from '@/lib/appwrite'; // Nosso cliente Appwrite para o navegador
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from './ui/button';

interface ImageUploaderProps {
  onUploadComplete: (fileId: string) => void;
}

const BUCKET_ID = APPWRITE_CONFIG.avatarsBucketId; // O ID do bucket que criamos no Appwrite

export default function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning('Por favor, selecione um arquivo primeiro.');
      return;
    }
    setIsUploading(true);

    try {
      const response = await storage.createFile(
        BUCKET_ID,
        ID.unique(), // Gera um ID único para o arquivo
        selectedFile
      );

      toast.success('Imagem enviada com sucesso!');
      onUploadComplete(response.$id); // Retorna o ID do arquivo para o formulário
    } catch (error) {
      console.error(error);
      toast.error('Ocorreu um erro ao enviar a imagem.');
    } finally {
      setIsUploading(false);
      setSelectedFile(null); // Limpa a seleção
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="avatar-upload">Foto de Perfil</Label>
      <div className="flex items-center gap-2">
        <Input
          id="avatar-upload"
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          className="flex-1"
        />
        <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar'}
        </Button>
      </div>
      {selectedFile && <p className="text-xs text-gray-500">Arquivo selecionado: {selectedFile.name}</p>}
    </div>
  );
}
