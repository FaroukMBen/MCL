import { IconSymbol } from '@/components/ui/icon-symbol';
import { Etablissement, useStore } from '@/store/useStore';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EtablissementsScreen() {
  const etablissements = useStore((state) => state.etablissements);
  const addEtablissement = useStore((state) => state.addEtablissement);
  const updateEtablissement = useStore((state) => state.updateEtablissement);
  const removeEtablissement = useStore((state) => state.removeEtablissement);

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('centre'); // 'centre', 'ecole', 'autre'
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId: string }>();

  const handleOpenForm = (etab?: Etablissement) => {
    if (etab) {
      setCurrentId(etab.id);
      setName(etab.name);
      setType(etab.type);
      setLocation(etab.location || '');
      setImage(etab.image || null);
    } else {
      setCurrentId(null);
      setName('');
      setType('centre');
      setLocation('');
      setImage(null);
    }
    setIsEditing(true);
  };

  useEffect(() => {
    if (editId) {
      const etab = etablissements.find(e => e.id === editId);
      if (etab) {
        handleOpenForm(etab);
        // Clear the param after opening to avoid re-triggering
        router.setParams({ editId: undefined });
      }
    }
  }, [editId, etablissements]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir au moins le nom de l\'établissement.');
      return;
    }

    const etabData: Etablissement = {
      id: currentId || `etab_${Date.now()}`,
      name: name.trim(),
      type,
      location: location.trim() || undefined,
      image: image || undefined,
    };

    if (currentId) {
      updateEtablissement(etabData);
    } else {
      addEtablissement(etabData);
    }

    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Supprimer', 'Êtes-vous sûr de vouloir supprimer cet établissement ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => removeEtablissement(id) }
    ]);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  if (isEditing) {
    const isFormValid = name.trim().length > 0;
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.backBtn}>
            <IconSymbol name="chevron.left" size={28} color="#0a7ea4" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{currentId ? 'Modifier l\'établissement' : 'Nouvel établissement'}</Text>
          <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, !isFormValid && styles.saveBtnDisabled]} disabled={!isFormValid}>
            <Text style={[styles.saveBtnText, !isFormValid && styles.saveBtnTextDisabled]}>Enregistrer</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContent}>
          {/* Photo */}
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.pickedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <IconSymbol name="building.2.fill" size={40} color="#0a7ea4" />
                <Text style={styles.imagePlaceholderText}>Ajouter une photo</Text>
              </View>
            )}
            <View style={styles.imageOverlayBadge}>
              <IconSymbol name="pencil" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Info section */}
          <View style={styles.formCard}>
            <View style={styles.formCardHeader}>
              <IconSymbol name="building.2.fill" size={18} color="#0a7ea4" />
              <Text style={styles.formCardTitle}>Informations</Text>
            </View>

            <Text style={styles.label}>Nom *</Text>
            <TextInput 
              style={[styles.input, !name.trim() && styles.inputRequired]} 
              placeholder="Ex: École Victor Hugo" 
              value={name} 
              onChangeText={setName}
              placeholderTextColor="#aaa"
            />

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeSwitcher}>
              {['centre', 'ecole', 'autre'].map((t) => (
                <TouchableOpacity 
                  key={t} 
                  style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                  onPress={() => setType(t)}
                >
                  <IconSymbol 
                    name={t === 'centre' ? 'house.fill' : t === 'ecole' ? 'book.fill' : 'building.2.fill'} 
                    size={16} 
                    color={type === t ? '#fff' : '#666'} 
                  />
                  <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Emplacement (Optionnel)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: 12 Rue des Lilas" 
              value={location} 
              onChangeText={setLocation}
              placeholderTextColor="#aaa"
            />
          </View>

          {currentId && (
            <TouchableOpacity style={styles.formDeleteBtn} onPress={() => { handleDelete(currentId); setIsEditing(false); }}>
              <IconSymbol name="trash.fill" size={18} color="#ff4444" />
              <Text style={styles.formDeleteBtnText}>Supprimer l'établissement</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.mainHeader}>
        <Text style={styles.mainHeaderTitle}>Établissements</Text>
        <TouchableOpacity style={styles.addIconBtn} onPress={() => handleOpenForm()}>
          <IconSymbol name="plus" size={24} color="#0a7ea4" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {etablissements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun établissement configuré.</Text>
            <TouchableOpacity style={styles.addBtnLarge} onPress={() => handleOpenForm()}>
              <Text style={styles.addBtnLargeText}>Ajouter un établissement</Text>
            </TouchableOpacity>
          </View>
        ) : (
          etablissements.map((etab) => (
            <TouchableOpacity 
              key={etab.id} 
              style={styles.etabCard} 
              onPress={() => router.push(`/etablissement/${etab.id}` as any)}
              activeOpacity={0.7}
            >
              <Image 
                source={{ uri: etab.image || 'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=200&q=80' }} 
                style={styles.etabImage} 
              />
              <View style={styles.etabInfo}>
                <View style={styles.etabBadge}>
                  <Text style={styles.etabBadgeText}>{etab.type}</Text>
                </View>
                <Text style={styles.etabName}>{etab.name}</Text>
                {etab.location && <View style={{flexDirection:'row',alignItems:'center',gap:4}}><IconSymbol name="map.fill" size={14} color="#888" /><Text style={styles.etabLocation}>{etab.location}</Text></View>}
              </View>
              <View style={styles.etabActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={(e) => { e.stopPropagation(); handleOpenForm(etab); }}>
                  <IconSymbol name="pencil" size={20} color="#0a7ea4" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={(e) => { e.stopPropagation(); handleDelete(etab.id); }}>
                  <IconSymbol name="trash.fill" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  mainHeaderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addIconBtn: {
    padding: 8,
    backgroundColor: '#e6f2f7',
    borderRadius: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  addBtnLarge: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addBtnLargeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  etabCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  etabImage: {
    width: 100,
    height: 100,
    backgroundColor: '#eee',
  },
  etabInfo: {
    flex: 1,
    padding: 12,
  },
  etabBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6f2f7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  etabBadgeText: {
    color: '#0a7ea4',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  etabName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  etabLocation: {
    fontSize: 13,
    color: '#666',
  },
  etabActions: {
    padding: 8,
    justifyContent: 'space-around',
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
  actionBtn: {
    padding: 8,
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
  },
  backBtn: {
    padding: 8,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  formContent: {
    padding: 20,
  },
  imagePicker: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 20,
  },
  pickedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    color: '#0a7ea4',
    marginTop: 8,
    fontWeight: '500',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  typeSwitcher: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  typeBtnActive: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  typeBtnText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 13,
  },
  typeBtnTextActive: {
    color: '#fff',
  },
  saveBtnDisabled: {
    backgroundColor: '#ccc',
  },
  saveBtnTextDisabled: {
    color: '#999',
  },
  imageOverlayBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  formCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  formCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  inputRequired: {
    borderColor: '#ffc107',
    borderWidth: 1.5,
  },
  formDeleteBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff4444',
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  formDeleteBtnText: {
    color: '#ff4444',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
