import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSessao } from '@/api/sessao';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight } from '@/theme/tokens';

/**
 * Barra inferior com os quatro destinos de uso diário. O menu lateral do web tem vinte itens —
 * num telefone isso não cabe e nem deveria: os três módulos que a pessoa abre todo dia ficam à
 * mão e o resto vive em "Mais".
 *
 * Conversas é a primeira aba, e por isso a tela de abertura do app: é a caixa de entrada, o que
 * mais se abre num dia de trabalho.
 */
export default function TabsLayout() {
  const c = useCores();
  const { estado } = useSessao();

  // A área logada não monta sem sessão: assim nenhuma tela dispara chamada que já se sabe que vai
  // voltar como "não autenticado", e a pessoa não vê quatro erros antes de cair no login.
  if (estado === 'verificando') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.canvas }}>
        <ActivityIndicator color={c.blue} />
      </View>
    );
  }
  if (estado === 'fora') return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.ink,
        tabBarInactiveTintColor: c.textFaint,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: c.line,
          height: 62,
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: fontWeight.bold,
        },
        sceneStyle: { backgroundColor: c.canvas },
      }}
    >
      <Tabs.Screen
        name="conversas"
        options={{
          title: 'Conversas',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="funil"
        options={{
          title: 'Funil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'git-branch' : 'git-branch-outline'} size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tarefas"
        options={{
          title: 'Tarefas',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'checkbox' : 'checkbox-outline'} size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mais"
        options={{
          title: 'Mais',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={21} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
