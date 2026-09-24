# Descoberta técnica do portal

Use este roteiro antes de implementar um adaptador novo.

## 1. Definir o alvo observável

Peça ao usuário uma página autenticada em que o evento apareça e uma descrição concreta do comportamento. Exemplos:

- “o contador ao lado de Mensagens muda de 0 para 1”;
- “uma nova linha surge na tabela de diligências”;
- “o lote muda de Julgamento para Habilitação”.

Registre página, elemento visual, processo, conta, frequência esperada e latência aceitável.

## 2. Comparar estados

Capture o estado antes e depois de um evento autorizado. Compare:

- texto, atributos e contador no DOM;
- requisições HTTP novas;
- frames WebSocket/SSE;
- mensagens de console;
- scripts carregados e funções de callback.

Não faça uma ação real de negócio apenas para gerar tráfego. Para mensagens, peça que outro usuário autorizado envie uma mensagem de teste. Para ações que não podem ser simuladas, use fixtures sanitizadas ou aguarde um evento real.

## 3. Inspecionar rede

No Chrome DevTools, use **Network**, marque **Preserve log** e recarregue a página quando isso não causar perda de trabalho. Procure:

- `negotiate`, `connect`, `start`, `reconnect` e `abort` para SignalR 2.x;
- conexões `WS` para WebSocket;
- `event-stream` para SSE;
- `socket.io`;
- endpoints de `notifications`, `messages`, `alerts`, `chat`, `partial`, `unread` e `count`;
- chamadas periódicas que possam ser polling ou heartbeat.

Para cada requisição relevante, registre sem segredos:

| Campo | Registrar |
|---|---|
| Método e caminho | `GET /notifications` |
| Papel | snapshot, heartbeat, detalhe ou evento |
| Parâmetros | nomes, origem e escopo; não os valores secretos |
| Resposta | formato, campos e exemplo sanitizado |
| Autenticação | cookie, bearer ou outro; nunca o valor |
| Efeito colateral | nenhum, desconhecido ou confirmado |

## 4. Inspecionar scripts

Procure referências a:

- `signalR`, `HubConnection`, `WebSocket`, `EventSource` ou `socket.io`;
- objetos `hub.client`, `connection.on` ou handlers equivalentes;
- IDs do DOM atualizados pelo handler;
- parâmetros por usuário, processo e lote;
- política de reconexão e heartbeat da própria página.

Baixar uma biblioteca não prova que ela é usada. Confirme que a página chama a inicialização e que existe conexão ativa.

## 5. Identificar snapshot e detalhe

Um evento frequentemente contém apenas “houve mudança”. Localize separadamente:

- endpoint que lista itens não lidos;
- endpoint que retorna a última mensagem;
- endpoint que retorna o estado atual do processo;
- identificador estável para deduplicação;
- chamada que marca como lido.

Não use automaticamente uma chamada “Read”, “Acknowledge” ou equivalente como consulta. Ela pode alterar a conta do usuário.

## 6. Entregável de descoberta

Antes de programar, escreva um relatório com:

1. fato observado na interface;
2. transporte confirmado;
3. conexão geral ou por processo;
4. eventos/callbacks confirmados;
5. endpoint de snapshot ou detalhe;
6. comportamento de autenticação válida e inválida;
7. efeito colateral conhecido de cada chamada;
8. lacunas que exigem teste real.

Use linguagem firme: “o callback `newMessage` incrementa `#messageCount`” em vez de “o sistema controla notificações”.
