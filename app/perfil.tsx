import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Botao, Cabecalho, Campo, Cartao, Divisor, LinhaMenu, Secundario, TituloSecao } from '@/components/ui';
import { usuario } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, space } from '@/theme/tokens';

/** Perfil de quem está logado: dados pessoais, acesso e sessão. */
export default function PerfilScreen() {
  const c = useCores();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Meu perfil" sub={usuario.workspace} voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <Cartao style={{ alignItems: 'center', gap: space[3] }}>
          <Avatar iniciais={usuario.iniciais} tamanho={76} />
          <View style={{ alignItems: 'center', gap: 3 }}>
            <Text style={{ color: c.ink, fontSize: fontSize.xl, fontWeight: fontWeight.bold, letterSpacing: -0.3 }}>
              {usuario.nome}
            </Text>
            <Secundario>
              {usuario.cargo} · Administrador
            </Secundario>
          </View>
          <Botao titulo="Trocar foto" variante="secundario" icone="camera-outline" />
        </Cartao>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Dados pessoais" />
          <Cartao style={{ gap: space[4] }}>
            <Campo rotulo="Nome" valor={usuario.nome} />
            <Campo rotulo="E-mail" valor={usuario.email} teclado="email-address" />
            <Campo rotulo="Cargo" valor={usuario.cargo} />
            <Campo rotulo="WhatsApp" valor="(62) 99999-0000" teclado="phone-pad" />
            <Botao titulo="Salvar alterações" bloco />
          </Cartao>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Acesso" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            <LinhaMenu icone="lock-closed-outline" titulo="Alterar senha" sub="Última troca há 3 meses" />
            <Divisor />
            <LinhaMenu icone="shield-checkmark-outline" titulo="Verificação em duas etapas" sub="Desativada" />
            <Divisor />
            <LinhaMenu icone="phone-portrait-outline" titulo="Dispositivos conectados" sub="2 sessões ativas" />
          </Cartao>
        </View>

        <Botao titulo="Sair da conta" variante="perigo" icone="log-out-outline" bloco onPress={() => router.replace('/login')} />
      </ScrollView>
    </SafeAreaView>
  );
}
