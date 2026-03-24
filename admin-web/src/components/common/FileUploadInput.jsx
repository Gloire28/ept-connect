// admin-web/src/components/common/FileUploadInput.jsx
import { useRef, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import VideocamIcon from '@mui/icons-material/Videocam';
import AudioFileIcon from '@mui/icons-material/AudioFile';

const FileUploadInput = ({
  accept = 'image/*',
  onFileChange,
  preview = null,
  label = 'Sélectionner un fichier',
  icon = <CloudUploadIcon fontSize="large" />,
  maxSizeMB = 500,
  multiple = false,
  disabled = false,
  error = null,
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = (file) => {
    // Validation taille
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Le fichier est trop volumineux (max ${maxSizeMB} Mo)`);
      return;
    }

    setFileName(file.name);
    onFileChange(file);
  };

  const handleRemove = () => {
    setFileName('');
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getIcon = () => {
    if (accept.includes('image')) return <ImageIcon fontSize="large" color="primary" />;
    if (accept.includes('video')) return <VideocamIcon fontSize="large" color="primary" />;
    if (accept.includes('audio')) return <AudioFileIcon fontSize="large" color="primary" />;
    return icon;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderColor: dragActive ? 'primary.main' : error ? 'error.main' : 'grey.400',
          borderWidth: dragActive || error ? 2 : 1,
          borderStyle: 'dashed',
          backgroundColor: dragActive ? 'action.hover' : 'background.paper',
          transition: 'all 0.3s',
          position: 'relative',
          opacity: disabled ? 0.6 : 1,
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {preview ? (
          <Box sx={{ mb: 2, position: 'relative' }}>
            {accept.includes('image') ? (
              <img
                src={preview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  objectFit: 'contain',
                  borderRadius: 8,
                }}
              />
            ) : accept.includes('video') ? (
              <video
                src={preview}
                controls
                style={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  borderRadius: 8,
                }}
              />
            ) : (
              <Box sx={{ py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Aperçu non disponible pour ce type de fichier
                </Typography>
              </Box>
            )}

            {!disabled && (
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ) : (
          <Box sx={{ py: 4 }}>
            {getIcon()}
            <Typography variant="h6" sx={{ mt: 2 }}>
              {label}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Glissez-déposez ou cliquez pour sélectionner
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Taille max : {maxSizeMB} Mo
            </Typography>
          </Box>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />
      </Paper>

      {fileName && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Fichier sélectionné : {fileName}
          </Typography>
          {!disabled && (
            <IconButton size="small" onClick={handleRemove} sx={{ ml: 1 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FileUploadInput;