// app/login/page.tsx
'use client'; // Transforma este em um Componente de Cliente

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/appwrite';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import Link from 'next/link';

/**
 * Página de login do sistema de gestão escolar
 * Componente cliente com funcionalidade completa de autenticação
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { account } = createClient();

  /**
   * Manipula o processo de login do usuário
   * Autentica com Appwrite e redireciona em caso de sucesso
   */
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Limpar qualquer sessão existente
      try {
        await account.deleteSession('current');
        document.cookie = 'appwrite-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      } catch (sessionError) {
        console.log('Nenhuma sessão ativa para encerrar ou erro ao encerrar:', sessionError);
      }

      // Criar nova sessão
      const session = await account.createEmailPasswordSession(email, password);
      console.log('Sessão criada com sucesso:', session.$id);
      
      // Definir o cookie manualmente com o valor da sessão
      // Usar o nome exato que o middleware está procurando
      const cookieValue = session.secret;
      document.cookie = `appwrite-session=${cookieValue}; path=/; max-age=2592000; domain=${window.location.hostname}`;
      
      // Verificar se o cookie foi definido
      console.log('Cookie após definição manual:', document.cookie);
      console.log('Todos os cookies após login:', document.cookie.split('; ').join('\n'));
      
      toast.success("Login realizado com sucesso!");
      
      // Criar um formulário para fazer um POST para o dashboard
      // Isso força um redirecionamento completo com os cookies
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/dashboard';
      document.body.appendChild(form);
      form.submit();
      
      // Fallback caso o formulário não seja submetido
      setTimeout(() => {
        console.log('Usando fallback para redirecionamento');
        window.location.href = '/dashboard';
      }, 1000);
    } catch (error: any) {
      toast.error("Falha no login: " + (error.message || 'Erro desconhecido'));
    }
    
    setLoading(false);
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Digite seu e-mail e senha para acessar o sistema.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </CardContent>
        </form>
        <div className="mt-4 text-center text-sm">
          Não tem uma conta?{' '}
          <Link href="/register" className="underline">
            Criar conta
          </Link>
        </div>
      </Card>
    </main>
  );
}