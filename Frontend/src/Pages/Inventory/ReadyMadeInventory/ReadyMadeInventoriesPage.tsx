import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import MUICustomBtn from '../../../Components/Common/MUICustomBtn';
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import DataTable, { type Column } from '../../../Components/Common/DataTable';
import DataCardGrid, { type CardField, type CardAction } from '../../../Components/Common/DataCardGrid';
import {
  getReadyMadeInventoriesService,
  deleteReadyMadeInventoryService,
  type ReadyMadeInventoryItem,
  type PaginationMeta,
} from '../../../Services/ApiServices';
import { useToast } from '../../../Utils/ToastContext';

const ReadyMadeInventoriesPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [inventories, setInventories] = useState<ReadyMadeInventoryItem[]>([]);
  const [filteredInventories, setFilteredInventories] = useState<ReadyMadeInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<ReadyMadeInventoryItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const fetchData = useCallback(async (page: number = 0) => {
    try {
      setLoading(true);
      const apiPage = page + 1;

      const response = await getReadyMadeInventoriesService(apiPage, pageSize);

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
        (inventory.readyMade && inventory.readyMade.color.toLowerCase().includes(term))
    );
    setFilteredInventories(filtered);
  }, [searchTerm, inventories]);

  const handleCreateReadyMade = () => {
    navigate('/dashboard/inventory/ready-made-inventory/create');
  };

  const handleEditReadyMade = (inventory: ReadyMadeInventoryItem) => {
    navigate(`/dashboard/inventory/ready-made-inventory/edit/${inventory.id}`);
  };

  const handleOpenDeleteModal = (inventory: ReadyMadeInventoryItem) => {
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
      const response = await deleteReadyMadeInventoryService(inventoryToDelete.id);

      if (response.success === 200) {
        showSuccess(response.message || 'Ready-made inventory deleted successfully!', 'Success');
        await fetchData(currentPage);
        setTimeout(() => {
          handleCloseDeleteModal();
        }, 1000);
      } else {
        const errorMsg = response.message || 'Failed to delete ready-made inventory';
        showError(errorMsg, 'Delete Failed');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const errorMsg = axiosError.response?.data?.message || 'Failed to delete ready-made inventory';
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

  const getSizeDisplay = (item: ReadyMadeInventoryItem): string => {
    if (!item.readyMade) return '—';
    const { sizeLabel, sizeNumber } = item.readyMade;
    return `${sizeLabel || ''}${sizeLabel && sizeNumber ? ' ' : ''}${sizeNumber || ''}`.trim() || '—';
  };

  // Table columns configuration
  const columns: Column<ReadyMadeInventoryItem>[] = [
    {
      id: 'name',
      label: 'Name',
      render: (item) => item.name,
    },
    {
      id: 'color',
      label: 'Color',
      render: (item) => item.readyMade?.color || '—',
    },
    {
      id: 'image',
      label: 'Image',
      render: (item) => {
        const images = item.readyMade ? parseImages(item.readyMade.imageUrl) : [];
        return images.length > 0 ? (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {images.slice(0, 2).map((imgUrl: string, idx: number) => (
              <Box
                key={idx}
                component="img"
                src={imgUrl}
                alt={`${item.name} ${idx + 1}`}
                sx={{
                  width: 40,
                  height: 40,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '2px solid #e0e0e0',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ))}
            {images.length > 2 && (
              <Box sx={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', ml: 0.5 }}>
                +{images.length - 2}
              </Box>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        );
      },
    },
    {
      id: 'price',
      label: 'Price',
      render: (item) => item.readyMade?.price ? `₹${Number(item.readyMade.price).toFixed(2)}` : '—',
    },
    {
      id: 'quantity',
      label: 'Quantity',
      render: (item) => item.readyMade?.quantity || '—',
    },
    {
      id: 'size',
      label: 'Size',
      render: (item) => getSizeDisplay(item),
    },
    {
      id: 'createdAt',
      label: 'Created At',
      render: (item) => formatDate(item.createdAt),
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (item) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <MUICustomBtn
            onClick={() => handleEditReadyMade(item)}
            tooltip="Edit Ready-Made"
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
            onClick={() => handleOpenDeleteModal(item)}
            tooltip="Delete Ready-Made"
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
      ),
    },
  ];

  // Card fields configuration
  const cardFields: CardField<ReadyMadeInventoryItem>[] = [
    {
      id: 'color',
      label: 'Color',
      render: (item) => (
        <Typography variant="body2">{item.readyMade?.color || '—'}</Typography>
      ),
    },
    {
      id: 'price',
      label: 'Price',
      render: (item) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {item.readyMade?.price ? `₹${Number(item.readyMade.price).toFixed(2)}` : '—'}
        </Typography>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantity',
      render: (item) => (
        <Typography variant="body2">{item.readyMade?.quantity || '—'}</Typography>
      ),
    },
    {
      id: 'size',
      label: 'Size',
      render: (item) => (
        <Typography variant="body2">{getSizeDisplay(item)}</Typography>
      ),
    },
    {
      id: 'createdAt',
      label: 'Added On',
      render: (item) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(item.createdAt)}
        </Typography>
      ),
    },
  ];

  // Card actions configuration
  const cardActions: CardAction<ReadyMadeInventoryItem>[] = [
    {
      id: 'edit',
      render: (item) => (
        <MUICustomBtn
          onClick={() => handleEditReadyMade(item)}
          tooltip="Edit"
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
      ),
    },
    {
      id: 'delete',
      render: (item) => (
        <MUICustomBtn
          onClick={() => handleOpenDeleteModal(item)}
          tooltip="Delete"
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
      ),
    },
  ];

  return (
    <Card sx={{ borderRadius: 1.5, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Ready-Made Inventory
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
            variant="outlined"
            startIcon={viewMode === 'table' ? <ViewModuleIcon /> : <ViewListIcon />}
            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
            tooltip="Toggle view mode"
            sx={{
              borderColor: '#ccc',
              color: '#666',
              '&:hover': {
                borderColor: '#667eea',
                bgcolor: 'rgba(102, 126, 234, 0.04)',
                transform: 'translateY(-2px)',
              },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </MUICustomBtn>
          <MUICustomBtn
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateReadyMade}
            tooltip="Add new ready-made inventory"
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
            Add New Ready-Made Item
          </MUICustomBtn>
        </Box>
      </Box>

      {showFilter && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            placeholder="Search by name, item name, or color..."
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
              ? 'No ready-made items found matching your criteria'
              : 'No ready-made items found'}
          </Typography>
        </Box>
      ) : viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filteredInventories}
          getRowKey={(item) => item.id}
          paginationMeta={paginationMeta}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(_event, page) => setCurrentPage(page)}
          onRowsPerPageChange={(event) => {
            const newRowsPerPage = parseInt(event.target.value, 10);
            const actualRowsPerPage = newRowsPerPage === -1 ? 10000 : newRowsPerPage;
            setPageSize(actualRowsPerPage);
            setCurrentPage(0);
          }}
          searchTerm={searchTerm}
        />
      ) : (
        <DataCardGrid
          data={filteredInventories}
          getCardTitle={(item) => item.name}
          getCardSubtitle={(item) => item.readyMade?.color || 'No color'}
          getCardImages={(item) => {
            const images = item.readyMade ? parseImages(item.readyMade.imageUrl) : [];
            return images;
          }}
          fields={cardFields}
          actions={cardActions}
          getRowKey={(item) => item.id}
          paginationMeta={paginationMeta}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(_event, page) => setCurrentPage(page)}
          onRowsPerPageChange={(event) => {
            const newRowsPerPage = parseInt(event.target.value, 10);
            const actualRowsPerPage = newRowsPerPage === -1 ? 10000 : newRowsPerPage;
            setPageSize(actualRowsPerPage);
            setCurrentPage(0);
          }}
          searchTerm={searchTerm}
          columns={3}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onClose={handleCloseDeleteModal} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Ready-Made Inventory</DialogTitle>
        <DialogContent>
          {inventoryToDelete && (
            <Typography>
              Are you sure you want to delete ready-made item <strong>{inventoryToDelete.name}</strong>?
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
            tooltip="Permanently delete this ready-made item"
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

export default ReadyMadeInventoriesPage;

