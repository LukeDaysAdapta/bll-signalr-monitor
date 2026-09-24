# Implantação em VPS

## Baseline recomendado

Para um primeiro ambiente de produção use:

- Ubuntu LTS suportado;
- usuário de serviço sem login interativo;
- repositório Git clonado em `/opt/<nome-do-monitor>`;
- serviço gerenciado por systemd ou Docker Compose;
- PostgreSQL para estado e histórico;
- Redis apenas quando houver fila ou múltiplos workers;
- firewall permitindo somente SSH e o healthcheck quando necessário;
- relógio sincronizado por NTP.

Não exponha publicamente o worker de monitoramento.

## Segredos

Nunca inclua cookies no Git, na imagem Docker ou em exemplos. Use o cofre do provedor quando disponível. Como fallback documentado, crie um arquivo externo ao repositório com proprietário `root`, permissão `0600` e acesso somente pelo serviço.

O roteiro deve pedir ao usuário que cole o segredo diretamente na sessão SSH da VPS. A IA não deve pedir o valor no chat nem executar comandos que imprimam o arquivo.

## Serviço

O serviço deve:

- iniciar após a rede e o banco;
- reiniciar em falhas transitórias;
- ter limite de memória e descritores explícito;
- receber `SIGTERM` e fechar sockets ordenadamente;
- expor healthcheck local;
- registrar versão/commit no início;
- não registrar URLs com query sensível nem credenciais.

Não use apenas `nohup` ou uma janela SSH aberta como execução permanente.

## Arquivos operacionais

Separe:

```text
/opt/<monitor>/              código versionado
/etc/<monitor>/              configuração e referências a segredos
/var/lib/<monitor>/          estado persistente
/var/log/<monitor>/          logs, se não usar journald
```

Defina proprietário e permissões para cada diretório. O deploy não deve sobrescrever o estado.

## Banco e migrações

- Execute migrações antes de trocar o serviço.
- Faça backup antes de mudanças destrutivas.
- Use chave idempotente única para eventos.
- Configure retenção e rotação para payloads e logs.

## Healthcheck concreto

O healthcheck deve retornar pelo menos:

```json
{
  "status": "degraded",
  "version": "commit",
  "accounts": {"healthy": 3, "authExpired": 1},
  "processes": {"configured": 6000, "connected": 5520, "reconnecting": 480},
  "lastEventAt": "ISO-8601"
}
```

`healthy` exige critérios claros. Um processo Node vivo sem conexões não é saudável.

## Deploy seguro

1. verificar branch e commit;
2. executar testes;
3. construir artefato imutável;
4. validar configuração sem imprimir segredos;
5. aplicar migrações;
6. iniciar um canário com poucas URLs;
7. observar conexões e erros;
8. ampliar gradualmente;
9. confirmar healthcheck e evento persistido;
10. manter rollback para o artefato anterior.

## Dimensionamento

Antes do benchmark, obtenha autorização do responsável pelo portal ou confirme que a operação está dentro dos limites publicados. Não use novas VPSs ou IPs para contornar rate limit ou bloqueio.

Defina antecipadamente limites de CPU, memória, descritores, erros, reconexões, latência e idade do snapshot. Se o usuário não tiver metas, proponha valores iniciais conservadores e identifique-os como hipóteses de engenharia, não limites do portal.

Faça benchmark com 1, 10, 50, 100, 250 e 500 conexões. Se cada patamar permanecer estável pelo período definido e autorizado, continue com 750, 1.000, 1.500 e o volume-alvo. Interrompa quando:

- negociações começarem a falhar;
- reconexões crescerem continuamente;
- memória se aproximar do limite do serviço;
- CPU sustentada ultrapassar a meta definida;
- descritores de arquivo ficarem sem margem;
- a BLL/portal demonstrar rate limit ou bloqueio.

Registre resultados por commit e ambiente. Não extrapole diretamente o consumo total de 12 conexões para 6.000 sem separar a memória-base do runtime.

O relatório final deve concluir uma destas opções com evidências: “uma VPS aprovada”, “múltiplas VPSs necessárias”, “arquitetura deve mudar” ou “escala não autorizada/suportada”.
