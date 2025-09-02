import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Award, TrendingUp } from 'lucide-react';

interface ResponsavelDashboardProps {
  profile: {
    id: string;
    username: string | null;
    email?: string;
    role: string;
  };
}

export default function ResponsavelDashboard({ profile }: ResponsavelDashboardProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bem-vindo, {profile.username || 'Usuário'}!</h1>
        <p className="text-muted-foreground">Dashboard do Responsável</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filhos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Matriculados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.7</div>
            <p className="text-xs text-muted-foreground">Todos os filhos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desempenho</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">↗ 5%</div>
            <p className="text-xs text-muted-foreground">Último mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumo dos Filhos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Ana Silva</h3>
                  <span className="text-sm text-muted-foreground">9º Ano A</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Média: <span className="font-bold text-green-600">9.2</span></div>
                  <div>Faltas: <span className="font-bold">2</span></div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">João Silva</h3>
                  <span className="text-sm text-muted-foreground">7º Ano B</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Média: <span className="font-bold text-blue-600">8.1</span></div>
                  <div>Faltas: <span className="font-bold">1</span></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <div>
                  <span className="font-medium">Reunião de Pais</span>
                  <p className="text-xs text-muted-foreground">Ana Silva - 9º Ano A</p>
                </div>
                <span className="text-sm text-muted-foreground">15/01</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <div>
                  <span className="font-medium">Prova de Matemática</span>
                  <p className="text-xs text-muted-foreground">João Silva - 7º Ano B</p>
                </div>
                <span className="text-sm text-muted-foreground">18/01</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <div>
                  <span className="font-medium">Entrega de Trabalho</span>
                  <p className="text-xs text-muted-foreground">Ana Silva - História</p>
                </div>
                <span className="text-sm text-muted-foreground">20/01</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}