# Configuração de Variáveis de Ambiente na Netlify

Este documento lista todas as variáveis de ambiente que devem ser configuradas no painel da Netlify para que o deploy funcione corretamente.

## Como Configurar

1. Acesse o painel da Netlify
2. Vá para **Site settings** > **Environment variables**
3. Adicione cada uma das variáveis listadas abaixo

## Variáveis Obrigatórias

Estas variáveis são essenciais para o funcionamento da aplicação:

### Banco de Dados
```
DATABASE_URL=postgresql://usuario:senha@host:porta/nome_do_banco?sslmode=require
```
- URL de conexão com o banco PostgreSQL (Neon)
- Obtenha esta URL no painel do Neon

### Appwrite - Configurações Básicas
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=seu-project-id
APPWRITE_API_KEY=sua-api-key-secreta
```
- **ENDPOINT**: URL da API do Appwrite
- **PROJECT_ID**: ID do seu projeto no Appwrite
- **API_KEY**: Chave de API secreta (mantenha segura!)

## Variáveis Opcionais (mas Recomendadas)

Estas variáveis são opcionais durante o build, mas necessárias para funcionalidades específicas:

### Storage de Arquivos
```
NEXT_PUBLIC_APPWRITE_BUCKET_ID=seu-bucket-id
```
- ID do bucket para armazenar avatares de usuários
- Necessário apenas se a funcionalidade de upload de avatares for usada

### URL da Aplicação
```
NEXT_PUBLIC_APP_URL=https://seu-site.netlify.app
```
- URL base da sua aplicação na Netlify
- Substitua `seu-site` pelo nome do seu site na Netlify
- Necessário para funcionalidades que geram links (ex: convites por email)

### Configurações Adicionais do Appwrite
```
NEXT_PUBLIC_APPWRITE_DATABASE_ID=main
NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_STORAGE_ID=files
```
- Estas têm valores padrão e são opcionais
- Configure apenas se você usar IDs diferentes no seu projeto Appwrite

## Variáveis de Email (Opcionais)

Configure apenas se você quiser habilitar o envio de emails:

```
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=sua-api-key-do-sendgrid
EMAIL_FROM=noreply@seudominio.com
EMAIL_FROM_NAME=Sistema de Gestão Escolar
```

## Variáveis do Sistema

Estas já estão configuradas no `netlify.toml`, mas você pode sobrescrever se necessário:

```
NODE_VERSION=20
NEXT_TELEMETRY_DISABLED=1
```

## Verificação

Após configurar as variáveis, você pode testar se estão funcionando acessando:
```
https://seu-site.netlify.app/api/test-env
```

Este endpoint mostrará quais variáveis estão definidas (sem expor valores sensíveis).

## Solução de Problemas

### Erro: "Variáveis de ambiente inválidas"
- Verifique se todas as variáveis obrigatórias estão configuradas
- Certifique-se de que não há espaços extras nos valores
- Para URLs, certifique-se de que começam com `http://` ou `https://`

### Erro: "Dynamic server usage"
- Este erro foi resolvido com a configuração `output: 'standalone'` no `next.config.ts`
- Se persistir, verifique se todas as páginas que usam cookies têm `export const dynamic = 'force-dynamic'`

### Build falha na etapa "Collecting page data"
- Geralmente indica problema com variáveis de ambiente
- Verifique os logs para identificar qual variável está faltando
- Certifique-se de que a `DATABASE_URL` está correta e o banco está acessível