// admin-web/src/pages/Music/MusicList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Modal,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../../services/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const MusicList = () => {
  const navigate = useNavigate();
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // ← NOUVEAUTÉ
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [rowCount, setRowCount] = useState(0);
  const [filters, setFilters] = useState({ typeMedia: '', artiste: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMusicId, setSelectedMusicId] = useState(null);

  // Modal lecture
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [currentMediaUrl, setCurrentMediaUrl] = useState('');
  const [currentTypeMedia, setCurrentTypeMedia] = useState('audio');

  const fetchMusics = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        ...(filters.typeMedia && { typeMedia: filters.typeMedia }),
        ...(filters.artiste && { artiste: filters.artiste }),
      };
      const response = await api.get('/music', { params });
      setMusics(response.data.data || []);
      setRowCount(response.data.pagination.total);
    } catch (err) {
      setError('Erreur lors du chargement des musiques');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMusics();
  }, [paginationModel, filters]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDelete = (id) => {
    setSelectedMusicId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMusicId) return;
    setDeletingId(selectedMusicId);
    try {
      await api.delete(`/music/${selectedMusicId}`);
      setSuccess('Musique supprimée avec succès (fichiers supprimés');
      setTimeout(() => setSuccess(''), 3000);
      fetchMusics();
    } catch (err) {
      setError('Erreur lors de la suppression de la musique');
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
      setSelectedMusicId(null);
    }
  };

  const openMediaModal = (url, typeMedia) => {
    setCurrentMediaUrl(url);
    setCurrentTypeMedia(typeMedia);
    setMediaModalOpen(true);
  };

  const columns = [
    { field: 'titre', headerName: 'Titre', flex: 1, minWidth: 200 },
    { field: 'artiste', headerName: 'Artiste', flex: 1, minWidth: 150 },
    { field: 'album', headerName: 'Album', flex: 1, minWidth: 150 },
    { field: 'typeMedia', headerName: 'Type', width: 100 },
    { field: 'duree', headerName: 'Durée', width: 100 },
    {
      field: 'thumbnail',
      headerName: 'Pochette',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        params.row.urlThumbnail ? (
          <img
            src={params.row.urlThumbnail}
            alt="Pochette"
            style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => openMediaModal(params.row.urlMedia, params.row.typeMedia)}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">Pas d’image</Typography>
        )
      ),
    },
    {
      field: 'lecture',
      headerName: 'Lecture',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        params.row.urlMedia ? (
          <Tooltip title="Lire">
            <IconButton color="primary" onClick={() => openMediaModal(params.row.urlMedia, params.row.typeMedia)}>
              <PlayIcon />
            </IconButton>
          </Tooltip>
        ) : null
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Modifier">
            <IconButton color="primary" onClick={() => navigate(`/music/edit/${params.row._id}`)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton
              color="error"
              onClick={() => handleDelete(params.row._id)}
              disabled={deletingId === params.row._id}
            >
              {deletingId === params.row._id ? <CircularProgress size={20} /> : <DeleteIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Liste des Musiques</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/music/upload')}>
          Nouvelle Musique
        </Button>
      </Box>

      {/* Filtres */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Filtrer par type"
            name="typeMedia"
            value={filters.typeMedia}
            onChange={handleFilterChange}
            size="small"
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="audio">Audio</MenuItem>
            <MenuItem value="video">Vidéo</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Filtrer par artiste"
            name="artiste"
            value={filters.artiste}
            onChange={handleFilterChange}
            size="small"
          />
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={musics}
          columns={columns}
          rowCount={rowCount}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          getRowId={(row) => row._id}
        />
      </div>

      {/* MODAL LECTURE */}
      <Modal open={mediaModalOpen} onClose={() => setMediaModalOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 800,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton onClick={() => setMediaModalOpen(false)}>✕</IconButton>
          </Box>
          {currentMediaUrl && currentTypeMedia === 'audio' ? (
            <audio controls autoPlay style={{ width: '100%' }} src={currentMediaUrl}>
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
          ) : (
            <video controls autoPlay style={{ width: '100%', maxHeight: '70vh' }} src={currentMediaUrl}>
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          )}
        </Box>
      </Modal>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette musique ? Cette action est irréversible."
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedMusicId(null);
        }}
      />
    </Box>
  );
};

export default MusicList;