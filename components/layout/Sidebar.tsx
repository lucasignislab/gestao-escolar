// components/layout/Sidebar.tsx
import { getUserProfile } from '@/lib/auth';
import Link from 'next/link';
import { Home, Users, GraduationCap, UserCheck, School, BookOpen, Shield, FileText, ClipboardList, Award, Calendar, User, LucideIcon } from 'lucide-react';

/**
 * Componente de barra lateral com navegação dinâmica baseada no papel do usuário
 * @returns JSX da barra lateral com links específicos para cada tipo de usuário
 */
export default async function Sidebar() {
  let profile = null;
  
  try {
    profile = await getUserProfile();
  } catch (error) {
    console.log('Sidebar: Erro ao obter perfil, usuário não autenticado');
    // Se não conseguir obter o perfil, o usuário não está autenticado
    // O middleware deve redirecionar, mas vamos retornar um sidebar básico
  }

  // Links para diferentes roles
  const adminLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/professores', label: 'Professores', icon: Users },
    { href: '/dashboard/alunos', label: 'Alunos', icon: GraduationCap },
    { href: '/dashboard/responsaveis', label: 'Responsáveis', icon: UserCheck },
    { href: '/dashboard/turmas', label: 'Turmas', icon: School },
    { href: '/dashboard/materias', label: 'Matérias', icon: BookOpen },
    { href: '/dashboard/administradores', label: 'Administradores', icon: Shield },
  ];

  const professorLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/turmas', label: 'Minhas Turmas', icon: School },
    { href: '/dashboard/alunos', label: 'Meus Alunos', icon: GraduationCap },
    { href: '/dashboard/exames', label: 'Exames', icon: FileText },
    { href: '/dashboard/tarefas', label: 'Tarefas', icon: ClipboardList },
    { href: '/dashboard/notas', label: 'Notas', icon: Award },
  ];

  const alunoLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/agenda', label: 'Minha Agenda', icon: Calendar },
    { href: '/dashboard/notas', label: 'Minhas Notas', icon: Award },
    { href: '/dashboard/tarefas', label: 'Minhas Tarefas', icon: ClipboardList },
    { href: '/dashboard/perfil', label: 'Meu Perfil', icon: User },
  ];

  const responsavelLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/filhos', label: 'Meus Filhos', icon: Users },
    { href: '/dashboard/agenda', label: 'Agenda dos Filhos', icon: Calendar },
    { href: '/dashboard/notas', label: 'Notas dos Filhos', icon: Award },
    { href: '/dashboard/perfil', label: 'Meu Perfil', icon: User },
  ];

  const getNavigationLinks = () => {
    if (!profile) return [];
    
    switch (profile.role) {
      case 'ADMIN':
        return adminLinks;
      case 'PROFESSOR':
        return professorLinks;
      case 'ALUNO':
        return alunoLinks;
      case 'RESPONSAVEL':
        return responsavelLinks;
      default:
        return [];
    }
  };

  const links = getNavigationLinks();

  return (
    <aside className="w-64 bg-gray-900 text-white p-4 hidden md:block">
      <h2 className="text-xl font-bold mb-6">Gestão Escolar</h2>
      <nav>
        <ul>
          {links.map((link) => (
            <li key={link.href} className="mb-2">
              <Link href={link.href} className="flex items-center p-2 rounded hover:bg-gray-700">
                <link.icon className="w-5 h-5 mr-3" />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}