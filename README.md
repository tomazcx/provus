# Provus

Repositório para o sistema Provus, contendo a aplicação front-end desenvolvida com Nuxt.js e o back-end desenvolvido com Nest.js

## Instruções para rodar o projeto

### Estrutura do projeto

- `provus-backend-platform/`: Aplicação back-end desenvolvida com Nest.js
- `provus-frontend-platform/`: Aplicação front-end desenvolvida com Nuxt.js
- `provus-mobile-platform/`: Aplicação mobile desenvolvida com React Native


### Pré-requisitos

- Docker e Docker Compose
- Node.js
- NPM ou Yarn
- JDK
- Android Studio (essencial para criar e executar emuladores)

### Configuração do ambiente

1. Configure as variáveis de ambiente:

```bash
# No diretório provus-backend-platform
cp .env.example .env

# No diretório provus-frontend-platform
cp .env.example .env
```

2. Instale as dependências do back-end:
```bash
# No diretório provus-backend-platform
npm install
```

3. Inicie os containers do back-end:

```bash
# No diretório provus-backend-platform
docker-compose up -d
```

4. Execute as migrations do banco de dados:

```bash
# No diretório provus-backend-platform
npm run migration:run
```

5. Inicie a aplicação front-end:

```bash
# No diretório provus-frontend-platform
npm install
npm run dev
```

6. Instale as dependências do mobile:

```bash
# No diretório provus-mobile-platform
npm install
```

7. Inicie o Emulador Android

- Abra o Android Studio
- Acesse o Virtual Device Manager no menu de ferramentas
- Inicie com o play
- Após o emulador carregar completamente, pode fechar a janela principal do Android Studio

8. Rode o projeto mobile

```bash
# No diretório provus-mobile-platform
npm start
# Abra outro terminal e rode
npx react-native run-android
```

Após seguir estes passos, a aplicação estará disponível em:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Documentação do Backend: http://localhost:8000/api-docs
