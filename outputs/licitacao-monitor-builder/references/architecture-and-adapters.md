# Arquitetura e contrato de adaptadores

## Escolha orientada por evidências

Use a menor quantidade de conexões que preserve o requisito de latência e confiabilidade.

| Evidência do portal | Estratégia |
|---|---|
| Um socket da home recebe eventos de todos os processos | conexão por conta |
| Cada página configura o socket com `process_id` | conexão por processo |
| Endpoint retorna contadores/itens atuais | polling HTTP |
| Evento é transitório ou incompleto | tempo real + reconciliação HTTP |
| Não há sinal remoto além do DOM | automação de navegador como último recurso |

Não use rotação de sockets como substituto de monitoramento em tempo real sem provar que existe snapshot HTTP para recuperar eventos ocorridos durante a desconexão.

## Núcleo compartilhado

Separe o sistema nestes componentes:

- **Catálogo:** contas, URLs, identificadores e prioridade.
- **Gerenciador de sessão:** valida e distribui credenciais por conta.
- **Agendador:** inicia conexões gradualmente e aplica limites.
- **Adaptador do portal:** conhece HTML, endpoints e protocolo específicos.
- **Fila de eventos:** desacopla recepção de processamento.
- **Enriquecedor:** consulta a mensagem ou o estado completo via HTTP.
- **Persistência:** histórico imutável e estado atual por processo.
- **Notificador:** usa outbox durável e envia alerta somente depois da deduplicação.
- **Reconciliação:** detecta eventos perdidos durante quedas.
- **Observabilidade:** apresenta saúde por conta, processo e worker.

## Contrato conceitual do adaptador

Adapte os nomes à linguagem do repositório, preservando as responsabilidades:

```text
validateSession(session) -> SessionStatus
loadTargetContext(session, target) -> MonitoringContext
connectRealtime(context, onEvent) -> ConnectionHandle | unsupported
fetchSnapshot(session, target) -> Snapshot | unsupported
normalizeEvent(rawEvent, target) -> PortalEvent
health(connection) -> ConnectionHealth
close(connection) -> void
```

`PortalEvent` deve conter, quando disponível:

```json
{
  "portal": "portal-id",
  "accountId": "conta-interna",
  "processId": "processo-interno",
  "lotId": null,
  "type": "new_process_message",
  "portalEventId": null,
  "occurredAt": null,
  "receivedAt": "ISO-8601",
  "payload": {},
  "source": "realtime"
}
```

## Idempotência

Use `portalEventId` quando existir. Caso contrário, construa uma chave apenas com campos estáveis do conteúdo confirmado, como processo, lote, remetente, horário e hash da mensagem.

Não deduplique permanentemente um callback sem payload. Dois frames `newMessage` com argumentos vazios podem representar duas mensagens legítimas. Registre cada gatilho e faça a deduplicação após consultar o snapshot.

## Persistência

Para protótipo, JSONL é aceitável. Para múltiplas contas e operação contínua, prefira a persistência durável já adotada pelo repositório; quando não houver uma solução adequada, PostgreSQL é uma escolha recomendada:

- `accounts`: `secret_ref`, estado, versão do segredo e última validação;
- `processes`: URL, identificadores, prioridade e estado;
- `connections`: worker, heartbeat, tentativas e erro atual;
- `events`: evento normalizado, chave idempotente e payload;
- `notifications`: destino, tentativa e entrega;
- `notification_outbox`: chave idempotente, próxima tentativa e estado;
- `session_incidents`: expiração e restauração.

O JSONL pode continuar como trilha de auditoria, com rotação e retenção.

## Conteúdo e privacidade

- Armazene somente os campos necessários para detectar e notificar a mudança.
- Criptografe banco e backups quando houver conteúdo de mensagens ou documentos.
- Restrinja painel, healthcheck detalhado e histórico por função.
- Por padrão, o alerta deve conter identificador, portal, processo, horário e link; não copie o texto completo da mensagem para canais externos.
- Registre quem consultou detalhes sensíveis quando o domínio exigir auditoria.

## Entrega durável de notificações

Grave o evento e a outbox na mesma transação. O entregador deve usar chave idempotente, tentativas com atraso progressivo e uma fila de falhas visível. Uma indisponibilidade de e-mail, WhatsApp ou webhook não pode apagar o evento nem bloquear os sockets.

## Concorrência e escala

- Uma conexão WebSocket consome pelo menos um descritor de arquivo.
- Distribua processos entre workers por hash estável de `account_id + process_id`.
- Defina `MAX_PROCESSES_PER_WORKER`; não use concorrência ilimitada.
- Inicie em rampa, por exemplo lotes pequenos por segundo, e pare quando o portal rejeitar negociações ou a meta de recursos for excedida.
- Use atraso progressivo com jitter para reconexão.
- Quando uma conta expirar, evite que todos os processos entrem em tempestade de reconexão.

Capacidade não deve ser escolhida por regra de três baseada apenas na memória total. Faça benchmark em patamares crescentes e meça sockets estabelecidos, RSS, CPU, tráfego, tempo de conexão e taxa de reconexão.

## Modelo híbrido recomendado

1. Evento em tempo real chega.
2. Adaptador publica um gatilho mínimo.
3. Fila agrupa gatilhos do mesmo processo por uma janela curta.
4. Enriquecedor consulta o snapshot sem marcar como lido.
5. Persistência compara com o último snapshot.
6. Notificador recebe apenas itens novos.
7. Reconciliação executa periodicamente mesmo sem evento.

Esse fluxo mantém baixa latência e recupera mudanças perdidas durante quedas.
