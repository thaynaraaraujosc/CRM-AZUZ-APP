import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePermissoes } from '@/api/permissoes';
import { useFormularios } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { Cabecalho, Cartao, Indicador, ListaVazia, Secundario, Selo, TituloSecao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

function dataCurta(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR');
}

export default function FormulariosScreen() {
  const { pode } = usePermissoes();
  if (!pode('formularios')) return <TelaSemPermissao titulo="Formulários" modulo="formulários" voltar={true} />;

  return <Formularios />;
}

function Formularios() {
  const c = useCores();
  const router = useRouter();
  const aoPerderSessao = useAoPerderSessao();
  const { dados, carregando, erro, recarregar } = useFormularios(aoPerderSessao);

  const formularios = dados ?? [];
  const publicados = formularios.filter((f) => f.status?.toLowerCase() === 'publicado').length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Formulários"
        sub={carregando ? 'Carregando…' : `${formularios.length} formulários · ${publicados} publicados`}
        voltar
      />

      {erro ? (
        <FalhaAoCarregar mensagem={erro} aoTentar={recarregar} />
      ) : carregando && formularios.length === 0 ? (
        <Carregando texto="Buscando seus formulários" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={c.blue} />}
        >
          <View style={{ flexDirection: 'row', gap: space[2] }}>
            <Indicador numero={formularios.length} rotulo="Formulários" />
            <Indicador numero={publicados} rotulo="Publicados" cor={c.success} />
            <Indicador numero={formularios.length - publicados} rotulo="Rascunhos" />
          </View>

          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="Seus formulários" contagem={formularios.length} />

            {formularios.length === 0 ? (
              <ListaVazia
                icone="document-text-outline"
                titulo="Nenhum formulário ainda"
                descricao="Formulários são montados no CRM pelo computador. Aqui você acompanha quais existem."
              />
            ) : null}

            {formularios.map((f) => {
              const publicado = f.status?.toLowerCase() === 'publicado';
              return (
                <Cartao key={f.id} onPress={() => router.push(`/formulario/${f.id}`)} style={{ gap: space[3] }}>
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
                      {f.descricao ? <Secundario numberOfLines={1}>{f.descricao}</Secundario> : null}
                    </View>

                    <Selo
                      texto={publicado ? 'Publicado' : 'Rascunho'}
                      cor={publicado ? c.success : c.textMuted}
                      fundo={publicado ? c.successSoft : c.gray100}
                    />
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                    <Secundario style={{ flex: 1 }}>Atualizado em {dataCurta(f.atualizadoEm)}</Secundario>
                    <Text style={{ color: c.blue, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                      Ver respostas
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={c.blue} />
                  </View>
                </Cartao>
              );
            })}
          </View>

          <Secundario>
            Toque num formulário para ver o que as pessoas responderam. Criar e editar as perguntas
            é feito no CRM pelo computador.
          </Secundario>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
