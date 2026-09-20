/**
 * Formatos devolvidos pela API do CRM. São os mesmos tipos do `src/lib/data.ts` do painel web —
 * as rotas entregam a linha do banco já traduzida para eles, então copiar o formato aqui mantém
 * o app e o painel falando a mesma língua.
 */

export type Origem = string;
export type Canal = 'WhatsApp' | 'Instagram' | 'TikTok' | 'E-mail' | string;

export type SessaoDoUsuario = {
  /** Id do Membro — usado para gravar o próprio perfil em `PATCH /api/equipe/[id]`. */
  id?: string;
  name?: string;
  email?: string;
  initials?: string;
  role?: string;
  workspaceNome?: string;
  workspaceId?: string;
  superAdmin?: boolean;
  /** "admin" é o dono do workspace, que enxerga tudo. */
  papelTipo?: string;
  permissoes?: string[];
};

/** `/api/assinatura` — só "ativa" libera o uso; sem assinatura também é bloqueio. */
export type StatusDaAssinatura = 'pendente' | 'ativa' | 'atrasada' | 'cancelada';

export type RespostaDeAssinatura = {
  assinatura: { status: StatusDaAssinatura; plano?: string; proximoVencimento?: string | null } | null;
};

export type RespostaDeSessao = { user?: SessaoDoUsuario; expires?: string };

export type Conversa = {
  id: string;
  initials: string;
  nome: string;
  canal: Canal;
  contato: string;
  tempo: string;
  status: string;
  origem: Origem;
  naoLidas?: number;
  favorita?: boolean;
  arquivada?: boolean;
  responsavel?: string | null;
  criadoEm?: number;
};

export type Mensagem = {
  id?: string;
  tipo: 'in' | 'out' | 'system';
  texto: string;
  hora: string;
  /** Instante real em milissegundos; `hora` é só o rótulo já formatado pelo servidor. */
  criadoEm?: number;
  status?: string;
  canal?: string;
};

/**
 * `/api/mensagens-extra` devolve o histórico do workspace inteiro de uma vez, agrupado pelo NOME
 * do contato — não pelo id da conversa. É o mesmo formato que o painel web consome.
 */
export type HistoricoDeMensagens = Record<string, Mensagem[]>;

export type NegocioCard = {
  id: string;
  nome: string;
  valor: string;
  origem: Origem;
  dias: string;
  data: string;
  etiquetas?: string[];
  responsavel?: string;
  statusFechamento?: 'ganho' | 'perdido' | null;
  motivoPerda?: string | null;
  dataFechamento?: string | null;
};

export type ColunaFunil = {
  id: string;
  titulo: string;
  total: number;
  cards: NegocioCard[];
};

export type Funil = {
  id: string;
  nome: string;
  colunas: ColunaFunil[];
  responsavel?: string;
};

export type Contato = {
  id: string;
  initials: string;
  nome: string;
  origem: Origem;
  etapa: string;
  responsavel: string;
  ultima: string;
  valor: string;
  email?: string;
  whatsapp?: string;
  cidade?: string;
  estado?: string;
  empresa?: string;
  cargo?: string;
  etiquetas?: string[];
  favorito?: boolean;
};

export type MembroDaEquipe = {
  id: string;
  nome: string;
  email: string;
  initials?: string;
  cargo?: string | null;
  role?: string | null;
  ativo?: boolean;
};

/* -------------------------------------------------------------------------- */
/* Tarefas e agenda                                                           */
/* -------------------------------------------------------------------------- */

export type TarefaCard = {
  id: string;
  titulo: string;
  contato: string;
  contatoId?: string;
  /** Prazo já formatado pelo servidor, como "Hoje, 11:00". */
  data: string;
  atrasada?: boolean;
  responsavel: { nome: string; initials: string };
  concluida?: boolean;
  urgencia: string;
  descricao: string;
  anexo: { arquivo: string; detalhe: string } | null;
  modelo?: string;
};

export type ColunaTarefas = {
  id?: string;
  titulo: string;
  cards: TarefaCard[];
};

export type Compromisso = {
  id: string;
  contato: string;
  responsavel: string;
  /** Data no formato aaaa-mm-dd. */
  dataIso: string;
  hora: string;
  horaFim?: string | null;
  tipo: string;
  categoria?: string | null;
  descricao?: string | null;
  local?: string | null;
  status: string;
  origem: string;
};

/** Evento da linha do tempo do contato (`/api/contatos/linha-do-tempo?contato=<nome>`). */
export type EventoDoContato = {
  id: string;
  tipo: string;
  canal?: string | null;
  descricao: string;
  criadoEm: string;
};

export type RespostaLinhaDoTempo = { eventos: EventoDoContato[] };

/* -------------------------------------------------------------------------- */
/* Automações, formulários, documentos, canais, segurança                     */
/* -------------------------------------------------------------------------- */

export type FluxoAutomacao = {
  id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  status: 'rascunho' | 'publicado';
  ativa: boolean;
  arquivada?: boolean;
  execucoes: number;
  atualizadoEm: string;
  nodes?: unknown[];
};

export type FormularioApi = {
  id: string;
  nome: string;
  descricao?: string | null;
  status: string;
  criadoEm: string;
  atualizadoEm: string;
};

export type DocumentoApi = {
  id: string;
  titulo: string;
  autor: string;
  favorito?: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

/** `/api/canais` — o que o CRM tem conectado hoje para falar com o cliente. */
export type CanalDisponivel = {
  canal: string;
  label: string;
  conectado: boolean;
  detalhe?: string | null;
  motivo?: string;
};

export type SessaoAtiva = {
  id: string;
  dispositivo: string;
  ip?: string | null;
  criadoEm: string;
  atual: boolean;
};

export type RelatorioGerado = {
  id: string;
  nome: string;
  tipo: string;
  periodo?: string;
  autor: string;
  /** Já vem formatada pelo servidor em pt-BR. */
  data: string;
  formato?: string;
};

export type RespostaDaIa = { resposta: string };

/** `/api/integracoes/meta?provedor=…` — estado de uma integração, sem token nenhum. */
export type EstadoDaIntegracao = {
  status: string;
  metadados?: Record<string, unknown> | null;
  erroMensagem?: string | null;
  atualizadoEm?: string | null;
};

/** Pergunta de um formulário, como o CRM guarda. */
export type PerguntaDeFormulario = {
  id: string;
  tipo: string;
  rotulo: string;
  descricao?: string;
  obrigatoria?: boolean;
  oculta?: boolean;
  opcoes?: string[];
};

export type PaginaDeFormulario = {
  id: string;
  titulo: string;
  descricao?: string;
  perguntas: PerguntaDeFormulario[];
};

/** `/api/formularios/[id]` — o formulário inteiro, com as páginas e perguntas. */
export type FormularioCompleto = FormularioApi & {
  paginas?: PaginaDeFormulario[];
};

/** `/api/formularios/respostas` — todas as respostas do workspace; a tela filtra pelo formulário. */
export type RespostaDeFormulario = {
  id: string;
  formularioId: string;
  criadoEm: string;
  /** A chave é o id da pergunta, não o rótulo. */
  valores: Record<string, string>;
};
