// admin-web/src/pages/Sermons/SermonUpload.jsx
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
  FormControl,
  InputLabel,
  Select,
  Chip,
  LinearProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../../services/api';
import FileUploadInput from '../../components/common/FileUploadInput';

const ministereEnum = [
  'Hommes', 'Femmes', 'Jeunesse', 'Enfants'
];

const SermonUpload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titre: '',
    theme: '',
    orateur: '',
    orateurTitre: '',
    description: '',
    ministere: [],
    typeMedia: 'video',
    duree: '',
    isPremium: false,
    tags: []
  });
  const [files, setFiles] = useState({ video: null, thumbnail: null });
  const [preview, setPreview] = useState({ video: null, thumbnail: null });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (name === 'ministere' || name === 'tags') {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
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
      titre: '', theme: '', orateur: '', orateurTitre: '', description: '',
      ministere: [], typeMedia: 'video', duree: '', isPremium: false, tags: []
    });
    setFiles({ video: null, thumbnail: null });
    setPreview({ video: null, thumbnail: null });
    setProgress(0);
    setSuccess('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setProgress(0);

    if (!files.video || !files.thumbnail) {
      setError('Vidéo et miniature obligatoires');
      setLoading(false);
      return;
    }

    const data = new FormData();
    // Champs simples
    data.append('titre', formData.titre);
    data.append('theme', formData.theme);
    data.append('orateur', formData.orateur);
    data.append('orateurTitre', formData.orateurTitre);
    data.append('description', formData.description);
    data.append('typeMedia', formData.typeMedia);
    data.append('duree', formData.duree);
    data.append('isPremium', formData.isPremium);

    // Arrays (multi-sélection)
    formData.ministere.forEach(m => data.append('ministere', m));
    formData.tags.forEach(t => data.append('tags', t));

    // Fichiers
    data.append('video', files.video);
    data.append('thumbnail', files.thumbnail);

    try {
      const response = await api.post('/sermons', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 600000, // 10 minutes pour vidéos jusqu'à 500 Mo + Bunny.net
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        },
      });

      // === SUCCÈS ===
      setSuccess('✅ Sermon ajouté avec succès!');
      setProgress(100);

      setTimeout(() => {
        resetForm();
        navigate('/sermons', { replace: true });
      }, 2000);
    } catch (err) {
      const errMsg = err.response?.data?.message
        || err.message
        || 'Erreur inconnue lors de l\'upload. Vérifiez la connexion ou la taille des fichiers.';
      setError(errMsg);
      console.error('Erreur upload frontend:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Ajouter un Nouveau Sermon
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

        {/* PROGRESS BAR VISIBLE PENDANT L'UPLOAD */}
        {loading && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="body2" color="primary" gutterBottom>
              Upload en cours... {progress}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Colonne 1 */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Titre du sermon"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                required
                label="Thème"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                margin="normal"
                helperText="Écrivez librement (ex. : Manifestation de l’amour de Dieu)"
              />
              <TextField
                fullWidth
                required
                label="Orateur"
                name="orateur"
                value={formData.orateur}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                required
                label="Titre de l’orateur (Ap., Rev., Pasteur...)"
                name="orateurTitre"
                value={formData.orateurTitre}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>

            {/* Colonne 2 */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Ministère concerné (multi-sélection)</InputLabel>
                <Select
                  multiple
                  name="ministere"
                  value={formData.ministere}
                  onChange={handleChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {ministereEnum.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                required
                label="Durée (ex. 45:30)"
                name="duree"
                value={formData.duree}
                onChange={handleChange}
                margin="normal"
              />

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
                <MenuItem value="video">Vidéo</MenuItem>
                <MenuItem value="audio">Audio</MenuItem>
              </TextField>

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

            {/* Description */}
            <Grid item xs={12}>
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
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tags (multi-sélection)</InputLabel>
                <Select
                  multiple
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {ministereEnum.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Uploads */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Vidéo / Audio du sermon
              </Typography>
              <FileUploadInput
                accept={formData.typeMedia === 'video' ? 'video/*' : 'audio/*'}
                onFileChange={(file) => handleFileChange('video', file)}
                preview={preview.video}
                label="Sélectionner le fichier média"
                icon={<CloudUploadIcon />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Miniature / Couverture
              </Typography>
              <FileUploadInput
                accept="image/*"
                onFileChange={(file) => handleFileChange('thumbnail', file)}
                preview={preview.thumbnail}
                label="Sélectionner la miniature"
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
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    Publication en cours ({progress}%)
                  </>
                ) : (
                  'Publier le Sermon'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default SermonUpload;