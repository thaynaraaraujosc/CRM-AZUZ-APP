/**
 * Cálculo dos indicadores, com as mesmas fórmulas do CRM da web (`src/lib/metrics.ts` lá).
 *
 * As telas de Inteligência não têm rota própria no CRM: tanto o painel web quanto o aplicativo
 * derivam tudo de funis, conversas, contatos, tarefas e equipe. Ter as fórmulas num arquivo só
 * evita o que já aconteceu no CRM antes: a mesma métrica com número diferente em cada tela.
 */

import type { Compromisso, Contato, Conversa, Funil, NegocioCard, TarefaCard } from './tipos';

export function moeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export function percentual(valor: number, casas = 1): string {
  return `${valor.toFixed(casas).replace('.', ',')}%`;
}

export function valorDoCard(bruto: string): number {
  const n = Number(bruto.replace(/[^\d,]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/** Todos os negócios de todos os funis e etapas, num só monte. */
export function todosOsNegocios(funis: Funil[]): NegocioCard[] {
  return funis.flatMap((f) => f.colunas.flatMap((co) => co.cards));
}

/** Ganhas ÷ encerradas (ganhas + perdidas). */
export function taxaDeConversao(cards: NegocioCard[]): number {
  const ganhas = cards.filter((c) => c.statusFechamento === 'ganho').length;
  const perdidas = cards.filter((c) => c.statusFechamento === 'perdido').length;
  const encerradas = ganhas + perdidas;
  return encerradas > 0 ? (ganhas / encerradas) * 100 : 0;
}

export function valorVendido(cards: NegocioCard[]): number {
  return cards
    .filter((c) => c.statusFechamento === 'ganho')
    .reduce((soma, c) => soma + valorDoCard(c.valor), 0);
}

export function valorPerdido(cards: NegocioCard[]): number {
  return cards
    .filter((c) => c.statusFechamento === 'perdido')
    .reduce((soma, c) => soma + valorDoCard(c.valor), 0);
}

export function valorEmAberto(cards: NegocioCard[]): number {
  return cards.filter((c) => !c.statusFechamento).reduce((soma, c) => soma + valorDoCard(c.valor), 0);
}

/** Valor vendido ÷ quantidade de negócios ganhos. */
export function ticketMedio(cards: NegocioCard[]): number {
  const ganhas = cards.filter((c) => c.statusFechamento === 'ganho');
  return ganhas.length > 0 ? valorVendido(cards) / ganhas.length : 0;
}

export function negociosGanhos(cards: NegocioCard[]): NegocioCard[] {
  return cards.filter((c) => c.statusFechamento === 'ganho');
}

export function negociosPerdidos(cards: NegocioCard[]): NegocioCard[] {
  return cards.filter((c) => c.statusFechamento === 'perdido');
}

/** Cada motivo de perda com quantidade e percentual sobre os perdidos que têm motivo. */
export function distribuicaoDeMotivos(
  cards: NegocioCard[],
): { motivo: string; quantidade: number; percentual: number }[] {
  const perdidas = cards.filter((c) => c.statusFechamento === 'perdido' && c.motivoPerda);
  const contagem = new Map<string, number>();
  for (const c of perdidas) {
    const motivo = c.motivoPerda as string;
    contagem.set(motivo, (contagem.get(motivo) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([motivo, quantidade]) => ({
      motivo,
      quantidade,
      percentual: perdidas.length > 0 ? (quantidade / perdidas.length) * 100 : 0,
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

/** Vendidas, perdidas e receita por responsável. Negócio sem responsável fica de fora. */
export function porResponsavel(
  cards: NegocioCard[],
): { nome: string; vendidas: number; perdidas: number; receita: number }[] {
  const porNome = new Map<string, { vendidas: number; perdidas: number; receita: number }>();
  for (const c of cards) {
    if (!c.responsavel) continue;
    const atual = porNome.get(c.responsavel) ?? { vendidas: 0, perdidas: 0, receita: 0 };
    if (c.statusFechamento === 'ganho') {
      atual.vendidas += 1;
      atual.receita += valorDoCard(c.valor);
    } else if (c.statusFechamento === 'perdido') {
      atual.perdidas += 1;
    }
    porNome.set(c.responsavel, atual);
  }
  return [...porNome.entries()]
    .map(([nome, v]) => ({ nome, ...v }))
    .sort((a, b) => b.receita - a.receita || b.vendidas - a.vendidas);
}

export type DiaDaSerie = { dia: string; criadas: number; vendas: number; perdas: number; valorVendas: number };

/** Movimento por dia: negócios criados (`data`) e fechados (`dataFechamento`). */
export function serieDiaria(cards: NegocioCard[]): DiaDaSerie[] {
  const porDia = new Map<string, DiaDaSerie>();
  function doDia(dia: string): DiaDaSerie {
    const atual = porDia.get(dia) ?? { dia, criadas: 0, vendas: 0, perdas: 0, valorVendas: 0 };
    porDia.set(dia, atual);
    return atual;
  }

  for (const c of cards) {
    if (c.data) doDia(c.data).criadas += 1;
    if (c.dataFechamento && c.statusFechamento === 'ganho') {
      const linha = doDia(c.dataFechamento);
      linha.vendas += 1;
      linha.valorVendas += valorDoCard(c.valor);
    } else if (c.dataFechamento && c.statusFechamento === 'perdido') {
      doDia(c.dataFechamento).perdas += 1;
    }
  }

  return [...porDia.values()].sort((a, b) => a.dia.localeCompare(b.dia));
}

/** Os últimos `quantos` dias corridos até hoje, mesmo os dias sem movimento. */
export function ultimosDias(cards: NegocioCard[], quantos = 14): DiaDaSerie[] {
  const serie = new Map(serieDiaria(cards).map((d) => [d.dia, d]));
  const dias: DiaDaSerie[] = [];
  for (let i = quantos - 1; i >= 0; i -= 1) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    const dia = data.toISOString().slice(0, 10);
    dias.push(serie.get(dia) ?? { dia, criadas: 0, vendas: 0, perdas: 0, valorVendas: 0 });
  }
  return dias;
}

/** Conversas que ainda não tiveram resposta da equipe. */
export function aguardandoAtendimento(conversas: Conversa[]): Conversa[] {
  return conversas.filter((cv) => cv.status === 'Não respondido');
}

/** Contagem de contatos por origem — de onde os leads vêm. */
export function porOrigem(contatos: Contato[]): { origem: string; quantidade: number; percentual: number }[] {
  const contagem = new Map<string, number>();
  for (const contato of contatos) {
    const origem = contato.origem || 'Sem origem';
    contagem.set(origem, (contagem.get(origem) ?? 0) + 1);
  }
  return [...contagem.entries()]
    .map(([origem, quantidade]) => ({
      origem,
      quantidade,
      percentual: contatos.length > 0 ? (quantidade / contatos.length) * 100 : 0,
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
}

/** Quantos negócios há em cada etapa do funil, para o desenho do afunilamento. */
export function porEtapa(funil: Funil | undefined): { etapa: string; total: number; largura: number }[] {
  if (!funil) return [];
  const maior = Math.max(1, ...funil.colunas.map((co) => co.cards.length));
  return funil.colunas.map((co) => ({
    etapa: co.titulo,
    total: co.cards.length,
    largura: Math.round((co.cards.length / maior) * 100),
  }));
}

/** Atividade da equipe: tarefas e compromissos de cada pessoa. */
export function atividadePorPessoa(
  colunas: { cards: TarefaCard[] }[],
  agenda: Compromisso[],
): { nome: string; tarefas: number; concluidas: number; compromissos: number }[] {
  const porNome = new Map<string, { tarefas: number; concluidas: number; compromissos: number }>();
  function doNome(nome: string) {
    const atual = porNome.get(nome) ?? { tarefas: 0, concluidas: 0, compromissos: 0 };
    porNome.set(nome, atual);
    return atual;
  }

  for (const coluna of colunas) {
    for (const tarefa of coluna.cards) {
      const nome = tarefa.responsavel?.nome;
      if (!nome) continue;
      const linha = doNome(nome);
      linha.tarefas += 1;
      if (tarefa.concluida) linha.concluidas += 1;
    }
  }
  for (const compromisso of agenda) {
    if (!compromisso.responsavel) continue;
    doNome(compromisso.responsavel).compromissos += 1;
  }

  return [...porNome.entries()]
    .map(([nome, v]) => ({ nome, ...v }))
    .sort((a, b) => b.tarefas + b.compromissos - (a.tarefas + a.compromissos));
}

/** Campanha do Meta Ads como a rota devolve (texto já formatado). */
export type Campanha = {
  plataforma: 'M' | 'G';
  nome: string;
  sub: string;
  roas: string;
  barra: number;
  vendas?: number;
  pausada?: boolean;
};

/** "12 leads · R$ 800 investidos" — a rota devolve assim, formatado. */
export function lerCampanha(sub: string): { leads: number; investido: number } {
  const leads = sub.match(/(\d+)\s*leads?/i);
  const investido = sub.match(/R\$\s*([\d.,]+)\s*investidos?/i);
  return {
    leads: leads ? Number(leads[1]) : 0,
    investido: investido ? Number(investido[1].replace(/\./g, '').replace(',', '.')) : 0,
  };
}

export function investimentoEmTrafego(campanhas: Campanha[]): number {
  return campanhas.reduce((soma, c) => soma + lerCampanha(c.sub).investido, 0);
}

export function leadsDeTrafego(campanhas: Campanha[]): number {
  return campanhas.reduce((soma, c) => soma + lerCampanha(c.sub).leads, 0);
}

/** ROAS médio ponderado pelo investido de cada campanha. */
export function roasMedio(campanhas: Campanha[]): number {
  let receita = 0;
  let investido = 0;
  for (const c of campanhas) {
    const gasto = lerCampanha(c.sub).investido;
    const roas = Number(c.roas.replace(',', '.').replace('x', '')) || 0;
    receita += gasto * roas;
    investido += gasto;
  }
  return investido > 0 ? receita / investido : 0;
}

/** Custo por lead = investido ÷ leads. */
export function custoPorLead(campanhas: Campanha[]): number {
  const leads = leadsDeTrafego(campanhas);
  return leads > 0 ? investimentoEmTrafego(campanhas) / leads : 0;
}
