// admin-web/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  alpha,
} from '@mui/material';
import VideoLibraryTwoToneIcon from '@mui/icons-material/VideoLibraryTwoTone';
import MusicNoteTwoToneIcon from '@mui/icons-material/MusicNoteTwoTone';
import MenuBookTwoToneIcon from '@mui/icons-material/MenuBookTwoTone';
import CampaignTwoToneIcon from '@mui/icons-material/CampaignTwoTone';
import LocationOnTwoToneIcon from '@mui/icons-material/LocationOnTwoTone';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const StatCard = ({ title, count, icon, color, to }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 4,
      border: '1px solid',
      borderColor: 'divider',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: (theme) => `0 10px 20px ${alpha(theme.palette.common.black, 0.05)}`,
        borderColor: color,
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
      <Avatar
        sx={{
          backgroundColor: alpha(color, 0.1),
          color: color,
          width: 56,
          height: 56,
          borderRadius: 3,
        }}
      >
        {icon}
      </Avatar>
      <Typography variant="h4" fontWeight="700">
        {count}
      </Typography>
    </Box>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
      {title}
    </Typography>
    <Button
      component={RouterLink}
      to={to}
      endIcon={<ArrowForwardIcon />}
      sx={{
        mt: 'auto',
        justifyContent: 'flex-start',
        px: 0,
        color: color,
        '&:hover': { backgroundColor: 'transparent', opacity: 0.8 },
      }}
    >
      Gérer
    </Button>
  </Paper>
);

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    sermons: 0, music: 0, books: 0, announcements: 0, locations: 0,
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
          api.get('/locations?limit=0'),
        ]);
        setStats({
          sermons: sermonsRes.data?.pagination?.total || 0,
          music: musicRes.data?.pagination?.total || 0,
          books: booksRes.data?.pagination?.total || 0,
          announcements: annRes.data?.pagination?.total || 0,
          locations: locationsRes.data?.count || 0,
        });
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress thickness={5} size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 5 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" fontWeight="800" gutterBottom>
          Bonjour, {user?.prenoms} 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Voici ce qui se passe sur <strong>EPT Connect</strong> aujourd'hui.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard title="Sermons" count={stats.sermons} color="#6366f1" to="/sermons" icon={<VideoLibraryTwoToneIcon fontSize="large" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard title="Musique" count={stats.music} color="#10b981" to="/music" icon={<MusicNoteTwoToneIcon fontSize="large" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard title="Livres" count={stats.books} color="#f59e0b" to="/books" icon={<MenuBookTwoToneIcon fontSize="large" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard title="Annonces" count={stats.announcements} color="#ef4444" to="/announcements" icon={<CampaignTwoToneIcon fontSize="large" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard title="Lieux" count={stats.locations} color="#8b5cf6" to="/locations" icon={<LocationOnTwoToneIcon fontSize="large" />} />
        </Grid>
      </Grid>

      {/* Section Activité Récente */}
      <Paper sx={{ mt: 5, p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="700" gutterBottom>
          Activités récentes
        </Typography>
        <Box sx={{ py: 4, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography color="text.secondary">
            Le flux d'activité en temps réel sera bientôt disponible.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;