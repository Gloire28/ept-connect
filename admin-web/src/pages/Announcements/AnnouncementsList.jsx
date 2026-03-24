// admin-web/src/pages/Announcements/AnnouncementsList.jsx
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
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as PreviewIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../../services/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const AnnouncementsList = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null); // ← NOUVEAUTÉ
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [rowCount, setRowCount] = useState(0);
  const [filters, setFilters] = useState({ isActive: 'true' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);

  // Modal preview image
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        activeOnly: filters.isActive === 'true' ? 'true' : undefined,
      };
      const response = await api.get('/announcements', { params });
      setAnnouncements(response.data.data);
      setRowCount(response.data.pagination.total);
    } catch (err) {
      setError('Erreur lors du chargement des annonces');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [paginationModel, filters]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, isActive: e.target.value }));
  };

  const handleDelete = (id) => {
    setSelectedAnnouncementId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAnnouncementId) return;
    setDeletingId(selectedAnnouncementId);
    try {
      await api.delete(`/announcements/${selectedAnnouncementId}`);
      setSuccess('Annonce supprimée avec succès');
      setTimeout(() => setSuccess(''), 3000);
      fetchAnnouncements();
    } catch (err) {
      setError('Erreur lors de la suppression de l’annonce');
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
      setSelectedAnnouncementId(null);
    }
  };

  const openPreviewModal = (imageUrl) => {
    setCurrentImageUrl(imageUrl);
    setPreviewModalOpen(true);
  };

  const columns = [
    { field: 'titre', headerName: 'Titre', flex: 1, minWidth: 220 },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 250 },
    {
      field: 'priorite',
      headerName: 'Priorité',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value >= 7 ? 'error' : params.value >= 4 ? 'warning' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Statut',
      width: 130,
      renderCell: (params) => {
        const isActive = params.row.isActive &&
          new Date(params.row.dateDebut) <= new Date() &&
          new Date(params.row.dateFin) >= new Date();
        return (
          <Chip
            label={isActive ? 'Active' : 'Inactif/expiré'}
            color={isActive ? 'success' : 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'image',
      headerName: 'Image',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        params.row.imageUrl ? (
          <img
            src={params.row.imageUrl}
            alt="Annonce"
            style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => openPreviewModal(params.row.imageUrl)}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">Pas d’image</Typography>
        )
      ),
    },
    {
      field: 'preview',
      headerName: 'Aperçu',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        params.row.imageUrl ? (
          <Tooltip title="Voir l’image">
            <IconButton color="primary" onClick={() => openPreviewModal(params.row.imageUrl)}>
              <PreviewIcon />
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
            <IconButton color="primary" onClick={() => navigate(`/announcements/edit/${params.row._id}`)}>
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
        <Typography variant="h5">Liste des Annonces</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/announcements/create')}>
          Nouvelle Annonce
        </Button>
      </Box>

      {/* Filtres */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Afficher"
            name="isActive"
            value={filters.isActive}
            onChange={handleFilterChange}
            size="small"
          >
            <MenuItem value="true">Annonces actives seulement</MenuItem>
            <MenuItem value="false">Toutes les annonces</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={announcements}
          columns={columns}
          rowCount={rowCount}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          getRowId={(row) => row._id}
        />
      </div>

      {/* MODAL PREVIEW IMAGE */}
      <Modal open={previewModalOpen} onClose={() => setPreviewModalOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 700,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton onClick={() => setPreviewModalOpen(false)}>✕</IconButton>
          </Box>
          {currentImageUrl && (
            <img
              src={currentImageUrl}
              alt="Aperçu annonce"
              style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px' }}
            />
          )}
        </Box>
      </Modal>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedAnnouncementId(null);
        }}
      />
    </Box>
  );
};

export default AnnouncementsList;