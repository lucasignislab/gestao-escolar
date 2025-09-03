// components/dashboards/AdminDashboard.tsx
import { PrismaClient } from '@prisma/client';
import { Users, BookUser, School } from 'lucide-react';
import StatCard from './StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Importe o componente do gráfico
import AlunosPorAnoChart from '../charts/AlunosPorAnoChart';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  // Executa todas as consultas de contagem em paralelo para otimização
  const [totalAlunos, totalProfessores, totalTurmas] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.class.count(),
  ]);

  // --- NOVA LÓGICA PARA O GRÁFICO --- 
  // 1. Contamos os alunos agrupados pelo ID do ano escolar (gradeId) 
  const studentCountsByGrade = await prisma.student.groupBy({ 
    by: ['gradeId'], 
    _count: { 
      id: true, 
    }, 
  }); 

  // 2. Buscamos todos os anos escolares para termos os nomes (ex: "1º Ano") 
  const allGrades = await prisma.grade.findMany(); 

  // 3. Combinamos os dois resultados para criar um formato amigável para o gráfico 
  const chartData = allGrades.map(grade => { 
    const count = studentCountsByGrade.find(item => item.gradeId === grade.id)?._count.id || 0; 
    return { 
      name: `${grade.level}º Ano`, 
      total: count, 
    }; 
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard do Administrador</h1>
      <p className="text-gray-600 mb-10">Visão geral do sistema escolar.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card de Alunos */}
        <StatCard 
          title="Total de Alunos" 
          value={totalAlunos} 
          icon={Users} 
          iconColor="text-blue-500" 
          valueColor="text-blue-600" 
          description="Alunos matriculados no sistema" 
        />

        {/* Card de Professores */}
        <StatCard 
          title="Total de Professores" 
          value={totalProfessores} 
          icon={BookUser} 
          iconColor="text-green-500" 
          valueColor="text-green-600" 
          description="Professores cadastrados no sistema" 
        />

        {/* Card de Turmas */}
        <StatCard 
          title="Total de Turmas" 
          value={totalTurmas} 
          icon={School} 
          iconColor="text-purple-500" 
          valueColor="text-purple-600" 
          description="Turmas ativas no sistema" 
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Distribuição de Alunos por Ano Escolar</CardTitle>
        </CardHeader>
        <CardContent>
          {/* O componente do gráfico recebendo os dados formatados */}
          <AlunosPorAnoChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}