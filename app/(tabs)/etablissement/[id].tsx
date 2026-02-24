import { IconSymbol } from '@/components/ui/icon-symbol';
import { CATALOG_DATA } from '@/constants/data';
import { useStore } from '@/store/useStore';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EtablissementDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const etablissements = useStore((state) => state.etablissements);
  const activityHistory = useStore((state) => state.activityHistory);
  const customActivities = useStore((state) => state.customActivities);

  const etab = useMemo(() => {
    return etablissements.find((e) => e.id === id);
  }, [id, etablissements]);

  const historyAtEtab = useMemo(() => {
    const allActivities = [...CATALOG_DATA, ...customActivities];
    return activityHistory
      .filter((h) => h.etablissementId === id)
      .sort((a, b) => b.date - a.date)
      .map((h) => ({
        ...h,
        activity: allActivities.find((a) => a.id === h.activityId)
      }))
      .filter((h) => h.activity);
  }, [id, activityHistory, customActivities]);

  if (!etab) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Établissement introuvable.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={28} color="#0a7ea4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{etab.name}</Text>
        <View style={{width: 40}} /> {/* Spacer to center title */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image 
          source={{ uri: etab.image || 'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800&q=80' }} 
          style={styles.heroImage} 
        />

        <View style={styles.content}>
          <View style={styles.titleBadgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{etab.type}</Text>
            </View>
          </View>
          
          <Text style={styles.name}>{etab.name}</Text>
          {etab.location && (
            <View style={styles.locationRow}>
              <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
                <IconSymbol name="map.fill" size={16} color="#666" />
                <Text style={styles.locationText}>{etab.location}</Text>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Historique des activités</Text>
          {historyAtEtab.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>Aucune activité enregistrée pour cet établissement.</Text>
            </View>
          ) : (
            historyAtEtab.map((item) => {
              const date = new Date(item.date);
              return (
                <View key={item.id} style={styles.historyCard}>
                  <View style={styles.historyIcon}>
                    <IconSymbol name="book.fill" size={20} color="#0a7ea4" />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyActivityTitle}>{item.activity?.title}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#eee',
  },
  content: {
    padding: 20,
  },
  titleBadgeRow: {
    marginBottom: 8,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6f2f7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: '#0a7ea4',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  locationRow: {
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyHistory: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  emptyHistoryText: {
    color: '#888',
    textAlign: 'center',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyIcon: {
    marginRight: 16,
  },
  historyInfo: {
    flex: 1,
  },
  historyActivityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  historyDate: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backBtnText: {
    color: '#0a7ea4',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
