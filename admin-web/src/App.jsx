// admin-web/src/App.jsx
import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import useAuthStore from './store/authStore';
import Sidebar from './components/layout/Sidebar';
import AdminNavbar from './components/layout/AdminNavbar';
import Footer from './components/layout/Footer';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SermonsList from './pages/Sermons/SermonsList';
import SermonUpload from './pages/Sermons/SermonUpload';
import MusicList from './pages/Music/MusicList';
import MusicUpload from './pages/Music/MusicUpload';
import BooksList from './pages/Books/BooksList';
import BookUpload from './pages/Books/BookUpload';
import AnnouncementsList from './pages/Announcements/AnnouncementsList';
import AnnouncementCreate from './pages/Announcements/AnnouncementCreate';

// === NOUVELLES PAGES LIEUX DE CULTE ===
import LocationsList from './pages/Locations/LocationsList';
import LocationCreate from './pages/Locations/LocationsCreate';

import NotFound from './pages/NotFound';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Protection des routes
  useEffect(() => {
    const currentPath = location.pathname;
    const isProtectedRoute = currentPath !== '/login' && !currentPath.startsWith('/login');
    if (!isAuthenticated && isProtectedRoute) {
      navigate('/login', { replace: true });
      return;
    }
    if (isAuthenticated && user?.role !== 'admin' && isProtectedRoute) {
      navigate('/login', { replace: true });
      return;
    }
    if (isAuthenticated && user?.role === 'admin' && currentPath === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user?.role, navigate, location.pathname]);

  const AdminLayout = () => (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
        <AdminNavbar />
        <Box sx={{ flexGrow: 1, mt: 8 }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );

  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Sermons */}
          <Route path="/sermons" element={<SermonsList />} />
          <Route path="/sermons/upload" element={<SermonUpload />} />

          {/* Musique */}
          <Route path="/music" element={<MusicList />} />
          <Route path="/music/upload" element={<MusicUpload />} />

          {/* Livres */}
          <Route path="/books" element={<BooksList />} />
          <Route path="/books/upload" element={<BookUpload />} />

          {/* Annonces */}
          <Route path="/announcements" element={<AnnouncementsList />} />
          <Route path="/announcements/create" element={<AnnouncementCreate />} />

          {/* === LIEUX DE CULTE (NOUVELLES ROUTES) === */}
          <Route path="/locations" element={<LocationsList />} />
          <Route path="/locations/create" element={<LocationCreate />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;