import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraProgresso, Cabecalho, Cartao, Corpo, Indicador, Secundario, Selo, TituloSecao } from '@/components/ui';
import { motivosDePerda } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, space } from '@/theme/tokens';

const PERDIDOS = [
  { id: 'p1', nome: 'Sandra Melo', valor: 'R$ 1.900', motivo: 'Preço acima do esperado', quando: '05/09' },
  { id: 'p2', nome: 'Igor Batista', valor: 'R$ 640', motivo: 'Sem retorno do lead', quando: '03/09' },
  { id: 'p3', nome: 'Clínica Viva', valor: 'R$ 3.200', motivo: 'Escolheu concorrente', quando: '01/09' },
];

/** Por que os negócios não fecharam — o campo é obrigatório ao marcar perdido no funil. */
export default function MotivosPerdaScreen() {
  const c = useCores();
  const total = motivosDePerda.reduce((s, m) => s + m.total, 0);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Motivos de perda" sub={`${total} negócios perdidos em 30 dias`} voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', gap: space[2] }}>
          <Indicador numero={total} rotulo="Perdidos" cor={c.danger} />
          <Indicador numero="R$ 24.100" rotulo="Valor que saiu" />
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Motivos" contagem={motivosDePerda.length} />
          <Cartao style={{ gap: space[4] }}>
            {motivosDePerda.map((m) => (
              <View key={m.motivo} style={{ gap: space[2] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                  <Text style={{ flex: 1, color: c.ink, fontSize: fontSize.base }}>{m.motivo}</Text>
                  <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                    {m.total}
                  </Text>
                  <Secundario>{m.percentual}%</Secundario>
                </View>
                <BarraProgresso valor={m.percentual} cor={c.danger} />
              </View>
            ))}
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Últimos perdidos" contagem={PERDIDOS.length} />
          {PERDIDOS.map((p) => (
            <Cartao key={p.id} style={{ gap: space[2] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                <Corpo style={{ flex: 1, fontWeight: fontWeight.bold }}>{p.nome}</Corpo>
                <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>{p.valor}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                <Selo texto={p.motivo} cor={c.danger} fundo={c.dangerSoft} />
                <View style={{ flex: 1 }} />
                <Secundario>{p.quando}</Secundario>
              </View>
            </Cartao>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
