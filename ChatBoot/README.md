# Natus · Atendimento Natu Vale

## Abrir no computador

Dê dois cliques em [`index.html`](index.html) na pasta `ChatBoot`. Ele abre a demonstração diretamente no navegador. Dá para testar a fila, os filtros, o histórico e o envio de mensagens fictícias. Ao recarregar, as conversas voltam aos dados de exemplo.

Para usar o painel com login, execute **Iniciar Natus.cmd** e abra o [painel de atendimento](http://127.0.0.1:8790/). O iniciador usa o Node.js 24 ou superior. Após reiniciar o computador, execute o iniciador novamente para ativar o painel. O log de inicialização fica em `dados-locais/natus-launcher.log`.

Para iniciar pelo PowerShell dentro de `ChatBoot`, use estes comandos com Node.js disponível no PATH.

```powershell
$env:NATUS_PORT = '8790'
node .\server.mjs --demo
```

Entre com uma conta administrativa do painel. Os hashes ficam em `dados-locais/natus-admin.local.json`. Escolha uma conversa para simular mensagens do cliente, respostas pelo WhatsApp Business e o lembrete de 20 minutos.

## Organização da pasta

| Pasta | Conteúdo |
|---|---|
| `publicar/` | Demonstração estática com `index.html`, `css/`, `js/` e `assets/`. |
| `interface/` | Entrada de compatibilidade para quem abriu o `index.html` pelo caminho antigo. |
| `painel/` | Interface do painel com login, servida pelo Node.js. |
| `scripts/` | Script de inicialização usado pelo atalho do Windows. |
| `config/` | Modelo de configuração da Meta sem credenciais. |
| `dados-locais/` | Contas administrativas, bancos de dados, configuração local e log. A pasta é ignorada pelo Git. |

## Hospedar a demonstração

Envie o conteúdo de `publicar/` para a raiz da hospedagem estática. O `index.html` dessa pasta é a página inicial. Mantenha `css/`, `js/` e `assets/` ao lado dele.

O repositório `Fonts45/Natus-AI` usa um fluxo do GitHub Actions que publica a demonstração de `ChatBoot/publicar/` a cada mudança nessa pasta na branch `main`. [Fluxo de publicação](https://github.com/Fonts45/Natus-AI/actions/workflows/pages.yml) · [Demonstração hospedada](https://fonts45.github.io/Natus-AI/).

O painel com login e o webhook da Meta precisam do servidor Node.js. As credenciais e os dados de atendimento ficam em `dados-locais/`, fora de `publicar/`.

## Configuração com WhatsApp

### Respostas automáticas

No painel, abra **Configurar respostas**. A aba **Respostas manuais** guarda os cinco textos fixos do menu. Uma escolha pelo número da opção sempre usa o texto salvo. A aba **Respostas com IA** permite editar a base da NVC e ativar respostas a perguntas livres. Quando a IA precisa de ajuda, a conversa entra na fila humana.

Para habilitar a IA, rode o Ollama no mesmo computador ou servidor do ChatBoot e defina `NATUS_AI_MODEL` com o nome de um modelo já baixado. O ChatBoot usa o endpoint local `http://127.0.0.1:11434/api/chat`. Em produção, a variável pode ser definida em `dados-locais/meta.local.env`. Na demonstração, defina a variável no PowerShell antes de executar `node .\server.mjs --demo` dentro de `ChatBoot`. As configurações ficam em `dados-locais/`, nos bancos `natus-demo-settings.sqlite` e `natus.sqlite`.

No portfólio empresarial da NVC, confirme quem administra a conta que contém o número. Se o número estiver sob gestão do ChatPro, confirme a titularidade e se será preciso migrá-lo antes da troca. Confirme também a elegibilidade para usar o mesmo número no aplicativo WhatsApp Business e na API.

Para iniciar no Windows, copie `config/meta.example.env` para `dados-locais/meta.local.env` e preencha os dados no próprio computador. Antes de iniciar **Iniciar Natus WhatsApp.cmd**, encerre o processo local de demonstração ou configure outra porta nesse arquivo. Use um proxy HTTPS para o painel e o webhook.

O único número aceito pela integração é **+55 24 99261-2870**. Use o ID desse número no Gerenciador do WhatsApp. Ao iniciar, o ChatBoot verifica se o número retornado pela Meta corresponde ao número oficial.

Inicie o serviço sem `--demo` e configure estas variáveis no ambiente do serviço:

| Variável | Uso |
|---|---|
| `NATUS_USERS` | Objeto JSON com um usuário e uma senha forte por atendente. |
| `NATUS_PORT` | Porta local. O padrão é 8787. |
| `META_API_VERSION` | Versão da Graph API usada pelo aplicativo da Meta. |
| `META_PHONE_ID` | ID do número +55 24 99261-2870 no WhatsApp Business. |
| `META_TOKEN` | Token com permissões para consultar o número e enviar mensagens. |
| `META_APP_SECRET` | Segredo do aplicativo para validar assinaturas do webhook. |
| `META_VERIFY_TOKEN` | Token definido pela NVC para verificar o webhook. |

Coloque o serviço atrás de um proxy HTTPS. Cadastre `/webhook` no aplicativo da Meta e assine `messages` e, para atendimento pelo aplicativo com o mesmo número, `smb_message_echoes`. Quando a coexistência e a sincronização da agenda forem autorizadas, assine também `smb_app_state_sync` para receber nomes salvos. O painel usa o nome salvo quando disponível, seguido pelo nome de perfil recebido com a mensagem e pelo número. Os eventos documentados da Meta não fornecem a foto de perfil do cliente. Confirme a configuração de coexistência e as mensagens de teste antes de usar o número em produção. O painel escuta somente em loopback e usa cookies Secure fora da demonstração.

O histórico de produção fica em `dados-locais/natus.sqlite`. Mantenha o serviço em um processo contínuo para verificar os lembretes e inclua o banco no backup privado. Os anexos aparecem no histórico pelo tipo. Na opção 4, a equipe recebe os dados do cliente no painel para consultar o rastreamento.

