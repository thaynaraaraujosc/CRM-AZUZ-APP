import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TagOrigem } from '@/components/funil';
import { Avatar, Botao, Cabecalho, Cartao, Chip, Corpo, Divisor, Secundario, Selo, TituloSecao } from '@/components/ui';
import { etapasFunil } from '@/mock/dados';
import { usePermissoes } from '@/api/permissoes';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

/** Negócio aberto — valor, etapa atual, responsável e o que já aconteceu nele. */
export default function NegocioScreen() {
  const { pode } = usePermissoes();
  if (!pode('funil')) return <TelaSemPermissao titulo="Negócio" modulo="o funil" voltar={true} />;

  const c = useCores();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const todos = etapasFunil.flatMap((e) => e.cards.map((card) => ({ card, etapa: e.titulo })));
  const encontrado = todos.find((t) => t.card.id === id) ?? todos[0];
  const { card: negocio, etapa } = encontrado;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo={negocio.nome} sub={`Funil comercial · ${etapa}`} voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[4] }}
        showsVerticalScrollIndicator={false}
      >
        <Cartao style={{ gap: space[3] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <Avatar iniciais={negocio.iniciais} tamanho={48} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.ink, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>{negocio.nome}</Text>
              <Secundario style={{ marginTop: 2 }}>{negocio.responsavel || 'Sem responsável'}</Secundario>
            </View>
          </View>

          <Text style={{ color: c.ink, fontSize: fontSize.display, fontWeight: fontWeight.bold, letterSpacing: -1 }}>
            {negocio.valor}
          </Text>

          <View style={{ flexDirection: 'row', gap: space[1], flexWrap: 'wrap' }}>
            <TagOrigem origem={negocio.origem} />
            <Selo texto={`${negocio.dias} nesta etapa`} icone="time-outline" />
            {negocio.etiquetas.map((e) => (
              <Selo key={e} texto={e} cor={c.blue} fundo={c.blueSoft} />
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Botao titulo="Ganho" icone="trophy-outline" style={{ flex: 1 }} />
            <Botao titulo="Perdido" variante="perigo" icone="close-circle-outline" style={{ flex: 1 }} />
          </View>
        </Cartao>

        {/* Etapa atual dentro do funil */}
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Etapa" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space[2] }}>
            {etapasFunil.map((e) => (
              <Chip key={e.id} texto={e.titulo} ativo={e.titulo === etapa} />
            ))}
          </ScrollView>
        </View>

        {/* Atalhos do relacionamento */}
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Relacionamento" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            <LinhaAcao
              icone="chatbubble-ellipses-outline"
              titulo="Abrir conversa"
              sub="WhatsApp · última mensagem há 6 min"
              onPress={() => router.push('/conversa/marcos-aurelio')}
            />
            <Divisor />
            <LinhaAcao
              icone="person-outline"
              titulo="Ver contato"
              sub="Dados, histórico e etiquetas"
              onPress={() => router.push('/contatos/marcos-aurelio')}
            />
            <Divisor />
            <LinhaAcao icone="checkbox-outline" titulo="Criar tarefa" sub="Com prazo e responsável" />
            <Divisor />
            <LinhaAcao icone="document-attach-outline" titulo="Anexar documento" sub="Proposta, contrato, comprovante" />
          </Cartao>
        </View>

        {/* Anotações */}
        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Anotações" acao="Adicionar" />
          <Cartao style={{ gap: space[2] }}>
            <Corpo>Cliente pediu para retomar depois do dia 15. Tem interesse no pacote completo, mas quer parcelar em 3x.</Corpo>
            <Secundario>Bruno Salles · há 2 dias</Secundario>
          </Cartao>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function LinhaAcao({
    icone,
    titulo,
    sub,
    onPress,
  }: {
    icone: keyof typeof Ionicons.glyphMap;
    titulo: string;
    sub: string;
    onPress?: () => void;
  }) {
    return (
      <Cartao onPress={onPress} padding={space[3]} style={{ borderWidth: 0, borderRadius: 0, flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: radius.md,
            backgroundColor: c.gray100,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icone} size={16} color={c.ink} />
        </View>
        <View style={{ flex: 1 }}>
          <Corpo style={{ fontWeight: fontWeight.bold }}>{titulo}</Corpo>
          <Secundario numberOfLines={1}>{sub}</Secundario>
        </View>
        <Ionicons name="chevron-forward" size={16} color={c.textFaint} />
      </Cartao>
    );
  }
}
