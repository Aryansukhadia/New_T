import { useState, useEffect, useCallback } from 'react';
import {
  getProductItemsService,
  createProductItemService,
  updateProductItemService,
  deleteProductItemService,
  type ProductItem,
  type CreateProductItemRequest,
  type UpdateProductItemRequest,
  type PaginationMeta,
} from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';
import CustomTablePaginationComponent from '../../Components/Common/CustomTablePagination';
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const [formData, setFormData] = useState<CreateProductItemRequest>({
    name: '',
    imageUrl: null,
  });

  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const fetchProductItems = useCallback(async (page: number = 0) => {
    try {
      setLoading(true);
      const apiPage = page + 1;
      const response = await getProductItemsService(apiPage, pageSize);
      if (response.success === 200 && response.data) {
        const { productItems: productItemsData, pagination } = response.data;
        setProductItems(productItemsData);
        setPaginationMeta(pagination);
        setCurrentPage(page);
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
  }, [showError, pageSize]);

  useEffect(() => {
    fetchProductItems(currentPage);
  }, [fetchProductItems, currentPage]);

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
    setSelectedImageFiles([]);
    setImagePreviews([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (productItem: ProductItem) => {
    setIsEditMode(true);
    setSelectedProductItem(productItem);
    setFormData({
      name: productItem.name,
      imageUrl: productItem.imageUrl || null,
    });
    setSelectedImageFiles([]);

    // Parse existing images from JSON string
    let existingImages: string[] = [];
    if (productItem.imageUrl) {
      try {
        existingImages = JSON.parse(productItem.imageUrl);
        if (!Array.isArray(existingImages)) {
          existingImages = [productItem.imageUrl];
        }
      } catch {
        existingImages = [productItem.imageUrl];
      }
    }
    setImagePreviews(existingImages);
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
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files).slice(0, 5); // Limit to 5 files
      setSelectedImageFiles(fileArray);

      // Create previews for all files
      const previews: string[] = [];
      let loadedCount = 0;

      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          loadedCount++;
          if (loadedCount === fileArray.length) {
            setImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAllImages = () => {
    setSelectedImageFiles([]);
    setImagePreviews([]);
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
          selectedImageFiles.length > 0 ? selectedImageFiles : null
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

        const response = await createProductItemService(createData, selectedImageFiles.length > 0 ? selectedImageFiles : null);

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
                    {item.imageUrl ? (() => {
                      try {
                        const images = JSON.parse(item.imageUrl);
                        const imageArray = Array.isArray(images) ? images : [item.imageUrl];
                        return (
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {imageArray.slice(0, 3).map((imgUrl: string, idx: number) => (
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
                            {imageArray.length > 3 && (
                              <Box sx={{
                                width: 40,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: '#f0f0f0',
                                borderRadius: 1,
                                fontSize: 12,
                                color: '#666'
                              }}>
                                +{imageArray.length - 3}
                              </Box>
                            )}
                          </Box>
                        );
                      } catch {
                        return (
                          <Box
                            component="img"
                            src={item.imageUrl}
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
                        );
                      }
                    })() : (
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
                  Upload Images (Optional - Max 5)
                </Typography>
              </Box>
              <Button
                component="label"
                variant="contained"
                startIcon={<UploadIcon />}
                disabled={formLoading || imagePreviews.length >= 5}
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
                Choose Image Files
                <input
                  type="file"
                  hidden
                  multiple
                  id="imageFiles"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageFileChange}
                  disabled={formLoading || imagePreviews.length >= 5}
                />
              </Button>
              {selectedImageFiles.length > 0 && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Selected: {selectedImageFiles.length} file(s)
                </Typography>
              )}
              {imagePreviews.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Image Previews ({imagePreviews.length}/5)
                    </Typography>
                    <Button
                      size="small"
                      onClick={handleRemoveAllImages}
                      sx={{
                        textTransform: 'none',
                        color: '#dc3545',
                        '&:hover': { bgcolor: '#ffebee' }
                      }}
                    >
                      Remove All
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {imagePreviews.map((preview, index) => (
                      <Box key={index} sx={{ position: 'relative', display: 'inline-block' }}>
                        <Box
                          component="img"
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          sx={{
                            width: 120,
                            height: 120,
                            borderRadius: 1,
                            border: '2px solid #e0e0e0',
                            objectFit: 'cover',
                          }}
                        />
                        <MUICustomBtn
                          onClick={() => handleRemoveImage(index)}
                          tooltip="Remove image"
                          variant="contained"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: '#dc3545',
                            color: 'white',
                            width: 24,
                            height: 24,
                            minWidth: 24,
                            padding: 0,
                            '&:hover': {
                              bgcolor: '#c82333',
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </MUICustomBtn>
                      </Box>
                    ))}
                  </Box>
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

