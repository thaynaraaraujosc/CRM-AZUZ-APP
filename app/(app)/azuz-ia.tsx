import { Ionicons } from '@expo/vector-icons';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cabecalho, Chip } from '@/components/ui';
import { conversaIa, sugestoesIa } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

/** Assistente do CRM. Roxo é a cor semântica de IA no design system — não é a cor da marca. */
export default function AzuzIaScreen() {
  const c = useCores();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Azuz IA" sub="Lê os seus dados do CRM para responder" voltar />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: space[4], gap: space[3] }}
          showsVerticalScrollIndicator={false}
        >
          {conversaIa.map((m) => {
            const minha = m.tipo === 'eu';
            return (
              <View
                key={m.id}
                style={{
                  flexDirection: 'row',
                  gap: space[2],
                  alignSelf: minha ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                }}
              >
                {!minha ? (
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: c.iaSoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="sparkles" size={14} color={c.ia} />
                  </View>
                ) : null}

                <View
                  style={{
                    flex: 1,
                    backgroundColor: minha ? c.acao : c.surface,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: minha ? c.acaoBorda : c.line,
                    borderRadius: radius.lg,
                    paddingHorizontal: space[3],
                    paddingVertical: space[3],
                  }}
                >
                  <Text style={{ color: minha ? c.acaoTexto : c.ink, fontSize: fontSize.base, lineHeight: 21 }}>
                    {m.texto}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4], paddingBottom: space[2] }}
        >
          {sugestoesIa.map((s) => (
            <Chip key={s} texto={s} />
          ))}
        </ScrollView>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: space[2],
            paddingHorizontal: space[3],
            paddingVertical: space[2],
            backgroundColor: c.surface,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: c.line,
          }}
        >
          <View
            style={{
              flex: 1,
              minHeight: 42,
              justifyContent: 'center',
              paddingHorizontal: space[3],
              borderRadius: radius.xl,
              backgroundColor: c.gray100,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: c.lineSoft,
            }}
          >
            <TextInput
              placeholder="Pergunte sobre leads, funil ou conversas"
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
              backgroundColor: c.ia,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-up" size={19} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text
          style={{
            color: c.textFaint,
            fontSize: fontSize.xs,
            textAlign: 'center',
            paddingBottom: space[2],
            fontWeight: fontWeight.regular,
          }}
        >
          As respostas usam os dados do seu workspace e podem conter erros.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
