# EducaMais

Aplicativo Expo Go que funciona como assistente de estudo pessoal, com organização acadêmica, cursos, comunidade e gamificação.

## Rodar localmente

1. Inicie o PostgreSQL usado pelo backend.
2. Configure `backend/.env` a partir de `backend/.env.example`, incluindo `DATABASE_URL` e `JWT_SECRET`.
3. Em `backend/`, instale dependências com `npm install`, aplique as migrações com `npx prisma migrate deploy` e inicie a API com `npm run dev`.
4. Configure `frontend/.env.local` com `EXPO_PUBLIC_API_URL=http://<IP-DO-COMPUTADOR>:3000` (no celular, use o IP da rede local, não `localhost`).
5. Em `frontend/`, execute `npm install` e `npx expo start`; celular e computador precisam estar na mesma rede.

## Recursos persistidos na API

- Contas, login e redefinição ilustrativa de senha (o token é mostrado no app apenas em desenvolvimento).
- Tarefas por usuário; conclusão rende 10 pontos uma única vez.
- Cursos e aulas criados por professores, inscrições e progresso dos alunos; concluir uma aula rende 20 pontos uma única vez.
- Discussões e respostas da comunidade, com exclusão pelo autor e moderação por professores.
- Pontuação, nível, sequência de estudo e ranking.

As migrações são aditivas e preservam usuários e tarefas já existentes. Para redefinir senha fora do desenvolvimento, configure um provedor de e-mail e remova a exposição de token de desenvolvimento.
