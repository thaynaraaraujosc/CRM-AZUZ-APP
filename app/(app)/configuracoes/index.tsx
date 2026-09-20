import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cabecalho, Cartao, Divisor, LinhaMenu, Selo, TituloSecao } from '@/components/ui';
import { usePermissoes } from '@/api/permissoes';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { useCores } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';

/**
 * Painel de configurações por categoria. No web são duas colunas; aqui a coluna da esquerda
 * vira esta lista e cada categoria abre a própria tela.
 */
export default function ConfiguracoesScreen() {
  const { pode } = usePermissoes();
  if (!pode('configuracoes')) return <TelaSemPermissao titulo="Configurações" modulo="configurações" voltar={true} />;

  const c = useCores();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Configurações" sub="Workspace, canais e segurança" voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Workspace" />
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
              sub="O que avisa, e por qual canal"
              onPress={() => router.push('/configuracoes/notificacoes')}
            />
            <Divisor />
            <LinhaMenu icone="pricetags-outline" titulo="Etiquetas" sub="6 etiquetas em uso" />
            <Divisor />
            <LinhaMenu icone="git-branch-outline" titulo="Funis e etapas" sub="2 funis · 8 etapas" />
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Canais e integrações" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            <LinhaMenu
              icone="logo-whatsapp"
              titulo="WhatsApp"
              sub="2 números conectados"
              direita={<Selo texto="Conectado" cor={c.success} fundo={c.successSoft} />}
              onPress={() => router.push('/configuracoes/conexoes')}
            />
            <Divisor />
            <LinhaMenu
              icone="logo-instagram"
              titulo="Instagram"
              sub="@empresademo"
              direita={<Selo texto="Conectado" cor={c.success} fundo={c.successSoft} />}
              onPress={() => router.push('/configuracoes/conexoes')}
            />
            <Divisor />
            <LinhaMenu
              icone="mail-outline"
              titulo="E-mail"
              sub="Nenhuma caixa conectada"
              direita={<Selo texto="Pendente" cor={c.warning} fundo={c.warningSoft} />}
              onPress={() => router.push('/configuracoes/conexoes')}
            />
            <Divisor />
            <LinhaMenu
              icone="extension-puzzle-outline"
              titulo="Outras integrações"
              sub="Meta Ads, Google Ads, Google Agenda"
              onPress={() => router.push('/configuracoes/conexoes')}
            />
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Conta" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            <LinhaMenu
              icone="shield-checkmark-outline"
              titulo="Segurança"
              sub="Senha, sessões e permissões"
              onPress={() => router.push('/configuracoes/seguranca')}
            />
            <Divisor />
            <LinhaMenu icone="time-outline" titulo="Auditoria" sub="Quem fez o quê, e quando" />
            <Divisor />
            <LinhaMenu icone="cloud-download-outline" titulo="Importação de dados" sub="Planilha ou outro CRM" />
            <Divisor />
            <LinhaMenu
              icone="card-outline"
              titulo="Assinatura"
              sub="Plano e pagamento são geridos no site"
              direita={<Selo texto="No site" />}
            />
          </Cartao>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
