import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SessaoProvider } from '@/api/sessao';
import { TemaProvider, useTema } from '@/theme/ThemeContext';

/**
 * Casca do app. O empilhamento é: tema → área segura → sessão → navegação.
 *
 * Todas as telas escondem o cabeçalho nativo e desenham o próprio (`<Cabecalho />`), porque o CRM
 * web tem uma topbar com título + linha de contexto + ação, e o header padrão do React Navigation
 * não comporta os três.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TemaProvider>
          <SessaoProvider>
            <Navegacao />
          </SessaoProvider>
        </TemaProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Navegacao() {
  const { cores, escuro } = useTema();

  return (
    <>
      <StatusBar style={escuro ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: cores.canvas },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="(app)" options={{ animation: 'fade' }} />
      </Stack>
    </>
  );
}
