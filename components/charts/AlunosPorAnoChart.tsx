'use client'; // ESSENCIAL para bibliotecas de gráficos 

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface ChartData {
  name: string;
  total: number;
}

interface AlunosPorAnoChartProps {
  data: ChartData[];
}

export default function AlunosPorAnoChart({ data }: AlunosPorAnoChartProps) {
  return (
    // O ResponsiveContainer faz o gráfico se adaptar ao tamanho do card 
    <ResponsiveContainer width="100%" height={350}> 
      <BarChart data={data}> 
        <XAxis 
          dataKey="name" 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        /> 
        <YAxis 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `${value}`} // Formata o eixo Y 
        /> 
        <Tooltip 
          cursor={{ fill: 'transparent' }} 
          contentStyle={{ background: 'white', border: '1px solid #ccc', borderRadius: '0.5rem' }} 
        /> 
        <Legend iconType="circle" /> 
        <Bar dataKey="total" name="Total de Alunos" fill="#3b82f6" radius={[4, 4, 0, 0]} /> 
      </BarChart> 
    </ResponsiveContainer> 
  );
}