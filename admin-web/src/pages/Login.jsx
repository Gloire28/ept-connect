// admin-web/src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Container,
  Avatar,
  Link
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();

  const [tel, setTel] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirection automatique dès que isAuthenticated devient true
  useEffect(() => {
    if (isAuthenticated) {
      console.log('isAuthenticated est maintenant true → redirection vers /dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {  
        tel,
        motDePasse
      });

      const { token } = response.data;
      login(token);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Erreur de connexion. Vérifiez votre numéro et mot de passe.'
      );
      console.error('Erreur login frontend:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Connexion Administration EPT Connect
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="tel"
            label="Numéro de téléphone"
            name="tel"
            autoComplete="tel"
            autoFocus
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            placeholder="90909090"
            helperText="Sans indicatif +228"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="motDePasse"
            label="Mot de passe"
            type="password"
            id="motDePasse"
            autoComplete="current-password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Se connecter'
            )}
          </Button>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link href="#" variant="body2">
              Mot de passe oublié ?
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;