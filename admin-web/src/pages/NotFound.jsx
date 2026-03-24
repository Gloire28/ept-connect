// admin-web/src/pages/NotFound.jsx
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 120, color: 'error.main' }} />

        <Typography variant="h2" color="error" fontWeight="bold">
          404
        </Typography>

        <Typography variant="h4" gutterBottom>
          Page non trouvée
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
          La page que vous cherchez semble introuvable ou a été déplacée. 
          Vérifiez l’URL ou retournez au tableau de bord.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Retour au Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;