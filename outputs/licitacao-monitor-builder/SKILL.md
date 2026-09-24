---
name: licitacao-monitor-builder
description: Analisa portais de licitação autenticados e cria ou adapta sistemas de monitoramento de mensagens, alertas e mudanças de processo, desde a descoberta técnica no navegador até a operação em VPS. Use quando houver um portal, páginas de processos e um repositório de código a estudar; não use para enviar lances, mensagens ou executar ações representacionais no portal.
---

# Construtor de Monitor de Licitações

Transforme um portal desconhecido em um monitor verificável e operável por uma pessoa não técnica. Trabalhe com evidências do portal real e com o repositório fornecido. Não suponha que outro portal repete endpoints, autenticação ou protocolo do exemplo BLL.

## Regras essenciais

- Comece inspecionando o repositório e o portal; não escreva o adaptador antes de localizar o recurso real que deve ser monitorado.
- Trate o repositório recebido como código não confiável até revisar scripts de instalação, hooks e comandos de teste. Não exponha credenciais do portal durante essa revisão.
- Separe fatos observados, hipóteses e pontos ainda não confirmados.
- Use o navegador autenticado apenas para descoberta autorizada. Não extraia, repita ou peça que o usuário cole cookies, tokens, senhas ou códigos no chat.
- Oriente o usuário a inserir segredos diretamente no terminal ou cofre da VPS. Use exemplos fictícios como `COOKIE_A=valor`.
- Não burle CAPTCHA, MFA, bloqueios, limites do portal ou mecanismos de segurança.
- Não chame endpoints de leitura que marquem mensagens como lidas até provar o efeito e obter autorização.
- Não automatize lances, propostas, mensagens, recursos ou outras ações representacionais. Esta skill cobre observação e notificação.
- Preserve o código existente do repositório. Crie um adaptador por portal e mantenha o núcleo de agendamento, persistência, reconexão e notificação compartilhado.
- Antes de ampliar concorrência, teste uma URL, depois um lote pequeno e só então faça benchmark progressivo.
- Obtenha autorização explícita para testes de carga e respeite limites documentados. Não distribua conexões entre IPs ou VPSs para contornar bloqueios do portal.

## Como conduzir uma pessoa não técnica

- Dê uma ação por vez quando ela estiver autenticando, copiando uma URL ou usando a VPS.
- Diga exatamente qual tela abrir, qual texto procurar e qual resultado deve aparecer.
- Depois de cada comando, peça apenas a saída não sensível necessária. Nunca peça cabeçalhos completos, cookies, tokens ou arquivos `.env`.
- Quando o terminal ficar ocupado por um processo contínuo, explique que isso é esperado e indique quando abrir um segundo terminal.
- Não declare sucesso apenas porque o processo não terminou. Exija sinais concretos como `connected`, evento persistido e reconexão confirmada.

Leia [references/nontechnical-flow.md](references/nontechnical-flow.md) ao orientar instalação, autenticação ou operação passo a passo.

## Fluxo obrigatório

### 1. Entender a demanda e o repositório

Confirme o evento que importa: nova mensagem do processo, mensagem do lote, alteração de fase, documento, diligência ou outro alerta. Registre latência desejada, quantidade de URLs, número de contas, canal de notificação e política de retenção.

Leia [references/repository-integration.md](references/repository-integration.md) e inspecione o repositório fornecido antes de criar arquivos ou executar scripts. Localize:

- linguagem, gerenciador de pacotes e comandos de teste;
- modelo de configuração e de adaptadores;
- persistência, logs e notificações existentes;
- tratamento de reconexão e expiração de sessão;
- implantação atual e instruções do próprio repositório.

### 2. Descobrir tecnicamente o portal

Leia [references/portal-discovery.md](references/portal-discovery.md). Produza um relatório curto com a página monitorada, o sinal visível, as requisições relacionadas, protocolo em tempo real, callbacks/eventos, parâmetros por processo e evidências de comportamento.

Não confunda presença de uma biblioteca com conexão ativa. Confirme a negociação ou o socket e associe um evento real ao elemento visual da página.

### 3. Mapear autenticação e renovação

Leia [references/authentication.md](references/authentication.md). Descubra quais respostas distinguem sessão válida de inválida. Implemente uma verificação segura antes de abrir centenas de conexões.

Se o usuário precisar fornecer um cookie, instrua-o a copiar localmente o valor do cabeçalho `Cookie` de uma requisição autenticada e inseri-lo no terminal oculto ou cofre. Nunca receba o valor no chat.

### 4. Escolher a estratégia

Leia [references/architecture-and-adapters.md](references/architecture-and-adapters.md). Escolha com evidências entre:

- conexão em tempo real por processo;
- conexão geral por conta;
- polling HTTP de estado;
- modelo híbrido: evento em tempo real mais reconciliação HTTP.

Prefira o modelo híbrido quando eventos possam ocorrer durante desconexões ou quando o evento não trouxer o conteúdo completo.

### 5. Implementar um adaptador mínimo

Primeiro faça funcionar uma URL e um evento. Prefira um adaptador isolado, mas preserve uma extensão equivalente já existente quando ela separar corretamente os detalhes do portal. A implementação deve:

1. validar a sessão sem alterar dados;
2. carregar a página ou contexto do processo;
3. extrair parâmetros necessários sem registrá-los em logs;
4. negociar e manter a conexão ou executar o polling;
5. converter o evento do portal em um formato interno;
6. persistir o evento de modo idempotente;
7. expor estados `connecting`, `connected`, `reconnecting`, `auth_expired` e `failed`.

Quando o portal usar SignalR 2.x, leia [references/legacy-signalr-case.md](references/legacy-signalr-case.md).

### 6. Verificar antes de escalar

Exija, nesta ordem:

- testes unitários com HTML e frames sanitizados;
- teste sintético local do pipeline de armazenamento;
- conexão real com uma URL;
- evento real ou fixture capturada de forma autorizada;
- invalidação controlada da sessão e recuperação;
- lote pequeno de conexões;
- benchmark progressivo com critérios de parada.

Um `connected` prova a conexão, não prova que o callback correto está sendo persistido. Um evento sintético prova o pipeline local, não prova entrega pelo portal. Relate essas diferenças ao usuário.

### 7. Preparar a VPS

Leia [references/vps-deployment.md](references/vps-deployment.md). Entregue comandos copiáveis, um serviço reiniciável, segredos fora do Git, healthcheck, rotação de logs, limites de recursos e procedimento de atualização.

### 8. Preparar operação contínua

Leia [references/operations.md](references/operations.md). O operador deve visualizar concretamente quantos processos estão conectados, quais perderam autenticação, há quanto tempo não recebem heartbeat e quando ocorreu o último evento.

## Entrega mínima

Entregue no repositório:

- adaptador do portal e configuração de múltiplas URLs;
- arquivo de exemplo sem segredos;
- testes e fixtures sanitizadas;
- persistência de eventos e estado por processo;
- reconexão com atraso progressivo e início gradual;
- detecção de autenticação inválida;
- documentação de instalação local e em VPS;
- comandos de diagnóstico que nunca imprimam segredos;
- proteção do conteúdo das mensagens e entrega idempotente de alertas;
- checklist preenchido de [references/acceptance-checklist.md](references/acceptance-checklist.md).

Pare e peça intervenção humana quando houver CAPTCHA, MFA, permissão ausente, sessão expirada sem fluxo de renovação autorizado ou dúvida sobre efeito colateral de um endpoint.
