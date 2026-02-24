import { CatalogItemCard } from '@/components/ui/CatalogItemCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppCategory, AppType, CATALOG_DATA } from '@/constants/data';
import { useStore } from '@/store/useStore';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

export default function CatalogScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<AppType>('Centre');
  const customActivities = useStore((state) => state.customActivities);
  
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);
  const [selectedSchoolLevel, setSelectedSchoolLevel] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [filtersVisible, setFiltersVisible] = useState(true);

  const filteredData = useMemo(() => {
    const allData = [...CATALOG_DATA, ...customActivities];
    return allData.filter((item) => {
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (item.type !== selectedType) return false;
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (selectedType === 'Centre') {
        if (selectedAgeGroup && item.ageGroup !== selectedAgeGroup) return false;
      } else if (selectedType === 'Periscolaire') {
        if (selectedSchoolLevel && item.schoolLevel !== selectedSchoolLevel) return false;
        if (selectedClass && item.schoolClass !== selectedClass) return false;
      }
      return true;
    });
  }, [selectedType, selectedCategory, selectedAgeGroup, selectedSchoolLevel, selectedClass, searchQuery, customActivities]);

  const handleTypeChange = (type: AppType) => {
    setSelectedType(type);
    setSelectedAgeGroup(null);
    setSelectedSchoolLevel(null);
    setSelectedClass(null);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (selectedAgeGroup) count++;
    if (selectedSchoolLevel) count++;
    if (selectedClass) count++;
    return count;
  }, [selectedCategory, selectedAgeGroup, selectedSchoolLevel, selectedClass]);

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedAgeGroup(null);
    setSelectedSchoolLevel(null);
    setSelectedClass(null);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Catalogue</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/create-activity' as any)}>
          <IconSymbol name="plus" size={24} color="#0a7ea4" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={20} color="#888" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Rechercher une activité..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#aaa"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark" size={18} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.viewModeBtn, filtersVisible && { backgroundColor: '#e6f2f7' }]} 
          onPress={() => setFiltersVisible(!filtersVisible)}
        >
          <IconSymbol name="line.3.horizontal.decrease.circle" size={20} color="#0a7ea4" />
          {activeFilterCount > 0 && <View style={styles.filterDot} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.viewModeBtn} onPress={() => setViewMode(viewMode === 'list' ? 'card' : 'list')}>
          <IconSymbol name={viewMode === 'list' ? 'square.grid.2x2.fill' : 'list.bullet'} size={20} color="#0a7ea4" />
        </TouchableOpacity>
      </View>

      {/* Type Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentBtn, selectedType === 'Centre' && styles.segmentBtnActive]}
          onPress={() => handleTypeChange('Centre')}
        >
          <Text style={[styles.segmentBtnText, selectedType === 'Centre' && styles.segmentBtnTextActive]}>
            Centre
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, selectedType === 'Periscolaire' && styles.segmentBtnActive]}
          onPress={() => handleTypeChange('Periscolaire')}
        >
          <Text style={[styles.segmentBtnText, selectedType === 'Periscolaire' && styles.segmentBtnTextActive]}>
            Périscolaire
          </Text>
        </TouchableOpacity>
      </View>

      {filtersVisible && (
        <>
          {/* Category Chips */}
          <View style={styles.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                >
                  <IconSymbol 
                    name={CATEGORY_ICONS[cat] as any} 
                    size={16} 
                    color={selectedCategory === cat ? '#fff' : '#666'} 
                  />
                  <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Type-specific filters */}
          {selectedType === 'Centre' && (
            <View style={styles.filterSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {AGE_GROUPS.map((age) => (
                  <TouchableOpacity
                    key={age}
                    style={[styles.chip, selectedAgeGroup === age && styles.chipSelected]}
                    onPress={() => setSelectedAgeGroup(selectedAgeGroup === age ? null : age)}
                  >
                    <Text style={[styles.chipText, selectedAgeGroup === age && styles.chipTextSelected]}>{age}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {selectedType === 'Periscolaire' && (
            <View style={styles.filterSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {SCHOOL_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[styles.chip, selectedSchoolLevel === level && styles.chipSelected]}
                    onPress={() => {
                      setSelectedSchoolLevel(selectedSchoolLevel === level ? null : level);
                      setSelectedClass(null);
                    }}
                  >
                    <Text style={[styles.chipText, selectedSchoolLevel === level && styles.chipTextSelected]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
                {selectedSchoolLevel === 'primaire' && PRIMAIRE_CLASSES.map((cls) => (
                  <TouchableOpacity
                    key={cls}
                    style={[styles.subChip, selectedClass === cls && styles.chipSelected]}
                    onPress={() => setSelectedClass(selectedClass === cls ? null : cls)}
                  >
                    <Text style={[styles.chipText, selectedClass === cls && styles.chipTextSelected]}>{cls}</Text>
                  </TouchableOpacity>
                ))}
                {selectedSchoolLevel === 'maternelle' && MATERNELLE_CLASSES.map((cls) => (
                  <TouchableOpacity
                    key={cls}
                    style={[styles.subChip, selectedClass === cls && styles.chipSelected]}
                    onPress={() => setSelectedClass(selectedClass === cls ? null : cls)}
                  >
                    <Text style={[styles.chipText, selectedClass === cls && styles.chipTextSelected]}>{cls}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </>
      )}

      {/* Active filters summary */}
      {activeFilterCount > 0 && (
        <View style={styles.activeFiltersBar}>
          <Text style={styles.activeFiltersText}>{filteredData.length} résultat{filteredData.length !== 1 ? 's' : ''}</Text>
          <TouchableOpacity onPress={clearAllFilters} style={styles.clearFiltersBtn}>
            <IconSymbol name="xmark" size={14} color="#0a7ea4" />
            <Text style={styles.clearFiltersText}>Effacer les filtres</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <ScrollView contentContainerStyle={styles.contentList}>
        {filteredData.length > 0 ? (
          filteredData.map((item) => <CatalogItemCard key={item.id} item={item} viewMode={viewMode} />)
        ) : (
          <View style={styles.emptyContainer}>
            <IconSymbol name="magnifyingglass" size={40} color="#ccc" />
            <Text style={styles.emptyText}>Aucune activité trouvée.</Text>
            <Text style={styles.emptySubtext}>Essayez de modifier les filtres ou la recherche.</Text>
          </View>
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
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  addBtn: {
    padding: 8,
    backgroundColor: '#e6f2f7',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
  },
  viewModeBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff5722',
  },

  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 4,
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
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  segmentBtnTextActive: {
    color: '#0a7ea4',
  },

  // Filters
  filterSection: {
    marginBottom: 4,
  },
  chipsRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  categoryChipActive: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  categoryChipText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 13,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  chip: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  subChip: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
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

  // Active Filters
  activeFiltersBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeFiltersText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  clearFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearFiltersText: {
    fontSize: 13,
    color: '#0a7ea4',
    fontWeight: '600',
  },

  // Content
  contentList: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 4,
  },
});
