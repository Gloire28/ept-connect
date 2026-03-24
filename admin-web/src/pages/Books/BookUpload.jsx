// admin-web/src/pages/Books/BookUpload.jsx
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
  Divider,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../../services/api';
import FileUploadInput from '../../components/common/FileUploadInput'; // À créer après

const BookUpload = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titre: '',
    auteur: '',
    editeur: '',
    description: '',
    categorie: '',
    format: 'pdf',
    nombrePages: '',
    isPremium: false,
    tags: '',
  });

  const [files, setFiles] = useState({
    fichier: null,
    couverture: null,
  });

  const [preview, setPreview] = useState({
    fichier: null,
    couverture: null,
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!files.fichier || !files.couverture) {
      setError('Fichier livre et couverture obligatoires');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('titre', formData.titre);
    data.append('auteur', formData.auteur);
    data.append('editeur', formData.editeur);
    data.append('description', formData.description);
    data.append('categorie', formData.categorie);
    data.append('format', formData.format);
    data.append('nombrePages', formData.nombrePages);
    data.append('isPremium', formData.isPremium);
    data.append('tags', formData.tags);
    data.append('fichier', files.fichier);
    data.append('couverture', files.couverture);

    try {
      const response = await api.post('/books', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Livre ajouté avec succès !');
      setTimeout(() => navigate('/books'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Ajouter un Nouveau Livre
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
                label="Titre du livre"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                margin="normal"
              />

              <TextField
                fullWidth
                required
                label="Auteur"
                name="auteur"
                value={formData.auteur}
                onChange={handleChange}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Éditeur (optionnel)"
                name="editeur"
                value={formData.editeur}
                onChange={handleChange}
                margin="normal"
              />

              <TextField
                fullWidth
                required
                type="number"
                label="Nombre de pages"
                name="nombrePages"
                value={formData.nombrePages}
                onChange={handleChange}
                margin="normal"
                inputProps={{ min: 1 }}
              />
            </Grid>

            {/* Colonne 2 */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Catégorie"
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
                margin="normal"
                helperText="Ex. : Étude biblique, Témoignage, Jeunesse..."
              />

              <TextField
                select
                fullWidth
                required
                label="Format du fichier"
                name="format"
                value={formData.format}
                onChange={handleChange}
                margin="normal"
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="epub">ePub</MenuItem>
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

            {/* Description & Tags */}
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

              <TextField
                fullWidth
                label="Tags (séparés par des virgules)"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                margin="normal"
                helperText="Ex. : enseignement, évangélisation, jeunesse"
              />
            </Grid>

            {/* Uploads */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Fichier du livre (PDF ou ePub)
              </Typography>
              <FileUploadInput
                accept={formData.format === 'pdf' ? 'application/pdf' : 'application/epub+zip'}
                onFileChange={(file) => handleFileChange('fichier', file)}
                preview={preview.fichier}
                label="Sélectionner le fichier livre"
                icon={<CloudUploadIcon />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Couverture du livre
              </Typography>
              <FileUploadInput
                accept="image/*"
                onFileChange={(file) => handleFileChange('couverture', file)}
                preview={preview.couverture}
                label="Sélectionner la couverture"
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
                {loading ? <CircularProgress size={24} /> : 'Publier le Livre'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default BookUpload;