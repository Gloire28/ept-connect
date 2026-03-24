// mobile/src/components/common/FilterBar.jsx
// Composant réutilisable pour filtres dans les listes (Sermons, Musique, Livres, Annonces)
// Conforme Document UI/UX + Cahier des Charges Fonctionnel (filtre ministère/catégorie/thème)

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import usePreferenceStore from '../../store/preferenceStore';

const FilterBar = ({ 
  filters = [],                    // ex: [{ key: 'ministere', label: 'Ministère', options: [...] }]
  onApplyFilters,                  // callback quand on applique (retourne objet { ministere: '...', theme: '...' })
  initialValues = {},              // valeurs par défaut (ex: { ministere: 'Tous' })
}) => {
  const { isDarkMode } = usePreferenceStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(initialValues);

  const theme = {
    background: isDarkMode ? colors.darkBackground : '#f3f8fd',
    card: isDarkMode ? colors.darkCard : '#fff',
    text: isDarkMode ? colors.darkText : colors.text,
    accent: colors.primary,
    border: isDarkMode ? '#334155' : '#E5E7EB',
  };

  const handleSelect = (filterKey, value) => {
    setSelectedFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const handleApply = () => {
    onApplyFilters(selectedFilters);
    setModalVisible(false);
  };

  const handleReset = () => {
    setSelectedFilters(initialValues);
    onApplyFilters(initialValues);
    setModalVisible(false);
  };

  return (
    <>
      {/* Barre visible */}
      <View style={[styles.bar, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Filtres</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color={theme.accent} />
          <Text style={[styles.filterCount, { color: theme.accent }]}>
            {Object.values(selectedFilters).filter(v => v && v !== 'Tous').length}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de filtres */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Filtrer</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {filters.map((filter) => (
                <View key={filter.key} style={styles.filterSection}>
                  <Text style={[styles.filterLabel, { color: theme.text }]}>{filter.label}</Text>
                  <View style={styles.optionsRow}>
                    {filter.options.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.optionChip,
                          selectedFilters[filter.key] === option.value && styles.optionChipSelected,
                          { borderColor: theme.accent }
                        ]}
                        onPress={() => handleSelect(filter.key, option.value)}
                      >
                        <Text 
                          style={[
                            styles.optionText,
                            selectedFilters[filter.key] === option.value && { color: '#fff' },
                            { color: selectedFilters[filter.key] === option.value ? '#fff' : theme.text }
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetText}>Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.applyButton, { backgroundColor: theme.accent }]} onPress={handleApply}>
                <Text style={styles.applyText}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 37, 64, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterCount: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  resetText: {
    color: '#1F2937',
    fontWeight: '600',
    fontSize: 16,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default FilterBar;