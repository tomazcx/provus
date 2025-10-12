# Provus

API Back-end do sistema Provus, consumida pela aplicação web e pela aplicação mobile.

## Documentação de rotas

Após rodar o projeto (Ver README.md na raiz do projeto) acesse a url http://localhost:8000/api-docs para visualizar a documentação swagger das rotas da aplicação.

## WebSockets

A aplicação expõe dois sockets WebSocket para conexão em tempo real, cada um com seu próprio namespace para evitar conflitos:

### 1. Gateway do Avaliador (`/avaliador`)

**Namespace:** `/avaliador`  
**Propósito:** Comunicação em tempo real com avaliadores para notificações de infrações e monitoramento.

#### Conexão

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000/avaliador', {
  extraHeaders: {
    authorization: 'Bearer SEU_TOKEN_JWT',
  },
  transports: ['websocket'],
});
```

#### Autenticação

- **Obrigatório:** Token JWT válido no header `authorization`
- **Formato:** `Bearer <token>`
- O token deve ser de um avaliador autenticado no sistema

#### Eventos Recebidos pelo Cliente

| Evento                   | Descrição                            | Payload                |
| ------------------------ | ------------------------------------ | ---------------------- |
| `avaliador-conectado`    | Confirmação de conexão bem-sucedida  | `{ message: string }`  |
| `punicao-por-ocorrencia` | Notificação de infração de estudante | `PunicaoPorOcorrencia` |
| `erro-validacao`         | Erro de autenticação ou validação    | `{ message: string }`  |

#### Interface PunicaoPorOcorrencia

```typescript
interface PunicaoPorOcorrencia {
  estudanteId: number;
  nomeEstudante: string;
  nomeAvaliacao: string;
  dataHoraInfracao: string;
  quantidadeOcorrencias: number;
  tipoInfracao: string;
}
```

#### Exemplo de Uso

```javascript
// Conectar
const socket = io('http://localhost:8000/avaliador', {
  extraHeaders: {
    authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },
});

// Escutar eventos
socket.on('avaliador-conectado', (data) => {
  console.log('Conectado:', data.message);
});

socket.on('punicao-por-ocorrencia', (data) => {
  console.log(
    `Infração detectada: ${data.nomeEstudante} - ${data.tipoInfracao}`,
  );
  // Atualizar interface do avaliador
});

socket.on('erro-validacao', (error) => {
  console.error('Erro:', error.message);
});
```

### 2. Gateway de Submissão (`/submissao`)

**Namespace:** `/submissao`  
**Propósito:** Comunicação com estudantes durante avaliações para validação e registro de infrações.

#### Conexão

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000/submissao', {
  query: {
    hash: 'HASH_DA_SUBMISSAO',
  },
  transports: ['websocket'],
});
```

#### Autenticação

- **Obrigatório:** Hash válido da submissão no query parameter `hash`
- O hash deve corresponder a uma submissão ativa (estados: `INICIADA` ou `REABERTA`)
- Controle de acessos simultâneos baseado nas configurações de segurança

#### Eventos Enviados pelo Cliente

| Evento                             | Descrição                          | Payload                    |
| ---------------------------------- | ---------------------------------- | -------------------------- |
| `registrar-punicao-por-ocorrencia` | Registra uma infração do estudante | `{ tipoInfracao: string }` |

#### Eventos Recebidos pelo Cliente

| Evento               | Descrição                                       | Payload                                |
| -------------------- | ----------------------------------------------- | -------------------------------------- |
| `submissao-validada` | Confirmação de conexão e validação da submissão | `SubmissaoValidada`                    |
| `erro-validacao`     | Erro de hash inválido ou submissão indisponível | `{ message: string, estado?: string }` |

#### Interfaces

```typescript
interface SubmissaoValidada {
  message: string;
  submissaoId: number;
  estudante: string;
  avaliacao: string;
}

interface PunicaoPorOcorrenciaMessage {
  tipoInfracao: string;
}
```

#### Exemplo de Uso

```javascript
// Conectar
const socket = io('http://localhost:8000/submissao', {
  query: {
    hash: 'c5a73b0aafe1c046',
  },
});

// Escutar eventos
socket.on('submissao-validada', (data) => {
  console.log(`Conectado à avaliação: ${data.avaliacao}`);
  console.log(`Estudante: ${data.estudante}`);
});

socket.on('erro-validacao', (error) => {
  console.error('Erro de validação:', error.message);
  if (error.estado) {
    console.log('Estado da submissão:', error.estado);
  }
});

// Enviar eventos
function registrarInfracao(tipo) {
  socket.emit('registrar-punicao-por-ocorrencia', {
    tipoInfracao: tipo,
  });
}

// Exemplo: registrar troca de abas
registrarInfracao('Troca de Abas');
```
