import { Ionicons } from '@expo/vector-icons';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePermissoes } from '@/api/permissoes';
import { useCanais, useIntegracao } from '@/api/recursos';
import { useAoPerderSessao } from '@/api/sessao';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { Aviso, Cabecalho, Cartao, Corpo, Secundario, Selo, TituloSecao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontWeight, radius, space } from '@/theme/tokens';
import type { ComponentProps } from 'react';

type Icone = ComponentProps<typeof Ionicons>['name'];
type Linha = { chave: string; icone: Icone; nome: string; detalhe: string; conectado: boolean };

const ICONE_DO_CANAL: Record<string, Icone> = {
  whatsapp_oficial: 'logo-whatsapp',
  whatsapp_nao_oficial: 'logo-whatsapp',
  email: 'mail-outline',
};

/** Canais de atendimento e integrações externas, com o estado real de cada um. */
export default function ConexoesScreen() {
  const { pode } = usePermissoes();
  if (!pode('configuracoes')) return <TelaSemPermissao titulo="Canais e integrações" modulo="configurações" voltar={true} />;

  return <Conexoes />;
}

function Conexoes() {
  const c = useCores();
  const aoPerderSessao = useAoPerderSessao();

  const canais = useCanais(aoPerderSessao);
  const instagram = useIntegracao('meta_instagram', aoPerderSessao);
  const metaAds = useIntegracao('meta_ads', aoPerderSessao);

  const carregando = canais.carregando || instagram.carregando || metaAds.carregando;

  function recarregar() {
    canais.recarregar();
    instagram.recarregar();
    metaAds.recarregar();
  }

  const linhasDeCanal: Linha[] = (canais.dados ?? []).map((canal) => ({
    chave: canal.canal,
    icone: ICONE_DO_CANAL[canal.canal] ?? 'chatbubble-ellipses-outline',
    nome: canal.label,
    detalhe: canal.conectado ? (canal.detalhe ?? 'Conectado') : (canal.motivo ?? 'Não conectado'),
    conectado: canal.conectado,
  }));

  const usuarioInstagram = (instagram.dados?.metadados as { username?: string } | null)?.username;
  const contaDeAnuncios = (metaAds.dados?.metadados as { nomeConta?: string; contaId?: string } | null);

  const linhasDeIntegracao: Linha[] = [
    {
      chave: 'instagram',
      icone: 'logo-instagram',
      nome: 'Instagram Direct',
      detalhe:
        instagram.dados?.status === 'conectado'
          ? (usuarioInstagram ? `@${usuarioInstagram}` : 'Conta conectada')
          : (instagram.dados?.erroMensagem ?? 'Conecte no CRM pelo computador.'),
      conectado: instagram.dados?.status === 'conectado',
    },
    {
      chave: 'meta_ads',
      icone: 'logo-facebook',
      nome: 'Meta Ads',
      detalhe:
        metaAds.dados?.status === 'conectado'
          ? (contaDeAnuncios?.nomeConta ?? 'Conta de anúncios vinculada')
          : 'Sem conta vinculada.',
      conectado: metaAds.dados?.status === 'conectado',
    },
  ];

  function Lista({ titulo, itens }: { titulo: string; itens: Linha[] }) {
    if (itens.length === 0) return null;
    return (
      <View style={{ gap: space[3] }}>
        <TituloSecao titulo={titulo} contagem={itens.length} />
        {itens.map((i) => (
          <Cartao key={i.chave} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
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
              <Ionicons name={i.icone} size={17} color={c.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Corpo style={{ fontWeight: fontWeight.bold }}>{i.nome}</Corpo>
              <Secundario numberOfLines={2}>{i.detalhe}</Secundario>
            </View>
            <Selo
              texto={i.conectado ? 'Conectado' : 'Não conectado'}
              cor={i.conectado ? c.success : c.textMuted}
              fundo={i.conectado ? c.successSoft : c.gray100}
            />
          </Cartao>
        ))}
      </View>
    );
  }

  const conectados = [...linhasDeCanal, ...linhasDeIntegracao].filter((l) => l.conectado).length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Canais e integrações"
        sub={carregando ? 'Carregando…' : `${conectados} conectados`}
        voltar
      />

      {canais.erro ? (
        <FalhaAoCarregar mensagem={canais.erro} aoTentar={recarregar} />
      ) : carregando && !canais.dados ? (
        <Carregando texto="Conferindo as suas conexões" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={c.blue} />}
        >
          <Lista titulo="Canais de atendimento" itens={linhasDeCanal} />
          <Lista titulo="Integrações" itens={linhasDeIntegracao} />

          <Aviso
            texto="Conectar canal novo é no CRM pelo computador, porque exige entrar na conta da Meta e escanear QR Code. Aqui o aplicativo mostra o estado e recebe as mensagens."
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
