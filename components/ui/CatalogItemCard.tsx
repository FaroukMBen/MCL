import { CatalogItem } from '@/constants/data';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from './icon-symbol';

interface Props {
  item: CatalogItem;
}

export function CatalogItemCard({ item }: Props) {
  const completedItems = useStore((state) => state.completedItems);
  const addCompletedItem = useStore((state) => state.addCompletedItem);
  const addXp = useStore((state) => state.addXp);

  const isCompleted = completedItems.includes(item.id);

  const handleComplete = () => {
    if (!isCompleted) {
      addCompletedItem(item.id);
      addXp(20); // Give 20 XP for completion
    }
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
          {isCompleted && <IconSymbol name="house.fill" size={20} color={Colors.light.tint} />}
        </View>
        <Text style={styles.categoryBadge}>{item.category}</Text>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.details}>
          {item.duration && (
            <Text style={styles.detailText}>⏳ {item.duration}</Text>
          )}
          {item.location && (
            <Text style={styles.detailText}>📍 {item.location}</Text>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.button, isCompleted && styles.buttonCompleted]} 
          onPress={handleComplete}
          disabled={isCompleted}
        >
          <Text style={[styles.buttonText, isCompleted && styles.buttonTextCompleted]}>
            {isCompleted ? 'Terminé (XP +20)' : 'Marquer comme terminé'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0a7ea4',
    backgroundColor: '#e6f2f7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
    overflow: 'hidden',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  details: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonCompleted: {
    backgroundColor: '#f0f0f0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonTextCompleted: {
    color: '#28a745',
  },
});
