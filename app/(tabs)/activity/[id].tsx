import { IconSymbol } from '@/components/ui/icon-symbol';
import { CATALOG_DATA } from '@/constants/data';
import { useStore } from '@/store/useStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

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

  // Image gallery state
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const galleryRef = useRef<FlatList>(null);

  const item = useMemo(() => {
    return [...CATALOG_DATA, ...customActivities].find((a) => a.id === id);
  }, [id, customActivities]);

  if (!item) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="magnifyingglass" size={40} color="#ccc" />
          <Text style={styles.errorText}>Activité introuvable.</Text>
          <TouchableOpacity style={styles.backBtnError} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
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

  const openImageViewer = (index: number) => {
    setActiveImageIndex(index);
    setImageViewerVisible(true);
  };

  const handleDownloadImage = async (imageUri: string) => {
    try {
      if (imageUri.startsWith('http')) {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission requise', 'Autorisez l\'accès à la galerie pour télécharger.');
          return;
        }
        const filename = `mcl_${Date.now()}.jpg`;
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;
        const download = await FileSystem.downloadAsync(imageUri, fileUri);
        await MediaLibrary.saveToLibraryAsync(download.uri);
        Alert.alert('Succès', 'Image enregistrée dans votre galerie.');
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(imageUri);
        } else {
          Alert.alert('Erreur', 'Le partage n\'est pas disponible.');
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Impossible de télécharger l\'image.');
    }
  };

  const handleShareAttachment = async (uri: string, name: string) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, { dialogTitle: `Partager ${name}` });
      } else {
        Alert.alert('Erreur', 'Le partage n\'est pas disponible.');
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de partager le fichier.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <IconSymbol name="chevron.left" size={28} color="#0a7ea4" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{item.title}</Text>
        <TouchableOpacity onPress={() => router.push(`/create-activity?editId=${item.id}` as any)} style={styles.headerBtn}>
          <IconSymbol name="pencil" size={22} color="#0a7ea4" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          {imagesToDisplay.length > 1 ? (
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false} 
              style={styles.heroImageContainer}
              onScroll={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH));
                if (idx !== activeImageIndex) setActiveImageIndex(idx);
              }}
              scrollEventThrottle={16}
            >
              {imagesToDisplay.map((img: string, index: number) => (
                <TouchableOpacity key={index} activeOpacity={0.9} onPress={() => openImageViewer(index)}>
                  <Image source={{ uri: img }} style={[styles.heroImage, { width: SCREEN_WIDTH }]} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <TouchableOpacity activeOpacity={0.9} onPress={() => openImageViewer(0)}>
              <Image source={{ uri: imagesToDisplay[0] }} style={styles.heroImage} />
            </TouchableOpacity>
          )}
          {/* Dot indicators */}
          {imagesToDisplay.length > 1 && (
            <View style={styles.dotContainer}>
              {imagesToDisplay.map((_: string, index: number) => (
                <View key={index} style={[styles.dot, activeImageIndex === index && styles.dotActive]} />
              ))}
            </View>
          )}
          {/* Image counter badge */}
          {imagesToDisplay.length > 1 && (
            <View style={styles.imageCountBadge}>
              <IconSymbol name="star.fill" size={12} color="#fff" />
              <Text style={styles.imageCountText}>{activeImageIndex + 1}/{imagesToDisplay.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title}</Text>
            {usageCount > 0 && (
              <View style={styles.usageBadge}>
                <IconSymbol name="checkmark.circle.fill" size={18} color="#4caf50" />
                <Text style={styles.usageText}>{usageCount}</Text>
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

          {/* Detail Cards */}
          <View style={styles.detailsCard}>
            {item.duration && (
              <View style={styles.detailRow}>
                <IconSymbol name="clock.fill" size={18} color="#0a7ea4" />
                <View>
                  <Text style={styles.detailLabel}>Durée</Text>
                  <Text style={styles.detailValue}>{item.duration}</Text>
                </View>
              </View>
            )}
            {item.location && (
              <View style={styles.detailRow}>
                <IconSymbol name="map.fill" size={18} color="#0a7ea4" />
                <View>
                  <Text style={styles.detailLabel}>Lieu</Text>
                  <Text style={styles.detailValue}>{item.location}</Text>
                </View>
              </View>
            )}
            {item.prerequis && (
              <View style={styles.detailRow}>
                <IconSymbol name="checkmark.circle.fill" size={18} color="#0a7ea4" />
                <View>
                  <Text style={styles.detailLabel}>Prérequis</Text>
                  <Text style={styles.detailValue}>{item.prerequis}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Attachments */}
          {item.attachments && item.attachments.length > 0 && (
            <View style={styles.attachmentsSection}>
              <View style={styles.attachmentsHeader}>
                <IconSymbol name="folder.fill" size={18} color="#0a7ea4" />
                <Text style={styles.attachmentsTitle}>Fichiers joints</Text>
                <Text style={styles.attachmentsCount}>{item.attachments.length}</Text>
              </View>
              {item.attachments.map((file, index) => (
                <TouchableOpacity key={index} style={styles.attachmentRow} onPress={() => handleShareAttachment(file.uri, file.name)}>
                  <View style={styles.attachmentIconWrap}>
                    <IconSymbol name="paperplane.fill" size={16} color="#0a7ea4" />
                  </View>
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentName} numberOfLines={1}>{file.name}</Text>
                    <Text style={styles.attachmentType}>{file.type}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={16} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Image Thumbnails Grid */}
          {imagesToDisplay.length > 1 && (
            <View style={styles.thumbnailSection}>
              <View style={styles.thumbnailHeader}>
                <IconSymbol name="star.fill" size={18} color="#0a7ea4" />
                <Text style={styles.thumbnailTitle}>Toutes les photos</Text>
              </View>
              <View style={styles.thumbnailGrid}>
                {imagesToDisplay.map((img: string, index: number) => (
                  <TouchableOpacity key={index} onPress={() => openImageViewer(index)} style={styles.thumbnailWrap}>
                    <Image source={{ uri: img }} style={styles.thumbnail} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setModalVisible(true)}
        >
          <IconSymbol name="checkmark.circle.fill" size={22} color="#fff" />
          <Text style={styles.buttonText}>Enregistrer une utilisation</Text>
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

      {/* Fullscreen Image Viewer */}
      <Modal visible={imageViewerVisible} transparent animationType="fade">
        <View style={styles.viewerContainer}>
          <StatusBar barStyle="light-content" />
          {/* Top bar */}
          <View style={styles.viewerTopBar}>
            <TouchableOpacity onPress={() => setImageViewerVisible(false)} style={styles.viewerCloseBtn}>
              <IconSymbol name="xmark" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.viewerCounter}>{activeImageIndex + 1} / {imagesToDisplay.length}</Text>
            <TouchableOpacity onPress={() => handleDownloadImage(imagesToDisplay[activeImageIndex])} style={styles.viewerDownloadBtn}>
              <IconSymbol name="arrow.up.circle.fill" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {/* Image */}
          <FlatList
            ref={galleryRef}
            data={imagesToDisplay}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={activeImageIndex}
            getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActiveImageIndex(idx);
            }}
            renderItem={({ item: img }) => (
              <View style={styles.viewerImageWrap}>
                <Image source={{ uri: img }} style={styles.viewerImage} resizeMode="contain" />
              </View>
            )}
            keyExtractor={(_, i) => i.toString()}
          />
          {/* Bottom thumbnails */}
          {imagesToDisplay.length > 1 && (
            <View style={styles.viewerThumbnailRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
                {imagesToDisplay.map((img: string, index: number) => (
                  <TouchableOpacity 
                    key={index} 
                    onPress={() => {
                      setActiveImageIndex(index);
                      galleryRef.current?.scrollToIndex({ index, animated: true });
                    }}
                    style={[styles.viewerThumb, activeImageIndex === index && styles.viewerThumbActive]}
                  >
                    <Image source={{ uri: img }} style={styles.viewerThumbImg} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
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
    color: '#1a1a1a',
  },
  headerBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
  },
  backBtnError: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Gallery
  galleryContainer: {
    position: 'relative',
  },
  heroImageContainer: {
    height: 260,
  },
  heroImage: {
    width: '100%',
    height: 260,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 20,
    borderRadius: 4,
  },
  imageCountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Content
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 10,
  },
  usageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  usageText: {
    color: '#4caf50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  badgesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#e6f2f7',
    color: '#0a7ea4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 13,
    fontWeight: '600',
    overflow: 'hidden',
  },
  typeBadge: {
    backgroundColor: '#fff3e0',
    color: '#ff9800',
  },
  filterBadge: {
    backgroundColor: '#f3e5f5',
    color: '#9c27b0',
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 20,
  },

  // Details Card
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },

  // Attachments
  attachmentsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  attachmentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  attachmentsTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  attachmentsCount: {
    backgroundColor: '#e6f2f7',
    color: '#0a7ea4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 10,
  },
  attachmentIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#e6f2f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  attachmentType: {
    fontSize: 11,
    color: '#888',
  },

  // Thumbnails Section
  thumbnailSection: {
    marginBottom: 20,
  },
  thumbnailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  thumbnailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  thumbnailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  thumbnailWrap: {
    width: (SCREEN_WIDTH - 56) / 4,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },

  // Footer
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Modal
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
    marginBottom: 20,
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

  // Image Viewer
  viewerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  viewerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 50,
  },
  viewerCloseBtn: {
    padding: 8,
  },
  viewerCounter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewerDownloadBtn: {
    padding: 8,
  },
  viewerImageWrap: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  viewerThumbnailRow: {
    paddingVertical: 12,
    paddingBottom: 30,
  },
  viewerThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  viewerThumbActive: {
    borderColor: '#0a7ea4',
  },
  viewerThumbImg: {
    width: '100%',
    height: '100%',
  },
});
