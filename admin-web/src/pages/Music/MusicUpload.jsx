// admin-web/src/pages/Music/MusicUpload.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Grid,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../../services/api';
import FileUploadInput from '../../components/common/FileUploadInput';

const MusicUpload = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titre: '', artiste: '', album: '', description: '', typeMedia: 'audio',
    duree: '', paroles: '', isPremium: false, tags: '',
  });

  const [files, setFiles] = useState({ media: null, thumbnail: null });
  const [preview, setPreview] = useState({ media: null, thumbnail: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (name, file) => {
    setFiles((prev) => ({ ...prev, [name]: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview((prev) => ({ ...prev, [name]: url }));
    }
  };

  const resetForm = () => {
    setFormData({
      titre: '', artiste: '', album: '', description: '', typeMedia: 'audio',
      duree: '', paroles: '', isPremium: false, tags: '',
    });
    setFiles({ media: null, thumbnail: null });
    setPreview({ media: null, thumbnail: null });
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!files.media || !files.thumbnail) {
      setError('Fichier média et miniature obligatoires');
      setLoading(false);
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('media', files.media);
    data.append('thumbnail', files.thumbnail);

    try {
      await api.post('/music', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('✅ Musique ajoutée avec succès!');
      
      setTimeout(() => {
        resetForm();
        navigate('/music', { replace: true });
      }, 1800);

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Ajouter une Nouvelle Musique
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        {success && (
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />} 
            sx={{ mb: 3, fontSize: '1.1rem' }}
          >
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Colonne 1 */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Titre de la musique"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                margin="normal"
              />

              <TextField
                fullWidth
                required
                label="Artiste / Groupe"
                name="artiste"
                value={formData.artiste}
                onChange={handleChange}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Album (optionnel)"
                name="album"
                value={formData.album}
                onChange={handleChange}
                margin="normal"
              />

              <TextField
                fullWidth
                required
                label="Durée (ex. 04:35)"
                name="duree"
                value={formData.duree}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>

            {/* Colonne 2 */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                required
                label="Type de média"
                name="typeMedia"
                value={formData.typeMedia}
                onChange={handleChange}
                margin="normal"
              >
                <MenuItem value="audio">Audio</MenuItem>
                <MenuItem value="video">Vidéo</MenuItem>
              </TextField>

              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label="Description / Contexte"
                name="description"
                value={formData.description}
                onChange={handleChange}
                margin="normal"
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
                sx={{ mt: 2 }}
              />
            </Grid>

            {/* Paroles & Tags */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Paroles (optionnel)"
                name="paroles"
                value={formData.paroles}
                onChange={handleChange}
                margin="normal"
                placeholder="Collez ici les paroles si disponibles"
              />

              <TextField
                fullWidth
                label="Tags (séparés par des virgules)"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                margin="normal"
                helperText="Ex. : louange, jeunesse, culte, adoration"
              />
            </Grid>

            {/* Uploads */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Fichier média (audio ou vidéo)
              </Typography>
              <FileUploadInput
                accept={formData.typeMedia === 'video' ? 'video/*' : 'audio/*,audio/mpeg'}
                onFileChange={(file) => handleFileChange('media', file)}
                preview={preview.media}
                label="Sélectionner le fichier média"
                icon={<CloudUploadIcon />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Miniature / Pochette
              </Typography>
              <FileUploadInput
                accept="image/*"
                onFileChange={(file) => handleFileChange('thumbnail', file)}
                preview={preview.thumbnail}
                label="Sélectionner la pochette"
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
                {loading ? <CircularProgress size={24} /> : 'Publier la Musique'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default MusicUpload;