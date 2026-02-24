import { IconSymbol } from '@/components/ui/icon-symbol';
import { CATALOG_DATA } from '@/constants/data';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const customActivities = useStore((state) => state.customActivities);
  const etablissements = useStore((state) => state.etablissements);
  const activityHistory = useStore((state) => state.activityHistory);
  const recordActivityUsage = useStore((state) => state.recordActivityUsage);

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedEtabId, setSelectedEtabId] = useState<string | null>(null);
  
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [customDate, setCustomDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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

  const usageCount = activityHistory.filter((h) => h.activityId === item.id).length;

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

  const imagesToDisplay = item.images && item.images.length > 0 
    ? item.images 
    : [item.image || 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=400&q=80'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={28} color="#0a7ea4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{item.title}</Text>
        <TouchableOpacity onPress={() => router.push(`/create-activity?editId=${item.id}` as any)} style={styles.editBtn}>
          <IconSymbol name="pencil" size={24} color="#0a7ea4" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {imagesToDisplay.length > 1 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.heroImageContainer}>
            {imagesToDisplay.map((img: string, index: number) => (
              <Image key={index} source={{ uri: img }} style={[styles.heroImage, {width: 400}]} />
            ))}
          </ScrollView>
        ) : (
          <Image source={{ uri: imagesToDisplay[0] }} style={styles.heroImage} />
        )}

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title}</Text>
            {usageCount > 0 && (
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                <IconSymbol name="book.fill" size={20} color={Colors.light.tint} />
                <Text style={{color: Colors.light.tint, fontWeight: 'bold', fontSize: 16}}>{usageCount}</Text>
              </View>
            )}
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
          style={styles.button} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>
            Enregistrer une utilisation
          </Text>
        </TouchableOpacity>
      </View>

      {/* Record Usage Modal */}
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

            <Text style={styles.modalLabel}>Date</Text>
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
    marginHorizontal: 16,
  },
  backBtn: {
    padding: 4,
  },
  editBtn: {
    padding: 4,
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
  backBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  heroImageContainer: {
    height: 250,
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
