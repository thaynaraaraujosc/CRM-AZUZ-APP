import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { corDaOrigem, paletaClara, paletaEscura, sombra, type NivelDeSombra, type Paleta } from './tokens';

type Modo = 'sistema' | 'claro' | 'escuro';

type TemaContextValue = {
  cores: Paleta;
  escuro: boolean;
  modo: Modo;
  setModo: (modo: Modo) => void;
  alternar: () => void;
};

const TemaContext = createContext<TemaContextValue | null>(null);

/**
 * Tema claro/escuro do app. Segue o sistema por padrão — o CRM web faz o mesmo — e aceita
 * escolha manual em Configurações › Aparência.
 */
export function TemaProvider({ children }: { children: ReactNode }) {
  const esquemaSistema = useColorScheme();
  const [modo, setModo] = useState<Modo>('sistema');

  const escuro = modo === 'sistema' ? esquemaSistema === 'dark' : modo === 'escuro';

  const valor = useMemo<TemaContextValue>(
    () => ({
      cores: escuro ? paletaEscura : paletaClara,
      escuro,
      modo,
      setModo,
      alternar: () => setModo(escuro ? 'claro' : 'escuro'),
    }),
    [escuro, modo],
  );

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema() {
  const ctx = useContext(TemaContext);
  if (!ctx) throw new Error('useTema precisa estar dentro de <TemaProvider>.');
  return ctx;
}

/** Atalho para quem só precisa das cores. */
export function useCores() {
  return useTema().cores;
}

/**
 * Cor da origem já resolvida para o tema atual — evita que cada tela precise carregar o `escuro`
 * só para pintar uma etiqueta.
 */
export function useCorDaOrigem() {
  const { escuro } = useTema();
  return (origem: string) => corDaOrigem(origem, escuro);
}

/** Sombra já resolvida para o tema atual. */
export function useSombra() {
  const { escuro } = useTema();
  return (nivel: NivelDeSombra) => sombra(nivel, escuro);
}
