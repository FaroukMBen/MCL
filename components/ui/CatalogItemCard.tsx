import { CatalogItem } from '@/constants/data';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from './icon-symbol';

interface Props {
  item: CatalogItem;
  viewMode?: 'card' | 'list';
}

export function CatalogItemCard({ item, viewMode = 'card' }: Props) {
  const router = useRouter();
  const etablissements = useStore((state) => state.etablissements);
  const activityHistory = useStore((state) => state.activityHistory);
  const recordActivityUsage = useStore((state) => state.recordActivityUsage);

  const usageCount = activityHistory.filter((h) => h.activityId === item.id).length;

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedEtabId, setSelectedEtabId] = useState<string | null>(null);
  
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [customDate, setCustomDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleRecordUsage = () => {
    let finalDate = Date.now();
    if (useCustomDate) {
      finalDate = customDate.getTime();
    }
    
    recordActivityUsage(item.id, finalDate, selectedEtabId || undefined);
    setModalVisible(false);
    
    // Reset modal state
    setSelectedEtabId(null);
    setUseCustomDate(false);
    setCustomDate(new Date());
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = customDate;
      currentDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setCustomDate(new Date(currentDate));
    }
  };

  const onChangeTime = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const currentDate = customDate;
      currentDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setCustomDate(new Date(currentDate));
    }
  };

  const renderModal = () => (
    <Modal visible={isModalVisible} transparent animationType="slide">
      <View style={styles.modalSubContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Détails de l'utilisation</Text>
          
          <Text style={styles.modalLabel}>Établissement (Optionnel)</Text>
          <ScrollView style={styles.etabList} horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.etabChoice, selectedEtabId === null && styles.etabChoiceActive]}
              onPress={() => setSelectedEtabId(null)}
            >
              <Text style={[styles.etabChoiceText, selectedEtabId === null && styles.etabChoiceTextActive]}>Aucun</Text>
            </TouchableOpacity>
            {etablissements.map(etab => (
              <TouchableOpacity 
                key={etab.id}
                style={[styles.etabChoice, selectedEtabId === etab.id && styles.etabChoiceActive]}
                onPress={() => setSelectedEtabId(etab.id)}
              >
                <Text style={[styles.etabChoiceText, selectedEtabId === etab.id && styles.etabChoiceTextActive]}>{etab.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.modalLabel}>Date et Heure</Text>
          <View style={styles.dateToggleRow}>
            <TouchableOpacity style={[styles.dateToggle, !useCustomDate && styles.dateToggleActive]} onPress={() => setUseCustomDate(false)}>
              <Text style={[styles.dateToggleText, !useCustomDate && styles.dateToggleTextActive]}>Maintenant</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dateToggle, useCustomDate && styles.dateToggleActive]} onPress={() => setUseCustomDate(true)}>
              <Text style={[styles.dateToggleText, useCustomDate && styles.dateToggleTextActive]}>Personnalisé</Text>
            </TouchableOpacity>
          </View>

          {useCustomDate && (
            <View style={styles.customDateWrapper}>
              <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateTimeBtnText}>{customDate.toLocaleDateString('fr-FR')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowTimePicker(true)}>
                <Text style={styles.dateTimeBtnText}>{customDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={customDate}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={customDate}
                  mode="time"
                  display="default"
                  onChange={onChangeTime}
                />
              )}
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSave} onPress={handleRecordUsage}>
              <Text style={styles.modalSaveText}>Valider</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (viewMode === 'list') {
    return (
      <TouchableOpacity 
        style={styles.listCard} 
        activeOpacity={0.8}
        onPress={() => router.push(`/activity/${item.id}` as any)}
      >
        <View style={styles.listContent}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <View style={{flexDirection: 'row', gap: 6, marginTop: 4, alignItems: 'center'}}>
            <Text style={styles.categoryBadge}>{item.category}</Text>
            <Text style={styles.detailText}>• {item.type}</Text>
            <Text style={styles.detailText}>• Utilisé {usageCount} fois</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.listRecordBtn} onPress={() => setModalVisible(true)}>
          <IconSymbol name="plus" size={20} color="#0a7ea4" />
        </TouchableOpacity>
        {renderModal()}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.8}
      onPress={() => router.push(`/activity/${item.id}` as any)}
    >
      <Image source={{ uri: item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=400&q=80' }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
          {usageCount > 0 && (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <IconSymbol name="book.fill" size={16} color={Colors.light.tint} />
              <Text style={{color: Colors.light.tint, fontWeight: 'bold'}}>{usageCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.categoryBadge}>{item.category}</Text>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.details}>
          {item.duration && (
            <View style={{flexDirection:'row',alignItems:'center',gap:3}}>
              <IconSymbol name="clock.fill" size={12} color="#888" />
              <Text style={styles.detailText}>{item.duration}</Text>
            </View>
          )}
          {item.location && (
            <View style={{flexDirection:'row',alignItems:'center',gap:3}}>
              <IconSymbol name="map.fill" size={12} color="#888" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>
            Enregistrer l'utilisation
          </Text>
        </TouchableOpacity>
        {renderModal()}
      </View>
    </TouchableOpacity>
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
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listContent: {
    flex: 1,
  },
  listRecordBtn: {
    backgroundColor: '#e6f2f7',
    padding: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  modalSubContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
  },
  etabList: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  etabChoice: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  etabChoiceActive: {
    backgroundColor: '#0a7ea4',
  },
  etabChoiceText: {
    color: '#333',
    fontWeight: '600',
  },
  etabChoiceTextActive: {
    color: '#fff',
  },
  dateToggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  dateToggle: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  dateToggleActive: {
    backgroundColor: '#0a7ea4',
  },
  dateToggleText: {
    fontWeight: '600',
    color: '#555',
  },
  dateToggleTextActive: {
    color: '#fff',
  },
  customDateWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 10,
  },
  dateTimeBtn: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  dateTimeBtnText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancel: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalCancelText: {
    color: '#555',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalSave: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#0a7ea4',
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
