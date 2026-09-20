# CRM AZUZ — aplicativo

Aplicativo móvel do CRM AZUZ, em React Native com Expo (SDK 57) e expo-router.

## Ligação com o CRM

O app fala com a **mesma API do painel web** (`https://azuzcrm.com.br`), sem nenhuma rota criada
só para ele. A sessão é o cookie do Auth.js: o aparelho guarda esse cookie sozinho, então basta o
login uma vez e as chamadas seguintes já vão assinadas. Trocar de ambiente é definir
`EXPO_PUBLIC_API_URL`.

**Quem entra.** O app confere duas coisas antes de abrir qualquer tela: a assinatura do workspace
em `/api/assinatura`, onde só "ativa" libera, e as permissões de módulo que já vêm na sessão. Sem
assinatura em dia aparece a tela de acesso suspenso; sem permissão, o módulo some do menu e da
barra. Os dois portões ficam no layout do grupo `app/(app)`, que embrulha toda a área logada.

Isso esconde a tela, não protege o dado. O `proxy.ts` do CRM só aplica essas regras em página, não
em `/api`, e o app só fala com a API. A correção definitiva é o CRM conferir assinatura e permissão
também nas rotas de API.

Ligadas na API de verdade: **login e sessão**, **Conversas**, **Funil** (inclusive gravar o card
movido em `/api/funis/mover`), **Contatos**, **Equipe**, e o perfil no menu.

Ainda em conteúdo estático (`src/mock/dados.ts`): Tarefas, Agenda, Automações, Formulários,
Documentos, Azuz IA, Inteligência comercial, Configurações e as telas de detalhe de conversa,
contato e negócio.

**Aviso sobre a versão web.** O `npm run web` roda, mas não consegue falar com o CRM: o navegador
bloqueia por CORS, e o servidor não manda `Access-Control-Allow-Origin`. iOS e Android não têm
essa restrição. A web serve para conferir layout, não dado.

## Rodar

```bash
npm install
npx expo start
```

Abra no Expo Go (QR Code no terminal), ou `npm run ios` / `npm run android` / `npm run web`.

## Telas

**Entrada** — login e recuperação de senha. **Não existe cadastro no app**: conta nova e
assinatura acontecem só no site. Um app de loja que abre caminho para vender assinatura digital cai
na regra de compra da Apple, que exigiria pagar pelo sistema dela. O app atende quem já é cliente.

**Barra inferior** — Conversas, Funil, Tarefas, Mais.
O menu lateral do web tem vinte itens; num telefone isso não cabe, então os três módulos de uso
diário ficam à mão e o resto vive em "Mais". O app abre em Conversas, que é a caixa de entrada.

**Empilhadas** — conversa aberta, contatos e ficha do contato, negócio do funil, agenda, equipe,
automações, formulários, documentos, Azuz IA, notificações, perfil.

**Inteligência comercial** — painel com tráfego, atividades, performance de vendas, jornada do
cliente, motivos de perda e relatórios.

**Configurações** — aparência, notificações, canais e integrações, segurança. Plano e cobrança
ficam no site.

## Estrutura

```
app/                    rotas (expo-router, uma pasta por área)
src/api/                cliente HTTP, sessão, tipos da API e tradução para a tela
src/theme/tokens.ts     cores, raio, espaçamento e tipografia
src/theme/ThemeContext  tema claro/escuro, seguindo o sistema por padrão
src/components/ui.tsx   primitivos: tela, cabeçalho, cartão, botão, campo, chip, indicador…
src/components/cards    cartões de domínio: pendência, conversa, negócio, tarefa, contato
src/mock/dados.ts       todo o conteúdo estático
```

## Design

Os tokens vêm do `globals.css` do CRM web, então o aplicativo e o painel são o mesmo produto:

- base preto, branco e cinza; **azul-marinho `#0B1533`** como tinta estrutural e cor de ação;
  **azul `#2E6BFF`** como accent. Sem cor quente, por regra da marca.
- verde é sucesso, âmbar é atenção, vermelho é erro, roxo é IA.
- sem glow, neon, gradiente pesado ou arredondamento exagerado — o peso vem de proporção,
  tipografia e espaçamento.
- no tema escuro o marinho tem luminosidade parecida com a do fundo, e é uma **borda clara** que
  recorta botão, chip ligado e bolha de mensagem (token `acaoBorda`). O tom da marca continua
  sendo um só nos dois temas.

## O que ainda não existe

Envio de mensagem, upload, notificação push, e a gravação nas telas que continuam em conteúdo
estático. Criar, editar e excluir ainda não estão ligados em lugar nenhum — o que grava hoje é só
mover um card no funil.
