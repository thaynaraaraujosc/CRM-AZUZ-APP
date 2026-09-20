import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { concluirTarefa, criarTarefa, useTarefas } from '@/api/recursos';
import { useAoPerderSessao, useSessao } from '@/api/sessao';
import type { TarefaCard } from '@/api/tipos';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { FolhaDeCriacao } from '@/components/FolhaDeCriacao';
import {
  Avatar,
  BotaoIcone,
  Cabecalho,
  Campo,
  Cartao,
  Chip,
  Indicador,
  ListaVazia,
  Selo,
  TituloSecao,
} from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const FILTROS = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'abertas', rotulo: 'Abertas' },
  { valor: 'atrasadas', rotulo: 'Atrasadas' },
  { valor: 'concluidas', rotulo: 'Concluídas' },
] as const;

type Filtro = (typeof FILTROS)[number]['valor'];

/**
 * Tarefas em lista, agrupadas pelas etapas do quadro do CRM.
 *
 * No telefone a leitura vertical vence o kanban: tarefa se lê em sequência, negócio se compara
 * lado a lado. Marcar como concluída grava na hora.
 */
export default function TarefasScreen() {
  const c = useCores();
  const aoPerderSessao = useAoPerderSessao();
  const { dados, carregando, erro, recarregar } = useTarefas(aoPerderSessao);
  const { usuario } = useSessao();

  const [criando, setCriando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [contato, setContato] = useState('');
  const [prazo, setPrazo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [falhaAoCriar, setFalhaAoCriar] = useState<string | null>(null);

  async function salvarTarefa() {
    if (!titulo.trim()) {
      setFalhaAoCriar('O que precisa ser feito é obrigatório.');
      return;
    }
    setSalvando(true);
    setFalhaAoCriar(null);
    try {
      await criarTarefa({
        titulo: titulo.trim(),
        contato: contato.trim(),
        data: prazo.trim(),
        descricao: descricao.trim(),
        responsavel: {
          nome: usuario?.name ?? '',
          initials: usuario?.initials ?? (usuario?.name ?? '?').slice(0, 2).toUpperCase(),
        },
      });
      setCriando(false);
      setTitulo('');
      setContato('');
      setPrazo('');
      setDescricao('');
      recarregar();
    } catch (e) {
      setFalhaAoCriar(e instanceof Error ? e.message : 'Não foi possível criar a tarefa.');
    } finally {
      setSalvando(false);
    }
  }

  const [filtro, setFiltro] = useState<Filtro>('todas');
  /** Tarefas que acabaram de ser marcadas, para o toque responder antes da resposta do servidor. */
  const [mudando, setMudando] = useState<Record<string, boolean>>({});
  const [falha, setFalha] = useState<string | null>(null);

  const colunas = dados ?? [];
  const todas = colunas.flatMap((col) => col.cards);

  function estaConcluida(t: TarefaCard) {
    return mudando[t.id] ?? t.concluida ?? false;
  }

  function combina(t: TarefaCard) {
    if (filtro === 'abertas') return !estaConcluida(t);
    if (filtro === 'atrasadas') return Boolean(t.atrasada) && !estaConcluida(t);
    if (filtro === 'concluidas') return estaConcluida(t);
    return true;
  }

  async function alternar(t: TarefaCard) {
    const novo = !estaConcluida(t);
    setMudando((antes) => ({ ...antes, [t.id]: novo }));
    setFalha(null);
    try {
      await concluirTarefa(t.id, novo);
      recarregar();
    } catch (e) {
      // Volta a marca para o que estava: mostrar a tarefa como feita sem ter gravado é pior que o erro.
      setMudando((antes) => {
        const copia = { ...antes };
        delete copia[t.id];
        return copia;
      });
      setFalha(e instanceof Error ? e.message : 'Não foi possível salvar a tarefa.');
    }
  }

  const abertas = todas.filter((t) => !estaConcluida(t)).length;
  const atrasadas = todas.filter((t) => t.atrasada && !estaConcluida(t)).length;
  const concluidas = todas.filter((t) => estaConcluida(t)).length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Tarefas"
        sub={carregando ? 'Carregando…' : `${abertas} abertas · ${atrasadas} atrasadas`}
        acao={<BotaoIcone icone="add" cor={c.acaoTexto} fundo={c.acao} onPress={() => setCriando(true)} />}
      />

      <View style={{ backgroundColor: c.surface, paddingVertical: space[3] }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4] }}
        >
          {FILTROS.map((f) => (
            <Chip key={f.valor} texto={f.rotulo} ativo={filtro === f.valor} onPress={() => setFiltro(f.valor)} />
          ))}
        </ScrollView>
      </View>

      {erro ? (
        <FalhaAoCarregar mensagem={erro} aoTentar={recarregar} />
      ) : carregando && todas.length === 0 ? (
        <Carregando texto="Buscando suas tarefas" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={c.blue} />}
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

          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Indicador numero={abertas} rotulo="Abertas" />
            <Indicador numero={atrasadas} rotulo="Atrasadas" cor={c.danger} />
            <Indicador numero={concluidas} rotulo="Concluídas" cor={c.success} />
          </View>

          {todas.length === 0 ? (
            <ListaVazia
              icone="checkbox-outline"
              titulo="Nenhuma tarefa ainda"
              descricao="Tarefas criadas no CRM aparecem aqui, agrupadas pelas etapas do quadro."
            />
          ) : null}

          {colunas.map((coluna) => {
            const visiveis = coluna.cards.filter(combina);
            if (visiveis.length === 0) return null;

            return (
              <View key={coluna.id ?? coluna.titulo} style={{ gap: space[3] }}>
                <TituloSecao titulo={coluna.titulo} contagem={visiveis.length} />

                {visiveis.map((t) => {
                  const feita = estaConcluida(t);
                  return (
                    <Cartao key={t.id} padding={space[3]} style={{ gap: space[2] }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space[3] }}>
                        <Pressable onPress={() => alternar(t)} hitSlop={8} style={{ paddingTop: 1 }}>
                          <View
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: radius.sm,
                              borderWidth: 1.5,
                              borderColor: feita ? c.success : c.lineStrong,
                              backgroundColor: feita ? c.success : 'transparent',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {feita ? <Ionicons name="checkmark" size={13} color="#FFFFFF" /> : null}
                          </View>
                        </Pressable>

                        <View style={{ flex: 1, gap: 3 }}>
                          <Text
                            style={{
                              color: feita ? c.textFaint : c.ink,
                              fontSize: fontSize.base,
                              fontWeight: fontWeight.bold,
                              textDecorationLine: feita ? 'line-through' : 'none',
                            }}
                          >
                            {t.titulo}
                          </Text>
                          {t.contato ? (
                            <Text style={{ color: c.textMuted, fontSize: fontSize.sm }}>{t.contato}</Text>
                          ) : null}
                          {t.descricao ? (
                            <Text numberOfLines={2} style={{ color: c.textFaint, fontSize: fontSize.sm }}>
                              {t.descricao}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                        {t.data ? (
                          <Selo
                            icone="calendar-outline"
                            texto={t.data}
                            cor={t.atrasada && !feita ? c.danger : c.textMuted}
                            fundo={t.atrasada && !feita ? c.dangerSoft : c.gray100}
                          />
                        ) : null}
                        {t.anexo ? <Selo icone="attach-outline" texto={t.anexo.arquivo} /> : null}
                        <View style={{ flex: 1 }} />
                        {t.responsavel?.initials ? <Avatar iniciais={t.responsavel.initials} tamanho={24} /> : null}
                      </View>
                    </Cartao>
                  );
                })}
              </View>
            );
          })}

          <View style={{ height: StyleSheet.hairlineWidth }} />
        </ScrollView>
      )}

      <FolhaDeCriacao
        aberta={criando}
        titulo="Nova tarefa"
        descricao="Ela entra na primeira etapa do seu quadro."
        salvando={salvando}
        erro={falhaAoCriar}
        aoFechar={() => setCriando(false)}
        aoSalvar={salvarTarefa}
        rotuloSalvar="Criar tarefa"
      >
        <Campo rotulo="O que precisa ser feito" placeholder="Ex.: ligar para confirmar" valor={titulo} aoMudar={setTitulo} />
        <Campo rotulo="Contato" placeholder="opcional" valor={contato} aoMudar={setContato} />
        <Campo rotulo="Prazo" placeholder="Ex.: Hoje, 17:00" valor={prazo} aoMudar={setPrazo} />
        <Campo rotulo="Detalhes" placeholder="opcional" valor={descricao} aoMudar={setDescricao} multilinha />
      </FolhaDeCriacao>
    </SafeAreaView>
  );
}
