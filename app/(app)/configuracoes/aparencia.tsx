import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cabecalho, Cartao, Corpo, Secundario, TituloSecao } from '@/components/ui';
import { usePermissoes } from '@/api/permissoes';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { useTema } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const OPCOES = [
  { id: 'sistema', titulo: 'Seguir o sistema', sub: 'Acompanha o ajuste do aparelho', icone: 'phone-portrait-outline' },
  { id: 'claro', titulo: 'Claro', sub: 'Fundo branco, tinta marinho', icone: 'sunny-outline' },
  { id: 'escuro', titulo: 'Escuro', sub: 'Fundo quase preto, tinta clara', icone: 'moon-outline' },
] as const;

/** A única tela do app que muda algo de verdade: o tema. O resto ainda é só desenho. */
export default function AparenciaScreen() {
  const { pode } = usePermissoes();
  if (!pode('configuracoes')) return <TelaSemPermissao titulo="Aparência" modulo="configurações" voltar={true} />;

  const { cores: c, modo, setModo } = useTema();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Aparência" sub="Tema do aplicativo" voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Tema" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            {OPCOES.map((o, i) => {
              const ativo = modo === o.id;
              return (
                <Pressable
                  key={o.id}
                  onPress={() => setModo(o.id)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space[3],
                    padding: space[3],
                    borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0,
                    borderTopColor: c.line,
                    backgroundColor: pressed ? c.surfaceHover : 'transparent',
                  })}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: radius.md,
                      backgroundColor: ativo ? c.blueSoft : c.gray100,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={o.icone} size={16} color={ativo ? c.blue : c.ink} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Corpo style={{ fontWeight: fontWeight.bold }}>{o.titulo}</Corpo>
                    <Secundario>{o.sub}</Secundario>
                  </View>

                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: ativo ? 6 : 1.5,
                      borderColor: ativo ? c.acao : c.lineStrong,
                    }}
                  />
                </Pressable>
              );
            })}
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Prévia" />
          <Cartao style={{ gap: space[3] }}>
            <Text style={{ color: c.ink, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>
              Marcos Aurélio
            </Text>
            <Secundario>Conversa sem resposta · há 6 min</Secundario>
            <View style={{ flexDirection: 'row', gap: space[2] }}>
              <View
                style={{
                  paddingHorizontal: space[3],
                  paddingVertical: space[2],
                  borderRadius: radius.md,
                  backgroundColor: c.acao,
                }}
              >
                <Text style={{ color: c.acaoTexto, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                  Responder
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: space[3],
                  paddingVertical: space[2],
                  borderRadius: radius.md,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: c.lineStrong,
                }}
              >
                <Text style={{ color: c.ink, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>Adiar</Text>
              </View>
            </View>
          </Cartao>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
