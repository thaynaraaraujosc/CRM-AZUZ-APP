import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CartaoTarefa } from '@/components/cards';
import { BotaoIcone, Cabecalho, Chip, Indicador, TituloSecao } from '@/components/ui';
import { colunasTarefas } from '@/mock/dados';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, space } from '@/theme/tokens';

const FILTROS = ['Todas', 'Minhas', 'Atrasadas', 'Hoje', 'Esta semana'];

/**
 * Tarefas em lista agrupada por coluna do quadro. No telefone a leitura vertical vence o kanban:
 * tarefa se lê em sequência, negócio se compara lado a lado.
 */
export default function TarefasScreen() {
  const c = useCores();

  const total = colunasTarefas.reduce((soma, col) => soma + col.tarefas.length, 0);
  const atrasadas = colunasTarefas.flatMap((col) => col.tarefas).filter((t) => t.atrasada).length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Tarefas"
        sub={`${total} no quadro · ${atrasadas} atrasada`}
        acao={<BotaoIcone icone="add" cor={c.acaoTexto} fundo={c.acao} />}
      />

      <View style={{ backgroundColor: c.surface, paddingVertical: space[3] }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space[2], paddingHorizontal: space[4] }}
        >
          {FILTROS.map((f, i) => (
            <Chip key={f} texto={f} ativo={i === 0} />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', gap: space[2] }}>
          <Indicador numero={total} rotulo="No quadro" />
          <Indicador numero={atrasadas} rotulo="Atrasadas" cor={c.danger} />
          <Indicador numero={2} rotulo="Para hoje" cor={c.warning} />
        </View>

        {colunasTarefas.map((coluna) => (
          <View key={coluna.id} style={{ gap: space[3] }}>
            <TituloSecao titulo={coluna.titulo} contagem={coluna.tarefas.length} />
            {coluna.tarefas.length === 0 ? (
              <Text style={{ color: c.textFaint, fontSize: fontSize.sm }}>Nada nesta coluna.</Text>
            ) : (
              <View style={{ gap: space[2] }}>
                {coluna.tarefas.map((t) => (
                  <CartaoTarefa key={t.id} tarefa={t} />
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
