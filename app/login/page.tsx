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
   * Autentica através da API do servidor
   */
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      console.log('🔍 [Login] Enviando requisição para API de login');
      
      // Fazer login através da API do servidor
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no login');
      }

      console.log('✅ [Login] Login realizado com sucesso via API');
      toast.success("Login realizado com sucesso!");
      
      // Redirecionar para o dashboard
      // O cookie já foi definido pelo servidor
      window.location.href = '/dashboard';
      
    } catch (error: any) {
      console.error('❌ [Login] Erro:', error);
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