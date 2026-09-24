# Condução de usuário não técnico

## Forma de trabalhar

Conduza em pequenas etapas com um resultado visível por etapa. Não entregue vinte comandos e espere que o usuário identifique onde falhou.

Use este ciclo:

1. explique em uma frase o objetivo da ação;
2. forneça um comando copiável ou caminho exato na interface;
3. diga qual saída confirma sucesso;
4. espere o resultado quando a próxima etapa depende dele;
5. peça apenas dados não sensíveis.

## Vocabulário concreto

Prefira:

- “o terminal mostrará uma linha `connected` para cada processo”;
- “a mensagem nova criará uma linha em `events.jsonl`”;
- “o painel mostrará 438 processos em `auth_expired`”.

Evite:

- “o sistema controlará tudo”;
- “a plataforma fará a gestão”;
- “a automação cuidará da sessão”.

## Terminais bloqueantes

Explique explicitamente:

- `npm start`, `docker compose up` sem `-d`, `tail -f` e `journalctl -f` permanecem abertos;
- ausência do prompt não significa travamento;
- dois processos contínuos exigem dois terminais ou execução em segundo plano;
- `Ctrl+C` encerra o processo atual.

## Segredos

Se o usuário enviar uma credencial no chat:

1. não a repita;
2. não a use;
3. informe que ela foi exposta;
4. oriente invalidação da sessão;
5. retome somente com um segredo novo inserido localmente.

Para diagnosticar variáveis, peça tamanho, quantidade de pares ou presença do prefixo, nunca o valor. Exemplo seguro:

```sh
node -e 'const c=process.env.PORTAL_COOKIE||""; console.log({bytes:Buffer.byteLength(c), pares:c.split(";").filter(x=>x.includes("=")).length})'
```

## Sequência recomendada com o usuário

1. Identificar uma página e o indicador visual.
2. Abrir DevTools e localizar a requisição relevante.
3. Confirmar transporte e evento.
4. Clonar ou abrir o repositório.
5. Executar testes existentes.
6. Criar o adaptador de uma URL.
7. Pedir que o usuário insira a sessão localmente.
8. Confirmar `connected`.
9. Executar teste sintético.
10. Confirmar evento real quando possível.
11. Adicionar múltiplas URLs com limite baixo.
12. Medir recursos.
13. Implantar em VPS.
14. Demonstrar expiração e renovação da sessão.

Se um evento real não puder ser provocado, declare exatamente o que foi provado e o que continua pendente.
