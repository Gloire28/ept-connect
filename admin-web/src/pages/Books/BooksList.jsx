// admin-web/src/pages/Books/BooksList.jsx
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
  Visibility as PreviewIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../../services/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const BooksList = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [rowCount, setRowCount] = useState(0);
  const [filters, setFilters] = useState({ format: '', categorie: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);

  // Modal preview
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentCoverUrl, setCurrentCoverUrl] = useState('');
  const [currentBookUrl, setCurrentBookUrl] = useState('');

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        ...(filters.format && { format: filters.format }),
        ...(filters.categorie && { categorie: filters.categorie }),
      };
      const response = await api.get('/books', { params });
      setBooks(response.data.data || []);
      setRowCount(response.data.pagination.total);
    } catch (err) {
      setError('Erreur lors du chargement des livres');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [paginationModel, filters]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDelete = (id) => {
    setSelectedBookId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBookId) return;
    setDeletingId(selectedBookId);
    try {
      await api.delete(`/books/${selectedBookId}`);
      setSuccess('Livre supprimé avec succès (fichiers supprimés');
      setTimeout(() => setSuccess(''), 3000);
      fetchBooks();
    } catch (err) {
      setError('Erreur lors de la suppression du livre');
      console.error(err);
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
      setSelectedBookId(null);
    }
  };

  const openPreviewModal = (coverUrl, bookUrl) => {
    setCurrentCoverUrl(coverUrl);
    setCurrentBookUrl(bookUrl);
    setPreviewModalOpen(true);
  };

  const columns = [
    { field: 'titre', headerName: 'Titre', flex: 1, minWidth: 220 },
    { field: 'auteur', headerName: 'Auteur', flex: 1, minWidth: 150 },
    { field: 'categorie', headerName: 'Catégorie', width: 140 },
    { field: 'format', headerName: 'Format', width: 100 },
    { field: 'nombrePages', headerName: 'Pages', width: 90 },
    {
      field: 'couverture',
      headerName: 'Couverture',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        params.row.urlCouverture ? (
          <img
            src={params.row.urlCouverture}
            alt="Couverture"
            style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
            onClick={() => openPreviewModal(params.row.urlCouverture, params.row.urlFichier)}
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
        params.row.urlCouverture || params.row.urlFichier ? (
          <Tooltip title="Voir le livre">
            <IconButton
              color="primary"
              onClick={() => openPreviewModal(params.row.urlCouverture, params.row.urlFichier)}
            >
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
            <IconButton color="primary" onClick={() => navigate(`/books/edit/${params.row._id}`)}>
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
        <Typography variant="h5">Liste des Livres</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/books/upload')}>
          Nouveau Livre
        </Button>
      </Box>

      {/* Filtres */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label="Filtrer par format"
            name="format"
            value={filters.format}
            onChange={handleFilterChange}
            size="small"
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="pdf">PDF</MenuItem>
            <MenuItem value="epub">ePub</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Filtrer par catégorie"
            name="categorie"
            value={filters.categorie}
            onChange={handleFilterChange}
            size="small"
          />
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={books}
          columns={columns}
          rowCount={rowCount}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          getRowId={(row) => row._id}
        />
      </div>

      {/* MODAL PREVIEW */}
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
          {currentCoverUrl && (
            <img
              src={currentCoverUrl}
              alt="Couverture agrandie"
              style={{ width: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '8px' }}
            />
          )}
          {currentBookUrl && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => window.open(currentBookUrl, '_blank')}
              >
                📖 Ouvrir le livre (PDF / ePub)
              </Button>
            </Box>
          )}
        </Box>
      </Modal>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce livre ? Cette action est irréversible"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setSelectedBookId(null);
        }}
      />
    </Box>
  );
};

export default BooksList;