import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight } from '@/theme/tokens';

/**
 * Barra inferior com os cinco destinos de uso diário. O menu lateral do web tem vinte itens —
 * num telefone isso não cabe e nem deveria: os quatro módulos que a pessoa abre todo dia ficam à
 * mão e o resto vive em "Mais".
 */
export default function TabsLayout() {
  const c = useCores();

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
        name="inicio"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="conversas"
        options={{
          title: 'Conversas',
          tabBarBadge: 6,
          tabBarBadgeStyle: { backgroundColor: c.blue, color: '#FFFFFF', fontSize: 10 },
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
