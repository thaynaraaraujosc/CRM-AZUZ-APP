import { Text, View } from 'react-native';

import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, radius, space } from '@/theme/tokens';

/**
 * Marca do produto nas telas de entrada: o "a" em bloco marinho + o nome em caixa baixa,
 * exatamente como o `auth-brand` do CRM web.
 */
export function Marca({ tamanho = 40 }: { tamanho?: number }) {
  const c = useCores();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
      <View
        style={{
          width: tamanho,
          height: tamanho,
          borderRadius: radius.md,
          backgroundColor: c.acao,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: c.acaoTexto,
            fontSize: tamanho * 0.55,
            fontWeight: fontWeight.bold,
            lineHeight: tamanho * 0.7,
          }}
        >
          a
        </Text>
      </View>
      <Text style={{ color: c.ink, fontSize: fontSize.xl, fontWeight: fontWeight.bold, letterSpacing: -0.4 }}>
        azuz crm
      </Text>
    </View>
  );
}
