import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import MUICustomBtn from '../../../Components/Common/MUICustomBtn';
import CustomTablePaginationComponent from '../../../Components/Common/CustomTablePagination';
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import {
  getFabricInventoriesService,
  deleteFabricInventoryService,
  type FabricInventoryItem,
  type PaginationMeta,
} from '../../../Services/ApiServices';
import { useToast } from '../../../Utils/ToastContext';

const FabricInventoriesPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [inventories, setInventories] = useState<FabricInventoryItem[]>([]);
  const [filteredInventories, setFilteredInventories] = useState<FabricInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<FabricInventoryItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const fetchData = useCallback(async (page: number = 0) => {
    try {
      setLoading(true);
      const apiPage = page + 1;

      const response = await getFabricInventoriesService(apiPage, pageSize);

      if (response.success === 200 && response.data) {
        const { inventories: inventoriesData, pagination } = response.data;
        setInventories(inventoriesData);
        setPaginationMeta(pagination);
        setCurrentPage(page);
      }
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      showError('Failed to load data. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  }, [showError, pageSize]);

  useEffect(() => {
    fetchData(currentPage);
  }, [fetchData, currentPage]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInventories(inventories);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = inventories.filter(
      (inventory) =>
        inventory.name.toLowerCase().includes(term) ||
        (inventory.fabric && inventory.fabric.color.toLowerCase().includes(term))
    );
    setFilteredInventories(filtered);
  }, [searchTerm, inventories]);

  const handleCreateFabric = () => {
    navigate('/dashboard/inventory/fabric-inventory/create');
  };

  const handleEditFabric = (inventory: FabricInventoryItem) => {
    navigate(`/dashboard/inventory/fabric-inventory/edit/${inventory.id}`);
  };

  const handleOpenDeleteModal = (inventory: FabricInventoryItem) => {
    setInventoryToDelete(inventory);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setInventoryToDelete(null);
  };

  const handleDelete = async () => {
    if (!inventoryToDelete) return;

    setFormLoading(true);

    try {
      const response = await deleteFabricInventoryService(inventoryToDelete.id);

      if (response.success === 200) {
        showSuccess(response.message || 'Fabric inventory deleted successfully!', 'Success');
        await fetchData(currentPage);
        setTimeout(() => {
          handleCloseDeleteModal();
        }, 1000);
      } else {
        const errorMsg = response.message || 'Failed to delete fabric inventory';
        showError(errorMsg, 'Delete Failed');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const errorMsg = axiosError.response?.data?.message || 'Failed to delete fabric inventory';
        showError(errorMsg, 'Delete Failed');
      } else {
        const errorMsg = 'An unexpected error occurred';
        showError(errorMsg, 'Delete Failed');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const parseImages = (imageUrl: string | null): string[] => {
    if (!imageUrl) return [];
    try {
      const parsed = JSON.parse(imageUrl);
      return Array.isArray(parsed) ? parsed : [imageUrl];
    } catch {
      return [imageUrl];
    }
  };

  return (
    <Card sx={{ borderRadius: 1.5, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Fabric Inventory
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <MUICustomBtn
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilter(!showFilter)}
            tooltip="Toggle filter visibility"
            sx={{
              borderColor: showFilter ? '#667eea' : '#ccc',
              color: showFilter ? '#667eea' : '#666',
              '&:hover': {
                borderColor: '#667eea',
                bgcolor: 'rgba(102, 126, 234, 0.04)',
                transform: 'translateY(-2px)',
              },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {showFilter ? 'Hide Filter' : 'Show Filter'}
          </MUICustomBtn>
          <MUICustomBtn
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateFabric}
            tooltip="Add new fabric inventory"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add New Fabric
          </MUICustomBtn>
        </Box>
      </Box>

      {showFilter && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            placeholder="Search fabrics by name or color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            sx={{ maxWidth: 500 }}
          />
        </Box>
      )}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredInventories.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <InventoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="body1">
            {searchTerm
              ? 'No fabric items found matching your criteria'
              : 'No fabric items found'}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Color</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Image</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Length (m)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventories.map((inventory) => {
                const images = inventory.fabric ? parseImages(inventory.fabric.imageUrl) : [];
                return (
                  <TableRow key={inventory.id} hover>
                    <TableCell>{inventory.name}</TableCell>
                    <TableCell>{inventory.fabric?.color || '—'}</TableCell>
                    <TableCell>
                      {images.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {images.slice(0, 2).map((imgUrl: string, idx: number) => (
                            <Box
                              key={idx}
                              component="img"
                              src={imgUrl}
                              alt={`${inventory.name} ${idx + 1}`}
                              sx={{
                                width: 50,
                                height: 50,
                                objectFit: 'cover',
                                borderRadius: 1,
                                border: '2px solid #e0e0e0',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                },
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ))}
                          {images.length > 2 && (
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 1,
                                border: '2px solid #e0e0e0',
                                bgcolor: '#f5f5f5',
                                color: '#666',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              +{images.length - 2}
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{inventory.fabric?.price ? `${Number(inventory.fabric.price).toFixed(2)}` : '—'}</TableCell>
                    <TableCell>{inventory.fabric?.length ? `${Number(inventory.fabric.length).toFixed(2)} m` : '—'}</TableCell>
                    <TableCell>{formatDate(inventory.createdAt)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <MUICustomBtn
                          onClick={() => handleEditFabric(inventory)}
                          tooltip="Edit Fabric"
                          variant="contained"
                          sx={{
                            bgcolor: '#e3f2fd',
                            color: '#1976d2',
                            minWidth: 32,
                            width: 32,
                            height: 32,
                            padding: 0,
                            '&:hover': {
                              bgcolor: '#bbdefb',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 8px rgba(25, 118, 210, 0.2)',
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </MUICustomBtn>
                        <MUICustomBtn
                          onClick={() => handleOpenDeleteModal(inventory)}
                          tooltip="Delete Fabric"
                          variant="contained"
                          sx={{
                            bgcolor: '#ffebee',
                            color: '#d32f2f',
                            minWidth: 32,
                            width: 32,
                            height: 32,
                            padding: 0,
                            '&:hover': {
                              bgcolor: '#ffcdd2',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 8px rgba(211, 47, 47, 0.2)',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </MUICustomBtn>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <tfoot>
              <tr>
                {!searchTerm && paginationMeta && (
                  <CustomTablePaginationComponent
                    count={paginationMeta.totalCount}
                    page={currentPage}
                    rowsPerPage={pageSize}
                    onPageChange={(_event, page) => setCurrentPage(page)}
                    onRowsPerPageChange={(event) => {
                      const newRowsPerPage = parseInt(event.target.value, 10);
                      const actualRowsPerPage = newRowsPerPage === -1 ? 10000 : newRowsPerPage;
                      setPageSize(actualRowsPerPage);
                      setCurrentPage(0);
                    }}
                  />
                )}
              </tr>
            </tfoot>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onClose={handleCloseDeleteModal} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Fabric Inventory</DialogTitle>
        <DialogContent>
          {inventoryToDelete && (
            <Typography>
              Are you sure you want to delete fabric <strong>{inventoryToDelete.name}</strong>?
              This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <MUICustomBtn
            onClick={handleCloseDeleteModal}
            variant="outlined"
            tooltip="Cancel delete operation"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </MUICustomBtn>
          <MUICustomBtn
            onClick={handleDelete}
            disabled={formLoading}
            variant="contained"
            color="error"
            tooltip="Permanently delete this fabric"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {formLoading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </MUICustomBtn>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default FabricInventoriesPage;

