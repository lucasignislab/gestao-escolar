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

## Deploy na Netlify

Este projeto está configurado para deploy na Netlify. Siga estas etapas para configurar corretamente:

1. Conecte seu repositório à Netlify
2. Configure as seguintes variáveis de ambiente no painel da Netlify (Settings > Environment variables):

```
DATABASE_URL=sua_url_do_banco_de_dados
NEXT_PUBLIC_APPWRITE_ENDPOINT=seu_endpoint_appwrite
NEXT_PUBLIC_APPWRITE_PROJECT_ID=seu_project_id_appwrite
NEXT_PUBLIC_APPWRITE_DATABASE_ID=seu_database_id_appwrite
NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID=seu_collection_id_appwrite
NEXT_PUBLIC_APPWRITE_STORAGE_ID=seu_storage_id_appwrite
NEXT_PUBLIC_APPWRITE_BUCKET_ID=seu_bucket_id_appwrite
APPWRITE_API_KEY=sua_api_key_appwrite
NEXT_PUBLIC_APP_URL=url_da_sua_aplicacao_netlify
```

3. O arquivo `netlify.toml` já está configurado com as configurações necessárias para o build e deploy.

### Solução de Problemas

Se encontrar erros durante o build relacionados ao Appwrite, verifique:

1. Se todas as variáveis de ambiente estão corretamente configuradas no painel da Netlify
2. Se as permissões do Appwrite estão configuradas corretamente para permitir acesso da sua aplicação
3. Se o banco de dados PostgreSQL está acessível a partir da Netlify
