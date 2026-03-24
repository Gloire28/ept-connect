// admin-web/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CampaignIcon from '@mui/icons-material/Campaign';
import LocationOnIcon from '@mui/icons-material/LocationOn';   // ← NOUVELLE ICÔNE
import useAuthStore from '../store/authStore';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    sermons: 0,
    music: 0,
    books: 0,
    announcements: 0,
    locations: 0,          // ← AJOUTÉ
    recentUploads: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sermonsRes, musicRes, booksRes, annRes, locationsRes] = await Promise.all([
          api.get('/sermons?limit=0'),
          api.get('/music?limit=0'),
          api.get('/books?limit=0'),
          api.get('/announcements?limit=0'),
          api.get('/locations?limit=0'),   // ← NOUVEL APPEL
        ]);
        setStats({
          sermons: sermonsRes.data?.pagination?.total || 0,
          music: musicRes.data?.pagination?.total || 0,
          books: booksRes.data?.pagination?.total || 0,
          announcements: annRes.data?.pagination?.total || 0,
          locations: locationsRes.data?.count || 0,   // ← count renvoyé par notre controller
          recentUploads: [],
        });
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bienvenue, {user?.nom} {user?.prenoms}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Tableau de bord d’administration - EPT Connect
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* === SERMONS === */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VideoLibraryIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Typography variant="h5">{stats.sermons}</Typography>
              </Box>
              <Typography variant="h6">Sermons</Typography>
              <Button component={RouterLink} to="/sermons" sx={{ mt: 2 }}>
                Voir tous
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* === MUSIQUE === */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MusicNoteIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Typography variant="h5">{stats.music}</Typography>
              </Box>
              <Typography variant="h6">Musique</Typography>
              <Button component={RouterLink} to="/music" sx={{ mt: 2 }}>
                Voir tous
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* === LIVRES === */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MenuBookIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Typography variant="h5">{stats.books}</Typography>
              </Box>
              <Typography variant="h6">Livres</Typography>
              <Button component={RouterLink} to="/books" sx={{ mt: 2 }}>
                Voir tous
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* === ANNONCES === */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CampaignIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Typography variant="h5">{stats.announcements}</Typography>
              </Box>
              <Typography variant="h6">Annonces</Typography>
              <Button component={RouterLink} to="/announcements" sx={{ mt: 2 }}>
                Voir tous
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* === LIEUX DE CULTE (NOUVELLE CARTE) === */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Typography variant="h5">{stats.locations}</Typography>
              </Box>
              <Typography variant="h6">Lieux de Culte</Typography>
              <Button component={RouterLink} to="/locations" sx={{ mt: 2 }}>
                Voir tous
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Derniers uploads (section en cours de développement) */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" gutterBottom>
          Derniers ajouts
        </Typography>
        <Typography variant="body2" color="text.secondary">
          (Section en cours de développement)
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;