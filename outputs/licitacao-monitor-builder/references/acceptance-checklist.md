# Checklist de aceitação

Preencha com `sim`, `não` ou `não aplicável`, acrescentando evidência.

## Descoberta

- [ ] Indicador visual e evento desejado foram descritos concretamente.
- [ ] Transporte foi confirmado por rede ou código em execução.
- [ ] Escopo da conexão, geral ou por processo, foi provado.
- [ ] Callback/evento foi associado ao indicador visual.
- [ ] Endpoint de snapshot/detalhe foi localizado ou marcado como pendente.
- [ ] Endpoints com efeito colateral foram identificados e evitados.
- [ ] Há autorização e limites conhecidos antes de qualquer teste de carga.

## Autenticação

- [ ] Nenhuma credencial está no Git, chat, fixture ou log.
- [ ] Sessão válida e inválida têm sinais verificáveis.
- [ ] Serviço entra em `auth_expired` em vez de reconectar indefinidamente.
- [ ] Renovação foi documentada para pessoa não técnica.
- [ ] Contas e processos estão particionados corretamente.
- [ ] Banco guarda `secret_ref`, não o cookie em texto.

## Implementação

- [ ] Uma URL conecta e registra o evento esperado.
- [ ] Evento sem payload não é descartado indevidamente.
- [ ] Snapshot confirma e deduplica a mudança quando necessário.
- [ ] Escritas concorrentes não corrompem o estado.
- [ ] Reconexão usa atraso progressivo e jitter.
- [ ] Encerramento fecha conexões ordenadamente.
- [ ] Diagnósticos omitem cookies, tokens e query sensível.
- [ ] Conteúdo de mensagens é minimizado, protegido e omitido dos alertas por padrão.
- [ ] Outbox garante entrega idempotente e recuperação de falhas.

## Testes

- [ ] Fixtures estão sanitizadas.
- [ ] Testes unitários passam.
- [ ] Teste sintético persiste um evento marcado como simulado.
- [ ] Evento real foi validado ou declarado explicitamente pendente.
- [ ] Expiração e renovação de sessão foram testadas.
- [ ] Lote pequeno foi executado antes do benchmark.
- [ ] Código recebido foi revisado e executado isoladamente, sem segredos.

## VPS

- [ ] Serviço reinicia automaticamente.
- [ ] Segredo está fora do repositório e protegido.
- [ ] Healthcheck mede conexões, não apenas processo vivo.
- [ ] Logs têm rotação e retenção.
- [ ] Banco tem backup e migração documentados.
- [ ] Há deploy canário e rollback.

## Operação

- [ ] Painel mostra estado por conta e processo.
- [ ] Alertas identificam quantidade afetada e duração.
- [ ] Reconciliação recupera eventos perdidos.
- [ ] Limites por worker e início gradual estão configurados.
- [ ] Capacidade foi medida, não apenas extrapolada.
- [ ] Interface operacional entregue foi declarada: CLI, healthcheck autenticado ou painel.
