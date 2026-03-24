// admin-web/src/components/layout/AdminNavbar.jsx
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import useAuthStore from '../../store/authStore';

const AdminNavbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuthStore();

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          EPT Connect - Administration
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2">
              {user?.nom} {user?.prenoms}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
            </Typography>
          </Box>

          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            {(user?.nom?.[0] || 'A')}
          </Avatar>

          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminNavbar;