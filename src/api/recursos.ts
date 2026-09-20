import { useCallback, useEffect, useState } from 'react';

import { chamar, ErroDeSessao } from './cliente';
import type {
  ColunaTarefas,
  Compromisso,
  Contato,
  Conversa,
  Funil,
  HistoricoDeMensagens,
  CanalDisponivel,
  DocumentoApi,
  FluxoAutomacao,
  FormularioApi,
  MembroDaEquipe,
  RelatorioGerado,
  RespostaDaIa,
  RespostaLinhaDoTempo,
  SessaoAtiva,
} from './tipos';

/** Estado de uma busca: o suficiente para a tela mostrar carregando, erro ou dado. */
export type Busca<T> = {
  dados: T | null;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
};

/**
 * Busca um recurso da API e devolve o estado dela.
 *
 * `ErroDeSessao` sobe sem tratamento aqui de propósito: quem cuida de mandar a pessoa de volta
 * ao login é o provedor de sessão, não cada tela.
 */
function useRecurso<T>(caminho: string, aoPerderSessao?: () => void): Busca<T> {
  const [dados, setDados] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    // Caminho vazio quer dizer "ainda não sei o que buscar" — por exemplo, a linha do tempo antes
    // de o contato ter carregado. Sem isto a chamada iria para a raiz do site.
    if (!caminho) {
      setCarregando(false);
      return;
    }

    let vivo = true;
    setCarregando(true);
    setErro(null);

    chamar<T>(caminho)
      .then((resultado) => {
        if (!vivo) return;
        setDados(resultado);
      })
      .catch((e: unknown) => {
        if (!vivo) return;
        if (e instanceof ErroDeSessao) {
          aoPerderSessao?.();
          return;
        }
        setErro(e instanceof Error ? e.message : 'Falha ao carregar.');
      })
      .finally(() => {
        if (vivo) setCarregando(false);
      });

    return () => {
      vivo = false;
    };
  }, [caminho, tentativa, aoPerderSessao]);

  const recarregar = useCallback(() => setTentativa((n) => n + 1), []);

  return { dados, carregando, erro, recarregar };
}

export const useConversas = (aoPerderSessao?: () => void) =>
  useRecurso<Conversa[]>('/api/conversas', aoPerderSessao);

/**
 * Histórico de mensagens do workspace, agrupado por nome de contato.
 *
 * Não existe rota "mensagens desta conversa": o CRM entrega tudo de uma vez e cada tela pega a
 * parte que interessa. Foi assim que o web nasceu, e o app segue o mesmo caminho para não precisar
 * de rota nova no servidor.
 */
export const useHistoricoDeMensagens = (aoPerderSessao?: () => void) =>
  useRecurso<HistoricoDeMensagens>('/api/mensagens-extra', aoPerderSessao);

export const useFunis = (aoPerderSessao?: () => void) => useRecurso<Funil[]>('/api/funis', aoPerderSessao);

export const useContatos = (aoPerderSessao?: () => void) =>
  useRecurso<Contato[]>('/api/contatos', aoPerderSessao);

export const useEquipe = (aoPerderSessao?: () => void) =>
  useRecurso<MembroDaEquipe[]>('/api/equipe', aoPerderSessao);

export const useTarefas = (aoPerderSessao?: () => void) =>
  useRecurso<ColunaTarefas[]>('/api/tarefas', aoPerderSessao);

export const useAgenda = (aoPerderSessao?: () => void) =>
  useRecurso<Compromisso[]>('/api/agenda', aoPerderSessao);

/** Histórico do lead. A chave é o NOME do contato, como no resto do CRM. */
export const useLinhaDoTempo = (nome: string | undefined, aoPerderSessao?: () => void) =>
  useRecurso<RespostaLinhaDoTempo>(
    nome ? `/api/contatos/linha-do-tempo?contato=${encodeURIComponent(nome)}` : '',
    aoPerderSessao,
  );

/**
 * Marca um negócio como ganho ou perdido.
 *
 * Não existe rota dedicada para isso: o painel web altera o funil inteiro e o grava de uma vez
 * (`PUT /api/funis`), e o app faz igual, mandando de volta a lista completa que acabou de ler.
 * É pesado, mas inventar meio caminho aqui deixaria app e web gravando de formas diferentes.
 */
export function marcarDesfecho(
  funis: Funil[],
  cardId: string,
  statusFechamento: 'ganho' | 'perdido' | null,
  motivoPerda?: string | null,
) {
  const hoje = new Date().toISOString().slice(0, 10);
  const atualizados = funis.map((funil) => ({
    ...funil,
    colunas: funil.colunas.map((coluna) => ({
      ...coluna,
      cards: coluna.cards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              statusFechamento,
              motivoPerda: statusFechamento === 'perdido' ? (motivoPerda ?? null) : null,
              dataFechamento: statusFechamento ? hoje : null,
            }
          : card,
      ),
    })),
  }));

  return chamar<unknown>('/api/funis', { metodo: 'PUT', corpo: atualizados });
}

