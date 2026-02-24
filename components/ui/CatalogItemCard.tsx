import { CatalogItem } from '@/constants/data';
import { useStore } from '@/store/useStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from './icon-symbol';
import { RecordUsageModal } from './RecordUsageModal';

interface Props {
  item: CatalogItem;
  viewMode?: 'card' | 'list';
}

export function CatalogItemCard({ item, viewMode = 'card' }: Props) {
  const router = useRouter();
  const activityHistory = useStore((state) => state.activityHistory);
  const removeCustomActivity = useStore((state) => state.removeCustomActivity);

  const usageCount = activityHistory.filter((h) => h.activityId === item.id).length;
  const [isModalVisible, setModalVisible] = useState(false);

  const isCustom = item.id.startsWith('custom_');

  const handleDelete = () => {
    if (!isCustom) {
      Alert.alert('Catalogue Protégé', 'Cette activité fait partie du catalogue standard et ne peut pas être supprimée.');
      return;
    }
    Alert.alert(
      'Supprimer l\'activité',
      'Êtes-vous sûr de vouloir supprimer cette activité ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive', 
          onPress: () => removeCustomActivity(item.id) 
        }
      ]
    );
  };

  const handleEdit = () => {
    if (!isCustom) {
      Alert.alert('Catalogue Protégé', 'Cette activité fait partie du catalogue standard. Vous pouvez créer votre propre activité personnalisée via le bouton + en haut de la page.');
      return;
    }
    router.push(`/create-activity?editId=${item.id}` as any);
  };

  if (viewMode === 'list') {
    return (
      <View style={styles.listCardWrap}>
        <View style={styles.listCard}>
          <TouchableOpacity 
            style={styles.listContent} 
            activeOpacity={0.7}
            onPress={() => router.push(`/activity/${item.id}` as any)}
          >
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            <View style={{flexDirection: 'row', gap: 6, marginTop: 4, alignItems: 'center'}}>
              <Text style={styles.categoryBadge}>{item.category}</Text>
              <Text style={[styles.detailText, { fontWeight: 'bold' }]}>{item.type}</Text>
              {isCustom && <View style={styles.isCustomDot} />}
            </View>
          </TouchableOpacity>
          
          <View style={styles.listActions}>
            {/* Edit Button - Always Blue Background */}
            <TouchableOpacity 
              style={[styles.actionBtnSmall, { backgroundColor: '#e6f2f7', borderColor: '#0a7ea4' }]} 
              onPress={handleEdit}
            >
              <IconSymbol name="pencil" size={16} color="#0a7ea4" />
            </TouchableOpacity>
            
            {/* Delete Button - Always Red Background */}
            <TouchableOpacity 
              style={[styles.actionBtnSmall, { backgroundColor: '#feeaf0', borderColor: '#ff4444' }]} 
              onPress={handleDelete}
            >
              <IconSymbol name="trash.fill" size={16} color="#ff4444" />
            </TouchableOpacity>

            {/* Record Button (Plus icon) - Always Dark Blue */}
            <TouchableOpacity style={styles.listRecordBtn} onPress={() => setModalVisible(true)}>
              <IconSymbol name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        <RecordUsageModal 
          visible={isModalVisible} 
          onClose={() => setModalVisible(false)} 
          activityId={item.id} 
          activityTitle={item.title} 
        />
      </View>
    );
  }

  return (
    <View style={styles.cardWrap}>
      <View style={styles.card}>
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => router.push(`/activity/${item.id}` as any)}
        >
          <Image source={{ uri: item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=400&q=80' }} style={styles.image} />
          {usageCount > 0 && (
            <View style={styles.cardUsageBadge}>
              <IconSymbol name="checkmark.circle.fill" size={12} color="#fff" />
              <Text style={styles.cardUsageText}>{usageCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.content}>
          <TouchableOpacity 
             activeOpacity={0.7}
             onPress={() => router.push(`/activity/${item.id}` as any)}
          >
            <View style={styles.header}>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            
            <View style={{flexDirection: 'row', gap: 6, marginBottom: 12}}>
              <Text style={styles.categoryBadge}>{item.category}</Text>
              <Text style={styles.typeBadge}>{item.type}</Text>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          </TouchableOpacity>

          <View style={styles.cardFooter}>
            {/* Record Button */}
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => setModalVisible(true)}
            >
              <IconSymbol name="plus" size={18} color="#fff" />
              <Text style={styles.buttonText}>Enregistrer</Text>
            </TouchableOpacity>

            {/* Always visible action buttons */}
            <View style={styles.customActions}>
              <TouchableOpacity 
                style={[styles.secondaryActionBtn, { backgroundColor: '#e6f2f7' }]} 
                onPress={handleEdit}
              >
                <IconSymbol name="pencil" size={18} color="#0a7ea4" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.secondaryActionBtn, { backgroundColor: '#feeaf0' }]} 
                onPress={handleDelete}
              >
                <IconSymbol name="trash.fill" size={18} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <RecordUsageModal 
        visible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
        activityId={item.id} 
        activityTitle={item.title} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 180,
  },
  cardUsageBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  cardUsageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    color: '#1a1a1a',
    flex: 1,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0a7ea4',
    backgroundColor: '#e6f2f7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  typeBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  customActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },

  // List View Styles
  listCardWrap: {
    marginBottom: 10,
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  listContent: {
    flex: 1,
  },
  isCustomDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0a7ea4',
  },
  detailText: {
    fontSize: 12,
    color: '#888',
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  listRecordBtn: {
    backgroundColor: '#0a7ea4',
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
