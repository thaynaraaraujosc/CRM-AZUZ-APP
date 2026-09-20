import type {
  ColunaTarefas,
  Compromisso as CompromissoApi,
  Contato as ContatoApi,
  Conversa as ConversaApi,
  Funil,
  HistoricoDeMensagens,
  MembroDaEquipe,
  RespostaDeAssinatura,
  RespostaDeSessao,
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
  return undefined;
}
