// admin-web/src/pages/Locations/LocationCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Grid,
  Typography,
  Alert,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Box,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import AdminNavbar from '../../components/layout/AdminNavbar';
import Sidebar from '../../components/layout/Sidebar';
import Footer from '../../components/layout/Footer';
import FileUploadInput from '../../components/common/FileUploadInput';
import api from '../../services/api';

const LocationCreate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    quartier: '',
    ville: 'Lomé',
    pays: 'Togo',
    latitude: '',
    longitude: '',
    pasteurResponsable: '',
    telephone: '',
  });

  const [horaires, setHoraires] = useState([
    { jour: 'Dimanche', debut: '', fin: '', type: 'Culte principal' }
  ]);

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleHoraireChange = (index, field, value) => {
    const newHoraires = [...horaires];
    newHoraires[index][field] = value;
    setHoraires(newHoraires);
  };

  const addHoraire = () => {
    setHoraires([...horaires, { jour: 'Dimanche', debut: '', fin: '', type: 'Culte principal' }]);
  };

  const removeHoraire = (index) => {
    if (horaires.length === 1) return;
    setHoraires(horaires.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Normalisation virgule → point
    const latitudeClean = formData.latitude.replace(',', '.').trim();
    const longitudeClean = formData.longitude.replace(',', '.').trim();

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'latitude') data.append('latitude', latitudeClean);
      else if (key === 'longitude') data.append('longitude', longitudeClean);
      else data.append(key, formData[key]);
    });

    data.append('horaires', JSON.stringify(horaires));
    if (image) data.append('image', image);

    console.log('📤 Envoi FormData → latitude:', latitudeClean, ' | longitude:', longitudeClean); // ← debug

    try {
      await api.post('/locations', data); // ← PAS de headers ici !
      alert('✅ Lieu de culte ajouté avec succès !');
      navigate('/locations');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminNavbar />
      <main className="main-content">
        <div className="page-header">
          <Typography variant="h4" gutterBottom>Ajouter un Lieu de Culte</Typography>
          <Button variant="outlined" onClick={() => navigate('/locations')}>
            ← Retour à la liste
          </Button>
        </div>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Nom du lieu *" name="nom" value={formData.nom} onChange={handleChange} required />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Quartier *" name="quartier" value={formData.quartier} onChange={handleChange} required />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Adresse complète *" name="adresse" value={formData.adresse} onChange={handleChange} required />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Latitude * (ex: 6,190927)"
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Longitude * (ex: 1,144280)"
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Pasteur responsable" name="pasteurResponsable" value={formData.pasteurResponsable} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Téléphone" name="telephone" value={formData.telephone} onChange={handleChange} />
                </Grid>

                {/* Horaires dynamiques */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Horaires de culte</Typography>
                    <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={addHoraire}>
                      Ajouter un horaire
                    </Button>
                  </Box>
                  {horaires.map((horaire, index) => (
                    <Card key={index} sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa' }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <TextField select fullWidth label="Jour" value={horaire.jour} onChange={(e) => handleHoraireChange(index, 'jour', e.target.value)}>
                            {['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map(j => <MenuItem key={j} value={j}>{j}</MenuItem>)}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField fullWidth label="Début" type="time" value={horaire.debut} onChange={(e) => handleHoraireChange(index, 'debut', e.target.value)} required />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField fullWidth label="Fin" type="time" value={horaire.fin} onChange={(e) => handleHoraireChange(index, 'fin', e.target.value)} required />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <TextField select fullWidth label="Type" value={horaire.type} onChange={(e) => handleHoraireChange(index, 'type', e.target.value)}>
                            <MenuItem value="Culte principal">Culte principal</MenuItem>
                            <MenuItem value="Culte de prière">Culte de prière</MenuItem>
                            <MenuItem value="Culte jeunesse">Culte jeunesse</MenuItem>
                            <MenuItem value="Réunion de prière">Réunion de prière</MenuItem>
                            <MenuItem value="Autre">Autre</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item xs={1}>
                          <IconButton color="error" onClick={() => removeHoraire(index)} disabled={horaires.length === 1}>
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Card>
                  ))}
                </Grid>

                <Grid item xs={12}>
                  <FileUploadInput
                    label="Photo du lieu (facultatif)"
                    accept="image/*"
                    onChange={(file) => setImage(file)}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Button type="submit" variant="contained" color="primary" fullWidth size="large" disabled={loading}>
                  {loading ? 'Enregistrement en cours...' : '✅ Enregistrer le lieu de culte'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LocationCreate;