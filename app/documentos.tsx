import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraBusca, BotaoIcone, Cabecalho, Cartao, Chip, Divisor, Secundario, TituloSecao } from '@/components/ui';
import { documentos } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const PASTAS = ['Tudo', 'Contratos', 'Propostas', 'Materiais', 'Enviados'];

/** Biblioteca de documentos do workspace — modelos e arquivos anexados a negócios. */
export default function DocumentosScreen() {
  const c = useCores();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Documentos"
        sub={`${documentos.length} arquivos · 580 KB`}
        voltar
        acao={<BotaoIcone icone="cloud-upload-outline" cor={c.acaoTexto} fundo={c.acao} />}
      />

      <View style={{ backgroundColor: c.surface, paddingHorizontal: space[4], paddingTop: space[3], gap: space[3] }}>
        <BarraBusca placeholder="Buscar documento" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingBottom: space[3] }}
        >
          {PASTAS.map((p, i) => (
            <Chip key={p} texto={p} ativo={i === 0} />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[4] }}
        showsVerticalScrollIndicator={false}
      >
        <TituloSecao titulo="Arquivos" contagem={documentos.length} />

        <Cartao padding={0} style={{ overflow: 'hidden' }}>
          {documentos.map((d, i) => (
            <View key={d.id}>
              {i > 0 ? <Divisor /> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[3] }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: radius.md,
                    backgroundColor: d.tipo === 'PDF' ? c.dangerSoft : c.blueSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: d.tipo === 'PDF' ? c.danger : c.blue,
                      fontSize: 9,
                      fontWeight: fontWeight.bold,
                    }}
                  >
                    {d.tipo}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                    {d.nome}
                  </Text>
                  <Secundario style={{ marginTop: 2 }}>
                    {d.tamanho} · {d.data}
                  </Secundario>
                </View>

                <Ionicons name="ellipsis-vertical" size={16} color={c.textFaint} />
              </View>
            </View>
          ))}
        </Cartao>

        <Cartao
          style={{
            alignItems: 'center',
            gap: space[2],
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: c.lineStrong,
            paddingVertical: space[6],
          }}
        >
          <Ionicons name="cloud-upload-outline" size={26} color={c.textFaint} />
          <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>Enviar arquivo</Text>
          <Text style={{ color: c.textMuted, fontSize: fontSize.sm, textAlign: 'center' }}>
            PDF, DOCX, imagem ou planilha até 20 MB
          </Text>
        </Cartao>

        <View style={{ height: StyleSheet.hairlineWidth }} />
      </ScrollView>
    </SafeAreaView>
  );
}
