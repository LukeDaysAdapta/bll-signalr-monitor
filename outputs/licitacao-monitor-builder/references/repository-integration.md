# Integração com o repositório fornecido

## Antes de editar

1. Leia `README`, instruções de agentes, manifesto de dependências e arquivos de implantação.
2. Inspecione scripts de instalação, lifecycle hooks, Makefiles, containers e comandos de teste antes de executá-los.
3. Execute dependências e testes inicialmente em ambiente isolado, sem cookie, chave SSH, segredo de produção ou banco real. Libere somente o acesso necessário para dependências conhecidas.
4. Registre o resultado inicial dos testes.
5. Localize o núcleo compartilhado e qualquer adaptador de portal já existente.
6. Identifique mudanças do usuário no worktree e preserve-as.
7. Descubra como configuração, segredos, logs e migrações já são tratados.

Não copie o adaptador anterior inteiro e troque apenas a URL. Endpoints, cookies, callbacks, parâmetros e semântica de leitura pertencem ao portal original.

Nunca execute o repositório recebido com a variável do cookie presente. Injete a sessão somente depois de revisar o caminho executado e validar o adaptador sem segredos.

## Reuso correto

Reutilize do sistema existente:

- modelo de evento interno;
- fila, persistência e notificação;
- supervisor de conexões;
- atraso progressivo e encerramento;
- healthcheck e métricas;
- arquivos de deploy e convenções de teste.

Isole no adaptador novo:

- validação de sessão;
- descoberta de contexto por URL;
- negociação do transporte;
- parser de frames/respostas;
- consulta de snapshot/detalhe;
- normalização de identificadores e eventos.

Se o núcleo não possuir contrato de adaptador, faça a menor refatoração necessária, protegida por testes do portal já suportado.

## Artefatos esperados no GitHub

- pasta/módulo do adaptador novo;
- fixtures sanitizadas;
- testes unitários e de integração controlada;
- exemplo de configuração sem segredos;
- migração de banco, quando necessária;
- atualização da documentação e do deploy;
- nota de descoberta com fatos confirmados e pendências;
- instrução de rollback.

Não faça commit de capturas de rede brutas antes de remover cookies, authorization headers, query tokens, nomes pessoais e conteúdo confidencial de mensagens.

## Verificação da mudança

Execute testes do adaptador novo e regressão do adaptador existente. Verifique que:

- uma falha de um portal não derruba os demais;
- métricas incluem `portal_id` e `account_id`;
- segredo de uma conta não aparece em erro de outra;
- deploy antigo continua utilizável durante rollback;
- exemplos não apontam para processos reais.

Ao entregar, cite arquivos e comandos executados; não afirme que um evento real foi testado se apenas fixtures ou o teste sintético foram usados.
