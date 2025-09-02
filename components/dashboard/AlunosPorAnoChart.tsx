// components/dashboard/AlunosPorAnoChart.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Legend
} from 'recharts';

/**
 * Interface para dados do gráfico de alunos por ano
 */
interface ChartData {
  anoEscolar: string;
  totalAlunos: number;
  gradeId: string;
}

/**
 * Props do componente AlunosPorAnoChart
 */
interface AlunosPorAnoChartProps {
  data: ChartData[];
}

// Cores para o gráfico de pizza
const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00ff00'
];

/**
 * Componente para exibir gráficos de distribuição de alunos por ano escolar
 * Renderiza tanto gráfico de barras quanto gráfico de pizza
 * @param data - Dados agregados de alunos por ano escolar
 */
export default function AlunosPorAnoChart({ data }: AlunosPorAnoChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Gráfico de Barras - Alunos por Ano
            </CardTitle>
            <CardDescription>
              Nenhum dado disponível para exibição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Sem dados para exibir
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Gráfico de Pizza - Distribuição
            </CardTitle>
            <CardDescription>
              Nenhum dado disponível para exibição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Sem dados para exibir
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Gráfico de Barras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gráfico de Barras - Alunos por Ano
          </CardTitle>
          <CardDescription>
            Visualização em barras da quantidade de alunos por ano escolar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="anoEscolar" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [value, "Total de Alunos"]}
                  labelFormatter={(label) => `Ano: ${label}`}
                />
                <Bar 
                  dataKey="totalAlunos" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Gráfico de Pizza - Distribuição
          </CardTitle>
          <CardDescription>
            Distribuição percentual de alunos por ano escolar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ anoEscolar, percent }) => 
                    `${anoEscolar} ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalAlunos"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, "Alunos"]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}