import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSessao } from '@/api/sessao';
import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

import { Marca } from './Marca';
import { Botao, Cartao } from './ui';

/**
 * Tela de acesso suspenso, no mesmo espírito da `/acesso-bloqueado` do web.
 *
 * Só "ativa" libera o uso: workspace recém-criado que ainda não pagou, pagamento atrasado e
 * assinatura cancelada caem todos aqui.
 *
 * Não existe botão para pagar. A regra de compra da Apple barra tanto vender assinatura digital
 * dentro do app quanto levar a pessoa para pagar fora dele, então a tela explica onde resolver e
 * para por aí.
 */
export function AssinaturaSuspensa() {
  const c = useCores();
  const { usuario, sair, reconferirAssinatura } = useSessao();
  const ehAdmin = usuario?.papelTipo === 'admin';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.canvas }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: space[5], gap: space[5] }}>
        <View style={{ alignItems: 'center' }}>
          <Marca />
        </View>

        <Cartao padding={space[5]} style={{ gap: space[4] }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: radius.md,
              backgroundColor: c.warningSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="lock-closed-outline" size={20} color={c.warning} />
          </View>

          <Text style={{ color: c.ink, fontSize: fontSize.xl, fontWeight: fontWeight.bold, letterSpacing: -0.3 }}>
            Acesso suspenso
          </Text>

          <Text style={{ color: c.textMuted, fontSize: fontSize.base, lineHeight: 21 }}>
            {ehAdmin
              ? 'A assinatura do seu workspace está pendente, atrasada ou cancelada. Regularize o pagamento no CRM pelo computador. Assim que a cobrança for confirmada, o acesso volta sozinho.'
              : 'A assinatura do seu workspace está pendente, atrasada ou cancelada. Fale com o administrador da sua empresa. Assim que a cobrança for confirmada, o acesso volta sozinho.'}
          </Text>

          <Botao titulo="Verificar de novo" variante="secundario" icone="refresh-outline" bloco onPress={reconferirAssinatura} />
          <Botao titulo="Sair da conta" variante="perigo" icone="log-out-outline" bloco onPress={sair} />
        </Cartao>
      </View>
    </SafeAreaView>
  );
}
