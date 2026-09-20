import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotaoIcone, Cabecalho, Cartao, Chip, Corpo, Indicador, Secundario, Selo, TituloSecao } from '@/components/ui';
import { automacoes } from '@/mock/dados';
import { usePermissoes } from '@/api/permissoes';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const ABAS = ['Fluxos', 'Disparos', 'Modelos'];

/** Fluxos automáticos: gatilho, quantidade de passos e se estão rodando. */
export default function AutomacoesScreen() {
  const { pode } = usePermissoes();
  if (!pode('automacoes')) return <TelaSemPermissao titulo="Automações" modulo="automações" voltar={true} />;

  const c = useCores();
  const ativas = automacoes.filter((a) => a.ativa).length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Automações"
        sub={`${ativas} fluxos ativos de ${automacoes.length}`}
        voltar
        acao={<BotaoIcone icone="add" cor={c.acaoTexto} fundo={c.acao} />}
      />

      <View style={{ backgroundColor: c.surface, paddingVertical: space[3] }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4] }}
        >
          {ABAS.map((a, i) => (
            <Chip key={a} texto={a} ativo={i === 0} />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', gap: space[2] }}>
          <Indicador numero={ativas} rotulo="Ativos" cor={c.success} />
          <Indicador numero="1.747" rotulo="Execuções" />
          <Indicador numero={1} rotulo="Com erro" cor={c.danger} />
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Fluxos" contagem={automacoes.length} />

          {automacoes.map((a) => (
            <Cartao key={a.id} style={{ gap: space[3] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: radius.md,
                    backgroundColor: a.ativa ? c.blueSoft : c.gray100,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="flash" size={17} color={a.ativa ? c.blue : c.textFaint} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>{a.nome}</Text>
                  <Secundario style={{ marginTop: 2 }}>{a.gatilho}</Secundario>
                </View>

                {/* Interruptor só desenhado — a tela ainda não liga nem desliga nada */}
                <View
                  style={{
                    width: 42,
                    height: 24,
                    borderRadius: 12,
                    padding: 2,
                    justifyContent: 'center',
                    alignItems: a.ativa ? 'flex-end' : 'flex-start',
                    backgroundColor: a.ativa ? c.acao : c.gray300,
                    borderWidth: a.ativa ? StyleSheet.hairlineWidth : 0,
                    borderColor: c.acaoBorda,
                  }}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' }} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[1] }}>
                <Selo texto={`${a.passos} passos`} icone="git-merge-outline" />
                <Selo texto={a.execucoes} icone="repeat-outline" />
              </View>
            </Cartao>
          ))}
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Modelos prontos" />
          <Cartao style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: radius.md,
                backgroundColor: c.iaSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="sparkles" size={16} color={c.ia} />
            </View>
            <View style={{ flex: 1 }}>
              <Corpo style={{ fontWeight: fontWeight.bold }}>Resposta imediata a lead novo</Corpo>
              <Secundario>Responde em até 1 minuto e marca a tarefa de qualificação</Secundario>
            </View>
            <Ionicons name="chevron-forward" size={16} color={c.textFaint} />
          </Cartao>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
