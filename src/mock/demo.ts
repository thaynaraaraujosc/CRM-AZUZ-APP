import type { Campanha } from '@/api/metricas';
import type {
  CanalDisponivel,
  ColunaTarefas,
  Compromisso as CompromissoApi,
  Contato as ContatoApi,
  Conversa as ConversaApi,
  DocumentoApi,
  FluxoAutomacao,
  FormularioApi,
  Funil,
  HistoricoDeMensagens,
  MembroDaEquipe,
  RelatorioGerado,
  RespostaDeAssinatura,
  RespostaDeSessao,
  SessaoAtiva,
} from '@/api/tipos';

import { colunasTarefas, compromissosHoje, contatos, conversas, equipe, etapasFunil, funis, mensagens, usuario } from './dados';

/**
 * Respostas de mentira no formato exato da API, para o modo demonstração.
 *
 * Existe por um motivo prático: no navegador o app não consegue entrar no CRM de verdade. O
 * servidor recusa chamadas vindas de outro endereço e o cookie da sessão não viaja entre
 * endereços diferentes. No celular nada disso acontece. Então, para olhar as telas no
 * computador, o app troca a API por estas respostas.
 *
 * Fica desligado por padrão e só liga com `EXPO_PUBLIC_DEMO=1`. Nada aqui entra no app publicado.
 */

const AGORA = Date.now();
const minutosAtras = (minutos: number) => new Date(AGORA - minutos * 60_000).toISOString();

export const sessaoDemo: RespostaDeSessao = {
  user: {
    name: usuario.nome,
    email: usuario.email,
    initials: usuario.iniciais,
    role: usuario.cargo,
    workspaceNome: usuario.workspace,
    workspaceId: 'demo',
    superAdmin: false,
    papelTipo: 'admin',
    permissoes: [],
  },
};

export const assinaturaDemo: RespostaDeAssinatura = {
  assinatura: { status: 'ativa', plano: 'completo', proximoVencimento: null },
};

export const conversasDemo: (ConversaApi & { atendenteSelecionado?: string | null; ultimaMensagemEm?: string })[] =
  conversas.map((c, i) => ({
    id: c.id,
    initials: c.iniciais,
    nome: c.nome,
    canal: c.canal,
    contato: '(62) 9XXXX-XXXX',
    tempo: c.tempo,
    status: c.status,
    origem: c.origem,
    naoLidas: c.naoLidas,
    atendenteSelecionado: c.responsavel || null,
    ultimaMensagemEm: minutosAtras(6 + i * 20),
  }));

export const historicoDemo: HistoricoDeMensagens = Object.fromEntries(
  conversas.map((c) => [
    c.nome,
    c.id === 'marcos-aurelio'
      ? mensagens.map((m) => ({ ...m, tipo: m.tipo === 'sistema' ? ('system' as const) : m.tipo }))
      : [{ tipo: 'in' as const, texto: c.previa, hora: '09:10' }],
  ]),
);

export const funisDemo: Funil[] = [
  {
    id: funis[0].id,
    nome: funis[0].nome,
    responsavel: funis[0].responsavel,
    colunas: etapasFunil.map((e) => ({
      id: e.id,
      titulo: e.titulo,
      total: e.cards.length,
      cards: e.cards.map((card) => ({
        id: card.id,
        nome: card.nome,
        valor: card.valor,
        origem: card.origem,
        dias: card.dias,
        data: '2026-09-01',
        etiquetas: card.etiquetas,
        responsavel: card.responsavel,
      })),
    })),
  },
];

export const contatosDemo: ContatoApi[] = contatos.map((c) => ({
  id: c.id,
  initials: c.iniciais,
  nome: c.nome,
  origem: c.origem,
  etapa: c.etapa,
  responsavel: c.responsavel,
  ultima: c.ultima,
  valor: c.valor,
  email: c.email,
  whatsapp: c.whatsapp,
  cidade: c.cidade,
  etiquetas: c.etiquetas,
  favorito: c.favorito,
}));

export const equipeDemo: MembroDaEquipe[] = equipe.map((m) => ({
  id: m.id,
  nome: m.nome,
  email: `${m.id}@empresademo.com.br`,
  initials: m.iniciais,
  cargo: m.cargo,
  role: m.papel,
  ativo: true,
}));

