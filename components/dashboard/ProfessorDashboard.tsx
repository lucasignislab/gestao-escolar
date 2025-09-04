// components/dashboard/ProfessorDashboard.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, BookOpen, Users } from 'lucide-react';
import WeeklySchedule from '../schedule/WeeklySchedule';
import { convertLessonsToEvents } from '@/lib/schedule-utils';

/**
 * Interface para as aulas do professor
 */
interface Lesson {
  id: string;
  dayOfWeek: number;
  startTime: Date;
  endTime: Date;
  classId: string;
  subjectId: string;
  teacherId: string;
  subject: {
    id: string;
    name: string;
  };
  class: {
    id: string;
    name: string;
  };
}

/**
 * Props do componente ProfessorDashboard
 */
interface ProfessorDashboardProps {
  aulas: Lesson[];
}

/**
 * Componente de dashboard para professores
 * Exibe as aulas e horários do professor
 * @param aulas - Lista de aulas do professor
 */
export default function ProfessorDashboard({ aulas }: ProfessorDashboardProps) {

  // Estatísticas das aulas
  const totalAulas = aulas.length;
  const materiasUnicas = new Set(aulas.map(aula => aula.subject.id)).size;
  const turmasUnicas = new Set(aulas.map(aula => aula.class.id)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard do Professor</h1>
        <p className="text-muted-foreground">
          Gerencie suas aulas e horários
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Aulas
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAulas}</div>
            <p className="text-xs text-muted-foreground">
              Aulas semanais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Matérias
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materiasUnicas}</div>
            <p className="text-xs text-muted-foreground">
              Matérias lecionadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Turmas
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{turmasUnicas}</div>
            <p className="text-xs text-muted-foreground">
              Turmas atendidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Carga Horária
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aulas.reduce((total, aula) => {
                const inicio = new Date(aula.startTime);
                const fim = new Date(aula.endTime);
                const duracao = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60);
                return total + duracao;
              }, 0).toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Horas semanais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendário de aulas */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Horária Semanal</CardTitle>
          <CardDescription>
            Visualize suas aulas da semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WeeklySchedule 
            events={convertLessonsToEvents(aulas)} 
            onEventClick={(event) => {
              // Você pode adicionar uma ação ao clicar em uma aula
              console.log('Aula selecionada:', event);
            }}
          />
        </CardContent>
      </Card>

      {/* Lista de aulas */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Aulas</CardTitle>
          <CardDescription>
            Lista detalhada de todas as suas aulas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aulas.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma aula encontrada
              </p>
            ) : (
              aulas.map((aula) => {
                const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                const startTime = new Date(aula.startTime);
                const endTime = new Date(aula.endTime);
                const inicio = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
                const fim = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
                
                return (
                  <div key={aula.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{aula.subject.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Turma: {aula.class.name}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">
                        {diasSemana[aula.dayOfWeek]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {inicio} - {fim}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}