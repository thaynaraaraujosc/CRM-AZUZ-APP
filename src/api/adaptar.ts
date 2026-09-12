import type { Contato, Conversa, NegocioCard } from './tipos';

/**
 * Tradução entre o formato do banco e o formato que as telas desenham.
 *
 * Existe porque os dois divergem de propósito. A API devolve a linha crua (`initials`,
 * `atendenteSelecionado`, `ultimaMensagemEm`), e o cartão quer texto pronto (`iniciais`,
 * `responsavel`, "há 6 min"). Sem esta camada, o nome de cada coluna do banco vazaria para dentro
 * de cada componente, e renomear uma coluna viraria uma caçada pelo app inteiro.
 */

/** "agora", "há 6 min", "há 2 h", "há 4 d" — o rótulo curto que cabe no canto do cartão. */
export function tempoRelativo(quando: string | number | null | undefined): string {
  if (!quando) return '';
  const instante = typeof quando === 'number' ? quando : Date.parse(quando);
  if (Number.isNaN(instante)) return '';

  const segundos = Math.max(0, Math.floor((Date.now() - instante) / 1000));
  if (segundos < 60) return 'agora';
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 30) return `${dias} d`;
  const meses = Math.floor(dias / 30);
  return `${meses} m`;
}

function iniciaisDe(nome: string): string {
  return (
    nome
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join('')
      .toUpperCase() || '?'
  );
}

export type ConversaNaTela = {
  id: string;
  iniciais: string;
  nome: string;
  canal: string;
  previa: string;
  tempo: string;
  naoLidas: number;
  origem: string;
  responsavel: string;
};

type LinhaDeConversa = Conversa & {
  atendenteSelecionado?: string | null;
  ultimaMensagemEm?: string | null;
  atualizadoEm?: string | null;
};

export function conversaNaTela(linha: LinhaDeConversa): ConversaNaTela {
  return {
    id: linha.id,
    iniciais: linha.initials || iniciaisDe(linha.nome),
    nome: linha.nome,
    canal: linha.canal,
    // A lista da API não traz o texto da última mensagem — ela é buscada por conversa. Até a tela
    // aberta carregar, a linha de baixo mostra o telefone/@ e o estado do atendimento, que é
    // informação real em vez de um trecho inventado.
    previa: [linha.contato, linha.status].filter(Boolean).join(' · '),
    tempo: tempoRelativo(linha.ultimaMensagemEm ?? linha.atualizadoEm ?? linha.criadoEm),
    naoLidas: linha.naoLidas ?? 0,
    origem: linha.origem,
    responsavel: linha.atendenteSelecionado ?? linha.responsavel ?? '',
  };
}

export type ContatoNaTela = {
  id: string;
  iniciais: string;
  nome: string;
  origem: string;
  etapa: string;
  responsavel: string;
  ultima: string;
  valor: string;
  email: string;
  whatsapp: string;
  cidade: string;
  etiquetas: string[];
  favorito: boolean;
};

export function contatoNaTela(linha: Contato & { atualizadoEm?: string | null }): ContatoNaTela {
  return {
    id: linha.id,
    iniciais: linha.initials || iniciaisDe(linha.nome),
    nome: linha.nome,
    origem: linha.origem,
    etapa: linha.etapa,
    responsavel: linha.responsavel ?? '',
    ultima: linha.ultima || tempoRelativo(linha.atualizadoEm),
    valor: linha.valor || '—',
    email: linha.email ?? '',
    whatsapp: linha.whatsapp ?? '',
    cidade: [linha.cidade, linha.estado].filter(Boolean).join(', '),
    etiquetas: linha.etiquetas ?? [],
    favorito: linha.favorito ?? false,
  };
}

export type NegocioNaTela = {
  id: string;
  nome: string;
  iniciais: string;
  valor: string;
  origem: string;
  dias: string;
  responsavel: string;
  etiquetas: string[];
};

export function negocioNaTela(card: NegocioCard): NegocioNaTela {
  return {
    id: card.id,
    nome: card.nome,
    iniciais: iniciaisDe(card.nome),
    valor: card.valor || '—',
    origem: card.origem,
    dias: card.dias,
    responsavel: card.responsavel ?? '',
    etiquetas: card.etiquetas ?? [],
  };
}
