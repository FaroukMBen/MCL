import { IconSymbol } from '@/components/ui/icon-symbol';
import { useStore } from '@/store/useStore';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const [newUsername, setNewUsername] = useState('');
  const username = useStore((state) => state.username);
  const setUsername = useStore((state) => state.setUsername);
  const xp = useStore((state) => state.xp);
  const level = useStore((state) => state.level);
  const achievements = useStore((state) => state.achievements);
  const completedItems = useStore((state) => state.completedItems);
  const resetProgress = useStore((state) => state.resetProgress);
  const importState = useStore((state) => state.importState);

  const FILE_URI = `${FileSystem.documentDirectory}profile_data.json`;

  const handleExport = async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(FILE_URI);
      if (!fileInfo.exists) {
        Alert.alert('Erreur', 'Aucune sauvegarde trouvée.');
        return;
      }
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Erreur', 'Le partage n\'est pas disponible sur cet appareil.');
        return;
      }
      await Sharing.shareAsync(FILE_URI, {
        mimeType: 'application/json',
        dialogTitle: 'Exporter votre progression',
        UTI: 'public.json'
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Impossible d\'exporter les données.');
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      
      const file = result.assets[0];
      const content = await FileSystem.readAsStringAsync(file.uri);
      const parsedData = JSON.parse(content);

      if (parsedData.state) {
        importState(parsedData.state);
        Alert.alert('Succès', 'Vos données ont été importées !');
      } else {
        throw new Error('Invalid format');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Impossible d\'importer le fichier, format invalide.');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Supprimer la progression',
      'Êtes-vous sûr de vouloir tout supprimer ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: resetProgress },
      ]
    );
  };

  if (!username) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <IconSymbol name="person.fill" size={60} color="#0a7ea4" />
            <Text style={styles.headerTitle}>Bienvenue</Text>
            <Text style={{color: '#666', marginTop: 8, textAlign: 'center'}}>Vous n'avez pas encore de profil. Créez-en un nouveau ou importez votre progression.</Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Créer un profil</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom d'utilisateur"
              value={newUsername}
              onChangeText={setNewUsername}
            />
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4', marginTop: 8 }]} 
              onPress={() => {
                if(newUsername.trim()) setUsername(newUsername.trim());
              }}
            >
              <Text style={[styles.actionBtnText, { color: '#fff' }]}>Commencer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ou importer existant</Text>
            <TouchableOpacity style={styles.actionBtn} onPress={handleImport}>
              <IconSymbol name="paperplane.fill" size={20} color="#28a745" />
              <Text style={[styles.actionBtnText, { color: '#28a745' }]}>Importer une progression</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <IconSymbol name="person.fill" size={60} color="#0a7ea4" />
          <Text style={styles.headerTitle}>Profil de {username}</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Niveau</Text>
            <Text style={styles.statValue}>{level}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>XP Total</Text>
            <Text style={styles.statValue}>{xp}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Activités</Text>
            <Text style={styles.statValue}>{completedItems.length}</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges & Succès</Text>
          {achievements.map((ach) => {
            // Determine dynamically if an achievement should be unlocked.
            // For real scenarios, this logic should be inside the store based on completed items.
            // Simplified check based on completed array length.
            let isUnlocked = ach.unlocked;
            if (ach.id === 'first_activity' && completedItems.length >= 1) isUnlocked = true;
            if (ach.id === 'artist' && completedItems.length >= 2) isUnlocked = true;
            if (ach.id === 'gamer' && completedItems.length >= 3) isUnlocked = true;
            
            return (
              <View key={ach.id} style={[styles.achievementCard, !isUnlocked && styles.achievementCardLocked]}>
                <View style={[styles.badgeIcon, isUnlocked ? styles.badgeUnlocked : styles.badgeLocked]}>
                  <IconSymbol name="house.fill" size={24} color={isUnlocked ? '#fff' : '#666'} />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{ach.title}</Text>
                  <Text style={styles.achievementDesc}>{ach.description}</Text>
                </View>
                {!isUnlocked && <IconSymbol name="chevron.right" size={20} color="#ccc" />}
              </View>
            );
          })}
        </View>

        {/* Settings / Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestion des Données</Text>
          
          <TouchableOpacity style={styles.actionBtn} onPress={handleExport}>
            <IconSymbol name="paperplane.fill" size={20} color="#007bff" />
            <Text style={[styles.actionBtnText, { color: '#007bff' }]}>Exporter la progression</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleImport}>
            <IconSymbol name="paperplane.fill" size={20} color="#28a745" />
            <Text style={[styles.actionBtnText, { color: '#28a745' }]}>Importer une progression</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={handleReset}>
            <IconSymbol name="house.fill" size={20} color="#dc3545" />
            <Text style={[styles.actionBtnText, { color: '#dc3545' }]}>Supprimer les données</Text>
          </TouchableOpacity>
        </View>
        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#444',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  badgeUnlocked: {
    backgroundColor: '#0a7ea4',
  },
  badgeLocked: {
    backgroundColor: '#e6e6e6',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 13,
    color: '#666',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnDanger: {
    borderColor: '#f5c6cb',
    backgroundColor: '#fff',
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 16,
  },
});
