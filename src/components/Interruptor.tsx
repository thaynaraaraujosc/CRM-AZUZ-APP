import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useCores } from '@/theme/ThemeContext';

/**
 * Interruptor de preferência.
 *
 * Sem `aoMudar` ele é só o desenho do estado (usado onde a preferência é decidida em outro lugar).
 * Com `aoMudar`, toca e muda de verdade — quem chama é que grava.
 */
export function Interruptor({
  ligado,
  aoMudar,
  ocupado = false,
}: {
  ligado: boolean;
  aoMudar?: (novo: boolean) => void;
  ocupado?: boolean;
}) {
  const c = useCores();

  const desenho = (
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
        opacity: ocupado ? 0.6 : 1,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {ocupado ? <ActivityIndicator size="small" color={c.acao} /> : null}
      </View>
    </View>
  );

  if (!aoMudar) return desenho;

  return (
    <Pressable onPress={() => aoMudar(!ligado)} disabled={ocupado} hitSlop={10}>
      {desenho}
    </Pressable>
  );
}
