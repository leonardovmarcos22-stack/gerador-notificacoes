# Gerador de Notificações Push — primeira versão

Esta versão foi pensada para testar o fluxo no próprio iPhone:

Safari → site HTTPS → Adicionar à Tela de Início → Abrir como App da Web → permitir notificações → Testar notificação.

## 1. Gerar as chaves VAPID

No ambiente Node.js, instale `web-push` e execute:

    npx web-push generate-vapid-keys

Você receberá uma chave pública e uma privada.

## 2. Variáveis de ambiente no Netlify

Crie:

- `VAPID_SUBJECT` = `mailto:seu-email@exemplo.com`
- `VAPID_PUBLIC_KEY` = chave pública
- `VAPID_PRIVATE_KEY` = chave privada

Opcionalmente:

- `ADMIN_TOKEN` = uma senha longa para proteger o endpoint de envio.

## 3. Publicação

Suba esta pasta para um repositório GitHub e conecte o repositório ao Netlify, ou use o método de deploy manual disponível no Netlify.

Depois de publicado em HTTPS:

1. Abra o endereço no Safari do iPhone.
2. Compartilhar → Adicionar à Tela de Início.
3. Ative “Abrir como App da Web”, se aparecer.
4. Abra o ícone criado.
5. Toque em “Ativar notificações neste iPhone”.
6. Permita notificações.
7. Toque em “Testar notificação”.

## Importante sobre esta versão

O armazenamento da inscrição está apenas em memória e serve para o primeiro teste. Ele não é confiável para produção nem para agendamento.

Depois que o Push básico funcionar, a próxima versão deve adicionar armazenamento persistente e então:
- quantidade de notificações;
- intervalo;
- horário/data;
- botão Enviar agora;
- histórico;
- vários dispositivos;
- autenticação.


## Gerar VAPID sem PC

Abra `tools/gerar-chaves-vapid.html` no Safari (ou publique temporariamente esse arquivo), toque em **Gerar chaves** e copie os dois valores para as variáveis de ambiente do Netlify.

Não compartilhe `VAPID_PRIVATE_KEY`. Ela deve ficar somente nas variáveis de ambiente do Netlify.

## Observação sobre segurança

Para o primeiro teste, o endpoint `/api/send` pode ser protegido definindo `ADMIN_TOKEN`. Se você definir essa variável, a chamada do navegador também precisará enviar esse token; a interface desta primeira versão ainda não possui um campo para ele. Para um teste inicial privado, deixe o site protegido por controle de acesso do próprio Netlify ou adicione autenticação antes de expor o endpoint.
