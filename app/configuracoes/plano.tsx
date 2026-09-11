import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraProgresso, Botao, Cabecalho, Cartao, Corpo, Divisor, Secundario, Selo, TituloSecao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const INCLUSO = [
  'Usuários ilimitados',
  '4 canais de atendimento',
  'Automações sem limite de execução',
  'Azuz IA com 2.000 créditos por mês',
  'Relatórios e exportação',
];

const USO = [
  { rotulo: 'Contatos', atual: 248, limite: 5000 },
  { rotulo: 'Créditos de IA', atual: 1240, limite: 2000 },
  { rotulo: 'Armazenamento', atual: 580, limite: 5120 },
];

const FATURAS = [
  { id: 'fa1', mes: 'Agosto de 2025', valor: 'R$ 397,00', estado: 'Paga' },
  { id: 'fa2', mes: 'Julho de 2025', valor: 'R$ 397,00', estado: 'Paga' },
  { id: 'fa3', mes: 'Junho de 2025', valor: 'R$ 397,00', estado: 'Paga' },
];

/** Plano atual, consumo e histórico de faturas. */
export default function PlanoScreen() {
  const c = useCores();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Plano e cobrança" sub="Profissional · renova em 02/10/2025" voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <Cartao style={{ gap: space[3] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <Text style={{ color: c.ink, fontSize: fontSize.lg, fontWeight: fontWeight.bold }}>Profissional</Text>
            <Selo texto="Ativo" cor={c.success} fundo={c.successSoft} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space[1] }}>
            <Text style={{ color: c.ink, fontSize: fontSize.display, fontWeight: fontWeight.bold, letterSpacing: -1 }}>
              R$ 397
            </Text>
            <Text style={{ color: c.textMuted, fontSize: fontSize.base }}>por mês</Text>
          </View>

          <Divisor margem={space[1]} />

          <View style={{ gap: space[2] }}>
            {INCLUSO.map((i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                <Ionicons name="checkmark-circle" size={15} color={c.success} />
                <Corpo style={{ flex: 1 }}>{i}</Corpo>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Botao titulo="Mudar de plano" style={{ flex: 1 }} />
            <Botao titulo="Cancelar" variante="secundario" style={{ flex: 1 }} />
          </View>
        </Cartao>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Consumo do ciclo" />
          <Cartao style={{ gap: space[4] }}>
            {USO.map((u) => (
              <View key={u.rotulo} style={{ gap: space[2] }}>
                <View style={{ flexDirection: 'row' }}>
                  <Corpo style={{ flex: 1, fontWeight: fontWeight.bold }}>{u.rotulo}</Corpo>
                  <Secundario>
                    {u.atual} de {u.limite}
                  </Secundario>
                </View>
                <BarraProgresso
                  valor={(u.atual / u.limite) * 100}
                  cor={u.atual / u.limite > 0.8 ? c.warning : c.blue}
                />
              </View>
            ))}
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Forma de pagamento" />
          <Cartao style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <View
              style={{
                width: 42,
                height: 30,
                borderRadius: radius.sm,
                backgroundColor: c.gray100,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: c.line,
              }}
            >
              <Ionicons name="card-outline" size={15} color={c.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Corpo style={{ fontWeight: fontWeight.bold }}>Visa terminado em 4821</Corpo>
              <Secundario>Cobrança automática todo dia 2</Secundario>
            </View>
            <Ionicons name="chevron-forward" size={16} color={c.textFaint} />
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Faturas" contagem={FATURAS.length} />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            {FATURAS.map((f, i) => (
              <View key={f.id}>
                {i > 0 ? <Divisor /> : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[3] }}>
                  <View style={{ flex: 1 }}>
                    <Corpo style={{ fontWeight: fontWeight.bold }}>{f.mes}</Corpo>
                    <Secundario>{f.valor}</Secundario>
                  </View>
                  <Selo texto={f.estado} cor={c.success} fundo={c.successSoft} />
                  <Ionicons name="download-outline" size={17} color={c.textMuted} />
                </View>
              </View>
            ))}
          </Cartao>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
