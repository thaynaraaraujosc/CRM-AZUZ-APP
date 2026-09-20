import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDocumentos } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { BarraBusca, Cabecalho, Cartao, Divisor, ListaVazia, Secundario, Selo } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

function dataCurta(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR');
}

/** Documentos do workspace. Criar e editar continua no CRM pelo computador. */
export default function DocumentosScreen() {
  const c = useCores();
  const aoPerderSessao = useAoPerderSessao();
  const { dados, carregando, erro, recarregar } = useDocumentos(aoPerderSessao);

  const [busca, setBusca] = useState('');

  const documentos = (dados ?? []).filter((d) =>
    busca.trim() ? d.titulo.toLowerCase().includes(busca.trim().toLowerCase()) : true,
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Documentos"
        sub={carregando ? 'Carregando…' : `${(dados ?? []).length} arquivos`}
        voltar
      />

      <View style={{ backgroundColor: c.surface, paddingHorizontal: space[4], paddingVertical: space[3] }}>
        <BarraBusca placeholder="Buscar documento" valor={busca} aoMudar={setBusca} />
      </View>

      {erro ? (
        <FalhaAoCarregar mensagem={erro} aoTentar={recarregar} />
      ) : carregando && documentos.length === 0 ? (
        <Carregando texto="Buscando seus documentos" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[4] }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={c.blue} />}
        >
          {documentos.length === 0 ? (
            <ListaVazia
              icone="folder-outline"
              titulo={(dados ?? []).length === 0 ? 'Nenhum documento ainda' : 'Nada com essa busca'}
              descricao="Contratos, propostas e modelos criados no CRM aparecem aqui."
            />
          ) : (
            <Cartao padding={0} style={{ overflow: 'hidden' }}>
              {documentos.map((d, i) => (
                <View key={d.id}>
                  {i > 0 ? <Divisor /> : null}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[3] }}>
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
                      <Ionicons name="document-outline" size={17} color={c.ink} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
                        {d.titulo}
                      </Text>
                      <Secundario>
                        {[d.autor, dataCurta(d.atualizadoEm)].filter(Boolean).join(' · ')}
                      </Secundario>
                    </View>

                    {d.favorito ? <Ionicons name="star" size={14} color={c.warning} /> : null}
                  </View>
                </View>
              ))}
            </Cartao>
          )}

          <Secundario>
            Escrever e editar documento é trabalho de tela grande, e continua no CRM pelo computador.
          </Secundario>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