/** Marca a tarefa como concluída ou reabre. */
export function concluirTarefa(tarefaId: string, concluida: boolean) {
  return chamar<unknown>(`/api/tarefas/${tarefaId}`, { metodo: 'PATCH', corpo: { concluida } });
}

/** Muda o status de um compromisso ("Confirmado", "Cancelado"…). */
export function mudarStatusDoCompromisso(compromissoId: string, status: string) {
  return chamar<unknown>(`/api/agenda/${compromissoId}`, { metodo: 'PATCH', corpo: { status } });
}

/**
 * Manda um texto numa conversa. O canal é escolhido pelo servidor, a partir da própria conversa.
 *
 * A chave é o NOME da conversa, não o id — é o que a rota espera, e é também como o histórico
 * vem agrupado.
 */
export function enviarMensagem(conversaNome: string, texto: string) {
  return chamar<{ ok: boolean }>('/api/conversas/enviar', {
    metodo: 'POST',
    corpo: { conversaNome, texto },
  });
}

/** Move um negócio de etapa. Mesma rota que o painel web usa ao arrastar um card. */
export function moverNegocio(cardId: string, etapaId: string) {
  return chamar<{ ok: boolean }>('/api/funis/mover', {
    metodo: 'POST',
    corpo: { cardId, etapaId },
  });
}

export const useAutomacoes = (aoPerderSessao?: () => void) =>
  useRecurso<FluxoAutomacao[]>('/api/automacoes-fluxos', aoPerderSessao);

export const useFormularios = (aoPerderSessao?: () => void) =>
  useRecurso<FormularioApi[]>('/api/formularios', aoPerderSessao);

export const useDocumentos = (aoPerderSessao?: () => void) =>
  useRecurso<DocumentoApi[]>('/api/documentos', aoPerderSessao);

export const useCanais = (aoPerderSessao?: () => void) =>
  useRecurso<CanalDisponivel[]>('/api/canais', aoPerderSessao);

export const useSessoesAtivas = (aoPerderSessao?: () => void) =>
  useRecurso<SessaoAtiva[]>('/api/seguranca/sessoes', aoPerderSessao);

export const useRelatorios = (aoPerderSessao?: () => void) =>
  useRecurso<RelatorioGerado[]>('/api/relatorios', aoPerderSessao);

export const useMotivosDePerda = (aoPerderSessao?: () => void) =>
  useRecurso<string[]>('/api/motivos-perda', aoPerderSessao);

/** Liga e desliga um fluxo de automação. */
export function alternarAutomacao(fluxoId: string, ativa: boolean) {
  return chamar<unknown>(`/api/automacoes-fluxos/${fluxoId}`, { metodo: 'PATCH', corpo: { ativa } });
}

/** Encerra uma sessão aberta em outro aparelho. */
export function encerrarSessao(sessaoId: string) {
  return chamar<unknown>(`/api/seguranca/sessoes/${sessaoId}`, { metodo: 'DELETE' });
}

/** Pergunta para a Azuz IA. O histórico dá contexto à resposta. */
export function perguntarParaIa(mensagem: string, historico: { papel: 'usuario' | 'ia'; texto: string }[]) {
  return chamar<RespostaDaIa>('/api/azuz-ia/perguntar', { metodo: 'POST', corpo: { mensagem, historico } });
}

/** Preferência do workspace guardada por chave (usada pelos avisos). */
export function lerPreferencia<T>(chave: string) {
  return chamar<T>(`/api/preferencias/${chave}`);
}

export function gravarPreferencia(chave: string, dados: unknown) {
  return chamar<unknown>(`/api/preferencias/${chave}`, { metodo: 'PUT', corpo: dados });
}

/* -------------------------------------------------------------------------- */
/* Criação                                                                    */
/* -------------------------------------------------------------------------- */

/** Cria (ou completa) um contato. O servidor casa pelo nome dentro do workspace. */
export function criarContato(nome: string, dados: { whatsapp?: string; email?: string }) {
  return chamar<Contato>('/api/contatos', { metodo: 'POST', corpo: { nome, dados } });
}

/**
 * Cria uma tarefa. `data` é texto livre porque é assim que o CRM guarda o prazo: o quadro mostra
 * o que foi escrito, como "Hoje, 17:00".
 */
export function criarTarefa(entrada: {
  titulo: string;
  contato?: string;
  data: string;
  descricao?: string;
  responsavel: { nome: string; initials: string };
  urgencia?: string;
}) {
  return chamar<unknown>('/api/tarefas', {
    metodo: 'POST',
    corpo: {
      titulo: entrada.titulo,
      contato: entrada.contato ?? '',
      data: entrada.data,
      descricao: entrada.descricao ?? '',
      responsavel: entrada.responsavel,
      urgencia: entrada.urgencia ?? 'media',
    },
  });
}

