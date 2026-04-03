// admin-web/src/components/layout/Footer.jsx
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {currentYear} Église de Pentecôte du Togo (EPT) - EPT Connect Admin
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Version 1.0 | Développé avec ❤️ pour l’édification des saints
      </Typography>

      <Box sx={{ mt: 1 }}>
        <Link href="mailto:epttogo@yahoo.fr" color="primary" underline="hover" variant="caption">
          Contact : epttogo@yahoo.fr
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;