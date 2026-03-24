// admin-web/src/pages/Locations/LocationsList.jsx
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../../services/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const LocationsList = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [rowCount, setRowCount] = useState(0);
  const [filters, setFilters] = useState({ ville: '', quartier: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  const fetchLocations = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        ...(filters.ville && { ville: filters.ville }),
        ...(filters.quartier && { quartier: filters.quartier }),
      };
      const response = await api.get('/locations', { params });
      setLocations(response.data.data || []);
      setRowCount(response.data.count || response.data.data?.length || 0);
    } catch (err) {
      setError('Erreur lors du chargement des lieux de culte');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [paginationModel, filters]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDelete = (id) => {
    setSelectedLocationId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedLocationId) return;
    setDeletingId(selectedLocationId);
    try {
      await api.delete(`/locations/${selectedLocationId}`);
      setSuccess('Lieu de culte supprimé avec succès');
      setTimeout(() => setSuccess(''), 3000);
      fetchLocations();
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
      setSelectedLocationId(null);
    }
  };

  const columns = [
    { field: 'nom', headerName: 'Nom du Lieu', flex: 1, minWidth: 220 },
    { field: 'quartier', headerName: 'Quartier', flex: 1, minWidth: 150 },
    { field: 'ville', headerName: 'Ville', width: 130 },
    { field: 'pasteurResponsable', headerName: 'Pasteur', flex: 1, minWidth: 160 },
    { field: 'telephone', headerName: 'Téléphone', width: 130 },
    { field: 'horaires', headerName: 'Horaires', flex: 1, minWidth: 180 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Modifier">
            <IconButton color="primary" onClick={() => navigate(`/locations/edit/${params.row._id}`)}>
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
        <Typography variant="h5">Liste des Lieux de Culte</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/locations/create')}
        >
          Nouveau Lieu
        </Button>
      </Box>

      {/* Filtres */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Filtrer par ville"
            name="ville"
            value={filters.ville}
            onChange={handleFilterChange}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Filtrer par quartier"
            name="quartier"
            value={filters.quartier}
            onChange={handleFilterChange}
            size="small"
          />
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={locations}
          columns={columns}
          rowCount={rowCount}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          getRowId={(row) => row._id}
        />
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce lieu de culte ? Cette action est irréversible."
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedLocationId(null);
        }}
      />
    </Box>
  );
};

export default LocationsList;