import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AsyncView } from '../../components/AsyncView';
import { DemandCard } from '../../components/DemandCard';
import { EmptyState } from '../../components/EmptyState';
import { Fab } from '../../components/Fab';
import { Screen } from '../../components/Screen';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { useData } from '../../context/DataContext';
import { useMainNavigation } from '../../navigation/hooks';
import { filterDemands, type DemandFilter } from '../../utils/demands';

const TABS: { key: DemandFilter; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'abertas', label: 'Em aberto' },
  { key: 'finalizadas', label: 'Finalizadas' },
];

export function DemandsScreen() {
  const nav = useMainNavigation();
  const { status, data, reload } = useData();
  const [filter, setFilter] = useState<DemandFilter>('todas');
  const now = new Date();
  const items = filterDemands(data.demands, filter);

  return (
    <Screen edges={['left', 'right', 'bottom']} maxWidth={720} fab={status === 'ready' ? <Fab label="Nova demanda" onPress={() => nav.navigate('DemandForm')} /> : undefined}>
      <AsyncView status={status} onRetry={reload}>
        <SegmentedTabs options={TABS} value={filter} onChange={setFilter} />
        <View style={styles.list}>
          {items.length === 0 ? (
            <EmptyState
              icon="megaphone-outline"
              title={filter === 'todas' ? 'Nenhuma demanda ainda' : 'Nada por aqui'}
              message={filter === 'todas' ? 'Registre um problema ou uma solicitação para a escola.' : 'Nenhuma demanda neste filtro.'}
              actionLabel={filter === 'todas' ? 'Nova demanda' : undefined}
              onAction={filter === 'todas' ? () => nav.navigate('DemandForm') : undefined}
            />
          ) : (
            items.map((d) => (
              <DemandCard key={d.id} demand={d} now={now} onOpen={() => nav.navigate('DemandDetail', { demandId: d.id })} />
            ))
          )}
        </View>
      </AsyncView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 16, gap: 10 },
});
