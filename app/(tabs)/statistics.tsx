import { IconSymbol } from '@/components/ui/icon-symbol';
import { CATALOG_DATA } from '@/constants/data';
import { getLevelFromXp, getLevelTitle, useStore } from '@/store/useStore';
import { useMemo } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function StatisticsScreen() {
  const activityHistory = useStore((state) => state.activityHistory);
  const customActivities = useStore((state) => state.customActivities);
  const etablissements = useStore((state) => state.etablissements);
  const xp = useStore((state) => state.xp);
  const achievements = useStore((state) => state.achievements);

  const allActivities = useMemo(() => [...CATALOG_DATA, ...customActivities], [customActivities]);

  const stats = useMemo(() => {
    const counts = new Map<string, number>();
    const categoryCounts = new Map<string, number>();
    const etabCounts = new Map<string, number>();
    const daySet = new Set<string>();

    activityHistory.forEach((usage) => {
      counts.set(usage.activityId, (counts.get(usage.activityId) || 0) + 1);

      const activity = allActivities.find((a) => a.id === usage.activityId);
      if (activity) {
        categoryCounts.set(activity.category, (categoryCounts.get(activity.category) || 0) + 1);
      }

      if (usage.etablissementId) {
        etabCounts.set(usage.etablissementId, (etabCounts.get(usage.etablissementId) || 0) + 1);
      }

      const day = new Date(usage.date).toISOString().split('T')[0];
      daySet.add(day);
    });

    // Top 5
    const topActivities = Array.from(counts.entries())
      .map(([activityId, count]) => ({ activityId, count, activity: allActivities.find((a) => a.id === activityId) }))
      .filter((a) => a.activity)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Category breakdown
    const categoryBreakdown = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Top establishments
    const topEtabs = Array.from(etabCounts.entries())
      .map(([etabId, count]) => ({ etabId, count, etab: etablissements.find((e) => e.id === etabId) }))
      .filter((e) => e.etab)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Recent history
    const recentHistory = [...activityHistory]
      .sort((a, b) => b.date - a.date)
      .slice(0, 15)
      .map((usage) => ({ ...usage, activity: allActivities.find((a) => a.id === usage.activityId) }))
      .filter((u) => u.activity);

    // Unique activities
    const uniqueActivities = new Set(activityHistory.map((h) => h.activityId)).size;

    // Activity streak
    const streak = calculateStreak(activityHistory);

    // Achievements progress
    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    return {
      topActivities,
      categoryBreakdown,
      topEtabs,
      recentHistory,
      uniqueActivities,
      activeDays: daySet.size,
      streak,
      unlockedCount,
      totalAchievements: achievements.length,
    };
  }, [activityHistory, allActivities, etablissements, achievements]);

  const levelInfo = getLevelFromXp(xp);
  const levelTitle = getLevelTitle(levelInfo.level);

  const CATEGORY_COLORS: Record<string, string> = {
    'Activités': '#0a7ea4',
    'Coloriage': '#e91e63',
    'Jeux': '#ff9800',
  };

  const totalCategoryUsages = stats.categoryBreakdown.reduce((sum, c) => sum + c.count, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistiques</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Overview Cards */}
        <View style={styles.overviewGrid}>
          <View style={[styles.overviewCard, { borderLeftColor: '#0a7ea4' }]}>  
            <View style={styles.overviewIconWrap}>
              <IconSymbol name="book.fill" size={20} color="#0a7ea4" />
            </View>
            <Text style={styles.overviewValue}>{activityHistory.length}</Text>
            <Text style={styles.overviewLabel}>Utilisations</Text>
          </View>
          <View style={[styles.overviewCard, { borderLeftColor: '#4caf50' }]}>
            <View style={[styles.overviewIconWrap, { backgroundColor: '#e8f5e9' }]}>
              <IconSymbol name="sparkles" size={20} color="#4caf50" />
            </View>
            <Text style={styles.overviewValue}>{stats.uniqueActivities}</Text>
            <Text style={styles.overviewLabel}>Différentes</Text>
          </View>
          <View style={[styles.overviewCard, { borderLeftColor: '#ff9800' }]}>
            <View style={[styles.overviewIconWrap, { backgroundColor: '#fff3e0' }]}>
              <IconSymbol name="flame.fill" size={20} color="#ff9800" />
            </View>
            <Text style={styles.overviewValue}>{stats.streak}</Text>
            <Text style={styles.overviewLabel}>Jours d'affilée</Text>
          </View>
          <View style={[styles.overviewCard, { borderLeftColor: '#7c4dff' }]}>
            <View style={[styles.overviewIconWrap, { backgroundColor: '#ede7f6' }]}>
              <IconSymbol name="trophy.fill" size={20} color="#7c4dff" />
            </View>
            <Text style={styles.overviewValue}>{stats.unlockedCount}/{stats.totalAchievements}</Text>
            <Text style={styles.overviewLabel}>Succès</Text>
          </View>
        </View>

        {/* Level Progress */}
        <View style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelTitle}>Niveau {levelInfo.level}</Text>
              <Text style={styles.levelSubtitle}>{levelTitle}</Text>
            </View>
            <Text style={styles.xpText}>{levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP</Text>
          </View>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${Math.min((levelInfo.currentLevelXp / levelInfo.nextLevelXp) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.totalXpText}>{xp} XP total</Text>
        </View>

        {/* Category Breakdown */}
        {stats.categoryBreakdown.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <IconSymbol name="chart.bar.fill" size={20} color="#0a7ea4" />
              <Text style={styles.sectionTitle}>Répartition par catégorie</Text>
            </View>
            <View style={styles.categoryCard}>
              {/* Visual bar */}
              <View style={styles.categoryBarContainer}>
                {stats.categoryBreakdown.map(({ category, count }) => (
                  <View
                    key={category}
                    style={[styles.categoryBarSegment, {
                      flex: count,
                      backgroundColor: CATEGORY_COLORS[category] || '#999',
                    }]}
                  />
                ))}
              </View>
              {/* Legend */}
              {stats.categoryBreakdown.map(({ category, count }) => (
                <View key={category} style={styles.categoryRow}>
                  <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[category] || '#999' }]} />
                  <Text style={styles.categoryName}>{category}</Text>
                  <Text style={styles.categoryCount}>{count}</Text>
                  <Text style={styles.categoryPercent}>
                    {Math.round((count / totalCategoryUsages) * 100)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Top 5 Activities */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <IconSymbol name="trophy.fill" size={20} color="#ff9800" />
            <Text style={styles.sectionTitle}>Top Activités</Text>
          </View>
          {stats.topActivities.length === 0 ? (
            <Text style={styles.emptyText}>Aucune activité enregistrée.</Text>
          ) : (
            stats.topActivities.map((item, index) => {
              const maxCount = stats.topActivities[0]?.count || 1;
              const barWidth = (item.count / maxCount) * 100;
              return (
                <View key={item.activityId} style={styles.topCard}>
                  <View style={[styles.rankBadge, index === 0 && styles.rankGold, index === 1 && styles.rankSilver, index === 2 && styles.rankBronze]}>
                    <Text style={[styles.rankText, index < 3 && { color: '#fff' }]}>#{index + 1}</Text>
                  </View>
                  <View style={styles.topInfo}>
                    <View style={styles.topTitleRow}>
                      <Text style={styles.topTitle} numberOfLines={1}>{item.activity?.title}</Text>
                      <Text style={styles.topCount}>{item.count}×</Text>
                    </View>
                    <View style={styles.topBarBg}>
                      <View style={[styles.topBarFill, { width: `${barWidth}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Top Establishments */}
        {stats.topEtabs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <IconSymbol name="building.2.fill" size={20} color="#0a7ea4" />
              <Text style={styles.sectionTitle}>Établissements les plus actifs</Text>
            </View>
            {stats.topEtabs.map((item, index) => (
              <View key={item.etabId} style={styles.etabStatCard}>
                <View style={styles.etabStatIcon}>
                  <IconSymbol name="building.2.fill" size={24} color="#0a7ea4" />
                </View>
                <View style={styles.etabStatInfo}>
                  <Text style={styles.etabStatName}>{item.etab?.name}</Text>
                  <Text style={styles.etabStatCount}>{item.count} utilisations</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent History */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <IconSymbol name="clock.fill" size={20} color="#666" />
            <Text style={styles.sectionTitle}>Historique Récent</Text>
          </View>
          {stats.recentHistory.length === 0 ? (
            <View style={styles.emptyHistory}>
              <IconSymbol name="clock.fill" size={40} color="#ccc" />
              <Text style={styles.emptyText}>L'historique est vide.</Text>
              <Text style={styles.emptySubtext}>Enregistrez une activité pour commencer.</Text>
            </View>
          ) : (
            stats.recentHistory.map((usage) => {
              const date = new Date(usage.date);
              const etab = etablissements.find((e) => e.id === usage.etablissementId);
              return (
                <View key={usage.id} style={styles.historyItem}>
                  <View style={styles.historyIcon}>
                    <IconSymbol name="checkmark.circle.fill" size={22} color="#4caf50" />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyTitle} numberOfLines={1}>{usage.activity?.title}</Text>
                    <View style={styles.historyMeta}>
                      <Text style={styles.historyDate}>
                        {date.toLocaleDateString('fr-FR')} à {date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                      </Text>
                      {etab && <Text style={styles.historyEtab}>• {etab.name}</Text>}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
}

function calculateStreak(history: { date: number }[]): number {
  if (history.length === 0) return 0;
  const days = new Set(history.map((h) => new Date(h.date).toISOString().split('T')[0]));
  const sortedDays = Array.from(days).sort().reverse();
  
  const today = new Date().toISOString().split('T')[0];
  if (!days.has(today)) {
    // Check yesterday
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (!days.has(yesterday)) return 0;
  }

  let streak = 0;
  let currentDate = new Date();
  
  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (days.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    currentDate = new Date(currentDate.getTime() - 86400000);
  }
  return streak;
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

  // Overview Grid
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  overviewCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#e6f2f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  overviewValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  overviewLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    marginTop: 2,
  },

  // Level Progress
  levelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  levelSubtitle: {
    fontSize: 13,
    color: '#0a7ea4',
    fontWeight: '600',
  },
  xpText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  xpBarBg: {
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#0a7ea4',
    borderRadius: 5,
  },
  totalXpText: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'right',
    marginTop: 6,
  },

  // Categories
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryBarContainer: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  categoryBarSegment: {
    height: '100%',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  categoryPercent: {
    fontSize: 13,
    color: '#888',
    minWidth: 36,
    textAlign: 'right',
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyHistory: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptySubtext: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 4,
  },

  // Top Activities
  topCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6f2f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rankGold: { backgroundColor: '#ffd700' },
  rankSilver: { backgroundColor: '#b0bec5' },
  rankBronze: { backgroundColor: '#cd7f32' },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  topInfo: {
    flex: 1,
  },
  topTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  topTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  topCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  topBarBg: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
  },
  topBarFill: {
    height: '100%',
    backgroundColor: '#0a7ea4',
    borderRadius: 3,
  },

  // Establishment stats
  etabStatCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  etabStatIcon: {
    marginRight: 16,
  },
  etabStatInfo: {
    flex: 1,
  },
  etabStatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  etabStatCount: {
    fontSize: 13,
    color: '#666',
  },

  // History
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyIcon: {
    marginRight: 14,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  historyMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#888',
  },
  historyEtab: {
    fontSize: 12,
    color: '#0a7ea4',
    fontWeight: '500',
  },
});
