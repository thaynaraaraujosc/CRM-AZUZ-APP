import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao, Cabecalho, Cartao, Corpo, Secundario, Selo, TituloSecao } from '@/components/ui';
import { usePermissoes } from '@/api/permissoes';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

type Icone = ComponentProps<typeof Ionicons>['name'];

type Conexao = {
  icone: Icone;
  nome: string;
  detalhe: string;
  estado: 'Conectado' | 'Pendente' | 'Desconectado';
};

const CANAIS: Conexao[] = [
  { icone: 'logo-whatsapp', nome: 'WhatsApp Business', detalhe: '(62) 99999-0000 · API oficial', estado: 'Conectado' },
  { icone: 'logo-whatsapp', nome: 'WhatsApp — atendimento', detalhe: '(62) 98888-0000 · QR Code', estado: 'Conectado' },
  { icone: 'logo-instagram', nome: 'Instagram Direct', detalhe: '@empresademo', estado: 'Conectado' },
  { icone: 'musical-notes-outline', nome: 'TikTok', detalhe: 'Mensagens da conta comercial', estado: 'Pendente' },
  { icone: 'mail-outline', nome: 'E-mail', detalhe: 'Nenhuma caixa conectada', estado: 'Desconectado' },
];

const INTEGRACOES: Conexao[] = [
  { icone: 'logo-facebook', nome: 'Meta Ads', detalhe: 'Atribuição de lead por anúncio', estado: 'Conectado' },
  { icone: 'logo-google', nome: 'Google Ads', detalhe: 'Sem conta vinculada', estado: 'Desconectado' },
  { icone: 'calendar-outline', nome: 'Google Agenda', detalhe: 'ana@empresademo.com.br', estado: 'Conectado' },
  { icone: 'card-outline', nome: 'Asaas', detalhe: 'Cobrança e link de pagamento', estado: 'Desconectado' },
];

/** Canais de atendimento e integrações externas, com o estado de cada um. */
export default function ConexoesScreen() {
  const { pode } = usePermissoes();
  if (!pode('configuracoes')) return <TelaSemPermissao titulo="Canais e integrações" modulo="configurações" voltar={true} />;

  const c = useCores();

  function cor(estado: Conexao['estado']) {
    if (estado === 'Conectado') return { tinta: c.success, fundo: c.successSoft };
    if (estado === 'Pendente') return { tinta: c.warning, fundo: c.warningSoft };
    return { tinta: c.textMuted, fundo: c.gray100 };
  }

  function Lista({ titulo, itens }: { titulo: string; itens: Conexao[] }) {
    return (
      <View style={{ gap: space[3] }}>
        <TituloSecao titulo={titulo} contagem={itens.length} />
        {itens.map((i) => {
          const p = cor(i.estado);
          return (
            <Cartao key={i.nome} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
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
                <Secundario numberOfLines={1}>{i.detalhe}</Secundario>
              </View>
              <Selo texto={i.estado} cor={p.tinta} fundo={p.fundo} />
            </Cartao>
          );
        })}
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Canais e integrações" sub="5 canais · 4 integrações" voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        <Lista titulo="Canais de atendimento" itens={CANAIS} />
        <Lista titulo="Integrações" itens={INTEGRACOES} />

        <Cartao style={{ gap: space[3] }}>
          <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
            Conectar um canal novo
          </Text>
          <Secundario>
            A conexão é feita pelo CRM no computador — o aplicativo mostra o estado e recebe as mensagens.
          </Secundario>
          <Botao titulo="Abrir instruções" variante="secundario" icone="open-outline" />
        </Cartao>
      </ScrollView>
    </SafeAreaView>
  );
}
