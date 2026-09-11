import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao, BotaoIcone, Cabecalho, Cartao, Chip, Corpo, Divisor, Secundario, TituloSecao } from '@/components/ui';
import { relatorios } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const MODELOS = [
  { nome: 'Resumo comercial', descricao: 'Leads, conversão e faturamento do período' },
  { nome: 'Performance por vendedor', descricao: 'Atividade e resultado de cada pessoa' },
  { nome: 'Origem de leads', descricao: 'De onde vem cada lead, com custo e retorno' },
  { nome: 'Motivos de perda', descricao: 'Agrupado por motivo e por etapa' },
];

/** Relatórios já gerados e os modelos disponíveis para gerar um novo. */
export default function RelatoriosScreen() {
  const c = useCores();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Relatórios"
        sub={`${relatorios.length} gerados`}
        voltar
        acao={<BotaoIcone icone="add" cor={c.acaoTexto} fundo={c.acao} />}
      />

      <View style={{ backgroundColor: c.surface, paddingVertical: space[3] }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4] }}
        >
          {['Todos', 'PDF', 'CSV', 'Meus'].map((f, i) => (
            <Chip key={f} texto={f} ativo={i === 0} />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Gerados" contagem={relatorios.length} />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            {relatorios.map((r, i) => (
              <View key={r.id}>
                {i > 0 ? <Divisor /> : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[3] }}>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: radius.md,
                      backgroundColor: r.tipo === 'PDF' ? c.dangerSoft : c.successSoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: r.tipo === 'PDF' ? c.danger : c.success,
                        fontSize: 9,
                        fontWeight: fontWeight.bold,
                      }}
                    >
                      {r.tipo}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Corpo style={{ fontWeight: fontWeight.bold }} numberOfLines={1}>
                      {r.nome}
                    </Corpo>
                    <Secundario>
                      {r.gerado} · {r.autor}
                    </Secundario>
                  </View>
                  <Ionicons name="share-outline" size={17} color={c.textMuted} />
                </View>
              </View>
            ))}
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Gerar novo" />
          {MODELOS.map((m) => (
            <Cartao key={m.nome} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: radius.md,
                  backgroundColor: c.gray100,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="stats-chart-outline" size={16} color={c.ink} />
              </View>
              <View style={{ flex: 1 }}>
                <Corpo style={{ fontWeight: fontWeight.bold }}>{m.nome}</Corpo>
                <Secundario>{m.descricao}</Secundario>
              </View>
              <Ionicons name="chevron-forward" size={16} color={c.textFaint} />
            </Cartao>
          ))}

          <Botao titulo="Montar relatório do zero" variante="secundario" icone="construct-outline" bloco />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
