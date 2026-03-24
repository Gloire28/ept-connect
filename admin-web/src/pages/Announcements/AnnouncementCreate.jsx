// admin-web/src/pages/Announcements/AnnouncementCreate.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../../services/api';
import FileUploadInput from '../../components/common/FileUploadInput'; 

const AnnouncementCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 

  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    lienExterne: '',
    dateDebut: '',
    dateFin: '',
    isActive: true,
    isPremium: false,
    priorite: 0,
    tags: '',
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Chargement en mode édition
  useEffect(() => {
    if (isEditMode) {
      const fetchAnnouncement = async () => {
        try {
          const response = await api.get(`/announcements/${id}`);
          const data = response.data.data;
          setFormData({
            titre: data.titre,
            description: data.description,
            lienExterne: data.lienExterne || '',
            dateDebut: new Date(data.dateDebut).toISOString().slice(0, 16),
            dateFin: new Date(data.dateFin).toISOString().slice(0, 16),
            isActive: data.isActive,
            isPremium: data.isPremium,
            priorite: data.priorite,
            tags: data.tags?.join(', ') || '',
          });
          setPreview(data.imageUrl);
        } catch (err) {
          setError('Erreur lors du chargement de l’annonce');
        }
      };
      fetchAnnouncement();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (file) => {
    setFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!file && !isEditMode) {
      setError('Image principale obligatoire');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('titre', formData.titre);
    data.append('description', formData.description);
    data.append('lienExterne', formData.lienExterne);
    data.append('dateDebut', formData.dateDebut);
    data.append('dateFin', formData.dateFin);
    data.append('isActive', formData.isActive);
    data.append('isPremium', formData.isPremium);
    data.append('priorite', formData.priorite);
    data.append('tags', formData.tags);

    if (file) {
      data.append('image', file);
    }

    try {
      if (isEditMode) {
        await api.put(`/announcements/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Annonce modifiée avec succès !');
      } else {
        await api.post('/announcements', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSuccess('Annonce créée avec succès !');
      }

      setTimeout(() => navigate('/announcements'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {isEditMode ? 'Modifier l’Annonce' : 'Créer une Nouvelle Annonce'}
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Colonne 1 */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Titre de l’annonce"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                margin="normal"
              />

              <TextField
                fullWidth
                required
                multiline
                rows={5}
                label="Description complète"
                name="description"
                value={formData.description}
                onChange={handleChange}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Lien externe (optionnel)"
                name="lienExterne"
                value={formData.lienExterne}
                onChange={handleChange}
                margin="normal"
                placeholder="https://youtube.com/... ou lien inscription"
              />
            </Grid>

            {/* Colonne 2 */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Date de début"
                name="dateDebut"
                type="datetime-local"
                value={formData.dateDebut}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                required
                label="Date de fin"
                name="dateFin"
                type="datetime-local"
                value={formData.dateFin}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Annonce active"
                sx={{ mt: 2 }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isPremium}
                    onChange={handleChange}
                    name="isPremium"
                    color="primary"
                  />
                }
                label="Réservé aux membres premium"
                sx={{ mt: 1 }}
              />

              <TextField
                fullWidth
                label="Priorité (0 à 10)"
                name="priorite"
                type="number"
                value={formData.priorite}
                onChange={handleChange}
                margin="normal"
                inputProps={{ min: 0, max: 10 }}
                helperText="Plus haut = plus visible en haut du feed"
              />
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (séparés par des virgules)"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                margin="normal"
                helperText="Ex. : croisade, évangélisation, nouvelle position"
              />
            </Grid>

            {/* Upload Image */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Image principale de l’annonce
              </Typography>
              <FileUploadInput
                accept="image/*"
                onFileChange={handleFileChange}
                preview={preview}
                label="Sélectionner l’image"
                icon={<CloudUploadIcon />}
              />
            </Grid>

            {/* Submit */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? <CircularProgress size={24} /> : isEditMode ? 'Modifier l’Annonce' : 'Publier l’Annonce'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AnnouncementCreate;