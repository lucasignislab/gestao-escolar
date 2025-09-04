'use client';

import { useState } from 'react';
import { storage } from '@/lib/appwrite';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ onUploadSuccess, label = "Foto de perfil" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para fazer upload.');
      }

      const file = event.target.files[0];
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

      const url = fileUrl.toString();
      setPreviewUrl(url);
      onUploadSuccess(url);
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao fazer upload da imagem: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="avatar">{label}</Label>
      <Input 
        id="avatar" 
        type="file" 
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && <p className="text-sm text-blue-500">Fazendo upload...</p>}
      {previewUrl && (
        <div className="mt-2">
          <Image 
            src={previewUrl} 
            alt="Preview" 
            width={80}
            height={80}
            className="object-cover rounded-full"
          />
        </div>
      )}
    </div>
  );
}
