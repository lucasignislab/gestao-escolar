// components/PaginationControls.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from './ui/button';

interface PaginationControlsProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Componente de controles de paginação
 * Permite navegação entre páginas usando parâmetros de URL
 */
export default function PaginationControls({ hasNextPage, hasPrevPage }: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = searchParams.get('page') ?? '1';

  /**
   * Navega para a página anterior
   */
  const handlePreviousPage = () => {
    router.push(`?page=${Number(page) - 1}`);
  };

  /**
   * Navega para a próxima página
   */
  const handleNextPage = () => {
    router.push(`?page=${Number(page) + 1}`);
  };

  return (
    <div className="flex gap-2 mt-4 justify-end">
      <Button 
        disabled={!hasPrevPage} 
        onClick={handlePreviousPage}
        variant="outline"
      >
        Anterior
      </Button>
      <Button 
        disabled={!hasNextPage} 
        onClick={handleNextPage}
        variant="outline"
      >
        Próxima
      </Button>
    </div>
  );
}