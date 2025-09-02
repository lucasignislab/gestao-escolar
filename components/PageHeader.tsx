// components/PageHeader.tsx
'use client';

import { Button } from './ui/button';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Interface para as propriedades do componente PageHeader
 */
interface PageHeaderProps {
  title: string;
  buttonLabel: string;
  onButtonClick: () => void;
  entityType?: string; // Tipo de entidade para verificar permissões
  showButton?: boolean; // Controle manual para mostrar/ocultar botão
}

/**
 * Componente de cabeçalho de página reutilizável com controle de acesso
 * @param title - Título da página
 * @param buttonLabel - Texto do botão
 * @param onButtonClick - Função executada ao clicar no botão
 * @param entityType - Tipo de entidade para verificar permissões de criação
 * @param showButton - Controle manual para mostrar/ocultar botão
 */
export default function PageHeader({ 
  title, 
  buttonLabel, 
  onButtonClick, 
  entityType = '',
  showButton = true 
}: PageHeaderProps) {
  const { canCreate, isAdmin, loading } = usePermissions();
  
  // Determinar se deve mostrar o botão baseado nas permissões
  const shouldShowButton = showButton && !loading && (
    isAdmin() || canCreate(entityType)
  );
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      {shouldShowButton && (
        <Button onClick={onButtonClick}>{buttonLabel}</Button>
      )}
    </div>
  );
}