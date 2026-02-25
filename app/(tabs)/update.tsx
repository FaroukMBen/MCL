import { IconSymbol } from '@/components/ui/icon-symbol';
import { APP_VERSION, CHANGELOG, ChangelogEntry } from '@/constants/changelog';
import * as Updates from 'expo-updates';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type UpdateStatus = 'idle' | 'checking' | 'downloading' | 'ready' | 'up-to-date' | 'error';

export default function UpdateScreen() {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isDev = __DEV__;

  const handleCheckUpdate = async () => {
    if (isDev) {
      Alert.alert(
        'Mode Développement',
        'Les mises à jour OTA ne sont pas disponibles en mode développement. Elles fonctionneront uniquement dans le build de production (APK).'
      );
      return;
    }

    try {
      setStatus('checking');
      setErrorMsg('');

      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setStatus('downloading');
        await Updates.fetchUpdateAsync();
        setStatus('ready');
      } else {
        setStatus('up-to-date');
      }
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e.message || 'Erreur inconnue');
    }
  };

  const handleRestart = async () => {
    try {
      await Updates.reloadAsync();
    } catch (e: any) {
      Alert.alert('Erreur', 'Impossible de redémarrer l\'application.');
    }
  };

  const getTypeColor = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'major': return '#ff6b35';
      case 'minor': return '#0a7ea4';
      case 'patch': return '#4caf50';
    }
  };

  const getTypeLabel = (type: ChangelogEntry['type']) => {
    switch (type) {
      case 'major': return 'Majeure';
      case 'minor': return 'Mineure';
      case 'patch': return 'Correctif';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Current Version Header */}
        <View style={styles.versionHeader}>
          <View style={styles.versionIconCircle}>
            <IconSymbol name="arrow.triangle.2.circlepath" size={36} color="#fff" />
          </View>
          <Text style={styles.versionTitle}>Mises à jour</Text>
          <View style={styles.currentVersionBadge}>
            <Text style={styles.currentVersionText}>v{APP_VERSION}</Text>
          </View>
          <Text style={styles.versionSubtitle}>Version actuelle</Text>
        </View>

        {/* Update Action */}
        <View style={styles.updateCard}>
          {status === 'idle' && (
            <>
              <Text style={styles.updateCardTitle}>Rechercher une mise à jour</Text>
              <Text style={styles.updateCardDesc}>
                Vérifiez si une nouvelle version est disponible. Vos données seront conservées.
              </Text>
              <TouchableOpacity style={styles.checkBtn} onPress={handleCheckUpdate}>
                <IconSymbol name="arrow.triangle.2.circlepath" size={20} color="#fff" />
                <Text style={styles.checkBtnText}>Rechercher</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'checking' && (
            <View style={styles.statusRow}>
              <ActivityIndicator size="large" color="#0a7ea4" />
              <Text style={styles.statusText}>Recherche en cours...</Text>
            </View>
          )}

          {status === 'downloading' && (
            <View style={styles.statusRow}>
              <ActivityIndicator size="large" color="#0a7ea4" />
              <Text style={styles.statusText}>Téléchargement de la mise à jour...</Text>
              <Text style={styles.statusSubText}>Ne fermez pas l'application</Text>
            </View>
          )}

          {status === 'ready' && (
            <>
              <View style={styles.statusRow}>
                <View style={styles.successCircle}>
                  <IconSymbol name="checkmark.circle.fill" size={40} color="#4caf50" />
                </View>
                <Text style={styles.statusText}>Mise à jour prête !</Text>
                <Text style={styles.statusSubText}>
                  Redémarrez l'application pour appliquer la mise à jour.
                </Text>
              </View>
              <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
                <IconSymbol name="arrow.clockwise" size={20} color="#fff" />
                <Text style={styles.checkBtnText}>Redémarrer maintenant</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'up-to-date' && (
            <>
              <View style={styles.statusRow}>
                <View style={styles.successCircle}>
                  <IconSymbol name="checkmark.circle.fill" size={40} color="#4caf50" />
                </View>
                <Text style={styles.statusText}>Vous êtes à jour !</Text>
                <Text style={styles.statusSubText}>
                  Aucune mise à jour disponible pour le moment.
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.checkBtn, { backgroundColor: '#e0e0e0' }]}
                onPress={() => setStatus('idle')}
              >
                <Text style={[styles.checkBtnText, { color: '#666' }]}>OK</Text>
              </TouchableOpacity>
            </>
          )}

          {status === 'error' && (
            <>
              <View style={styles.statusRow}>
                <View style={styles.errorCircle}>
                  <IconSymbol name="xmark" size={40} color="#ff4444" />
                </View>
                <Text style={styles.statusText}>Erreur</Text>
                <Text style={styles.statusSubText}>{errorMsg || 'Impossible de vérifier les mises à jour.'}</Text>
              </View>
              <TouchableOpacity style={styles.checkBtn} onPress={() => { setStatus('idle'); setErrorMsg(''); }}>
                <Text style={styles.checkBtnText}>Réessayer</Text>
              </TouchableOpacity>
            </>
          )}

          {isDev && (
            <View style={styles.devNotice}>
              <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#ff9800" />
              <Text style={styles.devNoticeText}>
                Mode développement — les mises à jour OTA sont disponibles uniquement dans le build de production.
              </Text>
            </View>
          )}
        </View>

        {/* Changelog Section */}
        <View style={styles.changelogSection}>
          <Text style={styles.changelogSectionTitle}>Journal des modifications</Text>

          {CHANGELOG.map((entry, index) => (
            <View key={entry.version} style={styles.changelogCard}>
              <View style={styles.changelogHeader}>
                <View style={styles.changelogVersionRow}>
                  <Text style={styles.changelogVersion}>v{entry.version}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: getTypeColor(entry.type) }]}>
                    <Text style={styles.typeBadgeText}>{getTypeLabel(entry.type)}</Text>
                  </View>
                  {index === 0 && (
                    <View style={styles.latestBadge}>
                      <Text style={styles.latestBadgeText}>Actuelle</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.changelogDate}>
                  {new Date(entry.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={styles.changelogTitle}>{entry.title}</Text>
              </View>

              <View style={styles.changesList}>
                {entry.changes.map((change, i) => (
                  <View key={i} style={styles.changeItem}>
                    <View style={styles.changeDot} />
                    <Text style={styles.changeText}>{change}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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

  // Version Header
  versionHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  versionIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  versionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  currentVersionBadge: {
    backgroundColor: '#e6f2f7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
  },
  currentVersionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  versionSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },

  // Update Card
  updateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  updateCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  updateCardDesc: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
    marginBottom: 18,
  },
  checkBtn: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  restartBtn: {
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  statusRow: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  statusSubText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  successCircle: {
    marginBottom: 4,
  },
  errorCircle: {
    marginBottom: 4,
  },
  devNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff8e1',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  devNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#f57c00',
    lineHeight: 17,
  },

  // Changelog Section
  changelogSection: {
    marginBottom: 16,
  },
  changelogSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  changelogCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  changelogHeader: {
    marginBottom: 14,
  },
  changelogVersionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  changelogVersion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  latestBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#e8f5e9',
  },
  latestBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4caf50',
    textTransform: 'uppercase',
  },
  changelogDate: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  changelogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  changesList: {
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 12,
    gap: 8,
  },
  changeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  changeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0a7ea4',
    marginTop: 6,
  },
  changeText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
