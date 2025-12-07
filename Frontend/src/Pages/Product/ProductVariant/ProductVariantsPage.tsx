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
  MenuItem,
  Chip,
} from '@mui/material';
import MUICustomBtn from '../../../Components/Common/MUICustomBtn';
import {
  Category as CategoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  FilterList as FilterListIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
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
} from '../../../Services/ApiServices';
import { useToast } from '../../../Utils/ToastContext';
import { useTranslation } from '../../../hooks/useTranslation';
import DataTable, { type Column } from '../../../Components/Common/DataTable';
import DataCardGrid, { type CardField, type CardAction } from '../../../Components/Common/DataCardGrid';

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
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

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

  const parseImages = (imageUrl: string | null): string[] => {
    if (!imageUrl) return [];
    try {
      const parsed = JSON.parse(imageUrl);
      return Array.isArray(parsed) ? parsed : [imageUrl];
    } catch {
      return [imageUrl];
    }
  };

  // Table columns configuration
  const columns: Column<ProductVariant>[] = [
    {
      id: 'name',
      label: t('productVariants.name'),
      render: (variant) => variant.name,
    },
    {
      id: 'product',
      label: t('productVariants.product'),
      render: (variant) => variant.product?.name || '—',
    },
    {
      id: 'description',
      label: t('productVariants.description'),
      render: (variant) => variant?.description || '—',
    },
    {
      id: 'photo',
      label: t('productVariants.photo'),
      render: (variant) => {
        const images = parseImages(variant.imageUrl);
        return images.length > 0 ? (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {images.slice(0, 2).map((imgUrl: string, idx: number) => (
              <Box
                key={idx}
                component="img"
                src={imgUrl}
                alt={`${variant.name} ${idx + 1}`}
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
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  border: '2px solid #e0e0e0',
                  bgcolor: '#f5f5f5',
                  fontSize: '0.65rem',
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
        );
      },
    },
    {
      id: 'productItems',
      label: t('productVariants.productItems'),
      render: (variant) =>
        variant.productItems && variant.productItems.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {variant.productItems.slice(0, 3).map((item) => (
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
            {variant.productItems.length > 3 && (
              <Chip
                label={`+${variant.productItems.length - 3}`}
                size="small"
                sx={{
                  bgcolor: '#f5f5f5',
                  color: '#666',
                  fontWeight: 500,
                }}
              />
            )}
          </Box>
        ) : (
          '—'
        ),
    },
    {
      id: 'createdAt',
      label: t('productVariants.createdAt'),
      render: (variant) => formatDate(variant.createdAt),
    },
    {
      id: 'actions',
      label: t('common.actions'),
      render: (variant) => (
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
      ),
    },
  ];

  // Card fields configuration
  const cardFields: CardField<ProductVariant>[] = [
    {
      id: 'product',
      label: 'Product',
      render: (variant) => <Typography variant="body2">{variant.product?.name || '—'}</Typography>,
    },
    {
      id: 'description',
      label: 'Description',
      render: (variant) => <Typography variant="body2">{variant?.description || '—'}</Typography>,
    },
    {
      id: 'productItems',
      label: 'Items',
      render: (variant) =>
        variant.productItems && variant.productItems.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {variant.productItems.slice(0, 4).map((item) => (
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
            {variant.productItems.length > 4 && (
              <Typography variant="caption" color="text.secondary">
                +{variant.productItems.length - 4} more
              </Typography>
            )}
          </Box>
        ) : (
          <Typography variant="body2">—</Typography>
        ),
    },
    {
      id: 'createdAt',
      label: 'Created',
      render: (variant) => (
        <Typography variant="body2" color="text.secondary">
          {formatDate(variant.createdAt)}
        </Typography>
      ),
    },
  ];

  // Card actions configuration
  const cardActions: CardAction<ProductVariant>[] = [
    {
      id: 'manage',
      render: (variant) => (
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
      ),
    },
    {
      id: 'edit',
      render: (variant) => (
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
      ),
    },
    {
      id: 'delete',
      render: (variant) => (
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
      ),
    },
  ];

  return (
    <Card sx={{ borderRadius: 1.5, p: { xs: 2, sm: 3 } }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2
      }}>
        <Typography variant="h5" sx={{
          fontWeight: 700,
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}>
          {t('productVariants.title')}
        </Typography>
        <Box sx={{
          display: 'flex',
          gap: 1.5,
          flexWrap: 'wrap',
          width: { xs: '100%', sm: 'auto' },
          alignItems: 'center'
        }}>
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
              fontSize: '0.875rem',
              px: 2,
              py: 1,
              borderRadius: 1.5,
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
              fontSize: '0.875rem',
              px: 2,
              py: 1,
              borderRadius: 1.5,
              display: { xs: 'none', lg: 'flex' },
            }}
          >
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </MUICustomBtn>
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
              fontSize: '0.875rem',
              px: 2.5,
              py: 1,
              borderRadius: 1.5,
              whiteSpace: 'nowrap',
              minWidth: { xs: 'auto', sm: 140 },
            }}
          >
            {t('productVariants.addNewVariant')}
          </MUICustomBtn>
        </Box>
      </Box>

      {showFilter && (
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
            sx={{
              maxWidth: { xs: '100%', sm: 500 },
              '& .MuiInputBase-input': {
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }
            }}
          />
        </Box>
      )}

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
        <>
          {/* Desktop view - show table or card based on viewMode */}
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            {viewMode === 'table' ? (
              <DataTable
                columns={columns}
                data={filteredVariants}
                getRowKey={(variant) => variant.id}
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
                data={filteredVariants}
                getCardTitle={(variant) => variant.name}
                getCardSubtitle={(variant) => variant.product?.name || 'No product'}
                getCardImages={(variant) => parseImages(variant.imageUrl)}
                fields={cardFields}
                actions={cardActions}
                getRowKey={(variant) => variant.id}
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
          </Box>

          {/* Mobile/Tablet view - always show card view on screens < 1024px */}
          <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
            <DataCardGrid
              data={filteredVariants}
              getCardTitle={(variant) => variant.name}
              getCardSubtitle={(variant) => variant.product?.name || 'No product'}
              getCardImages={(variant) => parseImages(variant.imageUrl)}
              fields={cardFields}
              actions={cardActions}
              getRowKey={(variant) => variant.id}
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
              columns={1}
            />
          </Box>
        </>
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
