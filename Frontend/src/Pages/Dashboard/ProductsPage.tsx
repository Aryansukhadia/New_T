import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
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
import MUICustomBtn from '../../Components/Common/MUICustomBtn';
import CustomTablePaginationComponent from '../../Components/Common/CustomTablePagination';
import {
  ShoppingBag as ShoppingBagIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import {
  getProductsService,
  createProductService,
  updateProductService,
  deleteProductService,
  type Product,
  type CreateProductRequest,
  type UpdateProductRequest,
  type PaginationMeta,
} from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const { showSuccess, showError } = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    description: null,
  });

  const fetchProducts = useCallback(async (page: number = 0) => {
    try {
      setLoading(true);
      const apiPage = page + 1;
      const response = await getProductsService(apiPage, pageSize);
      if (response.success === 200 && response.data) {
        const { products: productsData, pagination } = response.data;
        setProducts(productsData);
        setPaginationMeta(pagination);
        setCurrentPage(page);
      } else {
        showError(response.message || 'Failed to load products', 'Error');
      }
    } catch (err: unknown) {
      console.error('Error fetching products:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'Failed to load products', 'Error');
      } else {
        showError('Failed to load products. Please try again.', 'Error');
      }
    } finally {
      setLoading(false);
    }
  }, [showError, pageSize]);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [fetchProducts, currentPage]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        (product.description && product.description.toLowerCase().includes(term))
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setIsEditMode(true);
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || null,
    });
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'description' ? (value === '' ? null : value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (isEditMode && selectedProduct) {
        const updateData: UpdateProductRequest = {
          name: formData.name,
          description: formData.description || null,
        };

        const response = await updateProductService(selectedProduct.id, updateData);

        if (response.success === 200) {
          showSuccess(response.message || 'Product updated successfully!', 'Success');
          await fetchProducts();
          setTimeout(() => {
            handleCloseModal();
          }, 1000);
        } else {
          const errorMsg = response.message || 'Failed to update product';
          showError(errorMsg, 'Update Failed');
        }
      } else {
        const createData: CreateProductRequest = {
          name: formData.name,
          description: formData.description || null,
        };

        const response = await createProductService(createData);

        if (response.success === 201) {
          showSuccess(response.message || 'Product created successfully!', 'Success');
          await fetchProducts();
          setTimeout(() => {
            handleCloseModal();
          }, 1000);
        } else {
          const errorMsg = response.message || 'Failed to create product';
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
    if (!productToDelete) return;

    setFormLoading(true);

    try {
      const response = await deleteProductService(productToDelete.id);

      if (response.success === 200) {
        showSuccess(response.message || 'Product deleted successfully!', 'Success');
        await fetchProducts();
        setTimeout(() => {
          handleCloseDeleteModal();
        }, 1000);
      } else {
        const errorMsg = response.message || 'Failed to delete product';
        showError(errorMsg, 'Delete Failed');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const errorMsg = axiosError.response?.data?.message || 'Failed to delete product';
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
          Products Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilter(!showFilter)}
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
          </Button>
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
            Add New Product
          </Button>
        </Box>
      </Box>

      {showFilter && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search products by name or description..."
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
      ) : filteredProducts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <ShoppingBagIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="body1">
            {searchTerm
              ? 'No products found matching your search'
              : 'No products found. Add your first product to get started!'}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Variants Count</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description || '—'}</TableCell>
                  <TableCell>{product.variants?.length || 0}</TableCell>
                  <TableCell>{formatDate(product.createdAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <MUICustomBtn
                        size="small"
                        onClick={() => handleOpenEditModal(product)}
                        tooltip="Edit Product"
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
                        size="small"
                        onClick={() => handleOpenDeleteModal(product)}
                        tooltip="Delete Product"
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
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? 'Edit Product' : 'Create New Product'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Enter product name (e.g., Suit, Sherwani, Indowestern)"
              required
              disabled={formLoading}
              InputProps={{
                startAdornment: <ShoppingBagIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              name="description"
              value={formData.description || ''}
              onChange={handleFormChange}
              placeholder="Enter product description (optional)"
              multiline
              rows={4}
              disabled={formLoading}
              InputProps={{
                startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 2 }} />,
              }}
            />
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
            startIcon={isEditMode ? <EditIcon /> : <AddIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
              },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {formLoading ? <CircularProgress size={20} color="inherit" /> : isEditMode ? 'Update Product' : 'Create Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onClose={handleCloseDeleteModal} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          {productToDelete && (
            <Typography>
              Are you sure you want to delete product <strong>{productToDelete.name}</strong>?
              This action cannot be undone. If this product has variants, you must delete them first.
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
            color="error"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {formLoading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ProductsPage;

