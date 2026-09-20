import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { negocioNaTela } from '@/api/adaptar';
import { usePermissoes } from '@/api/permissoes';
import { marcarDesfecho, moverNegocio, useConversas, useFunis } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { TagOrigem } from '@/components/funil';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import {
  Avatar,
  Botao,
  Cabecalho,
  Cartao,
  Chip,
  Corpo,
  Divisor,
  ListaVazia,
  Secundario,
  Selo,
  TituloSecao,
} from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

export default function NegocioScreen() {
  const { pode } = usePermissoes();
  if (!pode('funil')) return <TelaSemPermissao titulo="Negócio" modulo="o funil" voltar={true} />;

  return <Negocio />;
}

function Negocio() {
  const c = useCores();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const aoPerderSessao = useAoPerderSessao();

  const { dados, carregando, erro, recarregar } = useFunis(aoPerderSessao);
  const conversas = useConversas(aoPerderSessao);

  const [salvando, setSalvando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);

  const funis = dados ?? [];
  const achado = funis
    .flatMap((funil) =>
      funil.colunas.flatMap((coluna) => coluna.cards.map((card) => ({ card, coluna, funil }))),
    )
    .find((item) => item.card.id === id);

  async function comGravacao(acao: () => Promise<unknown>) {
    setSalvando(true);
    setFalha(null);
    try {
      await acao();
      recarregar();
    } catch (e) {
      setFalha(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  if (erro) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
        <Cabecalho titulo="Negócio" voltar />
        <FalhaAoCarregar mensagem={erro} aoTentar={recarregar} />
      </SafeAreaView>
    );
  }

  if (!achado) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
        <Cabecalho titulo="Negócio" voltar />
        {carregando ? (
          <Carregando texto="Buscando o negócio" />
        ) : (
          <ListaVazia
            icone="git-branch-outline"
            titulo="Negócio não encontrado"
            descricao="Ele pode ter sido movido ou removido do funil."
          />
        )}
      </SafeAreaView>
    );
  }

  const { card, coluna, funil } = achado;
  const negocio = negocioNaTela(card);
  const conversaDoContato = (conversas.dados ?? []).find((cv) => cv.nome === card.nome);
  const fechado = card.statusFechamento ?? null;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo={card.nome} sub={`${funil.nome} · ${coluna.titulo}`} voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[4] }}
        showsVerticalScrollIndicator={false}
      >
        {falha ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space[2],
              padding: space[3],
              borderRadius: radius.md,
              backgroundColor: c.dangerSoft,
            }}
          >
            <Ionicons name="alert-circle-outline" size={16} color={c.danger} />
            <Text style={{ flex: 1, color: c.danger, fontSize: fontSize.sm }}>{falha}</Text>
          </View>
        ) : null}

        <Cartao style={{ gap: space[3] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
            <Avatar iniciais={negocio.iniciais} tamanho={48} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.ink, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>{card.nome}</Text>
              <Secundario style={{ marginTop: 2 }}>{negocio.responsavel || 'Sem responsável'}</Secundario>
            </View>
          </View>

          <Text style={{ color: c.ink, fontSize: fontSize.display, fontWeight: fontWeight.bold, letterSpacing: -1 }}>
            {negocio.valor}
          </Text>

          <View style={{ flexDirection: 'row', gap: space[1], flexWrap: 'wrap', alignItems: 'center' }}>
            <TagOrigem origem={negocio.origem} />
            {negocio.dias ? <Selo texto={`${negocio.dias} nesta etapa`} icone="time-outline" /> : null}
            {negocio.etiquetas.map((e) => (
              <Selo key={e} texto={e} cor={c.blue} fundo={c.blueSoft} />
            ))}
          </View>

          {fechado ? (
            <View style={{ gap: space[2] }}>
              <Selo
                icone={fechado === 'ganho' ? 'trophy-outline' : 'close-circle-outline'}
                texto={fechado === 'ganho' ? 'Negócio ganho' : `Perdido${card.motivoPerda ? `: ${card.motivoPerda}` : ''}`}
                cor={fechado === 'ganho' ? c.success : c.danger}
                fundo={fechado === 'ganho' ? c.successSoft : c.dangerSoft}
              />
              <Botao
                titulo="Reabrir negócio"
                variante="secundario"
                icone="refresh-outline"
                bloco
                onPress={() => comGravacao(() => marcarDesfecho(funis, card.id, null))}
              />
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: space[2] }}>
              <Botao
                titulo={salvando ? 'Salvando…' : 'Ganho'}
                icone="trophy-outline"
                style={{ flex: 1 }}
                onPress={() => comGravacao(() => marcarDesfecho(funis, card.id, 'ganho'))}
              />
              <Botao
                titulo="Perdido"
                variante="perigo"
                icone="close-circle-outline"
                style={{ flex: 1 }}
                onPress={() => comGravacao(() => marcarDesfecho(funis, card.id, 'perdido'))}
              />
            </View>
          )}
        </Cartao>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Etapa" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space[2] }}>
            {funil.colunas.map((e) => (
              <Chip
                key={e.id}
                texto={e.titulo}
                ativo={e.id === coluna.id}
                desabilitado={salvando}
                onPress={() =>
                  e.id === coluna.id ? undefined : comGravacao(() => moverNegocio(card.id, e.id))
                }
              />
            ))}
          </ScrollView>
          <Secundario>Tocar numa etapa move o negócio e grava no CRM.</Secundario>
        </View>

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Relacionamento" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            <LinhaAcao
              icone="chatbubble-ellipses-outline"
              titulo="Abrir conversa"
              sub={conversaDoContato ? `${conversaDoContato.canal} · ${conversaDoContato.status}` : 'Sem conversa ligada a este contato'}
              onPress={conversaDoContato ? () => router.push(`/conversa/${conversaDoContato.id}`) : undefined}
            />
            <Divisor />
            <LinhaAcao
              icone="person-outline"
              titulo="Ver contato"
              sub="Dados, histórico e etiquetas"
              onPress={() => router.push(`/contatos/${card.id}`)}
            />
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
      <Cartao
        onPress={onPress}
        padding={space[3]}
        style={{
          borderWidth: 0,
          borderRadius: 0,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[3],
          opacity: onPress ? 1 : 0.5,
        }}
      >
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
        {onPress ? <Ionicons name="chevron-forward" size={16} color={c.textFaint} /> : null}
      </Cartao>
    );
  }
}
