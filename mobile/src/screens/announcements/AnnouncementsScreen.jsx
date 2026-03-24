// mobile/src/screens/announcements/AnnouncementsScreen.jsx
// Version finale : dark mode dynamique complet + correction duplication styles

import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../../components/common/CustomHeader';
import AnnouncementCard from '../../components/feed/AnnouncementCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';
import { offlineCache } from '../../utils/offlineCache';
import usePreferenceStore from '../../store/preferenceStore';
import colors from '../../constants/colors';

const AnnouncementsScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode } = usePreferenceStore();

  // Thème dynamique
  const theme = {
    background: isDarkMode ? colors.darkBackground : '#f3f8fd',
  };

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements?limit=30');
      setAnnouncements(res.data.data || []);
      offlineCache.save('announcements_list', res.data.data);
    } catch (err) {
      const cached = await offlineCache.get('announcements_list');
      if (cached) setAnnouncements(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  if (loading && announcements.length === 0) return <LoadingSpinner />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="Annonces" showBack={false} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scroll}
      >
        {announcements.map(ann => (
          <AnnouncementCard
            key={ann._id}
            announcement={ann}
            onPress={() => navigation.navigate('AnnouncementDetail', { id: ann._id })}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: { 
    padding: 16 
  },
});

export default AnnouncementsScreen;