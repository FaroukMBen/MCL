import { IconSymbol } from '@/components/ui/icon-symbol';
import { useStore } from '@/store/useStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  activityId: string;
  activityTitle: string;
}

export function RecordUsageModal({ visible, onClose, activityId, activityTitle }: Props) {
  const etablissements = useStore((state) => state.etablissements);
  const recordActivityUsage = useStore((state) => state.recordActivityUsage);

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
    
    recordActivityUsage(activityId, finalDate, selectedEtabId || undefined);
    onClose();
    
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

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalSubContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Détails de l'utilisation</Text>
          <Text style={styles.modalActivitySub}>{activityTitle}</Text>
          
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
                <IconSymbol name="calendar" size={16} color="#0a7ea4" />
                <Text style={styles.dateTimeBtnText}>{customDate.toLocaleDateString('fr-FR')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowTimePicker(true)}>
                <IconSymbol name="clock.fill" size={16} color="#0a7ea4" />
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
            <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
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
}

const styles = StyleSheet.create({
  modalSubContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  modalActivitySub: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  etabList: {
    maxHeight: 50,
  },
  etabChoice: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
  },
  etabChoiceActive: {
    backgroundColor: '#0a7ea4',
  },
  etabChoiceText: {
    fontWeight: '600',
    color: '#555',
    fontSize: 14,
  },
  etabChoiceTextActive: {
    color: '#fff',
  },
  dateToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 3,
  },
  dateToggle: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  dateToggleActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateToggleText: {
    fontWeight: '600',
    color: '#666',
    fontSize: 14,
  },
  dateToggleTextActive: {
    color: '#0a7ea4',
  },
  customDateWrapper: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  dateTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateTimeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  modalCancelText: {
    fontWeight: 'bold',
    color: '#666',
    fontSize: 15,
  },
  modalSave: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
  },
  modalSaveText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 15,
  },
});
