import { IconSymbol } from '@/components/ui/icon-symbol';
import { Achievement, getLevelFromXp, getLevelTitle, RARITY_COLORS, RARITY_LABELS, useStore } from '@/store/useStore';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import { Alert, Image, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const username = useStore((state) => state.username);
  const profileImage = useStore((state) => state.profileImage);
  const setUsername = useStore((state) => state.setUsername);
  const setProfileImage = useStore((state) => state.setProfileImage);
  const xp = useStore((state) => state.xp);
  const achievements = useStore((state) => state.achievements);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState<string | null>(null);
  const activityHistory = useStore((state) => state.activityHistory);
  const etablissements = useStore((state) => state.etablissements);
  const customActivities = useStore((state) => state.customActivities);
  const resetProgress = useStore((state) => state.resetProgress);
  const importState = useStore((state) => state.importState);

  const [filterRarity, setFilterRarity] = useState<string | null>(null);

  const FILE_URI = `${FileSystem.documentDirectory}profile_data.json`;

  const levelInfo = getLevelFromXp(xp);
  const levelTitle = getLevelTitle(levelInfo.level);
  const xpProgress = Math.min((levelInfo.currentLevelXp / levelInfo.nextLevelXp) * 100, 100);

  const { unlocked, locked, sortedAchievements } = useMemo(() => {
    const ul = achievements.filter((a) => a.unlocked);
    const lo = achievements.filter((a) => !a.unlocked);
    
    let sorted = [...ul.sort((a, b) => (b.dateUnlocked || 0) - (a.dateUnlocked || 0)), ...lo];
    if (filterRarity) {
      sorted = sorted.filter((a) => a.rarity === filterRarity);
    }
    
    return { unlocked: ul, locked: lo, sortedAchievements: sorted };
  }, [achievements, filterRarity]);

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

  const handleStartEdit = () => {
    setEditName(username || '');
    setEditImage(profileImage);
    setIsEditing(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setEditImage(result.assets[0].uri);
    }
  };

  const handleSaveProfile = () => {
    if (editName.trim()) {
      setUsername(editName.trim());
      setProfileImage(editImage);
      setIsEditing(false);
      Alert.alert('Succès', 'Profil mis à jour !');
    }
  };

  if (!username) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.onboardingContent}>
          <View style={styles.onboardingHero}>
            <View style={styles.onboardingIconCircle}>
              <IconSymbol name="person.fill" size={48} color="#fff" />
            </View>
            <Text style={styles.onboardingTitle}>Bienvenue sur MCL</Text>
            <Text style={styles.onboardingSubtitle}>
              Créez votre profil pour suivre vos activités, gagner de l'XP et débloquer des succès !
            </Text>
          </View>
          
          <View style={styles.onboardingCard}>
            <Text style={styles.onboardingCardTitle}>Créer un profil</Text>
            <TouchableOpacity style={styles.onboardingAvatarPicker} onPress={pickImage}>
              {editImage ? (
                <Image source={{ uri: editImage }} style={styles.onboardingAvatar} />
              ) : (
                <View style={[styles.onboardingAvatar, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                  <IconSymbol name="plus" size={32} color="#0a7ea4" />
                </View>
              )}
              <Text style={styles.onboardingAvatarLabel}>Photo (optionnel)</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Votre prénom ou pseudo..."
              value={editName}
              onChangeText={setEditName}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity 
              style={[styles.primaryBtn, !editName.trim() && styles.primaryBtnDisabled]} 
              onPress={() => {
                if(editName.trim()) {
                  setUsername(editName.trim());
                  setProfileImage(editImage);
                }
              }}
              disabled={!editName.trim()}
            >
              <IconSymbol name="bolt.fill" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Commencer l'aventure</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.onboardingCard}>
            <Text style={styles.onboardingCardTitle}>Ou reprendre votre progression</Text>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleImport}>
              <IconSymbol name="paperplane.fill" size={20} color="#28a745" />
              <Text style={[styles.secondaryBtnText, { color: '#28a745' }]}>Importer un fichier</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={handleStartEdit}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <IconSymbol name="pencil" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.profileName}>{username}</Text>
          <View style={styles.levelBadge}>
            <IconSymbol name="star.fill" size={14} color="#ffd700" />
            <Text style={styles.levelBadgeText}>Niv. {levelInfo.level} — {levelTitle}</Text>
          </View>
          
          <TouchableOpacity style={styles.editProfileFloat} onPress={handleStartEdit}>
            <IconSymbol name="pencil" size={18} color="#0a7ea4" />
            <Text style={styles.editProfileFloatText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        {/* XP Progress Bar */}
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpLabel}>Progression</Text>
            <Text style={styles.xpValue}>{levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP</Text>
          </View>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${xpProgress}%` }]} />
          </View>
          <Text style={styles.xpTotal}>{xp} XP total • Prochain niveau dans {levelInfo.nextLevelXp - levelInfo.currentLevelXp} XP</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <IconSymbol name="book.fill" size={22} color="#0a7ea4" />
            <Text style={styles.statValue}>{activityHistory.length}</Text>
            <Text style={styles.statLabel}>Utilisations</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol name="building.2.fill" size={22} color="#0a7ea4" />
            <Text style={styles.statValue}>{etablissements.length}</Text>
            <Text style={styles.statLabel}>Lieux</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol name="pencil" size={22} color="#0a7ea4" />
            <Text style={styles.statValue}>{customActivities.length}</Text>
            <Text style={styles.statLabel}>Créations</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol name="trophy.fill" size={22} color="#ff9800" />
            <Text style={styles.statValue}>{unlocked.length}</Text>
            <Text style={styles.statLabel}>Succès</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Succès & Badges</Text>
            <Text style={styles.sectionCounter}>{unlocked.length}/{achievements.length}</Text>
          </View>

          {/* Rarity Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rarityFilters}>
            <TouchableOpacity 
              style={[styles.rarityChip, !filterRarity && styles.rarityChipActive]}
              onPress={() => setFilterRarity(null)}
            >
              <Text style={[styles.rarityChipText, !filterRarity && styles.rarityChipTextActive]}>Tous</Text>
            </TouchableOpacity>
            {(['common', 'rare', 'epic', 'legendary'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.rarityChip, filterRarity === r && { backgroundColor: RARITY_COLORS[r] }]}
                onPress={() => setFilterRarity(filterRarity === r ? null : r)}
              >
                <Text style={[styles.rarityChipText, filterRarity === r && { color: '#fff' }]}>
                  {RARITY_LABELS[r]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Achievement Cards */}
          {sortedAchievements.map((ach) => (
            <AchievementCard key={ach.id} achievement={ach} />
          ))}
        </View>

        {/* Data Management */}
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
            <IconSymbol name="trash.fill" size={20} color="#dc3545" />
            <Text style={[styles.actionBtnText, { color: '#dc3545' }]}>Supprimer les données</Text>
          </TouchableOpacity>
        </View>
        <View style={{height: 40}} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditing} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le profil</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <IconSymbol name="xmark" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.editAvatarSection}>
              <TouchableOpacity style={styles.editAvatarCircle} onPress={pickImage}>
                {editImage ? (
                  <Image source={{ uri: editImage }} style={styles.editAvatarImage} />
                ) : (
                  <View style={[styles.editAvatarImage, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.editAvatarBadge}>
                  <IconSymbol name="paintbrush.fill" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text style={styles.editAvatarLabel}>Changer la photo</Text>
            </View>

            <View style={styles.editInputSection}>
              <Text style={styles.inputLabel}>Nom d'utilisateur</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Votre nom..."
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveBtn, !editName.trim() && styles.saveBtnDisabled]} 
                onPress={handleSaveProfile}
                disabled={!editName.trim()}
              >
                <Text style={styles.saveBtnText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const rarityColor = RARITY_COLORS[achievement.rarity];
  const isUnlocked = achievement.unlocked;

  return (
    <View style={[styles.achievementCard, !isUnlocked && styles.achievementCardLocked]}>
      <View style={[styles.achievementIcon, { backgroundColor: isUnlocked ? rarityColor : '#e0e0e0' }]}>
        <IconSymbol name={achievement.icon as any} size={24} color={isUnlocked ? '#fff' : '#999'} />
      </View>
      <View style={styles.achievementInfo}>
        <View style={styles.achievementTitleRow}>
          <Text style={[styles.achievementTitle, !isUnlocked && { color: '#999' }]}>
            {achievement.title}
          </Text>
          <Text style={[styles.achievementRarity, { color: rarityColor }]}>
            {RARITY_LABELS[achievement.rarity]}
          </Text>
        </View>
        <Text style={[styles.achievementDesc, !isUnlocked && { color: '#bbb' }]}>
          {achievement.description}
        </Text>
        <View style={styles.achievementMeta}>
          {isUnlocked ? (
            <>
              <IconSymbol name="checkmark.circle.fill" size={14} color="#4caf50" />
              <Text style={styles.achievementUnlockedText}>
                Débloqué le {new Date(achievement.dateUnlocked!).toLocaleDateString('fr-FR')}
              </Text>
            </>
          ) : (
            <Text style={styles.achievementXpPreview}>+{achievement.xpReward} XP</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 16,
  },
  scrollContent: {
    padding: 16,
  },

  // Onboarding
  onboardingContent: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  onboardingHero: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  onboardingIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  onboardingSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  onboardingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  onboardingCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  secondaryBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff8e1',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#b38000',
  },

  // XP Bar
  xpCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  xpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  xpValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  xpBarBg: {
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#0a7ea4',
    borderRadius: 5,
  },
  xpTotal: {
    fontSize: 11,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 8,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '500',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Section
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionCounter: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },

  // Rarity Filters
  rarityFilters: {
    marginBottom: 16,
  },
  rarityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  rarityChipActive: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  rarityChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  rarityChipTextActive: {
    color: '#fff',
  },

  // Achievement Cards
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  achievementCardLocked: {
    opacity: 0.55,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  achievementRarity: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  achievementDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  achievementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  achievementUnlockedText: {
    fontSize: 11,
    color: '#4caf50',
    fontWeight: '500',
  },
  achievementXpPreview: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: 'bold',
  },

  // Actions
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
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
  },
  onboardingAvatarPicker: {
    alignItems: 'center',
    marginBottom: 24,
  },
  onboardingAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0a7ea4',
    marginBottom: 8,
    overflow: 'hidden',
  },
  onboardingAvatarLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0a7ea4',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0a7ea4',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editProfileFloat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  editProfileFloatText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editAvatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  editAvatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f8f9fa',
    borderWidth: 3,
    borderColor: '#eee',
    position: 'relative',
    overflow: 'hidden',
  },
  editAvatarImage: {
    width: '100%',
    height: '100%',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0a7ea4',
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  editAvatarLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#0a7ea4',
    fontWeight: '600',
  },
  editInputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
  },
  saveBtnDisabled: {
    backgroundColor: '#ccc',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
});
