import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePermissoes } from '@/api/permissoes';
import { gravarPreferencia, lerPreferencia } from '@/api/recursos';
import { Interruptor } from '@/components/Interruptor';
import { TelaSemPermissao } from '@/components/TelaSemPermissao';
import { Aviso, Cabecalho, Cartao, Divisor, LinhaMenu, Secundario, TituloSecao } from '@/components/ui';
import { useCores } from '@/theme/ThemeContext';
import { space } from '@/theme/tokens';

/** Mesma chave e mesmos campos que o CRM da web usa — mudar aqui muda lá. */
const CHAVE = 'notificacoes';

type Prefs = { notificacoesAtivas: boolean; notificarNovaTarefa: boolean };

const PADRAO: Prefs = { notificacoesAtivas: true, notificarNovaTarefa: true };

/** O que o CRM avisa. São as duas chaves que o CRM realmente guarda — nada além disso. */
export default function NotificacoesConfigScreen() {
  const { pode } = usePermissoes();
  if (!pode('configuracoes')) return <TelaSemPermissao titulo="Notificações" modulo="configurações" voltar={true} />;

  return <Preferencias />;
}

function Preferencias() {
  const c = useCores();

  const [prefs, setPrefs] = useState<Prefs>(PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [gravando, setGravando] = useState<keyof Prefs | null>(null);
  const [falha, setFalha] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    lerPreferencia<Partial<Prefs>>(CHAVE)
      .then((p) => {
        if (vivo) setPrefs({ ...PADRAO, ...p });
      })
      .catch((e: unknown) => {
        if (vivo) setFalha(e instanceof Error ? e.message : 'Não deu para ler as suas preferências.');
      })
      .finally(() => {
        if (vivo) setCarregando(false);
      });
    return () => {
      vivo = false;
    };
  }, []);

  async function alternar(campo: keyof Prefs, novo: boolean) {
    const antes = prefs;
    const depois = { ...prefs, [campo]: novo };

    setPrefs(depois);
    setGravando(campo);
    setFalha(null);
    try {
      await gravarPreferencia(CHAVE, depois);
    } catch (e) {
      setPrefs(antes);
      setFalha(e instanceof Error ? e.message : 'Não deu para gravar essa mudança.');
    } finally {
      setGravando(null);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.canvas }}>
      <Cabecalho titulo="Notificações" sub="Escolha o que merece interromper" voltar />

      <ScrollView
        contentContainerStyle={{ padding: space[4], paddingBottom: space[7], gap: space[5] }}
        showsVerticalScrollIndicator={false}
      >
        {falha ? <Aviso tom="erro" texto={falha} /> : null}

        <View style={{ gap: space[3] }}>
          <TituloSecao titulo="Avisos do CRM" />
          <Cartao padding={0} style={{ overflow: 'hidden' }}>
            <LinhaMenu
              icone="notifications-outline"
              titulo="Avisar sobre mensagem nova"
              sub="Vale para qualquer canal conectado"
              direita={
                <Interruptor
                  ligado={prefs.notificacoesAtivas}
                  ocupado={carregando || gravando === 'notificacoesAtivas'}
                  aoMudar={(novo) => alternar('notificacoesAtivas', novo)}
                />
              }
            />
            <Divisor />
            <LinhaMenu
              icone="checkbox-outline"
              titulo="Avisar sobre tarefa nova"
              sub="Quando alguém da equipe cria uma tarefa"
              direita={
                <Interruptor
                  ligado={prefs.notificarNovaTarefa}
                  ocupado={carregando || gravando === 'notificarNovaTarefa'}
                  aoMudar={(novo) => alternar('notificarNovaTarefa', novo)}
                />
              }
            />
          </Cartao>
          <Secundario>
            Essas duas opções são as mesmas do CRM no computador: o que você mudar aqui vale nos dois.
          </Secundario>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
