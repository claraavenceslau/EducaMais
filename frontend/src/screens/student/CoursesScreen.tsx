import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AsyncView } from '../../components/AsyncView';
import { Chip } from '../../components/Chip';
import { CourseCard } from '../../components/CourseCard';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { courseRating } from '../../utils/reviews';
import { useData } from '../../context/DataContext';
import { useMainNavigation } from '../../navigation/hooks';
import { colors, fonts, layout } from '../../theme';
import type { CourseLevel, CourseTheme } from '../../types';
import { COURSE_LEVELS, COURSE_THEMES, filterCourses, type CourseTab } from '../../utils/selectors';

const TABS: { key: CourseTab; label: string }[] = [
  { key: 'explorar', label: 'Explorar' },
  { key: 'meus', label: 'Meus cursos' },
];

export function CoursesScreen() {
  const nav = useMainNavigation();
  const { status, data, reload } = useData();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<CourseTab>('explorar');
  const [theme, setTheme] = useState<CourseTheme>();
  const [level, setLevel] = useState<CourseLevel>();

  const courses = filterCourses(data.courses, { tab, theme, level });
  // 2 colunas no celular, 3 em telas largas (protótipos de até 767 px e de 1025 px ou mais)
  const columns = width >= layout.phoneMax + 1 ? 3 : 2;
  const rows: typeof courses[] = [];
  for (let i = 0; i < courses.length; i += columns) rows.push(courses.slice(i, i + columns));

  return (
    <Screen>
      <Text style={styles.title} accessibilityRole="header">Cursos</Text>

      <AsyncView status={status} onRetry={reload}>
        <SegmentedTabs options={TABS} value={tab} onChange={setTab} />

        <Text style={styles.filterLabel}>Tema</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="Todos" selected={!theme} onPress={() => setTheme(undefined)} accessibilityLabel="Todos os temas" />
          {COURSE_THEMES.map((t) => (
            <Chip key={t} label={t} selected={theme === t} onPress={() => setTheme(theme === t ? undefined : t)} />
          ))}
        </ScrollView>

        <Text style={styles.filterLabel}>Nível</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="Todos" selected={!level} onPress={() => setLevel(undefined)} accessibilityLabel="Todos os níveis" />
          {COURSE_LEVELS.map((l) => (
            <Chip key={l} label={l} selected={level === l} onPress={() => setLevel(level === l ? undefined : l)} />
          ))}
        </ScrollView>

        <View style={styles.grid}>
          {courses.length === 0 ? (
            <EmptyState
              icon="school-outline"
              title={tab === 'meus' ? 'Você ainda não está em nenhum curso' : 'Nenhum curso encontrado'}
              message={tab === 'meus' ? 'Abra a aba Explorar e inscreva-se em um curso.' : 'Tente remover algum filtro.'}
              actionLabel={tab === 'meus' ? 'Explorar cursos' : undefined}
              onAction={tab === 'meus' ? () => setTab('explorar') : undefined}
            />
          ) : (
            rows.map((row, i) => (
              <View key={i} style={styles.row}>
                {row.map((c) => (
                  <View key={c.id} style={styles.cell}>
                    <CourseCard course={c} rating={courseRating(data.reviews, c.id)} onPress={() => nav.navigate('CourseDetail', { courseId: c.id })} />
                  </View>
                ))}
                {/* células vazias mantêm a largura das colunas na última linha */}
                {Array.from({ length: columns - row.length }).map((_, k) => (
                  <View key={`empty-${k}`} style={styles.cell} />
                ))}
              </View>
            ))
          )}
        </View>
      </AsyncView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, marginBottom: 16 },
  filterLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.textMuted, marginTop: 16, marginBottom: 6 },
  chips: { gap: 8 },
  grid: { marginTop: 20, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  cell: { flex: 1 },
});
