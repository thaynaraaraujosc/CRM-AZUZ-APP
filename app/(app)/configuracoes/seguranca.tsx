import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Interruptor } from '@/components/Interruptor';
import { Avatar, Botao, Cabecalho, Cartao, Corpo, Divisor, LinhaMenu, Secundario, Selo, TituloSecao } from '@/components/ui';
import { equipe } from '@/mock/dados';
import { usePermissoes } from '@/api/permissoes';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { useCores } from '@/theme/ThemeContext';
import { fontWeight, space } from '@/theme/tokens';

const SESSOES = [
  { id: 's1', aparelho: 'iPhone 15 — este aparelho', onde: 'Goiânia, GO · agora', atual: true },
  { id: 's2', aparelho: 'Chrome — macOS', onde: 'Goiânia, GO · há 2h', atual: false },
];

/** Senha, dupla verificação, sessões abertas e quem tem qual papel. */
export default function SegurancaScreen() {
  const { pode } = usePermissoes();
  if (!pode('configuracoes')) return <TelaSemPermissao titulo="Segurança" modulo="configurações" voltar={true} />;

  const c = useCores();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Segurança" sub="Acesso ao workspace" voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Acesso" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            <LinhaMenu icone="lock-closed-outline" titulo="Alterar senha" sub="Última troca há 3 meses" />
            <Divisor />
            <LinhaMenu
              icone="shield-checkmark-outline"
              titulo="Verificação em duas etapas"
              sub="Código por e-mail a cada novo aparelho"
              direita={<Interruptor ligado={false} />}
            />
            <Divisor />
            <LinhaMenu
              icone="finger-print-outline"
              titulo="Desbloqueio biométrico"
              sub="Face ID para abrir o aplicativo"
              direita={<Interruptor ligado={true} />}
            />
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Sessões abertas" contagem={SESSOES.length} />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            {SESSOES.map((s, i) => (
              <View key={s.id}>
                {i > 0 ? <Divisor /> : null}
                <LinhaMenu
                  icone={s.atual ? 'phone-portrait-outline' : 'desktop-outline'}
                  titulo={s.aparelho}
                  sub={s.onde}
                  direita={s.atual ? <Selo texto="Atual" cor={c.success} fundo={c.successSoft} /> : <Selo texto="Encerrar" cor={c.danger} fundo={c.dangerSoft} />}
                />
              </View>
            ))}
          </Cartao>
          <Botao titulo="Encerrar todas as outras sessões" variante="perigo" bloco />
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Permissões da equipe" />
          <Cartao style={{ gap: space[3] }}>
            {equipe.map((m) => (
              <View key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                <Avatar iniciais={m.iniciais} tamanho={34} />
                <View style={{ flex: 1 }}>
                  <Corpo style={{ fontWeight: fontWeight.bold }}>{m.nome}</Corpo>
                  <Secundario>{m.cargo}</Secundario>
                </View>
                <Selo
                  texto={m.papel}
                  cor={m.papel === 'Administrador' ? c.blue : c.textMuted}
                  fundo={m.papel === 'Administrador' ? c.blueSoft : c.gray100}
                />
              </View>
            ))}
          </Cartao>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
