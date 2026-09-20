import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { conversaNaTela } from '@/api/adaptar';
import { usePermissoes } from '@/api/permissoes';
import { criarConversa, mudarConversa, useConversas } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import type { Conversa } from '@/api/tipos';
import { LinhaConversa } from '@/components/cards';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { FolhaDeCriacao } from '@/components/FolhaDeCriacao';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { Aviso, BarraBusca, BotaoIcone, Cabecalho, Campo, Chip, Divisor, LinhaMenu, ListaVazia } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

/** Situação da conversa. Mesmos nomes da web. */
const SITUACOES = [
  { valor: 'tudo', rotulo: 'Tudo' },
  { valor: 'nao-lidas', rotulo: 'Não lidas' },
  { valor: 'favoritas', rotulo: 'Favoritas' },
  { valor: 'arquivadas', rotulo: 'Arquivadas' },
] as const;

/**
 * Canal fica numa linha separada da situação, como na web, porque são coisas independentes: dá
 * para querer "não lidas do Instagram". São os dois canais que recebem mensagem hoje, e um deles
 * está sempre escolhido — a caixa de entrada é de um canal por vez.
 */
const CANAIS = [
  { valor: 'WhatsApp', rotulo: 'WhatsApp' },
  { valor: 'Instagram', rotulo: 'Instagram' },
] as const;

type Situacao = (typeof SITUACOES)[number]['valor'];
type Canal = (typeof CANAIS)[number]['valor'];

export default function ConversasScreen() {
  const { pode } = usePermissoes();
  if (!pode('conversas')) return <TelaSemPermissao titulo="Conversas" modulo="conversas" voltar={false} />;

  return <Conversas />;
}

