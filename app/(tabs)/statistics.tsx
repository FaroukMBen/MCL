import { IconSymbol } from '@/components/ui/icon-symbol';
import { CATALOG_DATA } from '@/constants/data';
import { useStore } from '@/store/useStore';
import { useMemo } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function StatisticsScreen() {
  const activityHistory = useStore((state) => state.activityHistory);
  const customActivities = useStore((state) => state.customActivities);

  const allActivities = useMemo(() => [...CATALOG_DATA, ...customActivities], [customActivities]);

  const { topActivities, recentHistory } = useMemo(() => {
    // Calculate usage counts
    const counts = new Map<string, number>();
    activityHistory.forEach((usage) => {
      counts.set(usage.activityId, (counts.get(usage.activityId) || 0) + 1);
    });

    // Get top 3
    const top3 = Array.from(counts.entries())
      .map(([activityId, count]) => ({
        activityId,
        count,
        activity: allActivities.find((a) => a.id === activityId)
      }))
      .filter((a) => a.activity) // ensure activity still exists
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Recent history (sort by date desc, maybe top 20)
    const recent = [...activityHistory]
      .sort((a, b) => b.date - a.date)
      .slice(0, 20)
      .map((usage) => ({
        ...usage,
        activity: allActivities.find((a) => a.id === usage.activityId)
      }))
      .filter((u) => u.activity); 

    return { topActivities: top3, recentHistory: recent };
  }, [activityHistory, allActivities]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistiques</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Top 3 Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Top 3 Activités</Text>
          {topActivities.length === 0 ? (
            <Text style={styles.emptyText}>Aucune activité enregistrée pour le moment.</Text>
          ) : (
            topActivities.map((item, index) => (
              <View key={item.activityId} style={styles.topCard}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.topInfo}>
                  <Text style={styles.topTitle}>{item.activity?.title}</Text>
                  <Text style={styles.topDetail}>Utilisé {item.count} fois</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕒 Historique Récent</Text>
          {recentHistory.length === 0 ? (
            <Text style={styles.emptyText}>L'historique est vide.</Text>
          ) : (
            recentHistory.map((usage) => {
              const date = new Date(usage.date);
              return (
                <View key={usage.id} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <IconSymbol name="book.fill" size={20} color="#0a7ea4" />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyTitle} numberOfLines={1}>{usage.activity?.title}</Text>
                    <Text style={styles.historyDate}>
                      {date.toLocaleDateString('fr-FR')} à {date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
  },
  topCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f2f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  topInfo: {
    flex: 1,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  topDetail: {
    fontSize: 14,
    color: '#666',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyIcon: {
    marginRight: 16,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  historyDate: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  }
});
