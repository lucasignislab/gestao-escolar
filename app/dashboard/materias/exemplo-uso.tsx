// app/dashboard/materias/exemplo-uso.tsx
// Este arquivo demonstra como usar o MateriaForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Teacher } from '@prisma/client';
import { Button } from '@/components/ui/button';
import MateriaForm from './MateriaForm';

// Tipo para matéria com professores
type MateriaWithTeachers = {
  id: string;
  name: string;
  teachers: Teacher[];
};

export default function ExemploUsoMateriaForm() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [professores, setProfessores] = useState<Teacher[]>([]);
  const [materiaToEdit, setMateriaToEdit] = useState<MateriaWithTeachers | null>(null);

  // Simular busca de professores
  useEffect(() => {
    // Aqui você chamaria a função real para buscar professores
    // const fetchProfessores = async () => {
    //   const result = await buscarProfessores();
    //   setProfessores(result);
    // };
    // fetchProfessores();

    // Dados simulados para demonstração
    setProfessores([
      {
        id: '1',
        profileId: 'prof1',
        name: 'João',
        surname: 'Silva',
        email: 'joao@escola.com',
        phone: '11999999999',
      },
      {
        id: '2',
        profileId: 'prof2',
        name: 'Maria',
        surname: 'Santos',
        email: 'maria@escola.com',
        phone: '11888888888',
      },
      {
        id: '3',
        profileId: 'prof3',
        name: 'Pedro',
        surname: 'Oliveira',
        email: 'pedro@escola.com',
        phone: '11777777777',
      },
    ]);
  }, []);

  const handleOpenForm = (materia?: MateriaWithTeachers) => {
    setMateriaToEdit(materia || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setMateriaToEdit(null);
  };

  const handleFormSuccess = () => {
    // Aqui você recarregaria a lista de matérias
    console.log('Matéria salva com sucesso!');
  };

  // Exemplo de matéria para edição
  const exemploMateria: MateriaWithTeachers = {
    id: 'mat1',
    name: 'Matemática',
    teachers: [
      {
        id: '1',
        profileId: 'prof1',
        name: 'João',
        surname: 'Silva',
        email: 'joao@escola.com',
        phone: '11999999999',
      },
      {
        id: '2',
        profileId: 'prof2',
        name: 'Maria',
        surname: 'Santos',
        email: 'maria@escola.com',
        phone: '11888888888',
      },
    ],
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Exemplo de Uso - MateriaForm</h1>
      
      <div className="space-x-4">
        <Button onClick={() => handleOpenForm()}>
          Nova Matéria
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => handleOpenForm(exemploMateria)}
        >
          Editar Matemática (Exemplo)
        </Button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Funcionalidades do MateriaForm:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ Seleção múltipla de professores usando componente Command</li>
          <li>✅ Interface de busca para encontrar professores</li>
          <li>✅ Badges para mostrar professores selecionados</li>
          <li>✅ Remoção individual de professores selecionados</li>
          <li>✅ Validação com Zod (nome obrigatório, pelo menos 1 professor)</li>
          <li>✅ Suporte para criação e edição de matérias</li>
          <li>✅ Estado gerenciado com useState</li>
          <li>✅ Feedback visual com toasts</li>
        </ul>
      </div>

      <MateriaForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        professores={professores}
        materia={materiaToEdit}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}

/*
Para usar o MateriaForm em sua aplicação:

1. Importe o componente:
   import MateriaForm from './MateriaForm';

2. Prepare os dados necessários:
   - Lista de professores (Teacher[])
   - Estado para controlar abertura/fechamento
   - Matéria para edição (opcional)

3. Use o componente:
   <MateriaForm
     isOpen={isFormOpen}
     onOpenChange={setIsFormOpen}
     professores={professores}
     materia={materiaToEdit} // null para nova matéria
     onSuccess={handleFormSuccess}
   />

4. Implemente as Server Actions:
   - createMateria(formData: FormData)
   - updateMateria(formData: FormData)

5. Descomente as linhas das Server Actions no MateriaForm.tsx
   quando estiverem implementadas.
*/