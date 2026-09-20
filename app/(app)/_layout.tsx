import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useSessao } from '@/api/sessao';
import { AssinaturaSuspensa } from '@/components/AssinaturaSuspensa';
import { useCores } from '@/theme/ThemeContext';

/**
 * Casca de tudo que exige estar logado.
 *
 * Os três portões ficam aqui, num lugar só, porque o grupo `(app)` embrulha todas as telas de
 * dentro: sem ele, cada tela teria a própria checagem e um link direto entraria sem passar por
 * nenhuma. O nome do grupo entre parênteses não aparece no endereço, então `/conversas` continua
 * sendo `/conversas`.
 */
export default function AppLayout() {
  const c = useCores();
  const { estado, assinatura } = useSessao();

  if (estado === 'verificando') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.canvas }}>
        <ActivityIndicator color={c.blue} />
      </View>
    );
  }

  if (estado === 'fora') return <Redirect href="/login" />;

  // `indefinida` deixa passar de propósito: a consulta pode ter falhado por rede, e derrubar quem
  // está em dia por causa de sinal ruim seria pior que deixar um inadimplente ver a tela.
  if (assinatura === 'bloqueada') return <AssinaturaSuspensa />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.canvas },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen name="notificacoes" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
