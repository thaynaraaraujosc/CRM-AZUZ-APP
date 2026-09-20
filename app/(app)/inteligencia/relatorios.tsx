import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePermissoes } from '@/api/permissoes';
import { useRelatorios } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { Cabecalho, Cartao, Chip, Corpo, ListaVazia, Secundario, Selo, TituloSecao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const FILTROS = ['Todos', 'PDF', 'CSV'] as const;

/** Relatórios que já foram gerados no CRM. */
export default function RelatoriosScreen() {
  const { pode } = usePermissoes();
  if (!pode('relatorios')) return <TelaSemPermissao titulo="Relatórios" modulo="relatórios" voltar={true} />;

  return <Relatorios />;
}

function Relatorios() {
  const c = useCores();
  const aoPerderSessao = useAoPerderSessao();
  const { dados, carregando, erro, recarregar } = useRelatorios(aoPerderSessao);

  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>('Todos');

  const todos = dados ?? [];
  const visiveis =
    filtro === 'Todos'
      ? todos
      : todos.filter((r) => (r.formato ?? '').toUpperCase().includes(filtro));

  function quantos(f: (typeof FILTROS)[number]) {
    return f === 'Todos' ? todos.length : todos.filter((r) => (r.formato ?? '').toUpperCase().includes(f)).length;
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Relatórios"
        sub={carregando ? 'Carregando…' : todos.length === 1 ? '1 relatório gerado' : `${todos.length} relatórios gerados`}
        voltar
      />

      <View style={{ backgroundColor: c.surface, paddingVertical: space[3] }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4] }}
        >
          {FILTROS.map((f) => (
            <Chip key={f} texto={`${f} (${quantos(f)})`} ativo={filtro === f} onPress={() => setFiltro(f)} />
          ))}
        </ScrollView>
      </View>

      {erro ? (
        <FalhaAoCarregar mensagem={erro} aoTentar={recarregar} />
      ) : carregando && !dados ? (
        <Carregando texto="Buscando os relatórios" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[4] }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={c.blue} />}
        >
          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="Gerados" contagem={visiveis.length} />

            {visiveis.length === 0 ? (
              <ListaVazia
                icone="document-outline"
                titulo={todos.length === 0 ? 'Nenhum relatório ainda' : 'Nada nesse formato'}
                descricao="Relatório é gerado no CRM pelo computador, onde dá para montar o arquivo e baixar."
              />
            ) : null}

            {visiveis.map((r) => (
              <Cartao key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: radius.md,
                    backgroundColor: c.gray100,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="document-text-outline" size={17} color={c.ink} />
                </View>
                <View style={{ flex: 1 }}>
                  <Corpo style={{ fontWeight: fontWeight.bold }} numberOfLines={2}>
                    {r.nome}
                  </Corpo>
                  <Secundario numberOfLines={1}>
                    {[r.periodo, r.autor, r.data].filter(Boolean).join(' · ')}
                  </Secundario>
                </View>
                {r.formato ? <Selo texto={r.formato.toUpperCase()} /> : null}
              </Cartao>
            ))}
          </View>

          <Cartao style={{ gap: space[2] }}>
            <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
              Gerar um relatório novo
            </Text>
            <Secundario>
              Gerar exige montar o arquivo e baixá-lo, o que acontece no CRM pelo computador. Aqui os
              números ao vivo estão em Inteligência comercial, sem precisar gerar nada.
            </Secundario>
          </Cartao>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
