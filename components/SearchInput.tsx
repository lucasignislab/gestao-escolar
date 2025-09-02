// components/SearchInput.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  placeholder?: string;
}

/**
 * Componente de busca que atualiza parâmetros de URL
 * Permite filtrar dados através de termo de busca
 */
export default function SearchInput({ placeholder = 'Buscar...' }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  /**
   * Sincroniza o estado local com os parâmetros da URL
   */
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  /**
   * Executa a busca atualizando os parâmetros da URL
   */
  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
    
    // Reset para primeira página ao buscar
    params.delete('page');
    
    router.push(`?${params.toString()}`);
  };

  /**
   * Limpa o termo de busca
   */
  const handleClear = () => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  /**
   * Executa busca ao pressionar Enter
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2 mb-4">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button onClick={handleSearch} variant="outline">
        <Search className="h-4 w-4 mr-2" />
        Buscar
      </Button>
    </div>
  );
}