export const tarefasDemo: ColunaTarefas[] = colunasTarefas.map((col) => ({
  id: col.id,
  titulo: col.titulo,
  cards: col.tarefas.map((t) => ({
    id: t.id,
    titulo: t.titulo,
    contato: t.contato,
    data: t.prazo,
    atrasada: t.atrasada,
    responsavel: { nome: t.responsavel, initials: t.iniciaisResponsavel },
    concluida: col.id === 't-concluido',
    urgencia: t.prioridade,
    descricao: '',
    anexo: null,
  })),
}));

const hojeIso = new Date().toISOString().slice(0, 10);

export const agendaDemo: CompromissoApi[] = compromissosHoje.map((cp) => ({
  id: cp.id,
  contato: cp.com,
  responsavel: usuario.nome,
  dataIso: hojeIso,
  hora: cp.hora,
  horaFim: null,
  tipo: cp.titulo,
  categoria: null,
  descricao: null,
  local: cp.local,
  status: cp.status,
  origem: 'Manual',
}));


/* -------------------------------------------------------------------------- */
/* Operação, configurações e análise                                          */
/* -------------------------------------------------------------------------- */

export const automacoesDemo: FluxoAutomacao[] = [
  {
    id: 'fluxo-boas-vindas',
    nome: 'Boas-vindas ao lead novo',
    descricao: 'Manda a primeira mensagem assim que o lead chega pelo anúncio.',
    categoria: 'Atendimento',
    status: 'publicado',
    ativa: true,
    execucoes: 412,
    atualizadoEm: minutosAtras(180),
  },
  {
    id: 'fluxo-retomada',
    nome: 'Retomar quem parou de responder',
    descricao: 'Depois de 2 dias sem resposta, tenta de novo.',
    categoria: 'Follow-up',
    status: 'publicado',
    ativa: false,
    execucoes: 96,
    atualizadoEm: minutosAtras(1440),
  },
  {
    id: 'fluxo-pos-venda',
    nome: 'Pós-venda',
    status: 'rascunho',
    ativa: false,
    execucoes: 0,
    atualizadoEm: minutosAtras(60),
  },
];

export const formulariosDemo: FormularioApi[] = [
  {
    id: 'form-avaliacao',
    nome: 'Agendar avaliação',
    descricao: 'Formulário do anúncio de Instagram',
    status: 'publicado',
    criadoEm: minutosAtras(20000),
    atualizadoEm: minutosAtras(500),
  },
  {
    id: 'form-orcamento',
    nome: 'Pedir orçamento',
    status: 'rascunho',
    criadoEm: minutosAtras(9000),
    atualizadoEm: minutosAtras(200),
  },
];

export const paginasDemo = [
  {
    id: 'pagina-1',
    titulo: 'Dados de contato',
    perguntas: [
      { id: 'p-nome', tipo: 'texto', rotulo: 'Seu nome', obrigatoria: true },
      { id: 'p-whats', tipo: 'texto', rotulo: 'WhatsApp com DDD', obrigatoria: true },
      { id: 'p-quando', tipo: 'opcao_unica', rotulo: 'Melhor horário', opcoes: ['Manhã', 'Tarde'] },
    ],
  },
];

export const respostasDeFormularioDemo = [
  {
    id: 'resposta-1',
    formularioId: 'form-avaliacao',
    criadoEm: minutosAtras(120),
    valores: { 'p-nome': 'Camila Duarte', 'p-whats': '(62) 99999-1234', 'p-quando': 'Tarde' },
  },
  {
    id: 'resposta-2',
    formularioId: 'form-avaliacao',
    criadoEm: minutosAtras(900),
    valores: { 'p-nome': 'Fernando Lima', 'p-whats': '(62) 98888-4321', 'p-quando': 'Manhã' },
  },
];

export const documentosDemo: DocumentoApi[] = [
  {
    id: 'doc-contrato',
    titulo: 'Contrato padrão 2026',
    autor: usuario.nome,
    criadoEm: minutosAtras(20000),
    atualizadoEm: minutosAtras(800),
    favorito: true,
  },
  {
    id: 'doc-proposta',
    titulo: 'Modelo de proposta',
    autor: usuario.nome,
    criadoEm: minutosAtras(9000),
    atualizadoEm: minutosAtras(3000),
  },
];

