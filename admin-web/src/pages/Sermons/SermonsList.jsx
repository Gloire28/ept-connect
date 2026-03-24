// admin-web/src/pages/Sermons/SermonsList.jsx
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
  Paper,
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

const SermonsList = () => {
  const navigate = useNavigate();
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // ← NOUVEAUTÉ : état suppression
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [rowCount, setRowCount] = useState(0);
  const [filters, setFilters] = useState({ ministere: '', theme: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSermonId, setSelectedSermonId] = useState(null);

  // Modal vidéo
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');

  const fetchSermons = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        ...(filters.ministere && { ministere: filters.ministere }),
        ...(filters.theme && { theme: filters.theme }),
      };
      const response = await api.get('/sermons', { params });
      setSermons(response.data.data || []);
      setRowCount(response.data.pagination.total);
    } catch (err) {
      setError('Erreur lors du chargement des sermons');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, [paginationModel, filters]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDelete = (id) => {
    setSelectedSermonId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSermonId) return;
    setDeletingId(selectedSermonId);
    try {
      await api.delete(`/sermons/${selectedSermonId}`);
      setSuccess('Sermon supprimé avec succès');
      setTimeout(() => setSuccess(''), 3000);
      fetchSermons(); // Rafraîchissement immédiat
    } catch (err) {
      setError('Erreur lors de la suppression du sermon');
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
      setSelectedSermonId(null);
    }
  };

  const openVideoModal = (url) => {
    setCurrentVideoUrl(url);
    setVideoModalOpen(true);
  };

  const columns = [
    { field: 'titre', headerName: 'Titre', flex: 1, minWidth: 200 },
    { field: 'theme', headerName: 'Thème', flex: 1, minWidth: 150 },
    { field: 'orateur', headerName: 'Orateur', flex: 1, minWidth: 150 },
    { field: 'orateurTitre', headerName: 'Titre', width: 100 },
    { field: 'ministere', headerName: 'Ministère', width: 130 },
    { field: 'duree', headerName: 'Durée', width: 100 },
    {
      field: 'thumbnail',
      headerName: 'Miniature',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        params.row.urlThumbnail ? (
          <img
            src={params.row.urlThumbnail}
            alt="Miniature"
            style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => openVideoModal(params.row.urlMedia)}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">Pas d’image</Typography>
        )
      ),
    },
    {
      field: 'video',
      headerName: 'Lecture',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        params.row.urlMedia ? (
          <Tooltip title="Lire la vidéo">
            <IconButton color="primary" onClick={() => openVideoModal(params.row.urlMedia)}>
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
            <IconButton color="primary" onClick={() => navigate(`/sermons/edit/${params.row._id}`)}>
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
        <Typography variant="h5">Liste des Sermons</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/sermons/upload')}>
          Nouveau Sermon
        </Button>
      </Box>

      {/* Filtres */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Filtrer par ministère" name="ministere" value={filters.ministere} onChange={handleFilterChange} size="small" />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Filtrer par thème" name="theme" value={filters.theme} onChange={handleFilterChange} size="small" />
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={sermons}
          columns={columns}
          rowCount={rowCount}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          getRowId={(row) => row._id}
        />
      </div>

      {/* MODAL VIDÉO */}
      <Modal open={videoModalOpen} onClose={() => setVideoModalOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 900,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 2,
          borderRadius: 2,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <IconButton onClick={() => setVideoModalOpen(false)}>✕</IconButton>
          </Box>
          {currentVideoUrl && (
            <video controls autoPlay style={{ width: '100%', maxHeight: '70vh' }} src={currentVideoUrl}>
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          )}
        </Box>
      </Modal>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce sermon ? Cette action est irréversible."
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedSermonId(null);
        }}
      />
    </Box>
  );
};

export default SermonsList;