import { StyleSheet, View } from 'react-native';

import { useCores } from '@/theme/ThemeContext';

/**
 * Interruptor apenas desenhado. O app é a camada visual: usar o `Switch` real daria a impressão
 * de que a preferência é gravada em algum lugar, e não é.
 */
export function Interruptor({ ligado }: { ligado: boolean }) {
  const c = useCores();
  return (
    <View
      style={{
        width: 42,
        height: 24,
        borderRadius: 12,
        padding: 2,
        justifyContent: 'center',
        alignItems: ligado ? 'flex-end' : 'flex-start',
        backgroundColor: ligado ? c.acao : c.gray300,
        borderWidth: ligado ? StyleSheet.hairlineWidth : 0,
        borderColor: c.acaoBorda,
      }}
    >
      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' }} />
    </View>
  );
}
