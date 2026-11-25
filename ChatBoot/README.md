# Natus · Atendimento Natu Vale

## Demonstração da nova interface

Com o ChatBoot iniciado, abra [Demonstração da interface](http://127.0.0.1:8790/interface/). O ambiente usa dados fictícios em memória para testar a fila, os filtros, o histórico, os menus e o envio simulado. Ao recarregar, as conversas voltam aos dados de exemplo. A preferência de tema fica no navegador. Selecionar um anexo registra apenas seus dados básicos na conversa simulada.

O diretório `interface` separa a estrutura HTML, os estilos e a lógica da tela. `app.mjs` controla as interações, `views.mjs` renderiza os componentes e `demo-gateway.mjs` oferece operações assíncronas sobre `fixtures.mjs`. Futuras integrações podem implementar o contrato do adaptador para listar, consultar, atualizar e enviar mensagens. Mantenha as credenciais da Meta, do Supabase e do Natus no servidor.

Em **Detalhes da conversa**, pode-se selecionar uma foto local de teste. Ela aparece na fila e na conversa durante a sessão da demonstração.

Execute com Node.js 24 ou superior. No PowerShell, a partir da raiz do projeto:

```powershell
node .\ChatBoot\server.mjs --demo
```

Abra o arquivo **Iniciar Natus.cmd** para usar o painel em http://127.0.0.1:8790. Entre com a conta oficial **natumarketing98@gmail.com**. O hash da senha fica no arquivo local ignorado pelo Git, `natus-admin.local.json`. Escolha uma conversa para experimentar o painel e abra **Simulação local** para testar mensagens do cliente, respostas pelo WhatsApp Business e o lembrete de 20 minutos. Os dados de demonstração são recriados ao reiniciar.

## Configuração com WhatsApp

### Respostas automáticas

No painel, abra **Configurar respostas**. A aba **Respostas manuais** guarda os cinco textos fixos do menu. Uma escolha pelo número da opção sempre usa o texto salvo. A aba **Respostas com IA** permite editar a base da NVC e ativar respostas a perguntas livres. Quando a IA precisa de ajuda, a conversa entra na fila humana.

Para habilitar a IA, rode o Ollama no mesmo computador ou servidor do ChatBoot e defina `NATUS_AI_MODEL` com o nome de um modelo já baixado. O ChatBoot usa o endpoint local `http://127.0.0.1:11434/api/chat`. Em produção, a variável pode ser definida em `meta.local.env`. Na demonstração, defina a variável no PowerShell antes de executar `node .\ChatBoot\server.mjs --demo`. As configurações da demonstração são salvas em `natus-demo-settings.sqlite`, e as de produção, em `natus.sqlite`.

No portfólio empresarial da NVC, confirme quem administra a conta que contém o número. Se o número estiver sob gestão do ChatPro, confirme a titularidade e se será preciso migrá-lo antes da troca. Confirme também a elegibilidade para usar o mesmo número no aplicativo WhatsApp Business e na API.

Para iniciar no Windows, copie `meta.example.env` para `meta.local.env` e preencha os dados no próprio computador. Feche a demonstração antes de iniciar **Iniciar Natus WhatsApp.cmd**, pois ambos usam a mesma porta por padrão. Use um proxy HTTPS para o painel e o webhook.

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

O histórico de produção fica em `natus.sqlite`, ao lado do servidor, dentro de `nvc-private`. Mantenha o serviço em um processo contínuo para verificar os lembretes e inclua o banco no backup privado. Os anexos aparecem no histórico pelo tipo. Na opção 4, a equipe recebe os dados do cliente no painel para consultar o rastreamento.

