import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePermissoes } from '@/api/permissoes';
import { useCanais, useFunis } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { Cabecalho, Cartao, Divisor, LinhaMenu, Secundario, Selo, TituloSecao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';

/**
 * Painel de configurações por categoria. No web são duas colunas; aqui a coluna da esquerda
 * vira esta lista e cada categoria abre a própria tela.
 */
export default function ConfiguracoesScreen() {
  const { pode } = usePermissoes();
  if (!pode('configuracoes')) return <TelaSemPermissao titulo="Configurações" modulo="configurações" voltar={true} />;

  return <Configuracoes />;
}

function Configuracoes() {
  const c = useCores();
  const router = useRouter();
  const aoPerderSessao = useAoPerderSessao();

  const { dados: canais } = useCanais(aoPerderSessao);
  const { dados: funis } = useFunis(aoPerderSessao);

  const conectados = (canais ?? []).filter((canal) => canal.conectado).length;
  const etapas = (funis ?? []).reduce((soma, f) => soma + f.colunas.length, 0);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Configurações" sub="Workspace, canais e segurança" voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="No aplicativo" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            <LinhaMenu
              icone="color-palette-outline"
              titulo="Aparência"
              sub="Tema claro, escuro ou do sistema"
              onPress={() => router.push('/configuracoes/aparencia')}
            />
            <Divisor />
            <LinhaMenu
              icone="notifications-outline"
              titulo="Notificações"
              sub="O que merece interromper"
              onPress={() => router.push('/configuracoes/notificacoes')}
            />
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Workspace" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            <LinhaMenu
              icone="chatbubbles-outline"
              titulo="Canais e integrações"
              sub={conectados === 1 ? '1 canal conectado' : `${conectados} canais conectados`}
              onPress={() => router.push('/configuracoes/conexoes')}
            />
            <Divisor />
            <LinhaMenu
              icone="git-branch-outline"
              titulo="Funis e etapas"
              sub={`${(funis ?? []).length} funis · ${etapas} etapas`}
              onPress={() => router.push('/funil')}
            />
            <Divisor />
            <LinhaMenu
              icone="shield-checkmark-outline"
              titulo="Segurança"
              sub="Senha, sessões e permissões"
              onPress={() => router.push('/configuracoes/seguranca')}
            />
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Assinatura" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            <LinhaMenu
              icone="card-outline"
              titulo="Plano e pagamento"
              sub="Geridos no site do CRM"
              direita={<Selo texto="No site" />}
            />
          </Cartao>
          <Secundario>
            Etiquetas, auditoria e importação de dados ficam no CRM pelo computador — são telas de
            tabela larga, que não caberiam aqui sem virar outra coisa.
          </Secundario>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
