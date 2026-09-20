import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  custoPorLead,
  investimentoEmTrafego,
  leadsDeTrafego,
  moeda,
  percentual,
  porOrigem,
  roasMedio,
} from '@/api/metricas';
import { usePermissoes } from '@/api/permissoes';
import { useCampanhas, useContatos } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import {
  BarraProgresso,
  Cabecalho,
  Cartao,
  Corpo,
  Indicador,
  ListaVazia,
  Secundario,
  Selo,
  TituloSecao,
} from '@/components/ui';
import { useCorDaOrigem, useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, space } from '@/theme/tokens';

/** Origem paga x orgânica: quanto entrou, quanto custou e o retorno. */
export default function TrafegoScreen() {
  const { pode } = usePermissoes();
  if (!pode('relatorios')) return <TelaSemPermissao titulo="Tráfego" modulo="relatórios" voltar={true} />;

  return <Trafego />;
}

function Trafego() {
  const c = useCores();
  const corOrigem = useCorDaOrigem();
  const aoPerderSessao = useAoPerderSessao();

  const contatos = useContatos(aoPerderSessao);
  const campanhas = useCampanhas(aoPerderSessao);

  const lista = campanhas.dados ?? [];
  const origens = porOrigem(contatos.dados ?? []);
  const maiorOrigem = Math.max(1, ...origens.map((o) => o.quantidade));

  const investido = investimentoEmTrafego(lista);
  const leads = leadsDeTrafego(lista);

  function recarregar() {
    contatos.recarregar();
    campanhas.recarregar();
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Tráfego"
        sub={
          lista.length > 0
            ? `${leads} leads de anúncio · ${moeda(investido)} investidos`
            : `${(contatos.dados ?? []).length} contatos no workspace`
        }
        voltar
      />

      {contatos.erro ? (
        <FalhaAoCarregar mensagem={contatos.erro} aoTentar={recarregar} />
      ) : contatos.carregando && !contatos.dados ? (
        <Carregando texto="Somando as origens" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={contatos.carregando} onRefresh={recarregar} tintColor={c.blue} />
          }
        >
          {lista.length > 0 ? (
            <>
              <View style={{ flexDirection: 'row', gap: space[2] }}>
                <Indicador numero={moeda(investido)} rotulo="Investido" />
                <Indicador numero={leads} rotulo="Leads" cor={c.blue} />
              </View>
              <View style={{ flexDirection: 'row', gap: space[2] }}>
                <Indicador numero={moeda(custoPorLead(lista))} rotulo="Custo por lead" />
                <Indicador
                  numero={`${roasMedio(lista).toFixed(1).replace('.', ',')}x`}
                  rotulo="ROAS médio"
                  cor={c.success}
                />
              </View>

              <View style={{ gap: space[3] }}>
                <TituloSecao titulo="Campanhas" contagem={lista.length} />
                {lista.map((campanha) => (
                  <Cartao key={campanha.nome} style={{ gap: space[3] }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                      <View style={{ flex: 1 }}>
                        <Corpo style={{ fontWeight: fontWeight.bold }} numberOfLines={2}>
                          {campanha.nome}
                        </Corpo>
                        <Secundario>{campanha.sub}</Secundario>
                      </View>
                      <Selo
                        texto={campanha.pausada ? 'Pausada' : campanha.roas}
                        cor={campanha.pausada ? c.textMuted : c.success}
                        fundo={campanha.pausada ? c.gray100 : c.successSoft}
                      />
                    </View>
                    <BarraProgresso valor={campanha.barra} />
                  </Cartao>
                ))}
              </View>
            </>
          ) : (
            <ListaVazia
              icone="megaphone-outline"
              titulo="Meta Ads não conectado"
              descricao="Com a conta de anúncios ligada no CRM, investimento, custo por lead e ROAS aparecem aqui."
            />
          )}

          <View style={{ gap: space[3] }}>
            <TituloSecao titulo="De onde vêm os contatos" contagem={origens.length} />
            <Cartao style={{ gap: space[4] }}>
              {origens.length === 0 ? <Secundario>Nenhum contato ainda.</Secundario> : null}
              {origens.map((o) => (
                <View key={o.origem} style={{ gap: space[2] }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                    <Text
                      style={{
                        flex: 1,
                        color: corOrigem(o.origem),
                        fontSize: fontSize.sm,
                        fontWeight: fontWeight.bold,
                        letterSpacing: 0.4,
                      }}
                    >
                      {o.origem.toUpperCase()}
                    </Text>
                    <Text style={{ color: c.ink, fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                      {o.quantidade}
                    </Text>
                    <Secundario>{percentual(o.percentual, 0)}</Secundario>
                  </View>
                  <BarraProgresso
                    valor={Math.round((o.quantidade / maiorOrigem) * 100)}
                    cor={corOrigem(o.origem)}
                  />
                </View>
              ))}
            </Cartao>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
