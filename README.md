# Monitor SignalR da BLL — vários processos

Este projeto mantém uma conexão SignalR 2.x por processo BLL e grava eventos em
`storage/events.jsonl`. Ele não abre abas, não extrai cookies do Chrome e não salva
cookies ou tokens em disco.

## Preparação

```sh
npm install
```

Crie `processes.txt` a partir de `processes.example.txt`: uma URL `BatchList` por linha.
O arquivo contém URLs de processo, nunca o cookie.

No terminal que executará o monitor, informe:

```sh
export PROCESS_URLS_FILE='./processes.txt'
read -s 'BLL_COOKIE?Cole o Cookie completo: '
export BLL_COOKIE
export STORAGE_DIR='./storage'
export MAX_PROCESSES=20
npm start
```

`BLL_COOKIE` fica apenas na memória do processo Node. Não coloque esse valor em `.env`,
arquivos de configuração, commits ou histórico de logs. O diretório `storage/` contém
somente o estado de deduplicação e o histórico de eventos.

## Executar

Em uma conexão válida, o terminal registra uma linha `connected` para cada processo.
Quando a BLL emitir `newProcessMsg` ou `newBatchMsg`, o monitor adiciona uma linha em
`storage/events.jsonl`, com a URL e o identificador do processo associados. Uma conexão
encerrada tenta retornar gradualmente, sem derrubar as demais.

Para validar somente o armazenamento local — sem enviar mensagem pela BLL — execute
`npm run self-test`. Ele grava um evento marcado como `simulated: true`.

## Limite operacional

O monitor usa o protocolo legado SignalR 2.x detectado nesta página (`batchScreenHub`).
`MAX_PROCESSES` começa em 20 como teto de segurança. Não aumente esse número antes de
medir os limites de conexão e a estabilidade da BLL com mensagens reais.
