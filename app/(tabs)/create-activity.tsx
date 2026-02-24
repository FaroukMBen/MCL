import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppCategory, AppType, CATALOG_DATA } from '@/constants/data';
import { useStore } from '@/store/useStore';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CATEGORIES: AppCategory[] = ['Activités', 'Coloriage', 'Jeux'];
const AGE_GROUPS = ['3 ans', '5 ans', '6 ans', '7/8 ans', '9 ans+'];
const SCHOOL_LEVELS = ['primaire', 'maternelle'];
const PRIMAIRE_CLASSES = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];
const MATERNELLE_CLASSES = ['Petite section', 'Moyenne section', 'Grande section'];

import { Alert } from 'react-native';

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
           // We might include the default unsplash ones, but let's just include whatever it has
          setImages([itemToEdit.image]);
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
    if (!title.trim() || !description.trim()) {
      alert('Veuillez remplir au moins le titre et la description.');
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="chevron.left" size={28} color="#0a7ea4" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editId ? 'Modifier l\'activité' : 'Nouvelle Activité'}</Text>
          <TouchableOpacity onPress={handleCreate} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContent}>
            <Text style={styles.label}>Titre de l'activité *</Text>
            <TextInput style={styles.input} placeholder="Ex: Chasse au trésor" value={title} onChangeText={setTitle} />

            <Text style={styles.label}>Description *</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="Décrivez l'activité..." 
              value={description} 
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Catégorie</Text>
            <View style={styles.chipsContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.chip, category === cat && styles.chipSelected]} 
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextSelected]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Type de centre</Text>
            <View style={styles.chipsContainer}>
              <TouchableOpacity style={[styles.chip, type === 'Centre' && styles.chipSelected]} onPress={() => setType('Centre')}>
                <Text style={[styles.chipText, type === 'Centre' && styles.chipTextSelected]}>Centre</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.chip, type === 'Periscolaire' && styles.chipSelected]} onPress={() => setType('Periscolaire')}>
                <Text style={[styles.chipText, type === 'Periscolaire' && styles.chipTextSelected]}>Périscolaire</Text>
              </TouchableOpacity>
            </View>

            {type === 'Centre' && (
              <>
                <Text style={styles.label}>Tranche d'âge</Text>
                <View style={styles.chipsContainer}>
                  {AGE_GROUPS.map((age) => (
                    <TouchableOpacity key={age} style={[styles.chip, ageGroup === age && styles.chipSelected]} onPress={() => setAgeGroup(age)}>
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
                    <TouchableOpacity key={lvl} style={[styles.chip, schoolLevel === lvl && styles.chipSelected]} onPress={() => { setSchoolLevel(lvl); setSchoolClass(''); }}>
                      <Text style={[styles.chipText, schoolLevel === lvl && styles.chipTextSelected]}>{lvl}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {schoolLevel === 'primaire' && (
                  <>
                    <Text style={styles.label}>Classe Primaire</Text>
                    <View style={styles.chipsContainer}>
                      {PRIMAIRE_CLASSES.map((cls) => (
                        <TouchableOpacity key={cls} style={[styles.chip, schoolClass === cls && styles.chipSelected]} onPress={() => setSchoolClass(cls)}>
                          <Text style={[styles.chipText, schoolClass === cls && styles.chipTextSelected]}>{cls}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {schoolLevel === 'maternelle' && (
                  <>
                    <Text style={styles.label}>Classe Maternelle</Text>
                    <View style={styles.chipsContainer}>
                      {MATERNELLE_CLASSES.map((cls) => (
                        <TouchableOpacity key={cls} style={[styles.chip, schoolClass === cls && styles.chipSelected]} onPress={() => setSchoolClass(cls)}>
                          <Text style={[styles.chipText, schoolClass === cls && styles.chipTextSelected]}>{cls}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </>
            )}

            <Text style={styles.label}>Durée (Optionnel)</Text>
            <TextInput style={styles.input} placeholder="Ex: 45 min" value={duration} onChangeText={setDuration} />

            <Text style={styles.label}>Lieu (Optionnel)</Text>
            <TextInput style={styles.input} placeholder="Ex: Salle polyvalente" value={location} onChangeText={setLocation} />

            <Text style={styles.label}>Prérequis (Optionnel)</Text>
            <TextInput style={styles.input} placeholder="Ex: Tenue de sport" value={prerequis} onChangeText={setPrerequis} />

            <Text style={styles.label}>Images (Optionnel)</Text>
            <View style={styles.imagesGrid}>
              {images.map((imgUri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: imgUri }} style={styles.selectedImage} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                    <Text style={styles.removeImageText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                <IconSymbol name="plus" size={32} color="#0a7ea4" />
                <Text style={styles.addImageText}>Ajouter</Text>
              </TouchableOpacity>
            </View>

            {editId && editId.startsWith('custom_') && (
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteActivity}>
                <Text style={styles.deleteBtnText}>Supprimer l'activité</Text>
              </TouchableOpacity>
            )}
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
  },
  backBtn: {
    padding: 8,
  },
  saveBtn: {
    padding: 8,
  },
  saveBtnText: {
    color: '#0a7ea4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
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
  },
  chipTextSelected: {
    color: '#fff',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#0a7ea4',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    color: '#0a7ea4',
    marginTop: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff4444',
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#ff4444',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
