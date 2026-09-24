# Caso de referência: SignalR 2.x por processo

Use esta referência somente quando o portal carregar `jquery.signalR` e o proxy `/signalr/hubs`. Não aplique este protocolo a ASP.NET Core SignalR.

## Evidências observadas no caso BLL

- Biblioteca: `jquery.signalR-2.4.1.js`.
- Proxy gerado: `/signalr/hubs`.
- Hub: `batchScreenHub`.
- Configuração por conexão: `Pid` e `Uid`.
- Negociação: `/signalr/negotiate`.
- Transporte: `/signalr/connect` com WebSocket.
- Inicialização: `/signalr/start`.
- Eventos de mensagem: `newProcessMsg` e `newBatchMsg`.
- Reconexão da página: tentativa após desconexão.
- Um evento de processo podia chegar sem argumentos.

Esses nomes são um exemplo, não um contrato de outros portais.

## Sequência do cliente legado

1. Carregar a página autenticada do processo.
2. Extrair configuração de hub vinculada àquela página.
3. Chamar `GET /signalr/negotiate` com `clientProtocol`, `connectionData` e parâmetros do hub.
4. Validar `ConnectionToken` e transportes oferecidos.
5. Abrir `/signalr/connect?transport=webSockets...` com o mesmo cookie e parâmetros.
6. Chamar `/signalr/start`.
7. Interpretar frames cujo campo `M` contém invocações do hub.
8. Reconectar com atraso progressivo quando o socket fechar.

Compare sempre com o JavaScript oficial carregado pelo próprio portal. No caso BLL, o cliente oficial mostrou que `negotiate` era `GET`; assumir `POST` gerou uma incompatibilidade evitável.

## Armadilhas confirmadas

- Página com título correto, mas `Pid`/`Uid` vazios: sessão insuficiente para o hub.
- `connected` sem evento real: transporte confirmado, callback ainda não validado.
- Deduplicar `newProcessMsg` por `process + nome + []`: elimina todas as mensagens posteriores.
- Conectar milhares de URLs de uma vez: risco de exceder descritores e criar tempestade no servidor.
- Registrar URL inteira, `Uid`, `ConnectionToken` ou query do socket: pode expor identificadores sensíveis.

## Diagnóstico seguro

É aceitável registrar:

- status HTTP;
- URL final sem query sensível ou com query redigida;
- título da página;
- nomes dos campos encontrados;
- comprimento ou presença de valores, nunca os valores;
- estado da conexão;
- código de fechamento do socket;
- contador agregado de processos afetados.

Fixtures de teste devem substituir todos os valores por `processo-exemplo`, `usuario-exemplo` e `token-exemplo`.
