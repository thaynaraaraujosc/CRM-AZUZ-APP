import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { criarCompromisso, useAgenda } from '@/api/recursos';
import { useAoPerderSessao, useSessao } from '@/api/sessao';
import type { Compromisso } from '@/api/tipos';
import { Carregando, FalhaAoCarregar } from '@/components/estados';
import { FolhaDeCriacao } from '@/components/FolhaDeCriacao';
import { BotaoIcone, Cabecalho, Campo, Cartao, ListaVazia, Secundario, TituloSecao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

const DIAS_DA_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** Data de hoje no mesmo formato que o servidor usa (aaaa-mm-dd), no fuso do aparelho. */
function isoDoDia(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

function rotuloLongo(iso: string): string {
  const [ano, mes, dia] = iso.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  return `${DIAS_DA_SEMANA[data.getDay()]}, ${dia} de ${MESES[mes - 1]}`;
}

/** Agenda real do CRM: a semana em cima, o dia escolhido embaixo. */
export default function AgendaScreen() {
  const c = useCores();
  const aoPerderSessao = useAoPerderSessao();
  const { dados, carregando, erro, recarregar } = useAgenda(aoPerderSessao);
  const { usuario } = useSessao();

  const [criando, setCriando] = useState(false);
  const [comQuem, setComQuem] = useState('');
  const [tipo, setTipo] = useState('');
  const [hora, setHora] = useState('');
  const [local, setLocal] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);

  async function salvar() {
    if (!comQuem.trim()) {
      setFalha('Diga com quem é o compromisso.');
      return;
    }
    setSalvando(true);
    setFalha(null);
    try {
      await criarCompromisso({
        contato: comQuem.trim(),
        dataIso: diaEscolhido,
        hora: hora.trim() || '09:00',
        tipo: tipo.trim() || 'Compromisso',
        local: local.trim(),
        responsavel: usuario?.name ?? '',
      });
      setCriando(false);
      setComQuem('');
      setTipo('');
      setHora('');
      setLocal('');
      recarregar();
    } catch (e) {
      setFalha(e instanceof Error ? e.message : 'Não foi possível criar o compromisso.');
    } finally {
      setSalvando(false);
    }
  }

  const hoje = new Date();
  const [diaEscolhido, setDiaEscolhido] = useState(isoDoDia(hoje));

  const compromissos = dados ?? [];

  // Semana começando no domingo da semana atual.
  const domingo = new Date(hoje);
  domingo.setDate(hoje.getDate() - hoje.getDay());
  const semana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(domingo);
    d.setDate(domingo.getDate() + i);
    return d;
  });

  const doDia = compromissos
    .filter((cp) => cp.dataIso === diaEscolhido)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const proximos = compromissos
    .filter((cp) => cp.dataIso > diaEscolhido)
    .sort((a, b) => `${a.dataIso}${a.hora}`.localeCompare(`${b.dataIso}${b.hora}`))
    .slice(0, 5);

  function corDoStatus(status: string) {
    const s = status.toLowerCase();
    if (s.includes('cancel')) return c.danger;
    if (s.includes('confirm')) return c.success;
    if (s.includes('atras')) return c.warning;
    return c.textMuted;
  }

  function Linha({ cp }: { cp: Compromisso }) {
    return (
      <Cartao padding={space[3]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
          <View
            style={{
              width: 56,
              paddingVertical: space[2],
              borderRadius: radius.md,
              backgroundColor: c.gray100,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>{cp.hora}</Text>
            {cp.horaFim ? (
              <Text style={{ color: c.textFaint, fontSize: 10 }}>até {cp.horaFim}</Text>
            ) : null}
          </View>

          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
              {cp.tipo || 'Compromisso'}
            </Text>
            <Text numberOfLines={1} style={{ color: c.textMuted, fontSize: fontSize.sm, marginTop: 2 }}>
              {[cp.contato, cp.local, cp.responsavel].filter(Boolean).join(' · ')}
            </Text>
          </View>

          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: corDoStatus(cp.status) }} />
        </View>
      </Cartao>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho
        titulo="Agenda"
        sub={
          carregando
            ? 'Carregando…'
            : `${MESES[hoje.getMonth()]} · ${compromissos.length} compromissos`
        }
        voltar
        acao={<BotaoIcone icone="add" cor={c.acaoTexto} fundo={c.acao} onPress={() => setCriando(true)} />}
      />

      <View style={{ backgroundColor: c.surface, paddingVertical: space[3] }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: space[3], gap: space[1] }}>
          {semana.map((d) => {
            const iso = isoDoDia(d);
            const escolhido = iso === diaEscolhido;
            const quantos = compromissos.filter((cp) => cp.dataIso === iso).length;

            return (
              <Pressable
                key={iso}
                onPress={() => setDiaEscolhido(iso)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  gap: 4,
                  paddingVertical: space[2],
                  borderRadius: radius.md,
                  backgroundColor: escolhido ? c.acao : 'transparent',
                }}
              >
                <Text style={{ color: escolhido ? 'rgba(255,255,255,0.7)' : c.textFaint, fontSize: fontSize.xs }}>
                  {DIAS_DA_SEMANA[d.getDay()]}
                </Text>
                <Text
                  style={{
                    color: escolhido ? c.acaoTexto : c.ink,
                    fontSize: fontSize.md,
                    fontWeight: fontWeight.bold,
                  }}
                >
                  {d.getDate()}
                </Text>
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: quantos > 0 ? (escolhido ? c.acaoTexto : c.blue) : 'transparent',
                  }}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      {erro ? (
        <FalhaAoCarregar mensagem={erro} aoTentar={recarregar} />
      ) : carregando && compromissos.length === 0 ? (
        <Carregando texto="Buscando sua agenda" />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={c.blue} />}
        >
          <View style={{ gap: space[3] }}>
            <TituloSecao titulo={rotuloLongo(diaEscolhido)} contagem={doDia.length} />
            {doDia.length === 0 ? (
              <Cartao>
                <ListaVazia
                  icone="calendar-outline"
                  titulo="Dia livre"
                  descricao="Nenhum compromisso marcado para este dia."
                />
              </Cartao>
            ) : (
              doDia.map((cp) => <Linha key={cp.id} cp={cp} />)
            )}
          </View>

          {proximos.length > 0 ? (
            <View style={{ gap: space[3] }}>
              <TituloSecao titulo="Próximos" contagem={proximos.length} />
              {proximos.map((cp) => (
                <View key={cp.id} style={{ gap: space[1] }}>
                  <Secundario>{rotuloLongo(cp.dataIso)}</Secundario>
                  <Linha cp={cp} />
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}

      <FolhaDeCriacao
        aberta={criando}
        titulo="Novo compromisso"
        descricao={`Será marcado para ${rotuloLongo(diaEscolhido)}.`}
        salvando={salvando}
        erro={falha}
        aoFechar={() => setCriando(false)}
        aoSalvar={salvar}
        rotuloSalvar="Marcar"
      >
        <Campo rotulo="Com quem" placeholder="Nome do contato" valor={comQuem} aoMudar={setComQuem} />
        <Campo rotulo="O que é" placeholder="Ex.: Call de apresentação" valor={tipo} aoMudar={setTipo} />
        <Campo rotulo="Hora" placeholder="Ex.: 09:30" valor={hora} aoMudar={setHora} />
        <Campo rotulo="Onde" placeholder="opcional" valor={local} aoMudar={setLocal} />
      </FolhaDeCriacao>
    </SafeAreaView>
  );
}
