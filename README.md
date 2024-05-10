# pizzashop-api

## Summary
- API com bun e Elysia.
- Auth magic link
- Fonte: Rocketseat, ignite, trilha node.

## Tools
 - Bun
 - Elysia
 - docker compose
 - Drizzle ORM
 
## Problema com pacote @elysiajs/cookie
o pacote @elysiajs/cookie esta com problema, desinstalar.
O Cookie já vem nativo no Elysia, usar como o trecho abaixo:
``` javascript 
async ({ query, jwt, set, cookie }) => {
  ...

  cookie.auth.set({
      value: token,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    })

  ...
}
```

## Routes 
- 1. /login -> enviar o email com o link de login (magic link)
- 2. /callback -> acessada quando o usuário clicar no link do email (validar o token, criar o JWT, redirecionar o usuário para o front-end)
- 3. /restaurants -> cadastra o restaurante incluindo o manager

## Docker
docker compose up -d
docker ps
docker logs xxxxx -f 

```code
version: '3.7'

services:
  postgres:
    image: bitnami/postgresql:latest
    ports:
      - '5432:5432'
    environment:
      - POSTGRES_USER=docker
      - POSTGRES_PASSWORD=docker
      - POSTGRES_DB=pizzashop
    volumes:
      - postgres_data:/bitnami/postgresql

volumes:
  postgres_data:
```
## Drizzle ORM

```shell
bun add drizzle-orm postgres
bun add -D drizzle-kit
```