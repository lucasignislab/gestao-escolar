import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Award, ClipboardList, BookOpen } from 'lucide-react';

interface AlunoDashboardProps {
  profile: {
    id: string;
    username: string | null;
    email?: string;
    role: string;
  };
}

export default function AlunoDashboard({ profile }: AlunoDashboardProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bem-vindo, {profile.username || 'Usuário'}!</h1>
        <p className="text-muted-foreground">Dashboard do Aluno</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas Aulas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Para entregar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5</div>
            <p className="text-xs text-muted-foreground">Último bimestre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matérias</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Cursando</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agenda da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="font-medium">Segunda - 08:00</span>
                <span className="text-sm text-muted-foreground">Matemática</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="font-medium">Segunda - 09:00</span>
                <span className="text-sm text-muted-foreground">Português</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="font-medium">Terça - 08:00</span>
                <span className="text-sm text-muted-foreground">História</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="font-medium">Matemática - Prova</span>
                <span className="text-sm font-bold text-green-600">9.0</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="font-medium">Português - Redação</span>
                <span className="text-sm font-bold text-blue-600">8.5</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="font-medium">História - Trabalho</span>
                <span className="text-sm font-bold text-green-600">9.5</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}