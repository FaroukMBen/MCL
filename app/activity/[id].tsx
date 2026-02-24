import { IconSymbol } from '@/components/ui/icon-symbol';
import { CATALOG_DATA } from '@/constants/data';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const customActivities = useStore((state) => state.customActivities);
  const completedItems = useStore((state) => state.completedItems);
  const addCompletedItem = useStore((state) => state.addCompletedItem);
  const addXp = useStore((state) => state.addXp);

  const item = useMemo(() => {
    return [...CATALOG_DATA, ...customActivities].find((a) => a.id === id);
  }, [id, customActivities]);

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Activité introuvable.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = completedItems.includes(item.id);

  const handleComplete = () => {
    if (!isCompleted) {
      addCompletedItem(item.id);
      addXp(20);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={28} color="#000" /> 
            {/* The closest icon available to left chevron based on our mapping */}
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{item.title}</Text>
          <View style={{ width: 28 }} />
        </View>

        <Image source={{ uri: item.image }} style={styles.heroImage} />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title}</Text>
            {isCompleted && <IconSymbol name="house.fill" size={24} color={Colors.light.tint} />}
          </View>

          <View style={styles.badgesWrapper}>
            <Text style={styles.badge}>{item.category}</Text>
            <Text style={[styles.badge, styles.typeBadge]}>{item.type}</Text>
            {item.ageGroup && <Text style={[styles.badge, styles.filterBadge]}>{item.ageGroup}</Text>}
            {item.schoolLevel && <Text style={[styles.badge, styles.filterBadge]}>{item.schoolLevel}</Text>}
            {item.schoolClass && <Text style={[styles.badge, styles.filterBadge]}>{item.schoolClass}</Text>}
          </View>

          <Text style={styles.description}>{item.description}</Text>

          {item.duration && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📍 Durée : </Text>
              <Text style={styles.detailValue}>{item.duration}</Text>
            </View>
          )}

          {item.location && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📍 Lieu : </Text>
              <Text style={styles.detailValue}>{item.location}</Text>
            </View>
          )}

          {item.prerequis && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📍 Prérequis : </Text>
              <Text style={styles.detailValue}>{item.prerequis}</Text>
            </View>
          )}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, isCompleted && styles.buttonCompleted]} 
          onPress={handleComplete}
          disabled={isCompleted}
        >
          <Text style={[styles.buttonText, isCompleted && styles.buttonTextCompleted]}>
            {isCompleted ? 'Activité terminée (+20 XP)' : 'Marquer comme terminé'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  backBtn: {
    padding: 12,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backArrow: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  badgesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0a7ea4',
    backgroundColor: '#e6f2f7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  typeBadge: {
    backgroundColor: '#fff4cc',
    color: '#b38000',
  },
  filterBadge: {
    backgroundColor: '#e6e6e6',
    color: '#555',
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonCompleted: {
    backgroundColor: '#f0f0f0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextCompleted: {
    color: '#28a745',
  },
});
