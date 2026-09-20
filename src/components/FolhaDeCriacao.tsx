import { Ionicons } from '@expo/vector-icons';
import { type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

import { Botao } from './ui';

/**
 * Folha que sobe de baixo para criar algo.
 *
 * Um componente só para todos os cadastros do app: o que muda entre criar contato, tarefa,
 * compromisso ou convite são os campos, não o comportamento. Erro de gravação aparece dentro da
 * folha e ela NÃO fecha, para o que foi digitado não se perder.
 */
export function FolhaDeCriacao({
  aberta,
  titulo,
  descricao,
  salvando,
  erro,
  aoFechar,
  aoSalvar,
  rotuloSalvar = 'Salvar',
  children,
}: {
  aberta: boolean;
  titulo: string;
  descricao?: string;
  salvando?: boolean;
  erro?: string | null;
  aoFechar: () => void;
  aoSalvar: () => void;
  rotuloSalvar?: string;
  children: ReactNode;
}) {
  const c = useCores();

  return (
    <Modal visible={aberta} animationType="slide" transparent onRequestClose={aoFechar}>
      <View style={{ flex: 1, backgroundColor: 'rgba(11, 21, 51, 0.35)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={aoFechar} />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView edges={['bottom']} style={{ backgroundColor: c.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }}>
            <View style={{ padding: space[4], gap: space[4], maxHeight: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space[3] }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.ink, fontSize: fontSize.lg, fontWeight: fontWeight.bold, letterSpacing: -0.2 }}>
                    {titulo}
                  </Text>
                  {descricao ? (
                    <Text style={{ color: c.textMuted, fontSize: fontSize.sm, marginTop: 2 }}>{descricao}</Text>
                  ) : null}
                </View>
                <Pressable onPress={aoFechar} hitSlop={10}>
                  <Ionicons name="close" size={22} color={c.textMuted} />
                </Pressable>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ gap: space[4], paddingBottom: space[2] }}
                style={{ maxHeight: 420 }}
              >
                {children}
              </ScrollView>

              {erro ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], padding: space[3], borderRadius: radius.md, backgroundColor: c.dangerSoft }}>
                  <Ionicons name="alert-circle-outline" size={16} color={c.danger} />
                  <Text style={{ flex: 1, color: c.danger, fontSize: fontSize.sm }}>{erro}</Text>
                </View>
              ) : null}

              {salvando ? (
                <View style={{ height: 44, borderRadius: radius.md, backgroundColor: c.acao, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator color={c.acaoTexto} />
                </View>
              ) : (
                <Botao titulo={rotuloSalvar} bloco onPress={aoSalvar} />
              )}
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
