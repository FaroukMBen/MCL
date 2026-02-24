import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppCategory, AppType, AttachmentFile, CATALOG_DATA } from '@/constants/data';
import { useStore } from '@/store/useStore';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CATEGORIES: AppCategory[] = ['Activités', 'Coloriage', 'Jeux'];
const AGE_GROUPS = ['3 ans', '5 ans', '6 ans', '7/8 ans', '9 ans+'];
const SCHOOL_LEVELS = ['primaire', 'maternelle'];
const PRIMAIRE_CLASSES = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];
const MATERNELLE_CLASSES = ['Petite section', 'Moyenne section', 'Grande section'];

const CATEGORY_ICONS: Record<string, string> = {
  'Activités': 'bolt.fill',
  'Coloriage': 'paintbrush.fill',
  'Jeux': 'gamecontroller.fill',
};

export default function CreateActivityScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId: string }>();
  const addCustomActivity = useStore((state) => state.addCustomActivity);
  const updateCustomActivity = useStore((state) => state.updateCustomActivity);
  const customActivities = useStore((state) => state.customActivities);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AppCategory>('Activités');
  const [type, setType] = useState<AppType>('Centre');
  
  const [ageGroup, setAgeGroup] = useState('');
  const [schoolLevel, setSchoolLevel] = useState('');
  const [schoolClass, setSchoolClass] = useState('');

  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [prerequis, setPrerequis] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  useEffect(() => {
    if (editId) {
      const itemToEdit = [...CATALOG_DATA, ...customActivities].find(a => a.id === editId);
      if (itemToEdit) {
        setTitle(itemToEdit.title);
        setDescription(itemToEdit.description);
        setCategory(itemToEdit.category);
        setType(itemToEdit.type);
        setAgeGroup(itemToEdit.ageGroup || '');
        setSchoolLevel(itemToEdit.schoolLevel || '');
        setSchoolClass(itemToEdit.schoolClass || '');
        setDuration(itemToEdit.duration || '');
        setLocation(itemToEdit.location || '');
        setPrerequis(itemToEdit.prerequis || '');
        if (itemToEdit.images && itemToEdit.images.length > 0) {
          setImages(itemToEdit.images);
        } else if (itemToEdit.image && !itemToEdit.image.includes('unsplash.com')) {
          setImages([itemToEdit.image]);
        }
        if (itemToEdit.attachments) {
          setAttachments(itemToEdit.attachments);
        }
      }
    }
  }, [editId]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled) {
        const newFiles: AttachmentFile[] = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
        }));
        setAttachments(prev => [...prev, ...newFiles]);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sélectionner le fichier.');
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteActivity = () => {
    Alert.alert(
      'Supprimer l\'activité',
      'Êtes-vous sûr de vouloir supprimer définitivement cette activité personnalisée ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive', 
          onPress: () => {
            const removeCustomActivity = useStore.getState().removeCustomActivity;
            if (editId) removeCustomActivity(editId);
            router.push('/');
          } 
        }
      ]
    );
  };

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert('Champ requis', 'Ajoutez un titre pour votre activité.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Champ requis', 'Ajoutez une description pour votre activité.');
      return;
    }

    const isExistingCustom = typeof editId === 'string' && editId.startsWith('custom_');
    const newId = isExistingCustom ? editId : `custom_${Date.now()}`;

    const newActivity = {
      id: newId,
      title: title.trim(),
      description: description.trim(),
      category,
      type,
      image: images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&q=80',
      images: images.length > 0 ? images : undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      duration: duration.trim() || undefined,
      location: location.trim() || undefined,
      prerequis: prerequis.trim() || undefined,
      ...(type === 'Centre' && ageGroup ? { ageGroup } : {}),
      ...(type === 'Periscolaire' && schoolLevel ? { schoolLevel } : {}),
      ...(type === 'Periscolaire' && schoolClass ? { schoolClass } : {}),
    };

    if (isExistingCustom) {
      updateCustomActivity(newActivity as any);
      router.back();
    } else {
      addCustomActivity(newActivity as any);
      router.push('/');
    }
  };

  const isFormValid = title.trim().length > 0 && description.trim().length > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="chevron.left" size={28} color="#0a7ea4" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editId ? 'Modifier l\'activité' : 'Nouvelle Activité'}</Text>
          <TouchableOpacity onPress={handleCreate} style={[styles.saveBtn, !isFormValid && styles.saveBtnDisabled]} disabled={!isFormValid}>
            <Text style={[styles.saveBtnText, !isFormValid && styles.saveBtnTextDisabled]}>Enregistrer</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContent}>

          {/* Section 1: Essentiel */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="pencil" size={18} color="#0a7ea4" />
              <Text style={styles.sectionTitle}>Informations essentielles</Text>
            </View>

            <Text style={styles.label}>Titre *</Text>
            <TextInput 
              style={[styles.input, !title.trim() && styles.inputRequired]} 
              placeholder="Ex: Chasse au trésor" 
              value={title} 
              onChangeText={setTitle}
              placeholderTextColor="#aaa"
            />

            <Text style={styles.label}>Description *</Text>
            <TextInput 
              style={[styles.input, styles.textArea, !description.trim() && styles.inputRequired]} 
              placeholder="Décrivez l'activité en détail..." 
              value={description} 
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor="#aaa"
            />
          </View>

          {/* Section 2: Classification */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="folder.fill" size={18} color="#0a7ea4" />
              <Text style={styles.sectionTitle}>Classification</Text>
            </View>

            <Text style={styles.label}>Catégorie</Text>
            <View style={styles.chipsContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.categoryChip, category === cat && styles.categoryChipSelected]} 
                  onPress={() => setCategory(cat)}
                >
                  <IconSymbol 
                    name={CATEGORY_ICONS[cat] as any} 
                    size={16} 
                    color={category === cat ? '#fff' : '#666'} 
                  />
                  <Text style={[styles.categoryChipText, category === cat && styles.chipTextSelected]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Type</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity 
                style={[styles.segmentBtn, type === 'Centre' && styles.segmentBtnActive]} 
                onPress={() => { setType('Centre'); setSchoolLevel(''); setSchoolClass(''); }}
              >
                <Text style={[styles.segmentBtnText, type === 'Centre' && styles.segmentBtnTextActive]}>Centre</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.segmentBtn, type === 'Periscolaire' && styles.segmentBtnActive]} 
                onPress={() => { setType('Periscolaire'); setAgeGroup(''); }}
              >
                <Text style={[styles.segmentBtnText, type === 'Periscolaire' && styles.segmentBtnTextActive]}>Périscolaire</Text>
              </TouchableOpacity>
            </View>

            {type === 'Centre' && (
              <>
                <Text style={styles.label}>Tranche d'âge</Text>
                <View style={styles.chipsContainer}>
                  {AGE_GROUPS.map((age) => (
                    <TouchableOpacity 
                      key={age} 
                      style={[styles.chip, ageGroup === age && styles.chipSelected]} 
                      onPress={() => setAgeGroup(ageGroup === age ? '' : age)}
                    >
                      <Text style={[styles.chipText, ageGroup === age && styles.chipTextSelected]}>{age}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {type === 'Periscolaire' && (
              <>
                <Text style={styles.label}>Niveau scolaire</Text>
                <View style={styles.chipsContainer}>
                  {SCHOOL_LEVELS.map((lvl) => (
                    <TouchableOpacity 
                      key={lvl} 
                      style={[styles.chip, schoolLevel === lvl && styles.chipSelected]} 
                      onPress={() => { setSchoolLevel(schoolLevel === lvl ? '' : lvl); setSchoolClass(''); }}
                    >
                      <Text style={[styles.chipText, schoolLevel === lvl && styles.chipTextSelected]}>
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {schoolLevel === 'primaire' && (
                  <>
                    <Text style={styles.label}>Classe</Text>
                    <View style={styles.chipsContainer}>
                      {PRIMAIRE_CLASSES.map((cls) => (
                        <TouchableOpacity key={cls} style={[styles.chip, schoolClass === cls && styles.chipSelected]} onPress={() => setSchoolClass(schoolClass === cls ? '' : cls)}>
                          <Text style={[styles.chipText, schoolClass === cls && styles.chipTextSelected]}>{cls}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {schoolLevel === 'maternelle' && (
                  <>
                    <Text style={styles.label}>Classe</Text>
                    <View style={styles.chipsContainer}>
                      {MATERNELLE_CLASSES.map((cls) => (
                        <TouchableOpacity key={cls} style={[styles.chip, schoolClass === cls && styles.chipSelected]} onPress={() => setSchoolClass(schoolClass === cls ? '' : cls)}>
                          <Text style={[styles.chipText, schoolClass === cls && styles.chipTextSelected]}>{cls}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </>
            )}
          </View>

          {/* Section 3: Détails */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="clock.fill" size={18} color="#0a7ea4" />
              <Text style={styles.sectionTitle}>Détails optionnels</Text>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Durée</Text>
                <TextInput style={styles.input} placeholder="Ex: 45 min" value={duration} onChangeText={setDuration} placeholderTextColor="#aaa" />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Lieu</Text>
                <TextInput style={styles.input} placeholder="Ex: Salle polyvalente" value={location} onChangeText={setLocation} placeholderTextColor="#aaa" />
              </View>
            </View>

            <Text style={styles.label}>Prérequis</Text>
            <TextInput style={styles.input} placeholder="Ex: Tenue de sport, matériel..." value={prerequis} onChangeText={setPrerequis} placeholderTextColor="#aaa" />
          </View>

          {/* Section 4: Images */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="star.fill" size={18} color="#0a7ea4" />
              <Text style={styles.sectionTitle}>Photos</Text>
              <Text style={styles.sectionBadge}>{images.length}</Text>
            </View>
            
            <View style={styles.imagesGrid}>
              {images.map((imgUri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: imgUri }} style={styles.selectedImage} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                    <IconSymbol name="xmark" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                <IconSymbol name="plus" size={28} color="#0a7ea4" />
                <Text style={styles.addImageText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 5: Attachments */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="folder.fill" size={18} color="#0a7ea4" />
              <Text style={styles.sectionTitle}>Fichiers joints (PDF, docs...)</Text>
              <Text style={styles.sectionBadge}>{attachments.length}</Text>
            </View>
            
            {attachments.map((file, index) => (
              <View key={index} style={styles.attachmentRow}>
                <View style={styles.attachmentIconWrap}>
                  <IconSymbol name="paperplane.fill" size={14} color="#0a7ea4" />
                </View>
                <View style={styles.attachmentInfo}>
                  <Text style={styles.attachmentName} numberOfLines={1}>{file.name}</Text>
                  <Text style={styles.attachmentType}>{file.type}</Text>
                </View>
                <TouchableOpacity onPress={() => removeAttachment(index)} style={styles.attachmentRemove}>
                  <IconSymbol name="xmark" size={14} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addFileBtn} onPress={pickFile}>
              <IconSymbol name="plus" size={20} color="#0a7ea4" />
              <Text style={styles.addFileBtnText}>Ajouter un fichier</Text>
            </TouchableOpacity>
          </View>

          {/* Delete button for custom activities */}
          {editId && editId.startsWith('custom_') && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteActivity}>
              <IconSymbol name="trash.fill" size={18} color="#ff4444" />
              <Text style={styles.deleteBtnText}>Supprimer l'activité</Text>
            </TouchableOpacity>
          )}

          <View style={{height: 40}} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    color: '#1a1a1a',
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
  saveBtnDisabled: {
    backgroundColor: '#ccc',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  saveBtnTextDisabled: {
    color: '#999',
  },
  formContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Section Cards
  sectionCard: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  sectionBadge: {
    backgroundColor: '#e6f2f7',
    color: '#0a7ea4',
    fontSize: 13,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },

  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 6,
    marginTop: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
    color: '#333',
  },
  inputRequired: {
    borderColor: '#ffc107',
    borderWidth: 1.5,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },

  // Chips
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  categoryChipSelected: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  categoryChipText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 13,
  },
  chip: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  chipSelected: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  chipText: {
    color: '#555',
    fontWeight: '500',
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#fff',
  },

  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 3,
    marginTop: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  segmentBtnTextActive: {
    color: '#0a7ea4',
  },

  // Images
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageBtn: {
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#f0f8ff',
    borderWidth: 1.5,
    borderColor: '#0a7ea4',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    color: '#0a7ea4',
    marginTop: 4,
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Delete
  deleteBtn: {
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
  deleteBtnText: {
    color: '#ff4444',
    fontWeight: 'bold',
    fontSize: 15,
  },

  // Attachments
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 10,
  },
  attachmentIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e6f2f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  attachmentType: {
    fontSize: 11,
    color: '#888',
  },
  attachmentRemove: {
    padding: 6,
  },
  addFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#0a7ea4',
    borderStyle: 'dashed',
    backgroundColor: '#f0f8ff',
  },
  addFileBtnText: {
    color: '#0a7ea4',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
