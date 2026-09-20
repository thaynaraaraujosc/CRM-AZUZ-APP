import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePermissoes } from '@/api/permissoes';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight } from '@/theme/tokens';

/**
 * Barra inferior com os destinos de uso diário. O menu lateral do web tem vinte itens — num
 * telefone isso não cabe e nem deveria: o que a pessoa abre todo dia fica à mão e o resto vive
 * em "Mais".
 *
 * Conversas é a primeira aba, e por isso a tela de abertura do app: é a caixa de entrada, o que
 * mais se abre num dia de trabalho.
 */
export default function TabsLayout() {
  const c = useCores();
  const { pode } = usePermissoes();
  const margens = useSafeAreaInsets();

  // Altura fixa empurrava ícone e rótulo para debaixo da faixa do indicador de início do iPhone,
  // e a barra parecia colada na borda. Agora a folga de baixo é a do próprio aparelho: em quem tem
  // indicador, o conteúdo sobe; em quem não tem, fica uma folga normal.
  const folgaDeBaixo = margens.bottom > 0 ? margens.bottom : 10;

  // Aba de módulo que o papel da pessoa não inclui some da barra (`href: null`), em vez de abrir
  // numa tela de erro. Sessão e assinatura são conferidas um nível acima, em `(app)/_layout`.
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
          height: 56 + folgaDeBaixo,
          paddingTop: 8,
          paddingBottom: folgaDeBaixo,
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
          href: pode('conversas') ? undefined : null,
          title: 'Conversas',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="funil"
        options={{
          href: pode('funil') ? undefined : null,
          title: 'Funil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'git-branch' : 'git-branch-outline'} size={21} color={color} />
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
