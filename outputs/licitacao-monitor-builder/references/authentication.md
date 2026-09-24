# Autenticação, cookies e renovação

## Princípio

Trate cookie, bearer token, senha, MFA e parâmetros vinculados ao usuário como credenciais. A IA não deve extraí-los do navegador, recebê-los no chat, registrá-los em logs ou incluí-los em arquivos versionados.

## Orientação local para cookie

Quando o portal usar cookies e não houver API oficial de autenticação:

1. peça ao usuário que abra uma requisição autenticada do próprio portal em **DevTools → Network**;
2. em **Headers → Request Headers**, ele localiza `Cookie`;
3. ele copia somente o valor depois de `Cookie:`;
4. ele insere o valor diretamente no prompt oculto do terminal ou no cofre da VPS;
5. ele nunca cola o valor no chat.

Exemplo local para zsh, usando apenas texto fictício:

```sh
read -s 'PORTAL_COOKIE?Cole o Cookie completo: '
export PORTAL_COOKIE
```

O valor correto de um cabeçalho pode conter vários pares: `COOKIE_A=valor; COOKIE_B=valor`. Não assuma que um token isolado seja o cabeçalho inteiro.

## Armazenamento na VPS

Preferência:

1. cofre gerenciado do provedor;
2. `systemd-creds` ou mecanismo de segredo equivalente;
3. como último recurso, arquivo fora do repositório, proprietário `root`, permissão `0600`, montado somente no serviço.

Não grave o cookie em `processes.txt`, `docker-compose.yml`, imagem Docker, histórico do shell, URL ou banco sem criptografia.

## Validação antes do fan-out

Faça uma requisição de leitura para uma página conhecida e valide sinais sem revelar valores:

- status HTTP e URL final;
- título ou seletor exclusivo da área autenticada;
- presença de configuração do hub;
- nomes dos campos esperados;
- ausência de formulário de login.

No caso que originou esta skill, a página correta podia retornar `Pid` e `Uid` com valores vazios quando a requisição não tinha a sessão completa. O título correto, isoladamente, não provava autenticação suficiente para o hub.

## Classificação de falhas

Classifique concretamente:

| Sinal | Estado |
|---|---|
| `401` ou `403` | `auth_expired` ou permissão ausente |
| redirecionamento para login | `auth_expired` |
| seletor autenticado ausente | `auth_suspect` |
| parâmetros do hub vazios | `auth_suspect` |
| `negotiate` rejeitado para todas as URLs da conta | `auth_expired` provável |
| apenas uma URL rejeitada | processo sem permissão ou removido |

Evite um ciclo infinito de reconexão quando a autenticação expirou. Pause o grupo da conta e gere um alerta com quantidade de processos afetados e horário inicial da falha.

## Renovação assistida

Fluxo recomendado:

1. detectar expiração em pelo menos duas verificações independentes;
2. pausar novas conexões daquela conta;
3. manter outras contas funcionando;
4. alertar o operador;
5. operador entra novamente no portal e atualiza o segredo localmente;
6. o serviço valida uma URL canário;
7. reconecta gradualmente o grupo;
8. registra início, fim e quantidade de processos restaurados.

Nunca tente automatizar MFA ou CAPTCHA sem um fluxo oficial autorizado.

## Múltiplas contas

Associe cada processo a `account_id`. Uma sessão não deve ser reutilizada silenciosamente para processos de outra conta. Métricas, limites, alertas e renovação devem ser agrupados por conta.

No banco operacional, `accounts` deve guardar `secret_ref`, estado, versão do segredo e horário da última validação — nunca o cookie em texto. O cofre guarda o valor. A atualização deve ser atômica: gravar nova versão, validar um canário, promover a versão e só então retomar o grupo.

Se uma credencial aparecer no chat ou log, considere-a exposta: oriente o usuário a invalidar a sessão e autenticar novamente.
