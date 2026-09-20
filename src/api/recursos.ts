import { useCallback, useEffect, useState } from 'react';

import { chamar, ErroDeSessao } from './cliente';
import type { Contato, Conversa, Funil, HistoricoDeMensagens, MembroDaEquipe } from './tipos';

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