export const canaisDemo: CanalDisponivel[] = [
  { canal: 'whatsapp_oficial', label: 'WhatsApp API Oficial', conectado: true, detalhe: '+55 62 99999-0000' },
  {
    canal: 'whatsapp_nao_oficial',
    label: 'WhatsApp (QR Code)',
    conectado: false,
    motivo: 'Escaneie o QR Code em Configurações → Outras integrações.',
  },
  { canal: 'email', label: 'E-mail', conectado: false, motivo: 'O envio de e-mail não está configurado no servidor.' },
];

export const sessoesDemo: SessaoAtiva[] = [
  { id: 'sessao-atual', dispositivo: 'iPhone', ip: '179.XXX.XXX.10', criadoEm: minutosAtras(15), atual: true },
  { id: 'sessao-mac', dispositivo: 'Chrome no macOS', ip: '179.XXX.XXX.10', criadoEm: minutosAtras(600), atual: false },
];

export const relatoriosDemo: RelatorioGerado[] = [
  {
    id: 'rel-setembro',
    nome: 'Resumo comercial · setembro',
    tipo: 'resumo',
    periodo: 'Setembro de 2026',
    autor: usuario.nome,
    data: '15/09/2026',
    formato: 'pdf',
  },
];

export const campanhasDemo: Campanha[] = [
  { plataforma: 'M', nome: 'Avaliação · Goiânia', sub: '86 leads · R$ 2.400 investidos', roas: '3,2x', barra: 100, vendas: 12 },
  { plataforma: 'M', nome: 'Remarketing · setembro', sub: '31 leads · R$ 900 investidos', roas: '2,1x', barra: 38, vendas: 4, pausada: true },
];

export const motivosDePerdaDemo = ['Achou caro', 'Sem retorno', 'Fechou com concorrente', 'Não era o momento', 'Outro'];

/** Resposta do modo demonstração para um caminho da API, ou `undefined` se a rota não tem demo. */
export function respostaDemo(caminho: string): unknown | undefined {
  if (caminho.startsWith('/api/auth/session')) return sessaoDemo;
  if (caminho.startsWith('/api/auth/csrf')) return { csrfToken: 'demo' };
  if (caminho.startsWith('/api/assinatura')) return assinaturaDemo;
  if (caminho.startsWith('/api/conversas/enviar')) return { ok: true };
  if (caminho.startsWith('/api/conversas')) return conversasDemo;
  if (caminho.startsWith('/api/mensagens-extra')) return historicoDemo;
  if (caminho.startsWith('/api/funis/mover')) return { ok: true };
  if (caminho.startsWith('/api/funis')) return funisDemo;
  if (caminho.startsWith('/api/contatos')) return contatosDemo;
  if (caminho.startsWith('/api/equipe')) return equipeDemo;
  if (caminho.startsWith('/api/tarefas')) return tarefasDemo;
  if (caminho.startsWith('/api/agenda')) return agendaDemo;
  if (caminho.startsWith('/api/contatos/linha-do-tempo')) return { eventos: [] };
  if (caminho.startsWith('/api/automacoes-fluxos')) return automacoesDemo;
  if (caminho.startsWith('/api/formularios/respostas')) return respostasDeFormularioDemo;
  if (caminho.startsWith('/api/formularios/')) return { ...formulariosDemo[0], paginas: paginasDemo };
  if (caminho.startsWith('/api/formularios')) return formulariosDemo;
  if (caminho.startsWith('/api/documentos')) return documentosDemo;
  if (caminho.startsWith('/api/canais')) return canaisDemo;
  if (caminho.startsWith('/api/seguranca/sessoes')) return sessoesDemo;
  if (caminho.startsWith('/api/relatorios')) return relatoriosDemo;
  if (caminho.startsWith('/api/motivos-perda')) return motivosDePerdaDemo;
  if (caminho.startsWith('/api/integracoes/meta/ads/campanhas')) return campanhasDemo;
  if (caminho.startsWith('/api/integracoes/meta')) return { status: 'conectado', metadados: { username: 'empresademo' } };
  if (caminho.startsWith('/api/preferencias')) return { notificacoesAtivas: true, notificarNovaTarefa: false };
  if (caminho.startsWith('/api/azuz-ia/perguntar')) {
    return {
      resposta:
        'No modo demonstração eu não chamo o servidor de verdade. No seu celular, com a sua conta, aqui vem a resposta lendo os dados do seu workspace.',
    };
  }
  return undefined;
}
