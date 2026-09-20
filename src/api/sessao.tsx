import { useRouter } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { chamar, entrarNoCrm, ErroDaApi, sairDoCrm } from './cliente';
import type { RespostaDeAssinatura, RespostaDeSessao, SessaoDoUsuario } from './tipos';

type Estado = 'verificando' | 'dentro' | 'fora';

/**
 * Situação da assinatura do workspace de quem entrou.
 *
 * `indefinida` é o estado enquanto a resposta não chegou, e também quando a consulta falha por
 * rede. Falha de rede não pode bloquear: derrubaria quem está em dia por causa de um sinal ruim.
 */
type Assinatura = 'indefinida' | 'ativa' | 'bloqueada';

type SessaoContexto = {
  estado: Estado;
  usuario: SessaoDoUsuario | null;
  assinatura: Assinatura;
  /** Refaz a consulta da assinatura — usado pelo botão "Tentar de novo" da tela de bloqueio. */
  reconferirAssinatura: () => void;
  entrar: (email: string, senha: string) => Promise<{ ok: boolean; erro?: string }>;
  sair: () => Promise<void>;
  /** Chamado pelas telas quando a API responde que a sessão morreu. */
  expirou: () => void;
};

const Contexto = createContext<SessaoContexto | null>(null);

/**
 * Sessão do CRM dentro do app.
 *
 * O servidor guarda a sessão num cookie do Auth.js, e o aparelho guarda esse cookie sozinho — não
 * há token para o app administrar. O que este provedor faz é perguntar ao servidor quem está
 * logado (`/api/auth/session`) e manter a resposta à mão para as telas.
 */
export function SessaoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>('verificando');
  const [usuario, setUsuario] = useState<SessaoDoUsuario | null>(null);
  const [assinatura, setAssinatura] = useState<Assinatura>('indefinida');

  /**
   * Confere a assinatura no servidor, não na sessão.
   *
   * O status muda por webhook da Asaas, fora do controle de quando o token da sessão foi emitido,
   * então cache de sessão não serve. É a mesma consulta que o `proxy.ts` do web faz a cada
   * navegação.
   */
  const conferirAssinatura = useCallback(async (dono: SessaoDoUsuario | null) => {
    if (dono?.superAdmin) {
      setAssinatura('ativa');
      return;
    }
    try {
      const resposta = await chamar<RespostaDeAssinatura>('/api/assinatura');
      setAssinatura(resposta?.assinatura?.status === 'ativa' ? 'ativa' : 'bloqueada');
    } catch {
      // Sem resposta não dá para afirmar que está devendo. Deixa passar e tenta de novo depois.
      setAssinatura('indefinida');
    }
  }, []);

  const conferir = useCallback(async () => {
    try {
      const sessao = await chamar<RespostaDeSessao>('/api/auth/session');
      if (sessao?.user?.email) {
        setUsuario(sessao.user);
        setEstado('dentro');
        void conferirAssinatura(sessao.user);
        return true;
      }
    } catch {
      // Sem rede ou sessão inválida caem no mesmo lugar: a tela de entrada.
    }
    setUsuario(null);
    setEstado('fora');
    setAssinatura('indefinida');
    return false;
  }, [conferirAssinatura]);

  useEffect(() => {
    void conferir();
  }, [conferir]);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      try {
        await entrarNoCrm(email, senha);
      } catch (e) {
        return {
          ok: false,
          erro: e instanceof ErroDaApi ? e.message : 'Não foi possível entrar agora.',
        };
      }

      // O Auth.js não diz na resposta se as credenciais valiam; quem responde é a sessão.
      const dentro = await conferir();
      return dentro ? { ok: true } : { ok: false, erro: 'E-mail ou senha incorretos.' };
    },
    [conferir],
  );

  const sair = useCallback(async () => {
    await sairDoCrm();
    setUsuario(null);
    setEstado('fora');
    setAssinatura('indefinida');
  }, []);

  const expirou = useCallback(() => {
    setUsuario(null);
    setEstado('fora');
    setAssinatura('indefinida');
  }, []);

  const reconferirAssinatura = useCallback(() => {
    setAssinatura('indefinida');
    void conferirAssinatura(usuario);
  }, [conferirAssinatura, usuario]);

  const valor = useMemo<SessaoContexto>(
    () => ({ estado, usuario, assinatura, entrar, sair, expirou, reconferirAssinatura }),
    [estado, usuario, assinatura, entrar, sair, expirou, reconferirAssinatura],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSessao() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useSessao precisa estar dentro de <SessaoProvider>.');
  return ctx;
}

/**
 * Devolve o aviso de sessão perdida já ligado à navegação: a tela passa isto para os hooks de
 * busca e não precisa saber para onde mandar a pessoa.
 */
export function useAoPerderSessao() {
  const { expirou } = useSessao();
  const router = useRouter();
  return useCallback(() => {
    expirou();
    router.replace('/login');
  }, [expirou, router]);
}
