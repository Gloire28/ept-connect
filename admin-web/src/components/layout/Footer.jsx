// admin-web/src/components/layout/Footer.jsx
import { Box, Typography, Stack, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" sx={{ p: 4, mt: 'auto' }}>
      <Divider sx={{ mb: 3, opacity: 0.5 }} />
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems="center"
        spacing={2}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%' }} />
          <Typography variant="caption" sx={{ letterSpacing: 1, fontWeight: 700, textTransform: 'uppercase' }}>
            EPT Connect Admin
          </Typography>
        </Stack>
        
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} — Église de Pentecôte du Togo. Tous droits réservés.
        </Typography>

        <Typography 
          variant="caption" 
          sx={{ 
            px: 1.5, py: 0.5, 
            bgcolor: 'action.selected', 
            borderRadius: 10,
            fontWeight: 500 
          }}
        >
          v1.0.2-stable
        </Typography>
      </Stack>
    </Box>
  );
};

export default Footer;