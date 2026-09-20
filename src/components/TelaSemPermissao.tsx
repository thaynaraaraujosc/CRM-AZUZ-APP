import { SafeAreaView } from 'react-native-safe-area-context';

import { useCores } from '@/theme/ThemeContext';

import { Cabecalho } from './ui';
import { SemPermissao } from './SemPermissao';

/** Tela inteira de "sem acesso", com cabeçalho, para quem chegou por link direto ao módulo. */
export function TelaSemPermissao({
  titulo,
  modulo,
  voltar = true,
}: {
  titulo: string;
  modulo: string;
  voltar?: boolean;
}) {
  const c = useCores();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo={titulo} voltar={voltar} />
      <SemPermissao modulo={modulo} />
    </SafeAreaView>
  );
}
