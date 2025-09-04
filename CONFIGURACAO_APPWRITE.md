# Configuração do Appwrite - Resolver Erro "Failed to fetch" e "Application error"

⚠️ **ATENÇÃO**: O erro "Application error: a client-side exception has occurred" indica que as variáveis de ambiente do Appwrite estão com valores placeholder em vez de valores reais.

## ⚠️ AÇÃO URGENTE NECESSÁRIA

**ANTES DE CONTINUAR**: Você DEVE substituir os valores placeholder no arquivo `.env.local`:

```bash
# ❌ VALORES INCORRETOS (placeholder):
NEXT_PUBLIC_APPWRITE_PROJECT_ID=seu-project-id-aqui
APPWRITE_API_KEY=sua-api-key-aqui

# ✅ VALORES CORRETOS (exemplo):
NEXT_PUBLIC_APPWRITE_PROJECT_ID=64f8a1b2c3d4e5f6g7h8i9j0
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_API_KEY=standard_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**📋 VARIÁVEIS MÍNIMAS OBRIGATÓRIAS** (baseado no starter oficial do Appwrite):
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` - ID do seu projeto no Appwrite
- `NEXT_PUBLIC_APPWRITE_ENDPOINT` - URL do servidor Appwrite (geralmente `https://cloud.appwrite.io/v1`)
- `APPWRITE_API_KEY` - Chave de API para operações server-side

## Problema Identificado

O arquivo `.env.local` contém valores placeholder como:
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID=seu-project-id-aqui`
- `APPWRITE_API_KEY=sua-api-key-aqui`

**Estes valores DEVEM ser substituídos pelos valores reais do seu projeto Appwrite, caso contrário a aplicação não funcionará.**

## Solução

### 1. Arquivo .env.local Criado

Já criei o arquivo `.env.local` com a estrutura básica. Agora você precisa configurar as variáveis corretas.

### 2. Configurar Projeto no Appwrite

Se você ainda não tem um projeto no Appwrite:

1. Acesse [https://cloud.appwrite.io](https://cloud.appwrite.io)
2. Crie uma conta ou faça login
3. Crie um novo projeto
4. Anote o **Project ID** que aparece no dashboard

### 3. Obter Chave de API

1. No painel do Appwrite, vá para **Settings** > **API Keys**
2. Clique em **Create API Key**
3. Dê um nome (ex: "Gestão Escolar")
4. Selecione os scopes necessários:
   - `users.read`
   - `users.write`
   - `sessions.write`
   - `databases.read`
   - `databases.write`
   - `files.read`
   - `files.write`
5. Copie a chave gerada

### 4. Configurar Domínio

1. No painel do Appwrite, vá para **Settings** > **Platforms**
2. Clique em **Add Platform** > **Web App**
3. Adicione os domínios:
   - `http://localhost:3000` (para desenvolvimento)
   - `https://seu-site.netlify.app` (para produção)

### 5. Atualizar .env.local

Edite o arquivo `.env.local` e substitua os valores:

```env
# CONFIGURAÇÕES DO APPWRITE
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=SEU_PROJECT_ID_AQUI
APPWRITE_API_KEY=SUA_API_KEY_AQUI

# Configurações adicionais do Appwrite (opcionais)
NEXT_PUBLIC_APPWRITE_DATABASE_ID=main
NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_STORAGE_ID=files
NEXT_PUBLIC_APPWRITE_BUCKET_ID=avatars

# BANCO DE DADOS (NEON/POSTGRESQL)
DATABASE_URL="sua-url-do-neon-aqui"

# CONFIGURAÇÃO DA APLICAÇÃO
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# CONFIGURAÇÕES DO NEXT.JS
NEXT_TELEMETRY_DISABLED=1
```

### 6. Configurar Banco de Dados (se necessário)

Se você ainda não configurou o banco:

1. Acesse [https://neon.tech](https://neon.tech)
2. Crie uma conta e um novo projeto
3. Copie a connection string
4. Cole no `DATABASE_URL` do `.env.local`

### 7. Executar Migrações

Após configurar o banco, execute:

```bash
npx prisma migrate dev
npx prisma db seed
```

### 8. Criar Usuário de Teste

Para testar o login, você pode criar um usuário diretamente no Appwrite:

1. No painel do Appwrite, vá para **Auth** > **Users**
2. Clique em **Create User**
3. Preencha:
   - **Email**: admin@teste.com
   - **Password**: 123456
   - **Name**: Administrador

### 9. Testar o Login

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse `http://localhost:3000/login`
3. Tente fazer login com as credenciais criadas

## Verificação

Para verificar se as variáveis estão configuradas corretamente:

1. Acesse `http://localhost:3000/api/test-env`
2. Deve mostrar quais variáveis estão definidas

## Problemas Comuns

### "Invalid credentials"
- Verifique se o email/senha estão corretos
- Confirme se o usuário foi criado no Appwrite

### "Project not found"
- Verifique se o `NEXT_PUBLIC_APPWRITE_PROJECT_ID` está correto
- Confirme se o domínio foi adicionado nas configurações do projeto

### "Unauthorized"
- Verifique se a `APPWRITE_API_KEY` está correta
- Confirme se os scopes necessários foram selecionados

## Próximos Passos

Após resolver o login:

1. Configure o upload de arquivos (bucket para avatares)
2. Configure o envio de emails (opcional)
3. Ajuste as permissões conforme necessário

## Suporte

Se o problema persistir:

1. Verifique os logs do navegador (F12 > Console)
2. Verifique os logs do servidor
3. Confirme se todas as variáveis estão definidas corretamente