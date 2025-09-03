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
      const session = await account.createEmailPasswordSession(email, password);
      
      // Salvar sessão nos cookies para o middleware
      document.cookie = `appwrite-session=${session.secret}; path=/; secure; samesite=strict`;
      
      toast.success("Login realizado com sucesso!");
      router.push('/dashboard'); // Redireciona para o dashboard
      router.refresh(); // Força a atualização do layout do servidor
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