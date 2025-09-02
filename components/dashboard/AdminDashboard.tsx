// components/dashboard/AdminDashboard.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, School } from 'lucide-react';
import AlunosPorAnoChart from './AlunosPorAnoChart';

/**
 * Interface para as estatísticas do dashboard administrativo
 */
interface AdminStats {
  totalAlunos: number;
  totalProfessores: number;
  totalTurmas: number;
}

/**
 * Interface para dados do gráfico de alunos por ano
 */
interface ChartData {
  anoEscolar: string;
  totalAlunos: number;
  gradeId: string;
}

/**
 * Props do componente AdminDashboard
 */
interface AdminDashboardProps {
  stats: AdminStats;
  chartData?: ChartData[];
}

/**
 * Componente de dashboard para administradores
 * Exibe estatísticas gerais do sistema escolar
 * @param stats - Estatísticas agregadas do sistema
 */
export default function AdminDashboard({ stats, chartData }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de gestão escolar
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Alunos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAlunos}</div>
            <p className="text-xs text-muted-foreground">
              Alunos matriculados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Professores
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProfessores}</div>
            <p className="text-xs text-muted-foreground">
              Professores cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Turmas
            </CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTurmas}</div>
            <p className="text-xs text-muted-foreground">
              Turmas ativas no sistema
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de distribuição de alunos por ano escolar */}
      {chartData && chartData.length > 0 && (
        <AlunosPorAnoChart data={chartData} />
      )}

      {/* Seção de ações rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a 
              href="/dashboard/alunos" 
              className="block p-2 text-sm hover:bg-muted rounded-md transition-colors"
            >
              Gerenciar Alunos
            </a>
            <a 
              href="/dashboard/professores" 
              className="block p-2 text-sm hover:bg-muted rounded-md transition-colors"
            >
              Gerenciar Professores
            </a>
            <a 
              href="/dashboard/turmas" 
              className="block p-2 text-sm hover:bg-muted rounded-md transition-colors"
            >
              Gerenciar Turmas
            </a>
            <a 
              href="/dashboard/materias" 
              className="block p-2 text-sm hover:bg-muted rounded-md transition-colors"
            >
              Gerenciar Matérias
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo do Sistema</CardTitle>
            <CardDescription>
              Informações gerais sobre o estado atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Média de alunos por turma:</span>
                <span className="font-medium">
                  {stats.totalTurmas > 0 
                    ? Math.round(stats.totalAlunos / stats.totalTurmas) 
                    : 0
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>Razão professor/aluno:</span>
                <span className="font-medium">
                  {stats.totalProfessores > 0 
                    ? `1:${Math.round(stats.totalAlunos / stats.totalProfessores)}`
                    : '0:0'
                  }
                </span>
              </div>
              {chartData && chartData.length > 0 && (
                <div className="flex justify-between">
                  <span>Anos com alunos:</span>
                  <span className="font-medium">
                    {chartData.length}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}