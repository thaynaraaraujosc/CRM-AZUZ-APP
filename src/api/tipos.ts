/**
 * Formatos devolvidos pela API do CRM. São os mesmos tipos do `src/lib/data.ts` do painel web —
 * as rotas entregam a linha do banco já traduzida para eles, então copiar o formato aqui mantém
 * o app e o painel falando a mesma língua.
 */

export type Origem = string;
export type Canal = 'WhatsApp' | 'Instagram' | 'TikTok' | 'E-mail' | string;

export type SessaoDoUsuario = {
  name?: string;
  email?: string;
  initials?: string;
  role?: string;
  workspaceNome?: string;
  workspaceId?: string;
  superAdmin?: boolean;
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
  responsavel?: string | null;
  criadoEm?: number;
};

export type Mensagem = {
  id?: string;
  tipo: 'in' | 'out' | 'system';
  texto: string;
  hora: string;
  status?: string;
};

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
