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
  Chip,
} from '@mui/material';
import MUICustomBtn from '../../../Components/Common/MUICustomBtn';
import CustomTablePaginationComponent from '../../../Components/Common/CustomTablePagination';
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  getAccessoryInventoriesService,
  deleteAccessoryInventoryService,
  type AccessoryInventoryItem,
  type PaginationMeta,
} from '../../../Services/ApiServices';
import { useToast } from '../../../Utils/ToastContext';

const AccessoryInventoriesPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [inventories, setInventories] = useState<AccessoryInventoryItem[]>([]);
  const [filteredInventories, setFilteredInventories] = useState<AccessoryInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<AccessoryInventoryItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const fetchData = useCallback(async (page: number = 0) => {
    try {
      setLoading(true);
      const apiPage = page + 1;

      const response = await getAccessoryInventoriesService(apiPage, pageSize);

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
      (inventory) => {
        const nameMatch = inventory.name.toLowerCase().includes(term);
        const propertiesMatch = inventory.accessory?.properties
          ? JSON.stringify(inventory.accessory.properties).toLowerCase().includes(term)
          : false;
        return nameMatch || propertiesMatch;
      }
    );
    setFilteredInventories(filtered);
  }, [searchTerm, inventories]);

  const handleCreateAccessory = () => {
    navigate('/dashboard/inventory/accessory-inventory/create');
  };

  const handleEditAccessory = (inventory: AccessoryInventoryItem) => {
    navigate(`/dashboard/inventory/accessory-inventory/edit/${inventory.id}`);
  };

  const handleOpenDeleteModal = (inventory: AccessoryInventoryItem) => {
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
      const response = await deleteAccessoryInventoryService(inventoryToDelete.id);

      if (response.success === 200) {
        showSuccess(response.message || 'Accessory inventory deleted successfully!', 'Success');
        await fetchData(currentPage);
        setTimeout(() => {
          handleCloseDeleteModal();
        }, 1000);
      } else {
        const errorMsg = response.message || 'Failed to delete accessory inventory';
        showError(errorMsg, 'Delete Failed');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const errorMsg = axiosError.response?.data?.message || 'Failed to delete accessory inventory';
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

  const parseImages = (imageUrl: string | any): string[] => {
    if (!imageUrl) return [];
    try {
      if (typeof imageUrl === 'string') {
        const parsed = JSON.parse(imageUrl);
        return Array.isArray(parsed) ? parsed : [imageUrl];
      }
      return Array.isArray(imageUrl) ? imageUrl : [imageUrl];
    } catch {
      return typeof imageUrl === 'string' ? [imageUrl] : [];
    }
  };

  const getPropertyValue = (properties: Record<string, any> | null, key: string): string => {
    if (!properties) return '—';
    return properties[key] !== undefined && properties[key] !== null ? String(properties[key]) : '—';
  };

  return (
    <Card sx={{ borderRadius: 1.5, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Accessory Inventory
        </Typography>
        <MUICustomBtn
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateAccessory}
          tooltip="Add new accessory inventory"
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
          Add New Accessory
        </MUICustomBtn>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          placeholder="Search by name or properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          sx={{ maxWidth: 500 }}
        />
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredInventories.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <InventoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="body1">
            {searchTerm
              ? 'No accessory items found matching your criteria'
              : 'No accessory items found'}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Image</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventories.map((inventory) => {
                const properties = inventory.accessory?.properties || {};
                const imageUrl = properties.imageUrl || null;
                const images = parseImages(imageUrl);
                return (
                  <TableRow key={inventory.id} hover>
                    <TableCell>{inventory.name}</TableCell>
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
                    <TableCell>{inventory.accessory?.quantity ?? '—'}</TableCell>
                    <TableCell>{formatDate(inventory.createdAt)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <MUICustomBtn
                          onClick={() => handleEditAccessory(inventory)}
                          tooltip="Edit Accessory"
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
                          tooltip="Delete Accessory"
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
        <DialogTitle>Delete Accessory Inventory</DialogTitle>
        <DialogContent>
          {inventoryToDelete && (
            <Typography>
              Are you sure you want to delete accessory <strong>{inventoryToDelete.name}</strong>?
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
            tooltip="Permanently delete this accessory"
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

export default AccessoryInventoriesPage;

