import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppCategory, AppType } from '@/constants/data';
import { useStore } from '@/store/useStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CATEGORIES: AppCategory[] = ['Activités', 'Coloriage', 'Jeux'];
const AGE_GROUPS = ['3 ans', '5 ans', '6 ans', '7/8 ans', '9 ans+'];
const SCHOOL_LEVELS = ['primaire', 'maternelle'];
const PRIMAIRE_CLASSES = ['CP', 'CE1', 'CE2', 'CM1', 'CM2'];
const MATERNELLE_CLASSES = ['Petite section', 'Moyenne section', 'Grande section'];

export default function CreateActivityScreen() {
  const router = useRouter();
  const addCustomActivity = useStore((state) => state.addCustomActivity);

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

  const handleCreate = () => {
    if (!title.trim() || !description.trim()) {
      alert('Veuillez remplir au moins le titre et la description.');
      return;
    }

    const newActivity = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      type,
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&q=80', // Default image
      duration: duration.trim() || undefined,
      location: location.trim() || undefined,
      prerequis: prerequis.trim() || undefined,
      ...(type === 'Centre' && ageGroup ? { ageGroup } : {}),
      ...(type === 'Periscolaire' && schoolLevel ? { schoolLevel } : {}),
      ...(type === 'Periscolaire' && schoolClass ? { schoolClass } : {}),
    };

    addCustomActivity(newActivity as any);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
              <IconSymbol name="chevron.left.forwardslash.chevron.right" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nouvelle Activité</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.formSection}>
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

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreate}>
              <Text style={styles.submitBtnText}>Créer l'activité</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  formSection: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f8f9fa',
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
  },
  chip: {
    backgroundColor: '#f8f9fa',
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
  submitBtn: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
