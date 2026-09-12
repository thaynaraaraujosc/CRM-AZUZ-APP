# CRM AZUZ — aplicativo

Aplicativo móvel do CRM AZUZ, em React Native com Expo (SDK 57) e expo-router.

**Esta entrega é só a camada visual.** Todas as telas existem e navegam entre si, mas nenhuma
busca API, grava dado ou guarda estado entre sessões. O conteúdo vem de `src/mock/dados.ts`, com
nomes, origens e etapas copiados do CRM web para o desenho ser avaliado com dado parecido com o
real. A única preferência que muda de verdade é o tema, em Configurações › Aparência.

## Rodar

```bash
npm install
npx expo start
```

Abra no Expo Go (QR Code no terminal), ou `npm run ios` / `npm run android` / `npm run web`.

## Telas

**Entrada** — login, cadastro, recuperação de senha.

**Barra inferior** — Conversas, Funil, Tarefas, Mais.
O menu lateral do web tem vinte itens; num telefone isso não cabe, então os três módulos de uso
diário ficam à mão e o resto vive em "Mais". O app abre em Conversas, que é a caixa de entrada.

**Empilhadas** — conversa aberta, contatos e ficha do contato, negócio do funil, agenda, equipe,
automações, formulários, documentos, Azuz IA, notificações, perfil.

**Inteligência comercial** — painel com tráfego, atividades, performance de vendas, jornada do
cliente, motivos de perda e relatórios.

**Configurações** — aparência, notificações, canais e integrações, segurança, plano e cobrança.

## Estrutura

```
app/                    rotas (expo-router, uma pasta por área)
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

Autenticação, chamadas de API, envio de mensagem, arrastar card no funil, upload, push e
persistência. Os botões estão desenhados e posicionados; nenhum deles chama nada.