/** Cria um compromisso na agenda. `dataIso` é aaaa-mm-dd. */
export function criarCompromisso(entrada: {
  contato: string;
  dataIso: string;
  hora: string;
  tipo: string;
  local?: string;
  responsavel: string;
  descricao?: string;
}) {
  return chamar<Compromisso>('/api/agenda', { metodo: 'POST', corpo: entrada });
}

/** Permissões que cada função ganha ao ser convidada — as mesmas do CRM web. */
export const FUNCOES_DE_EQUIPE = [
  {
    id: 'vendedor',
    nome: 'Vendedor',
    permissoes: [
      'contatos_visualizar',
      'contatos_criar',
      'contatos_editar',
      'wa_visualizar',
      'wa_responder',
      'wa_so_proprias',
      'funil_visualizar',
      'funil_criar_negocios',
      'funil_mover_negocios',
    ],
  },
  {
    id: 'atendente',
    nome: 'Atendente',
    permissoes: ['contatos_visualizar', 'wa_visualizar', 'wa_responder', 'wa_so_proprias', 'funil_visualizar'],
  },
  {
    id: 'gestor_trafego',
    nome: 'Gestor de tráfego',
    permissoes: ['contatos_visualizar', 'rel_visualizar', 'rel_exportar', 'funil_visualizar'],
  },
  {
    id: 'visualizador',
    nome: 'Visualizador',
    permissoes: ['contatos_visualizar', 'funil_visualizar', 'rel_visualizar'],
  },
] as const;

/** Convida alguém para a equipe. Entra inativo, com convite pendente, como no web. */
export function convidarMembro(entrada: { nome: string; email: string; funcao: (typeof FUNCOES_DE_EQUIPE)[number] }) {
  return chamar<MembroDaEquipe>('/api/equipe', {
    metodo: 'POST',
    corpo: {
      nome: entrada.nome,
      email: entrada.email,
      papel: entrada.funcao.nome,
      papelTipo: entrada.funcao.id,
      enxerga: 'Somente os próprios',
      permissoes: entrada.funcao.permissoes,
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Funil: novo negócio e nova etapa                                           */
/* -------------------------------------------------------------------------- */

/** As mesmas origens que o funil da web oferece. */
export const ORIGENS_DE_NEGOCIO = ['Instagram', 'TikTok', 'Meta Ads', 'Google Ads', 'Indicação'] as const;

/**
 * Cria um negócio na primeira etapa do funil.
 *
 * Igual ao web: o card entra na lista e o funil inteiro é gravado (`PUT /api/funis`). Não existe
 * rota de criar card sozinho.
 */
export function criarNegocio(
  funis: Funil[],
  funilId: string,
  entrada: { nome: string; valor?: string; origem: string },
) {
  const hoje = new Date().toISOString().slice(0, 10);
  const novo = {
    id: `negocio-${Date.now()}`,
    nome: entrada.nome,
    valor: entrada.valor?.trim() || '—',
    origem: entrada.origem,
    dias: 'Hoje',
    data: hoje,
  } as Funil['colunas'][number]['cards'][number];

  const atualizados = funis.map((funil) => {
    if (funil.id !== funilId) return funil;
    return {
      ...funil,
      colunas: funil.colunas.map((coluna, i) =>
        i === 0 ? { ...coluna, cards: [...coluna.cards, novo], total: coluna.cards.length + 1 } : coluna,
      ),
    };
  });

  return chamar<unknown>('/api/funis', { metodo: 'PUT', corpo: atualizados });
}

/** Cria uma etapa no fim do funil. Essa tem rota própria, que grava na hora. */
export function criarEtapa(funilId: string, nome: string) {
  const id = `etapa-${Date.now()}`;
  return chamar<unknown>('/api/funis/estrutura', {
    metodo: 'POST',
    corpo: { tipo: 'etapa', id, nome, funilId },
  });
}

/* -------------------------------------------------------------------------- */
/* Perfil e senha                                                             */
/* -------------------------------------------------------------------------- */

/** Grava os dados do próprio perfil (nome, telefone, foto). */
export function salvarMeuPerfil(membroId: string, dados: { nome?: string; telefone?: string; foto?: string }) {
  return chamar<unknown>(`/api/equipe/${membroId}`, { metodo: 'PATCH', corpo: dados });
}

/**
 * Pede o link de trocar senha por e-mail.
 *
 * Trocar senha dentro do app exigiria a senha atual em tela, e o CRM não tem rota para isso: ele
 * troca por link com validade de uma hora. O app usa o mesmo caminho.
 */
export function pedirLinkDeNovaSenha(email: string) {
  return chamar<{ mensagem?: string }>('/api/auth/esqueci-senha', { metodo: 'POST', corpo: { email } });
}
