import { useState, useEffect, useCallback } from 'react';
import {
  getProductItemsService,
  createProductItemService,
  updateProductItemService,
  deleteProductItemService,
  type ProductItem,
  type CreateProductItemRequest,
  type UpdateProductItemRequest,
} from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import MUICustomBtn from '../../Components/Common/MUICustomBtn';
import {
  Inventory as BoxIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';

const ProductItemsPage = () => {
  const [productItems, setProductItems] = useState<ProductItem[]>([]);
  const [filteredProductItems, setFilteredProductItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProductItem, setSelectedProductItem] = useState<ProductItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productItemToDelete, setProductItemToDelete] = useState<ProductItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<CreateProductItemRequest>({
    name: '',
    imageUrl: null,
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchProductItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProductItemsService();
      if (response.success === 200 && response.data) {
        setProductItems(response.data);
      } else {
        showError(response.message || 'Failed to load product items', 'Error');
      }
    } catch (err: unknown) {
      console.error('Error fetching product items:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'Failed to load product items', 'Error');
      } else {
        showError('Failed to load product items. Please try again.', 'Error');
      }
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchProductItems();
  }, [fetchProductItems]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProductItems(productItems);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = productItems.filter(
      (item) =>
        item.name.toLowerCase().includes(term)
    );
    setFilteredProductItems(filtered);
  }, [searchTerm, productItems]);

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setSelectedProductItem(null);
    setFormData({
      name: '',
      imageUrl: null,
    });
    setSelectedImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (productItem: ProductItem) => {
    setIsEditMode(true);
    setSelectedProductItem(productItem);
    setFormData({
      name: productItem.name,
      imageUrl: productItem.imageUrl || null,
    });
    setSelectedImageFile(null);
    setImagePreview(productItem.imageUrl ? productItem.imageUrl : null);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (productItem: ProductItem) => {
    setProductItemToDelete(productItem);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductItem(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductItemToDelete(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'imageUrl' ? (value === '' ? null : value) : value,
    }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, imageUrl: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (isEditMode && selectedProductItem) {
        const updateData: UpdateProductItemRequest = {
          name: formData.name,
          imageUrl: formData.imageUrl || null,
        };

        const response = await updateProductItemService(
          selectedProductItem.id,
          updateData,
          selectedImageFile
        );

        if (response.success === 200) {
          showSuccess(response.message || 'Product item updated successfully!', 'Success');
          await fetchProductItems();
          setTimeout(() => {
            handleCloseModal();
          }, 1000);
        } else {
          const errorMsg = response.message || 'Failed to update product item';
          showError(errorMsg, 'Update Failed');
        }
      } else {
        const createData: CreateProductItemRequest = {
          name: formData.name,
          imageUrl: formData.imageUrl || null,
        };

        const response = await createProductItemService(createData, selectedImageFile);

        if (response.success === 201) {
          showSuccess(response.message || 'Product item created successfully!', 'Success');
          await fetchProductItems();
          setTimeout(() => {
            handleCloseModal();
          }, 1000);
        } else {
          const errorMsg = response.message || 'Failed to create product item';
          showError(errorMsg, 'Create Failed');
        }
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const errorMsg = axiosError.response?.data?.message || 'An error occurred';
        showError(errorMsg, isEditMode ? 'Update Failed' : 'Create Failed');
      } else {
        const errorMsg = 'An unexpected error occurred';
        showError(errorMsg, isEditMode ? 'Update Failed' : 'Create Failed');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productItemToDelete) return;

    setFormLoading(true);

    try {
      const response = await deleteProductItemService(productItemToDelete.id);

      if (response.success === 200) {
        showSuccess(response.message || 'Product item deleted successfully!', 'Success');
        await fetchProductItems();
        setTimeout(() => {
          handleCloseDeleteModal();
        }, 1000);
      } else {
        const errorMsg = response.message || 'Failed to delete product item';
        showError(errorMsg, 'Delete Failed');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const errorMsg = axiosError.response?.data?.message || 'Failed to delete product item';
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

  return (
    <Card sx={{ borderRadius: 1.5, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Product Items Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateModal}
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
          Add New Product Item
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search product items by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredProductItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 7.5, color: 'text.secondary' }}>
          <Box sx={{ fontSize: 48, mb: 2, color: '#ccc', display: 'flex', justifyContent: 'center' }}>
            <BoxIcon sx={{ fontSize: 48 }} />
          </Box>
          <Typography variant="body1">
            {searchTerm
              ? 'No product items found matching your search'
              : 'No product items found. Add your first product item to get started!'}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#666' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666' }}>Image</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666' }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#666' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProductItems.map((item) => (
                <TableRow key={item.id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {item.imageUrl ? (
                      <Box
                        component="img"
                        src={item?.imageUrl || ''}
                        alt={item.name}
                        sx={{
                          width: 60,
                          height: 60,
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
                    ) : (
                      <span style={{ color: '#999' }}>—</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <MUICustomBtn
                        onClick={() => handleOpenEditModal(item)}
                        tooltip="Edit Product Item"
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
                        <EditIcon sx={{ fontSize: 16 }} />
                      </MUICustomBtn>
                      <MUICustomBtn
                        onClick={() => handleOpenDeleteModal(item)}
                        tooltip="Delete Product Item"
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
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </MUICustomBtn>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Product Item' : 'Create New Product Item'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <BoxIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Product Item Name
                </Typography>
              </Box>
              <TextField
                fullWidth
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Enter product item name (e.g., Shirt, Pant, Blazer)"
                required
                disabled={formLoading}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ImageIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Upload Image (Optional)
                </Typography>
              </Box>
              <Button
                component="label"
                variant="contained"
                startIcon={<UploadIcon />}
                disabled={formLoading}
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
                Choose Image File
                <input
                  type="file"
                  hidden
                  id="imageFile"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageFileChange}
                  disabled={formLoading}
                />
              </Button>
              {selectedImageFile && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Selected: {selectedImageFile.name}
                </Typography>
              )}
              {imagePreview && (
                <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{
                      maxWidth: 300,
                      maxHeight: 200,
                      borderRadius: 1,
                      border: '2px solid #e0e0e0',
                      objectFit: 'cover',
                    }}
                  />
                  <MUICustomBtn
                    onClick={handleRemoveImage}
                    tooltip="Remove image"
                    variant="contained"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: '#dc3545',
                      color: 'white',
                      width: 32,
                      height: 32,
                      minWidth: 32,
                      padding: 0,
                      '&:hover': {
                        bgcolor: '#c82333',
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </MUICustomBtn>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={formLoading}
            variant="contained"
            startIcon={formLoading ? <CircularProgress size={20} /> : isEditMode ? <EditIcon /> : <AddIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
              },
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 140,
            }}
          >
            {formLoading ? '' : isEditMode ? 'Update Product Item' : 'Create Product Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onClose={handleCloseDeleteModal} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Product Item</DialogTitle>
        <DialogContent>
          {productItemToDelete && (
            <Typography variant="body1">
              Are you sure you want to delete product item <strong>{productItemToDelete.name}</strong>?
              This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteModal} variant="outlined" sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={formLoading}
            variant="contained"
            sx={{
              bgcolor: '#dc3545',
              '&:hover': {
                bgcolor: '#c82333',
              },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {formLoading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ProductItemsPage;

