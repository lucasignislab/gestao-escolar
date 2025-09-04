This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Configuração do Ambiente

Para configurar o ambiente de desenvolvimento, siga estas etapas:

1. Copie o arquivo `.env.example` para um novo arquivo chamado `.env`:
```bash
cp .env.example .env
```

2. Preencha as variáveis de ambiente no arquivo `.env`:

### Variáveis Essenciais

#### Banco de Dados (Neon/PostgreSQL)
```
DATABASE_URL="postgresql://usuario:senha@host:porta/nome_do_banco?sslmode=require"
```
- Esta é a URL de conexão com seu banco de dados PostgreSQL
- Para o Neon, você pode obter esta URL no painel de controle do projeto

#### Appwrite (Autenticação e Storage)
```
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
NEXT_PUBLIC_APPWRITE_PROJECT_ID="seu-project-id"
APPWRITE_API_KEY="sua-api-key-secreta"
```
- Configure estas variáveis com os valores do seu projeto no Appwrite
- A API Key deve ser mantida segura e nunca compartilhada

#### Storage de Arquivos (Avatares)
```
NEXT_PUBLIC_APPWRITE_BUCKET_ID="seu-bucket-id"
```
- ID do bucket onde serão armazenados os avatares dos usuários
- Crie um bucket no Appwrite e configure as permissões apropriadas

### Variáveis Opcionais

#### Configuração de Email
```
EMAIL_SERVICE="seu-servico-de-email"
EMAIL_API_KEY="sua-api-key-do-servico-de-email"
EMAIL_FROM="email@seudominio.com"
EMAIL_FROM_NAME="Nome do Remetente"
```
- Configure estas variáveis se desejar habilitar o envio de emails
- Atualmente suporta integração com SendGrid e Mailgun

## Deploy na Netlify

Este projeto está configurado para deploy na Netlify. Siga estas etapas:

1. Conecte seu repositório à Netlify
2. Configure as variáveis de ambiente listadas acima no painel da Netlify (Settings > Environment variables)
3. Defina `NODE_ENV=production` nas configurações de build

3. O arquivo `netlify.toml` já está configurado com as configurações necessárias para o build e deploy.

### Solução de Problemas

Se encontrar erros durante o build relacionados ao Appwrite, verifique:

1. Se todas as variáveis de ambiente estão corretamente configuradas no painel da Netlify
2. Se as permissões do Appwrite estão configuradas corretamente para permitir acesso da sua aplicação
3. Se o banco de dados PostgreSQL está acessível a partir da Netlify
