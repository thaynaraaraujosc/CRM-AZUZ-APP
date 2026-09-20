import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePermissoes } from '@/api/permissoes';
import { alternarAutomacao, useAutomacoes } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { Interruptor } from '@/components/Interruptor';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { Cabecalho, Cartao, Chip, Indicador, ListaVazia, Secundario, Selo, TituloSecao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const FILTROS = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'ativos', rotulo: 'Ativos' },
  { valor: 'pausados', rotulo: 'Pausados' },
  { valor: 'rascunhos', rotulo: 'Rascunhos' },
] as const;

type Filtro = (typeof FILTROS)[number]['valor'];

export default function AutomacoesScreen() {
  const { pode } = usePermissoes();
  if (!pode('automacoes')) return <TelaSemPermissao titulo="Automações" modulo="automações" voltar={true} />;

  return <Automacoes />;
}

function Automacoes() {
  const c = useCores();
  const aoPerderSessao = useAoPerderSessao();
  const { dados, carregando, erro, recarregar } = useAutomacoes(aoPerderSessao);

  const [filtro, setFiltro] = useState<Filtro>('todos');
  /** Estado otimista do interruptor, para o toque responder antes do servidor. */
  const [mudando, setMudando] = useState<Record<string, boolean>>({});
  const [falha, setFalha] = useState<string | null>(null);

  const fluxos = (dados ?? []).filter((f) => !f.arquivada);

  const estaAtiva = (id: string, ativa: boolean) => mudando[id] ?? ativa;

  async function alternar(id: string, ativa: boolean) {
    const novo = !estaAtiva(id, ativa);
    setMudando((antes) => ({ ...antes, [id]: novo }));
    setFalha(null);
    try {
      await alternarAutomacao(id, novo);
      recarregar();
    } catch (e) {
      setMudando((antes) => {
        const copia = { ...antes };
        delete copia[id];
        return copia;
      });
      setFalha(e instanceof Error ? e.message : 'Não foi possível mudar a automação.');
    }
  }

  const visiveis = fluxos.filter((f) => {
    if (filtro === 'ativos') return estaAtiva(f.id, f.ativa) && f.status === 'publicado';
    if (filtro === 'pausados') return !estaAtiva(f.id, f.ativa) && f.status === 'publicado';
    if (filtro === 'rascunhos') return f.status === 'rascunho';
    return true;
  });

  const ativos = fluxos.filter((f) => estaAtiva(f.id, f.ativa) && f.status === 'publicado').length;
  const execucoes = fluxos.reduce((soma, f) => soma + (f.execucoes ?? 0), 0);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Automações"
        sub={carregando ? 'Carregando…' : `${ativos} ativas de ${fluxos.length}`}
        voltar
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
      ) : carregando && fluxos.length === 0 ? (
        <Carregando texto="Buscando suas automações" />
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
            <Indicador numero={ativos} rotulo="Ativas" cor={c.success} />
            <Indicador numero={execucoes.toLocaleString('pt-BR')} rotulo="Execuções" />
            <Indicador numero={fluxos.filter((f) => f.status === 'rascunho').length} rotulo="Rascunhos" />
          </View>

          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="Fluxos" contagem={visiveis.length} />

            {visiveis.length === 0 ? (
              <ListaVazia
                icone="flash-outline"
                titulo={fluxos.length === 0 ? 'Nenhuma automação ainda' : 'Nada com esse filtro'}
                descricao={
                  fluxos.length === 0
                    ? 'Os fluxos são montados no CRM pelo computador. Aqui você acompanha e liga ou desliga.'
                    : 'Troque o filtro para ver os outros fluxos.'
                }
              />
            ) : null}

            {visiveis.map((f) => {
              const ligada = estaAtiva(f.id, f.ativa);
              const rascunho = f.status === 'rascunho';

              return (
                <Cartao key={f.id} style={{ gap: space[3] }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: radius.md,
                        backgroundColor: ligada && !rascunho ? c.blueSoft : c.gray100,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="flash" size={17} color={ligada && !rascunho ? c.blue : c.textFaint} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                        {f.nome}
                      </Text>
                      {f.descricao ? <Secundario numberOfLines={2}>{f.descricao}</Secundario> : null}
                    </View>

                    {rascunho ? null : (
                      <Cartao
                        onPress={() => alternar(f.id, f.ativa)}
                        padding={0}
                        style={{ borderWidth: 0, backgroundColor: 'transparent' }}
                      >
                        <Interruptor ligado={ligada} />
                      </Cartao>
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[1], flexWrap: 'wrap' }}>
                    {rascunho ? <Selo texto="Rascunho" cor={c.warning} fundo={c.warningSoft} /> : null}
                    {f.categoria ? <Selo texto={f.categoria} /> : null}
                    <Selo texto={`${(f.execucoes ?? 0).toLocaleString('pt-BR')} execuções`} icone="repeat-outline" />
                  </View>
                </Cartao>
              );
            })}
          </View>

          <Secundario>
            Fluxos novos são montados no CRM pelo computador, onde dá para desenhar os passos. Pelo app
            você acompanha, liga e desliga.
          </Secundario>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
