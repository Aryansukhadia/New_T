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
  MenuItem,
  Chip,
} from '@mui/material';
import MUICustomBtn from '../../Components/Common/MUICustomBtn';
import CustomTablePaginationComponent from '../../Components/Common/CustomTablePagination';
import {
  Category as CategoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import {
  getProductVariantsService,
  getProductsService,
  getProductItemsService,
  deleteProductVariantService,
  addProductItemsToVariantService,
  removeProductItemsFromVariantService,
  type ProductVariant,
  type Product,
  type ProductItem,
  type PaginationMeta,
} from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';
import { useTranslation } from '../../hooks/useTranslation';

const ProductVariantsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allProductItems, setAllProductItems] = useState<ProductItem[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<ProductVariant | null>(null);
  const [isManageItemsModalOpen, setIsManageItemsModalOpen] = useState(false);
  const [variantToManageItems, setVariantToManageItems] = useState<ProductVariant | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const [selectedProductItems, setSelectedProductItems] = useState<string[]>([]);

  const fetchData = useCallback(async (page: number = 0) => {
    try {
      setLoading(true);
      const apiPage = page + 1;

      const [variantsResponse, productsResponse, itemsResponse] = await Promise.all([
        getProductVariantsService(selectedProductFilter || undefined, apiPage, pageSize),
        getProductsService(1, 10), // Get products for filter (max 100)
        getProductItemsService(1, 10), // Get items for manage modal (max 100)
      ]);

      if (variantsResponse.success === 200 && variantsResponse.data) {
        const { productVariants: variantsData, pagination } = variantsResponse.data;
        setProductVariants(variantsData);
        setPaginationMeta(pagination);
        setCurrentPage(page);
      }

      if (productsResponse.success === 200 && productsResponse.data) {
        setAllProducts(productsResponse.data.products);
      }

      if (itemsResponse.success === 200 && itemsResponse.data) {
        setAllProductItems(itemsResponse.data.productItems);
      }
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      showError('Failed to load data. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  }, [showError, selectedProductFilter, pageSize]);

  useEffect(() => {
    fetchData(currentPage);
  }, [fetchData, currentPage]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredVariants(productVariants);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = productVariants.filter(
      (variant) =>
        variant.name.toLowerCase().includes(term) ||
        (variant.description && variant.description.toLowerCase().includes(term)) ||
        variant.product?.name.toLowerCase().includes(term)
    );
    setFilteredVariants(filtered);
  }, [searchTerm, productVariants]);

  const handleCreateVariant = () => {
    navigate('/dashboard/product-variants/create');
  };

  const handleEditVariant = (variant: ProductVariant) => {
    navigate(`/dashboard/product-variants/edit/${variant.id}`);
  };

  const handleOpenDeleteModal = (variant: ProductVariant) => {
    setVariantToDelete(variant);
    setIsDeleteModalOpen(true);
  };

  const handleOpenManageItemsModal = (variant: ProductVariant) => {
    setVariantToManageItems(variant);
    setSelectedProductItems(variant.productItems?.map((item) => item.id) || []);
    setIsManageItemsModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setVariantToDelete(null);
  };

  const handleCloseManageItemsModal = () => {
    setIsManageItemsModalOpen(false);
    setVariantToManageItems(null);
    setSelectedProductItems([]);
  };

  const handleProductItemToggle = (itemId: string) => {
    setSelectedProductItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleManageItems = async () => {
    if (!variantToManageItems) return;

    setFormLoading(true);

    try {
      const currentItemIds = variantToManageItems.productItems?.map((item) => item.id) || [];
      const itemsToAdd = selectedProductItems.filter((id) => !currentItemIds.includes(id));
      const itemsToRemove = currentItemIds.filter((id) => !selectedProductItems.includes(id));

      const promises: Promise<unknown>[] = [];

      if (itemsToAdd.length > 0) {
        promises.push(addProductItemsToVariantService(variantToManageItems.id, itemsToAdd));
      }

      if (itemsToRemove.length > 0) {
        promises.push(removeProductItemsFromVariantService(variantToManageItems.id, itemsToRemove));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        showSuccess('Product items updated successfully!', 'Success');
        await fetchData(currentPage);
        setTimeout(() => {
          handleCloseManageItemsModal();
        }, 1000);
      } else {
        handleCloseManageItemsModal();
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const errorMsg = axiosError.response?.data?.message || 'Failed to update product items';
        showError(errorMsg, 'Update Failed');
      } else {
        const errorMsg = 'An unexpected error occurred';
        showError(errorMsg, 'Update Failed');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!variantToDelete) return;

    setFormLoading(true);

    try {
      const response = await deleteProductVariantService(variantToDelete.id);

      if (response.success === 200) {
        showSuccess(response.message || 'Product variant deleted successfully!', 'Success');
        await fetchData(currentPage);
        setTimeout(() => {
          handleCloseDeleteModal();
        }, 1000);
      } else {
        const errorMsg = response.message || 'Failed to delete product variant';
        showError(errorMsg, 'Delete Failed');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const errorMsg = axiosError.response?.data?.message || 'Failed to delete product variant';
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
          {t('productVariants.title')}
        </Typography>
        <MUICustomBtn
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateVariant}
          tooltip="Create a new product variant"
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
          {t('productVariants.addNewVariant')}
        </MUICustomBtn>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Filter by Product"
          value={selectedProductFilter}
          onChange={(e) => {
            setSelectedProductFilter(e.target.value);
            setCurrentPage(0);
          }}
          sx={{ minWidth: 250 }}
        >
          <MenuItem value="">All Products</MenuItem>
          {allProducts.map((product) => (
            <MenuItem key={product.id} value={product.id}>
              {product.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          placeholder="Search variants by name, description, or product..."
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
      ) : filteredVariants.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <CategoryIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="body1">
            {searchTerm || selectedProductFilter
              ? 'No product variants found matching your criteria'
              : t('productVariants.noVariants')}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>{t('productVariants.name')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('productVariants.product')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('productVariants.description')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('productVariants.photo')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('productVariants.productItems')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('productVariants.createdAt')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVariants.map((variant) => (
                <TableRow key={variant.id} hover>
                  <TableCell>{variant.name}</TableCell>
                  <TableCell>{variant.product?.name || '—'}</TableCell>
                  <TableCell>{variant?.description || '—'}</TableCell>
                  <TableCell>
                    {variant.imageUrl ? (() => {
                      // Try to parse as JSON array
                      const images = JSON.parse(variant.imageUrl);
                      const imageArray = Array.isArray(images) ? images : [variant.imageUrl];
                      return (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {imageArray.slice(0, 3).map((imgUrl: string, idx: number) => (
                            <Box
                              key={idx}
                              component="img"
                              src={imgUrl}
                              alt={`${variant.name} ${idx + 1}`}
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
                          ))}
                          {imageArray.length > 3 && (
                            <Box
                              sx={{
                                width: 60,
                                height: 60,
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
                              +{imageArray.length - 3}
                            </Box>
                          )}
                        </Box>
                      );

                    })() : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {variant.productItems && variant.productItems.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {variant.productItems.map((item) => (
                          <Chip
                            key={item.id}
                            label={item.name}
                            size="small"
                            sx={{
                              bgcolor: '#e3f2fd',
                              color: '#1976d2',
                              fontWeight: 500,
                            }}
                          />
                        ))}
                      </Box>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{formatDate(variant.createdAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <MUICustomBtn
                        onClick={() => handleOpenManageItemsModal(variant)}
                        tooltip="Manage Product Items"
                        variant="contained"
                        sx={{
                          bgcolor: '#e8f5e9',
                          color: '#2e7d32',
                          minWidth: 32,
                          width: 32,
                          height: 32,
                          padding: 0,
                          '&:hover': {
                            bgcolor: '#c8e6c9',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(46, 125, 50, 0.2)',
                          },
                        }}
                      >
                        <LinkIcon fontSize="small" />
                      </MUICustomBtn>
                      <MUICustomBtn
                        onClick={() => handleEditVariant(variant)}
                        tooltip="Edit Variant"
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
                        onClick={() => handleOpenDeleteModal(variant)}
                        tooltip="Delete Variant"
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

      {/* Manage Items Dialog */}
      <Dialog open={isManageItemsModalOpen} onClose={handleCloseManageItemsModal} maxWidth="md" fullWidth>
        <DialogTitle>Manage Product Items</DialogTitle>
        <DialogContent>
          {variantToManageItems && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manage product items for variant: <strong>{variantToManageItems.name}</strong>
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  maxHeight: 400,
                  overflowY: 'auto',
                  p: 2,
                  border: '2px solid #e0e0e0',
                  borderRadius: 1,
                  bgcolor: '#fafafa',
                }}
              >
                {allProductItems.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No product items available
                  </Typography>
                ) : (
                  allProductItems.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        borderRadius: 0.5,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        '&:hover': {
                          bgcolor: '#f0f0f0',
                        },
                      }}
                      onClick={() => !formLoading && handleProductItemToggle(item.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProductItems.includes(item.id)}
                        onChange={() => handleProductItemToggle(item.id)}
                        disabled={formLoading}
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                      />
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <MUICustomBtn
            onClick={handleCloseManageItemsModal}
            variant="outlined"
            tooltip="Cancel operation"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </MUICustomBtn>
          <MUICustomBtn
            onClick={handleManageItems}
            disabled={formLoading}
            variant="contained"
            tooltip="Update product items"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
              },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {formLoading ? <CircularProgress size={20} color="inherit" /> : 'Update Items'}
          </MUICustomBtn>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onClose={handleCloseDeleteModal} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Product Variant</DialogTitle>
        <DialogContent>
          {variantToDelete && (
            <Typography>
              Are you sure you want to delete product variant <strong>{variantToDelete.name}</strong>?
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
            tooltip="Permanently delete this variant"
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

export default ProductVariantsPage;
