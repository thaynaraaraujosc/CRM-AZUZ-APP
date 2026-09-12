import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TagOrigem } from '@/components/funil';
import { Avatar, Chip, Selo } from '@/components/ui';
import { conversas, mensagens } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const ACOES_RAPIDAS = ['Atribuir ao funil', 'Criar tarefa', 'Marcar como resolvida', 'Resumir com IA'];

/** Conversa aberta — bolhas, ações rápidas do CRM e a barra de composição. */
export default function ConversaScreen() {
  const c = useCores();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const conversa = conversas.find((cv) => cv.id === id) ?? conversas[0];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.canvas }}>
      {/* Cabeçalho com identidade do contato */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[3],
          paddingHorizontal: space[3],
          paddingVertical: space[3],
          backgroundColor: c.surface,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: c.line,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={c.ink} />
        </Pressable>

        <Pressable
          onPress={() => router.push(`/contatos/${conversa.id}`)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], flex: 1 }}
        >
          <Avatar iniciais={conversa.iniciais} tamanho={38} />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
              {conversa.nome}
            </Text>
            <Text numberOfLines={1} style={{ color: c.textMuted, fontSize: fontSize.xs, marginTop: 1 }}>
              {conversa.canal} · {conversa.responsavel || 'sem responsável'}
            </Text>
          </View>
        </Pressable>

        <Pressable hitSlop={8}>
          <Ionicons name="call-outline" size={19} color={c.ink} />
        </Pressable>
        <Pressable hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={19} color={c.ink} />
        </Pressable>
      </View>

      {/* Contexto comercial do contato, direto no topo da conversa */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[2],
          paddingHorizontal: space[4],
          paddingVertical: space[2],
          backgroundColor: c.surfaceRaised2,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: c.line,
        }}
      >
        <TagOrigem origem={conversa.origem} />
        <Selo texto="Qualificado" />
        <Selo texto="R$ 890" icone="pricetag-outline" />
        <View style={{ flex: 1 }} />
        <Text style={{ color: c.textFaint, fontSize: fontSize.xs }}>Funil comercial</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView
          contentContainerStyle={{ padding: space[4], gap: space[2] }}
          showsVerticalScrollIndicator={false}
        >
          {mensagens.map((m) => {
            if (m.tipo === 'sistema') {
              return (
                <View key={m.id} style={{ alignItems: 'center', paddingVertical: space[2] }}>
                  <View
                    style={{
                      paddingHorizontal: space[3],
                      paddingVertical: 5,
                      borderRadius: radius.pill,
                      backgroundColor: c.gray100,
                    }}
                  >
                    <Text style={{ color: c.textFaint, fontSize: fontSize.xs }}>{m.texto}</Text>
                  </View>
                </View>
              );
            }

            const minha = m.tipo === 'out';
            return (
              <View
                key={m.id}
                style={{
                  maxWidth: '82%',
                  alignSelf: minha ? 'flex-end' : 'flex-start',
                  backgroundColor: minha ? c.acao : c.surface,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: minha ? c.acaoBorda : c.line,
                  borderRadius: radius.lg,
                  borderBottomRightRadius: minha ? 4 : radius.lg,
                  borderBottomLeftRadius: minha ? radius.lg : 4,
                  paddingHorizontal: space[3],
                  paddingVertical: space[2],
                  gap: 4,
                }}
              >
                <Text style={{ color: minha ? c.acaoTexto : c.ink, fontSize: fontSize.base, lineHeight: 20 }}>
                  {m.texto}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' }}>
                  <Text style={{ color: minha ? 'rgba(255,255,255,0.6)' : c.textFaint, fontSize: 10 }}>{m.hora}</Text>
                  {minha ? <Ionicons name="checkmark-done" size={13} color="rgba(255,255,255,0.75)" /> : null}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Ações que o CRM oferece sem sair da conversa */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4], paddingBottom: space[2] }}
        >
          {ACOES_RAPIDAS.map((a) => (
            <Chip key={a} texto={a} />
          ))}
        </ScrollView>

        {/* Composição */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: space[2],
            paddingHorizontal: space[3],
            paddingTop: space[2],
            paddingBottom: space[2],
            backgroundColor: c.surface,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: c.line,
          }}
        >
          <Pressable hitSlop={8} style={{ paddingBottom: 10 }}>
            <Ionicons name="add-circle-outline" size={24} color={c.textMuted} />
          </Pressable>

          <View
            style={{
              flex: 1,
              minHeight: 42,
              maxHeight: 110,
              justifyContent: 'center',
              paddingHorizontal: space[3],
              borderRadius: radius.xl,
              backgroundColor: c.gray100,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: c.lineSoft,
            }}
          >
            <TextInput
              placeholder="Escreva uma mensagem"
              placeholderTextColor={c.textFaint}
              multiline
              style={{ color: c.ink, fontSize: fontSize.base, paddingVertical: space[2] }}
            />
          </View>

          <Pressable
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: c.acao,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: c.acaoBorda,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="send" size={17} color={c.acaoTexto} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