function Conversas() {
  const c = useCores();
  const router = useRouter();
  const aoPerderSessao = useAoPerderSessao();
  const { dados, carregando, erro, recarregar } = useConversas(aoPerderSessao);

  const [situacao, setSituacao] = useState<Situacao>('tudo');
  const [canal, setCanal] = useState<Canal>('WhatsApp');
  const [busca, setBusca] = useState('');

  const [abrindoNova, setAbrindoNova] = useState(false);
  const [nomeNovo, setNomeNovo] = useState('');
  const [telefoneNovo, setTelefoneNovo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [falhaAoCriar, setFalhaAoCriar] = useState<string | null>(null);

  /** Conversa que está com o menu de ações aberto (toque longo na linha). */
  const [comMenu, setComMenu] = useState<Conversa | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const todas = dados ?? [];

  function combina(cv: Conversa, sit: Situacao, can: Canal): boolean {
    // Arquivada só aparece quando é ela que está sendo pedida — igual à web.
    if (sit === 'arquivadas') {
      if (!cv.arquivada) return false;
    } else if (cv.arquivada) {
      return false;
    }
    if (sit === 'nao-lidas' && !(cv.naoLidas ?? 0)) return false;
    if (sit === 'favoritas' && !cv.favorita) return false;
    if (cv.canal !== can) return false;
    return true;
  }

  function combinaComABusca(cv: Conversa): boolean {
    const termo = busca.trim().toLowerCase();
    if (!termo) return true;
    return [cv.nome, cv.contato, cv.status, cv.responsavel ?? ''].some((campo) =>
      campo?.toLowerCase().includes(termo),
    );
  }

  async function nova() {
    if (!nomeNovo.trim()) {
      setFalhaAoCriar('Escreva o nome da pessoa.');
      return;
    }
    if (!telefoneNovo.trim()) {
      setFalhaAoCriar('Escreva o WhatsApp com DDD.');
      return;
    }

    setSalvando(true);
    setFalhaAoCriar(null);
    try {
      const criada = await criarConversa(nomeNovo.trim(), telefoneNovo.replace(/[^0-9]/g, ''));
      setAbrindoNova(false);
      setNomeNovo('');
      setTelefoneNovo('');
      recarregar();
      if (criada?.id) router.push(`/conversa/${criada.id}`);
    } catch (e) {
      setFalhaAoCriar(e instanceof Error ? e.message : 'Não deu para abrir a conversa.');
    } finally {
      setSalvando(false);
    }
  }

  async function mudar(cv: Conversa, dados: Parameters<typeof mudarConversa>[1], confirmacao: string) {
    setComMenu(null);
    setAviso(null);
    try {
      await mudarConversa(cv.id, dados);
      recarregar();
      setAviso(confirmacao);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'Não deu para mudar essa conversa.');
    }
  }

  const visiveis = todas.filter((cv) => combina(cv, situacao, canal) && combinaComABusca(cv)).map(conversaNaTela);
  const naoLidas = todas.filter((cv) => combina(cv, 'nao-lidas', canal) && combinaComABusca(cv)).length;

  /** Contagem de cada chip, respeitando o outro filtro que já está ligado. */
  const quantosNaSituacao = (valor: Situacao) => todas.filter((cv) => combina(cv, valor, canal)).length;
  const quantosNoCanal = (valor: Canal) => todas.filter((cv) => combina(cv, situacao, valor)).length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Conversas"
        sub={
          carregando
            ? 'Carregando…'
            : `${visiveis.length === 1 ? '1 conversa' : `${visiveis.length} conversas`} · ${naoLidas} não lidas`
        }
        acao={
          <BotaoIcone
            icone="add"
            cor={c.acaoTexto}
            fundo={c.acao}
            onPress={() => {
              setFalhaAoCriar(null);
              setAbrindoNova(true);
            }}
          />
        }
      />

      <View style={{ backgroundColor: c.surface, paddingTop: space[3], gap: space[2] }}>
        <View style={{ paddingHorizontal: space[4] }}>
          <BarraBusca placeholder="Buscar contato, status ou responsável" valor={busca} aoMudar={setBusca} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4] }}
        >
          {SITUACOES.map((s) => (
            <Chip
              key={s.valor}
              texto={s.valor === 'tudo' ? s.rotulo : `${s.rotulo} (${quantosNaSituacao(s.valor)})`}
              ativo={situacao === s.valor}
              onPress={() => setSituacao(s.valor)}
            />
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4], paddingBottom: space[3] }}
        >
          {CANAIS.map((ch) => {
            const quantidade = quantosNoCanal(ch.valor);
            return (
              <Chip
                key={ch.valor}
                texto={quantidade > 0 ? `${ch.rotulo} (${quantidade})` : ch.rotulo}
                ativo={canal === ch.valor}
                onPress={() => setCanal(ch.valor)}
              />
            );
          })}
        </ScrollView>
      </View>

      {erro ? (
        <FalhaAoCarregar mensagem={erro} aoTentar={recarregar} />
      ) : carregando && todas.length === 0 ? (
        <Carregando texto="Buscando suas conversas" />
      ) : (
        <FlatList
          data={visiveis}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LinhaConversa
              conversa={item}
              onPress={() => router.push(`/conversa/${item.id}`)}
              onLongPress={() => setComMenu(todas.find((cv) => cv.id === item.id) ?? null)}
            />
          )}
          contentContainerStyle={{ padding: space[4], gap: 7 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={c.blue} />}
          ListEmptyComponent={
            <ListaVazia
              icone="chatbubbles-outline"
              titulo={todas.length === 0 ? 'Nenhuma conversa ainda' : 'Nada com esses filtros'}
              descricao={
                todas.length === 0
                  ? 'Quando um lead chamar por um canal conectado, ele aparece aqui.'
                  : `Nenhuma conversa de ${canal} com esses filtros. Toque no outro canal para ver.`
              }
            />
          }
        />
      )}

      {aviso ? (
        <View style={{ position: 'absolute', left: space[4], right: space[4], bottom: space[4] }}>
          <Pressable onPress={() => setAviso(null)}>
            <Aviso texto={aviso} />
          </Pressable>
        </View>
      ) : null}

      <FolhaDeCriacao
        aberta={abrindoNova}
        titulo="Nova conversa"
        descricao="Para escrever primeiro para alguém que ainda não chamou."
        salvando={salvando}
        erro={falhaAoCriar}
        aoFechar={() => setAbrindoNova(false)}
        aoSalvar={nova}
        rotuloSalvar="Abrir conversa"
      >
        <Campo rotulo="Nome" placeholder="Nome de quem vai receber" valor={nomeNovo} aoMudar={setNomeNovo} />
        <Campo
          rotulo="WhatsApp"
          placeholder="(62) 99999-0000"
          valor={telefoneNovo}
          aoMudar={setTelefoneNovo}
          teclado="phone-pad"
        />
      </FolhaDeCriacao>

      {/* Toque longo numa conversa abre o que dá para fazer com ela sem entrar. */}
      <Modal visible={comMenu !== null} transparent animationType="fade" onRequestClose={() => setComMenu(null)}>
        <Pressable
          onPress={() => setComMenu(null)}
          style={{ flex: 1, backgroundColor: 'rgba(11, 21, 51, 0.35)', justifyContent: 'flex-end' }}
        >
          <View
            style={{
              backgroundColor: c.surface,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingVertical: space[3],
              paddingBottom: space[6],
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: c.ink,
                fontSize: fontSize.md,
                fontWeight: fontWeight.bold,
                paddingHorizontal: space[4],
                paddingBottom: space[2],
              }}
            >
              {comMenu?.nome}
            </Text>
            <Divisor />

            {comMenu ? (
              <>
                <LinhaMenu
                  icone={comMenu.favorita ? 'star' : 'star-outline'}
                  titulo={comMenu.favorita ? 'Tirar dos favoritos' : 'Favoritar'}
                  onPress={() =>
                    mudar(
                      comMenu,
                      { favorita: !comMenu.favorita },
                      comMenu.favorita ? 'Saiu dos favoritos.' : 'Conversa favoritada.',
                    )
                  }
                />
                <Divisor />
                <LinhaMenu
                  icone={(comMenu.naoLidas ?? 0) > 0 ? 'mail-open-outline' : 'mail-unread-outline'}
                  titulo={(comMenu.naoLidas ?? 0) > 0 ? 'Marcar como lida' : 'Marcar como não lida'}
                  onPress={() =>
                    mudar(
                      comMenu,
                      { naoLidas: (comMenu.naoLidas ?? 0) > 0 ? 0 : 1 },
                      (comMenu.naoLidas ?? 0) > 0 ? 'Marcada como lida.' : 'Marcada como não lida.',
                    )
                  }
                />
                <Divisor />
                <LinhaMenu
                  icone={comMenu.arquivada ? 'arrow-undo-outline' : 'archive-outline'}
                  titulo={comMenu.arquivada ? 'Desarquivar' : 'Arquivar'}
                  onPress={() =>
                    mudar(
                      comMenu,
                      { arquivada: !comMenu.arquivada },
                      comMenu.arquivada ? 'Conversa de volta à lista.' : 'Conversa arquivada.',
                    )
                  }
                />
              </>
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
