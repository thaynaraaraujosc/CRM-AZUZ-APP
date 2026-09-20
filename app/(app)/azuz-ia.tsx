import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
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

import { perguntarParaIa } from '@/api/recursos';
import { ErroDeSessao } from '@/api/cliente';
import { useAoPerderSessao } from '@/api/sessao';
import { Cabecalho, Chip } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

type Fala = { id: string; papel: 'usuario' | 'ia'; texto: string };

const SUGESTOES = [
  'Resuma meu funil hoje',
  'Quais leads estão parados?',
  'Quantos negócios ganhei este mês?',
  'O que devo priorizar amanhã?',
];

const ABERTURA: Fala = {
  id: 'abertura',
  papel: 'ia',
  texto:
    'Oi! Eu leio os dados do seu workspace — contatos, conversas, funil e tarefas — e respondo sobre eles. Pergunte à vontade.',
};

/** Assistente do CRM. Roxo é a cor semântica de IA no design system — não é a cor da marca. */
export default function AzuzIaScreen() {
  const c = useCores();
  const aoPerderSessao = useAoPerderSessao();
  const rolagem = useRef<ScrollView | null>(null);

  const [falas, setFalas] = useState<Fala[]>([ABERTURA]);
  const [texto, setTexto] = useState('');
  const [pensando, setPensando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);

  function irParaOFim() {
    requestAnimationFrame(() => rolagem.current?.scrollToEnd({ animated: true }));
  }

  async function perguntar(pergunta: string) {
    const limpa = pergunta.trim();
    if (!limpa || pensando) return;

    const minha: Fala = { id: `eu-${Date.now()}`, papel: 'usuario', texto: limpa };
    const anteriores = falas;

    setFalas([...anteriores, minha]);
    setTexto('');
    setFalha(null);
    setPensando(true);
    irParaOFim();

    try {
      // O histórico é o que dá contexto: sem ele, cada pergunta chegaria solta.
      const historico = anteriores
        .filter((f) => f.id !== 'abertura')
        .map((f) => ({ papel: f.papel, texto: f.texto }));

      const { resposta } = await perguntarParaIa(limpa, historico);
      setFalas((antes) => [...antes, { id: `ia-${Date.now()}`, papel: 'ia', texto: resposta }]);
      irParaOFim();
    } catch (e) {
      if (e instanceof ErroDeSessao) {
        aoPerderSessao();
        return;
      }
      // A pergunta volta para o campo: melhor que perder o que foi escrito.
      setFalas(anteriores);
      setTexto(limpa);
      setFalha(e instanceof Error ? e.message : 'Não deu para responder agora.');
    } finally {
      setPensando(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Azuz IA" sub="Lê os seus dados do CRM para responder" voltar />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={rolagem}
          contentContainerStyle={{ padding: space[4], gap: space[3] }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => rolagem.current?.scrollToEnd({ animated: false })}
        >
          {falas.map((m) => {
            const minha = m.papel === 'usuario';
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

          {pensando ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], alignSelf: 'flex-start' }}>
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
                <ActivityIndicator size="small" color={c.ia} />
              </View>
              <Text style={{ color: c.textMuted, fontSize: fontSize.sm }}>Lendo seus dados…</Text>
            </View>
          ) : null}

          {falha ? (
            <View
              style={{
                backgroundColor: c.dangerSoft,
                borderRadius: radius.md,
                paddingHorizontal: space[3],
                paddingVertical: space[2],
              }}
            >
              <Text style={{ color: c.danger, fontSize: fontSize.sm }}>{falha}</Text>
            </View>
          ) : null}
        </ScrollView>

        {falas.length <= 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4], paddingBottom: space[2] }}
          >
            {SUGESTOES.map((s) => (
              <Chip key={s} texto={s} onPress={() => perguntar(s)} desabilitado={pensando} />
            ))}
          </ScrollView>
        ) : null}

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
              value={texto}
              onChangeText={setTexto}
              placeholder="Pergunte sobre leads, funil ou conversas"
              placeholderTextColor={c.textFaint}
              multiline
              style={{ color: c.ink, fontSize: fontSize.base, paddingVertical: space[2] }}
            />
          </View>

          <Pressable
            onPress={() => perguntar(texto)}
            disabled={pensando || texto.trim().length === 0}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: c.ia,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pensando || texto.trim().length === 0 ? 0.45 : 1,
            }}
          >
            {pensando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="arrow-up" size={19} color="#FFFFFF" />
            )}
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
