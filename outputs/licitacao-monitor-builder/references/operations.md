# Operação, alertas e incidentes

## Estados visíveis

O operador deve visualizar por processo:

- `configured`;
- `connecting`;
- `connected`;
- `reconnecting`;
- `auth_expired`;
- `forbidden`;
- `removed`;
- `failed`.

Mostre também conta, worker, última conexão, último heartbeat, último evento, número de tentativas e erro sanitizado.

Para poucos processos, uma CLI ou healthcheck autenticado pode bastar. Para operação por pessoa não técnica e múltiplas contas, entregue um painel autenticado que permita filtrar conta, portal e estado. Declare explicitamente qual interface foi entregue.

## Métricas mínimas

- processos configurados, conectados e desconectados;
- conexões por worker e por conta;
- negociações bem-sucedidas e rejeitadas;
- reconexões por minuto;
- eventos recebidos, deduplicados e enriquecidos;
- tempo entre evento e notificação;
- falhas HTTP por status;
- idade do último snapshot;
- RSS, CPU, descritores e tráfego de rede;
- tamanho da fila e idade do evento mais antigo.

## Alertas concretos

Exemplos:

- “Conta Prefeitura X: autenticação expirada; 438 processos pausados.”
- “Worker 03: 27% das conexões em reconexão há mais de 5 minutos.”
- “Fila de enriquecimento: evento mais antigo aguardando há 92 segundos.”
- “Processo 028/2026: último snapshot há 40 minutos; meta é 10 minutos.”

Evite alertar por uma única desconexão transitória. Alerte por duração, proporção ou falhas consecutivas.

## Runbook de sessão expirada

1. Confirmar que várias URLs da mesma conta falharam.
2. Verificar status/redirect sem imprimir segredo.
3. Pausar o grupo da conta.
4. Solicitar autenticação humana.
5. Atualizar o segredo na VPS.
6. Validar uma URL canário.
7. Retomar em rampa.
8. Confirmar quantidade restaurada.
9. Encerrar o incidente com horários e causa.

## Runbook de portal alterado

Sinais: seletor desapareceu, proxy do hub mudou, evento deixou de ser reconhecido ou snapshot não contém campos esperados.

1. preservar amostra sanitizada da resposta;
2. comparar com fixture anterior;
3. verificar scripts e rede do portal;
4. atualizar somente o adaptador afetado;
5. criar teste que reproduz a mudança;
6. validar uma URL canário;
7. ampliar gradualmente.

## Retenção

Defina prazos para eventos brutos, mensagens normalizadas, logs e incidentes. Faça rotação de JSONL/logs e monitore espaço em disco. Nunca retenha cookies dentro dos eventos. Minimize o conteúdo de mensagens, criptografe banco e backups quando necessário e não envie o texto completo a canais de alerta por padrão.

## Falha do canal de notificação

O operador deve visualizar notificações pendentes, número de tentativas e última falha. Reprocesse a outbox de modo idempotente e mova itens esgotados para uma fila de falhas; não descarte silenciosamente nem reenvie alertas já confirmados.

## Atualização de processos

Importar uma lista nova deve produzir resumo antes da aplicação:

```text
6.000 atuais
120 adicionados
35 removidos
5 URLs inválidas
0 credenciais encontradas no arquivo
```

Não remova processos do estado silenciosamente. Marque-os como inativos e preserve o histórico conforme a política de retenção.
