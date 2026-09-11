import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Cabecalho, Cartao, Corpo, Divisor, Secundario, Selo, TituloSecao } from '@/components/ui';
import { contatos } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { corDaOrigem, fontSize, fontWeight, radius, space } from '@/theme/tokens';

const LINHA_DO_TEMPO = [
  { id: 'l1', icone: 'chatbubble-ellipses-outline', texto: 'Respondeu no WhatsApp', quando: 'há 6 min' },
  { id: 'l2', icone: 'git-branch-outline', texto: 'Movido para Qualificado', quando: 'há 2 dias' },
  { id: 'l3', icone: 'document-text-outline', texto: 'Preencheu o formulário de captação', quando: 'há 3 dias' },
  { id: 'l4', icone: 'megaphone-outline', texto: 'Entrou pelo anúncio "Pacote completo — julho"', quando: 'há 3 dias' },
] as const;

/** Ficha do contato: identidade, dados, contexto comercial e histórico. */
export default function ContatoScreen() {
  const c = useCores();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const contato = contatos.find((ct) => ct.id === id) ?? contatos[0];

  function Dado({ rotulo, valor, icone }: { rotulo: string; valor: string; icone: keyof typeof Ionicons.glyphMap }) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[3] }}>
        <Ionicons name={icone} size={16} color={c.textFaint} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.textFaint, fontSize: fontSize.xs }}>{rotulo}</Text>
          <Text style={{ color: c.ink, fontSize: fontSize.base, marginTop: 1 }}>{valor}</Text>
        </View>
      </View>
    );
  }

  function AcaoRedonda({ icone, rotulo, onPress }: { icone: keyof typeof Ionicons.glyphMap; rotulo: string; onPress?: () => void }) {
    return (
      <Pressable onPress={onPress} style={{ alignItems: 'center', gap: 6, flex: 1 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            backgroundColor: c.gray100,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icone} size={19} color={c.ink} />
        </View>
        <Text style={{ color: c.textMuted, fontSize: fontSize.xs, fontWeight: fontWeight.bold }}>{rotulo}</Text>
      </Pressable>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo={contato.nome} sub={contato.cidade} voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[4] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Identidade */}
        <Cartao style={{ alignItems: 'center', gap: space[3] }}>
          <Avatar iniciais={contato.iniciais} tamanho={72} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ color: c.ink, fontSize: fontSize.xl, fontWeight: fontWeight.bold, letterSpacing: -0.3 }}>
              {contato.nome}
            </Text>
            <Secundario>{contato.responsavel ? `Responsável: ${contato.responsavel}` : 'Sem responsável'}</Secundario>
          </View>

          <View style={{ flexDirection: 'row', gap: space[1], flexWrap: 'wrap', justifyContent: 'center' }}>
            <Selo texto={contato.origem} cor={corDaOrigem[contato.origem]} fundo={c.gray100} />
            <Selo texto={contato.etapa} />
            {contato.etiquetas.map((e) => (
              <Selo key={e} texto={e} cor={c.blue} fundo={c.blueSoft} />
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: space[2], alignSelf: 'stretch', marginTop: space[2] }}>
            <AcaoRedonda icone="chatbubble-outline" rotulo="Conversar" onPress={() => router.push(`/conversa/${contato.id}`)} />
            <AcaoRedonda icone="call-outline" rotulo="Ligar" />
            <AcaoRedonda icone="calendar-outline" rotulo="Agendar" onPress={() => router.push('/agenda')} />
            <AcaoRedonda icone="checkbox-outline" rotulo="Tarefa" />
          </View>
        </Cartao>

        {/* Contexto comercial */}
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Negócio" />
          <Cartao style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <View style={{ flex: 1 }}>
              <Corpo style={{ fontWeight: fontWeight.bold }}>Funil comercial · {contato.etapa}</Corpo>
              <Secundario style={{ marginTop: 2 }}>Última interação {contato.ultima.toLowerCase()}</Secundario>
            </View>
            <Text style={{ color: c.ink, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}>{contato.valor}</Text>
          </Cartao>
        </View>

        {/* Dados */}
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Dados" acao="Editar" />
          <Cartao padding={space[4]} style={{ paddingVertical: 0 }}>
            <Dado rotulo="E-mail" valor={contato.email} icone="mail-outline" />
            <Divisor />
            <Dado rotulo="WhatsApp" valor={contato.whatsapp} icone="logo-whatsapp" />
            <Divisor />
            <Dado rotulo="Cidade" valor={contato.cidade} icone="location-outline" />
            <Divisor />
            <Dado rotulo="Origem" valor={contato.origem} icone="megaphone-outline" />
          </Cartao>
        </View>

        {/* Histórico */}
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Histórico" />
          <Cartao style={{ gap: space[4] }}>
            {LINHA_DO_TEMPO.map((evento, i) => (
              <View key={evento.id} style={{ flexDirection: 'row', gap: space[3] }}>
                <View style={{ alignItems: 'center' }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: c.gray100,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={evento.icone} size={14} color={c.textMuted} />
                  </View>
                  {i < LINHA_DO_TEMPO.length - 1 ? (
                    <View style={{ width: 1, flex: 1, backgroundColor: c.line, marginTop: 4 }} />
                  ) : null}
                </View>
                <View style={{ flex: 1, paddingBottom: space[2] }}>
                  <Corpo>{evento.texto}</Corpo>
                  <Secundario style={{ marginTop: 2 }}>{evento.quando}</Secundario>
                </View>
              </View>
            ))}
          </Cartao>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
