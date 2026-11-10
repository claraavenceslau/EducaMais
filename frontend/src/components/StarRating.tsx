import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';
import type { Stars } from '../types';

type Props = {
  value: number; // 0 a 5; no modo leitura aceita decimais (4,6 mostra 5 estrelas cheias arredondando)
  size?: number;
  /** Se informado, as estrelas ficam tocáveis (modo avaliar). */
  onChange?: (stars: Stars) => void;
  label?: string;
};

const STAR_COLOR = '#F5A524'; // decorativa; o valor em texto sempre acompanha

// Cinco estrelas. Em modo leitura é uma imagem com rótulo ("4 de 5 estrelas");
// em modo avaliar, cada estrela é um botão de 44 px com estado selecionado.
export function StarRating({ value, size = 18, onChange, label }: Props) {
  const rounded = Math.round(value);
  const stars = [1, 2, 3, 4, 5] as const;

  if (!onChange) {
    return (
      <View
        style={styles.row}
        accessible
        accessibilityRole="image"
        accessibilityLabel={label ?? `${rounded} de 5 estrelas`}
      >
        {stars.map((n) => (
          <Ionicons key={n} name={n <= rounded ? 'star' : 'star-outline'} size={size} color={STAR_COLOR} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={label ?? 'Sua nota'}>
      {stars.map((n) => (
        <Pressable
          key={n}
          onPress={() => onChange(n)}
          accessibilityRole="radio"
          accessibilityLabel={`${n} ${n === 1 ? 'estrela' : 'estrelas'}`}
          accessibilityState={{ selected: n === value }}
          style={styles.hit}
        >
          <Ionicons name={n <= value ? 'star' : 'star-outline'} size={size} color={STAR_COLOR} />
        </Pressable>
      ))}
    </View>
  );
}

/** "★ 4,8 (23)" ou "Novo": a nota em texto, para quem não enxerga as estrelas. */
export function RatingText({ average, count }: { average: number; count: number }) {
  if (count === 0) return <Text style={styles.text} accessibilityLabel="Curso novo, sem avaliações">Novo</Text>;
  return (
    <Text style={styles.text} accessibilityLabel={`Nota ${average.toFixed(1).replace('.', ',')} de 5, ${count} avaliações`}>
      ★ {average.toFixed(1).replace('.', ',')} ({count})
    </Text>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  hit: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.medium, fontSize: 12, color: colors.warnText },
});
