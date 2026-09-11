import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotaoIcone, Cabecalho, Cartao, Corpo, Indicador, Secundario, Selo, TituloSecao } from '@/components/ui';
import { formularios } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

/** Formulários de captação: quantas respostas chegaram e o que virou lead. */
export default function FormulariosScreen() {
  const c = useCores();
  const total = formularios.reduce((soma, f) => soma + f.respostas, 0);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Formulários"
        sub={`${formularios.length} formulários · ${total} respostas`}
        voltar
        acao={<BotaoIcone icone="add" cor={c.acaoTexto} fundo={c.acao} />}
      />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', gap: space[2] }}>
          <Indicador numero={total} rotulo="Respostas" />
          <Indicador numero="26%" rotulo="Conversão média" cor={c.success} />
          <Indicador numero={2} rotulo="Publicados" />
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Seus formulários" contagem={formularios.length} />

          {formularios.map((f) => (
            <Cartao key={f.id} style={{ gap: space[3] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: radius.md,
                    backgroundColor: c.gray100,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="document-text-outline" size={17} color={c.ink} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                    {f.nome}
                  </Text>
                </View>
                <Selo
                  texto={f.ativo ? 'Publicado' : 'Rascunho'}
                  cor={f.ativo ? c.success : c.textMuted}
                  fundo={f.ativo ? c.successSoft : c.gray100}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: space[5] }}>
                <View>
                  <Corpo style={{ fontWeight: fontWeight.bold }}>{f.respostas}</Corpo>
                  <Secundario>respostas</Secundario>
                </View>
                <View>
                  <Corpo style={{ fontWeight: fontWeight.bold }}>{f.conversao}</Corpo>
                  <Secundario>viraram lead</Secundario>
                </View>
                <View style={{ flex: 1 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                  <BotaoIcone icone="link-outline" />
                  <BotaoIcone icone="eye-outline" />
                </View>
              </View>
            </Cartao>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
