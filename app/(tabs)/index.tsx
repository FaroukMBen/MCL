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

export default function CatalogScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<AppType>('Centre');
  const customActivities = useStore((state) => state.customActivities);
  
  // State for 'Centre'
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string | null>(null);
  
  // State for 'Periscolaire'
  const [selectedSchoolLevel, setSelectedSchoolLevel] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  // Common filters
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | null>(null);

  // Display modes & search
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const filteredData = useMemo(() => {
    const allData = [...CATALOG_DATA, ...customActivities];
    return allData.filter((item) => {
      // 0. Search query
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      // 1. Matches Type
      if (item.type !== selectedType) return false;

      // 2. Matches Category
      if (selectedCategory && item.category !== selectedCategory) return false;

      // 3. Matches Type-specific subfilters
      if (selectedType === 'Centre') {
        if (selectedAgeGroup && item.ageGroup !== selectedAgeGroup) return false;
      } else if (selectedType === 'Periscolaire') {
        if (selectedSchoolLevel && item.schoolLevel !== selectedSchoolLevel) return false;
        if (selectedClass && item.schoolClass !== selectedClass) return false;
      }

      return true;
    });
  }, [selectedType, selectedCategory, selectedAgeGroup, selectedSchoolLevel, selectedClass, searchQuery, customActivities]);

  // Handling type switch
  const handleTypeChange = (type: AppType) => {
    setSelectedType(type);
    setSelectedAgeGroup(null);
    setSelectedSchoolLevel(null);
    setSelectedClass(null);
  };

  const handleSchoolLevelChange = (level: string) => {
    setSelectedSchoolLevel(level);
    setSelectedClass(null); // Reset class selection if level changes
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

      <View style={styles.toolbar}>
        <View style={styles.searchBar}>
          <IconSymbol name="plus" size={20} color="#888" style={{transform: [{rotate: '45deg'}]}} /> {/* Placeholder for search icon */}
          <TextInput 
            style={styles.searchInput}
            placeholder="Rechercher une activité..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.toolBtn} onPress={() => setShowFilters(!showFilters)}>
          <IconSymbol name="line.3.horizontal.decrease.circle" size={20} color={showFilters ? '#0a7ea4' : '#888'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => setViewMode(viewMode === 'list' ? 'card' : 'list')}>
          <IconSymbol name={viewMode === 'list' ? 'square.grid.2x2.fill' : 'list.bullet'} size={20} color="#0a7ea4" />
        </TouchableOpacity>
      </View>

      {/* Filters Area */}
      {showFilters && (
        <View style={styles.filtersArea}>
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

      {/* Secondary Choice based on type */}
      <View style={styles.filtersContainer}>
        {selectedType === 'Centre' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {AGE_GROUPS.map((age) => (
              <FilterChip
                key={age}
                label={age}
                selected={selectedAgeGroup === age}
                onPress={() => setSelectedAgeGroup(selectedAgeGroup === age ? null : age)}
              />
            ))}
          </ScrollView>
        )}

        {selectedType === 'Periscolaire' && (
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {SCHOOL_LEVELS.map((level) => (
                <FilterChip
                  key={level}
                  label={level.charAt(0).toUpperCase() + level.slice(1)}
                  selected={selectedSchoolLevel === level}
                  onPress={() => handleSchoolLevelChange(selectedSchoolLevel === level ? '' : level)}
                />
              ))}
            </ScrollView>

            {/* Tertiary filters depending on primary/maternelle */}
            {selectedSchoolLevel === 'primaire' && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chipsRow, styles.subChips]}>
                {PRIMAIRE_CLASSES.map((cls) => (
                  <FilterChip
                    key={cls}
                    label={cls}
                    selected={selectedClass === cls}
                    onPress={() => setSelectedClass(selectedClass === cls ? null : cls)}
                    isSubChip
                  />
                ))}
              </ScrollView>
            )}
            
            {selectedSchoolLevel === 'maternelle' && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chipsRow, styles.subChips]}>
                {MATERNELLE_CLASSES.map((cls) => (
                  <FilterChip
                    key={cls}
                    label={cls}
                    selected={selectedClass === cls}
                    onPress={() => setSelectedClass(selectedClass === cls ? null : cls)}
                    isSubChip
                  />
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
        </View>
      )}

      {/* Category filters */}
      <View style={styles.categoryFiltersContainer}>
        <Text style={styles.filterTitle}>Catégorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.contentList}>
        {filteredData.length > 0 ? (
          filteredData.map((item) => <CatalogItemCard key={item.id} item={item} viewMode={viewMode} />)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune activité trouvée pour ces critères.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const FilterChip = ({ label, selected, onPress, isSubChip = false }: any) => (
  <TouchableOpacity
    style={[
      styles.chip,
      isSubChip && styles.subChip,
      selected && styles.chipSelected
    ]}
    onPress={onPress}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

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
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6e6e6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  toolBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#e6e6e6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersArea: {
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#e6e6e6',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  segmentBtnTextActive: {
    color: '#0a7ea4',
  },
  filtersContainer: {
    marginBottom: 8,
  },
  categoryFiltersContainer: {
    marginBottom: 16,
  },
  filterTitle: {
    marginBottom: 8,
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  chipsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  subChips: {
    marginTop: 8,
  },
  subChip: {
    backgroundColor: '#f0f0f0',
    borderWidth: 0,
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
  },
});
