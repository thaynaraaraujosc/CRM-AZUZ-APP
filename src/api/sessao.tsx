import { useRouter } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { chamar, entrarNoCrm, ErroDaApi, sairDoCrm } from './cliente';
import type { RespostaDeSessao, SessaoDoUsuario } from './tipos';

type Estado = 'verificando' | 'dentro' | 'fora';

type SessaoContexto = {
  estado: Estado;
  usuario: SessaoDoUsuario | null;
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

  const conferir = useCallback(async () => {
    try {
      const sessao = await chamar<RespostaDeSessao>('/api/auth/session');
      if (sessao?.user?.email) {
        setUsuario(sessao.user);
        setEstado('dentro');
        return true;
      }
    } catch {
      // Sem rede ou sessão inválida caem no mesmo lugar: a tela de entrada.
    }
    setUsuario(null);
    setEstado('fora');
    return false;
  }, []);

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
  }, []);

  const expirou = useCallback(() => {
    setUsuario(null);
    setEstado('fora');
  }, []);

  const valor = useMemo<SessaoContexto>(
    () => ({ estado, usuario, entrar, sair, expirou }),
    [estado, usuario, entrar, sair, expirou],
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
