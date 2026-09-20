import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Interruptor } from '@/components/Interruptor';
import { Cabecalho, Cartao, Divisor, LinhaMenu, Secundario, TituloSecao } from '@/components/ui';
import { usePermissoes } from '@/api/permissoes';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { useCores } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';

const NO_APARELHO = [
  { icone: 'chatbubble-ellipses-outline', titulo: 'Mensagem nova', sub: 'Qualquer canal conectado', ligado: true },
  { icone: 'person-add-outline', titulo: 'Lead novo', sub: 'Entrou por anúncio ou formulário', ligado: true },
  { icone: 'checkbox-outline', titulo: 'Tarefa vencendo', sub: 'Aviso 30 minutos antes', ligado: true },
  { icone: 'trophy-outline', titulo: 'Negócio ganho ou perdido', sub: 'Movimentação do funil', ligado: false },
  { icone: 'flash-outline', titulo: 'Automação com erro', sub: 'Fluxo parado no meio', ligado: true },
] as const;

const POR_EMAIL = [
  { icone: 'today-outline', titulo: 'Resumo diário', sub: 'Todo dia às 8h', ligado: true },
  { icone: 'stats-chart-outline', titulo: 'Relatório semanal', sub: 'Segunda-feira de manhã', ligado: false },
] as const;

/** O que o CRM avisa, e por onde. */
export default function NotificacoesConfigScreen() {
  const { pode } = usePermissoes();
  if (!pode('configuracoes')) return <TelaSemPermissao titulo="Notificações" modulo="configurações" voltar={true} />;

  const c = useCores();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Notificações" sub="Escolha o que merece interromper" voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="No aparelho" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            {NO_APARELHO.map((n, i) => (
              <View key={n.titulo}>
                {i > 0 ? <Divisor /> : null}
                <LinhaMenu icone={n.icone} titulo={n.titulo} sub={n.sub} direita={<Interruptor ligado={n.ligado} />} />
              </View>
            ))}
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Por e-mail" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            {POR_EMAIL.map((n, i) => (
              <View key={n.titulo}>
                {i > 0 ? <Divisor /> : null}
                <LinhaMenu icone={n.icone} titulo={n.titulo} sub={n.sub} direita={<Interruptor ligado={n.ligado} />} />
              </View>
            ))}
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Silenciar" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            <LinhaMenu icone="moon-outline" titulo="Não perturbe" sub="22:00 às 07:00" direita={<Interruptor ligado={false} />} />
            <Divisor />
            <LinhaMenu icone="calendar-outline" titulo="Fim de semana" sub="Nada de sábado e domingo" direita={<Interruptor ligado={true} />} />
          </Cartao>
          <Secundario>Urgência de conversa ignora o silêncio — lead que espera converte menos.</Secundario>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
