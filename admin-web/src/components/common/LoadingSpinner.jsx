// admin-web/src/components/common/LoadingSpinner.jsx
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';

/**
 * Composant de chargement réutilisable
 * Peut être utilisé comme overlay global (backdrop) ou local
 */
const LoadingSpinner = ({
  open = true,
  message = 'Chargement en cours...',
  fullScreen = false, 
  size = 60,         
  color = 'primary',  
  sx = {},
}) => {
  if (!open) return null;

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 4,
        ...sx,
      }}
    >
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        {content}
      </Backdrop>
    );
  }

  return content;
};

export default LoadingSpinner;