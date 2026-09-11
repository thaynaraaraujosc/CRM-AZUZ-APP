import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, BotaoIcone, Cabecalho, Cartao, Corpo, Indicador, Secundario, Selo, TituloSecao } from '@/components/ui';
import { equipe } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, space } from '@/theme/tokens';

/** Quem trabalha no workspace, com carga de atendimento e papel de acesso. */
export default function EquipeScreen() {
  const c = useCores();
  const online = equipe.filter((m) => m.online).length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Equipe"
        sub={`${equipe.length} pessoas · ${online} online`}
        voltar
        acao={<BotaoIcone icone="person-add-outline" cor={c.acaoTexto} fundo={c.acao} />}
      />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', gap: space[2] }}>
          <Indicador numero={equipe.length} rotulo="Pessoas" />
          <Indicador numero={online} rotulo="Online" cor={c.success} />
          <Indicador numero={61} rotulo="Conversas" />
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Membros" contagem={equipe.length} />
          {equipe.map((m) => (
            <Cartao key={m.id} style={{ gap: space[3] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                <View>
                  <Avatar iniciais={m.iniciais} tamanho={44} />
                  <View
                    style={{
                      position: 'absolute',
                      right: 0,
                      bottom: 0,
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: m.online ? c.success : c.gray300,
                      borderWidth: 2,
                      borderColor: c.surface,
                    }}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.inkNome, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                    {m.nome}
                  </Text>
                  <Secundario style={{ marginTop: 2 }}>{m.cargo}</Secundario>
                </View>

                <Selo
                  texto={m.papel}
                  cor={m.papel === 'Administrador' ? c.blue : c.textMuted}
                  fundo={m.papel === 'Administrador' ? c.blueSoft : c.gray100}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: space[4] }}>
                <View>
                  <Corpo style={{ fontWeight: fontWeight.bold }}>{m.conversas}</Corpo>
                  <Secundario>conversas</Secundario>
                </View>
                <View>
                  <Corpo style={{ fontWeight: fontWeight.bold }}>{m.negocios}</Corpo>
                  <Secundario>negócios abertos</Secundario>
                </View>
              </View>
            </Cartao>
          ))}
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Convites pendentes" contagem={1} />
          <Cartao style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <Avatar iniciais="?" tamanho={40} />
            <View style={{ flex: 1 }}>
              <Corpo style={{ fontWeight: fontWeight.bold }}>carlos@empresademo.com.br</Corpo>
              <Secundario>Convidado há 2 dias · papel Vendedor</Secundario>
            </View>
            <Selo texto="Pendente" cor={c.warning} fundo={c.warningSoft} />
          </Cartao>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
