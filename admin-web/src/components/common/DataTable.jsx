// admin-web/src/components/common/DataTable.jsx
import { DataGrid, frFR } from '@mui/x-data-grid';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Composant réutilisable pour afficher des listes paginées avec filtres et actions
 * Utilise MUI DataGrid (x-data-grid)
 */
const DataTable = ({
  rows = [],
  columns = [],
  loading = false,
  rowCount = 0,
  paginationModel,
  onPaginationModelChange,
  pageSizeOptions = [5, 10, 25, 50],
  checkboxSelection = false,
  onRowSelectionModelChange,
  getRowId = (row) => row._id || row.id,
  noRowsLabel = "Aucune donnée à afficher",
  loadingLabel = "Chargement en cours...",
  error = null,
  sx = {},
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ height: 600, width: '100%', ...sx }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DataGrid
        rows={rows}
        columns={columns}
        rowCount={rowCount}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={pageSizeOptions}
        checkboxSelection={checkboxSelection}
        onRowSelectionModelChange={onRowSelectionModelChange}
        getRowId={getRowId}
        localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
        disableRowSelectionOnClick
        loadingOverlayComponent={() => (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2">{loadingLabel}</Typography>
          </Box>
        )}
        slots={{
          noRowsOverlay: () => (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant="body1" color="text.secondary">
                {noRowsLabel}
              </Typography>
            </Box>
          ),
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: theme.palette.action.hover,
          },
          '& .MuiDataGrid-row.Mui-selected': {
            backgroundColor: theme.palette.primary.light,
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
            },
          },
        }}
      />
    </Box>
  );
};

export default DataTable;