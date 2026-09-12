import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Text, View } from 'react-native';

import { useCores } from '@/theme/ThemeContext';
import { fontSize, fontWeight, space } from '@/theme/tokens';

import { Botao } from './ui';

/** Enquanto a API não respondeu. */
export function Carregando({ texto = 'Carregando' }: { texto?: string }) {
  const c = useCores();
  return (
    <View style={{ paddingVertical: space[7], alignItems: 'center', gap: space[3] }}>
      <ActivityIndicator color={c.blue} />
      <Text style={{ color: c.textMuted, fontSize: fontSize.sm }}>{texto}</Text>
    </View>
  );
}

/**
 * Quando a chamada falhou. Mostra o motivo que veio do servidor em vez de "algo deu errado":
 * sem rede, banco fora do ar e permissão negada pedem reações diferentes de quem está lendo.
 */
export function FalhaAoCarregar({ mensagem, aoTentar }: { mensagem: string; aoTentar: () => void }) {
  const c = useCores();
  return (
    <View style={{ paddingVertical: space[6], paddingHorizontal: space[4], alignItems: 'center', gap: space[3] }}>
      <Ionicons name="cloud-offline-outline" size={28} color={c.textFaint} />
      <Text style={{ color: c.ink, fontSize: fontSize.base, fontWeight: fontWeight.bold }}>
        Não deu para carregar
      </Text>
      <Text style={{ color: c.textMuted, fontSize: fontSize.sm, textAlign: 'center', maxWidth: 280 }}>
        {mensagem}
      </Text>
      <Botao titulo="Tentar de novo" variante="secundario" icone="refresh-outline" onPress={aoTentar} />
    </View>
  );
}
