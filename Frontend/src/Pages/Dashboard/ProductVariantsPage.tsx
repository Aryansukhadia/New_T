import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
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
} from '../../Services/ApiServices';
import Modal from '../../Components/Common/Modal';
import { useToast } from '../../Utils/ToastContext';
import {
  Select,
  Button,
  LoadingSpinner,
} from '../../Components/Common/FormComponents';
import MUICustomBtn from '../../Components/Common/MUICustomBtn';
import {
  FaTags,
  FaPlus,
  FaEdit,
  FaTrash,
  FaLink,
} from 'react-icons/fa';

const PageContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterSelect = styled(Select)`
  max-width: 300px;
`;

const SearchBar = styled.div`
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableRow = styled.tr<{ isHeader?: boolean }>`
  border-bottom: 1px solid #e0e0e0;

  &:hover {
    background: ${(props) => (props.isHeader ? 'none' : '#f8f9fa')};
  }
`;

const TableCell = styled.td<{ isHeader?: boolean }>`
  padding: 16px;
  text-align: left;
  font-weight: ${(props) => (props.isHeader ? '600' : '400')};
  color: ${(props) => (props.isHeader ? '#666' : '#333')};
  font-size: 14px;
`;

const TableHeaderCell = styled(TableCell).attrs({ isHeader: true })`
  background: #f8f9fa;
`;

const ActionCell = styled(TableCell)`
  display: flex;
  gap: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: #ccc;
  display: flex;
  justify-content: center;

  svg {
    width: 48px;
    height: 48px;
  }
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  margin: 0;
`;

const ModalButton = styled(Button)`
  margin-top: 0;
  min-width: 140px;
  padding: 14px 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;

  svg {
    font-size: 14px;
  }
`;

const ModalButtonSecondary = styled.button`
  padding: 14px 28px;
  background: #f5f5f5;
  color: #333;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;

  &:hover {
    background: #e8e8e8;
    border-color: #ccc;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TableImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const ImageCell = styled(TableCell)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: #f0f0f0;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  span {
    font-size: 14px;
    color: #333;
  }
`;

const ProductItemsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const ProductItemTag = styled.span`
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
`;

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

  const [selectedProductItems, setSelectedProductItems] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [variantsResponse, productsResponse, itemsResponse] = await Promise.all([
        getProductVariantsService(),
        getProductsService(),
        getProductItemsService(),
      ]);

      if (variantsResponse.success === 200 && variantsResponse.data) {
        setProductVariants(variantsResponse.data.productVariants);
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
  }, [showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let filtered = productVariants;

    if (selectedProductFilter) {
      filtered = filtered.filter((v) => v.productId === selectedProductFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (variant) =>
          variant.name.toLowerCase().includes(term) ||
          (variant.description && variant.description.toLowerCase().includes(term)) ||
          variant.product?.name.toLowerCase().includes(term)
      );
    }

    setFilteredVariants(filtered);
  }, [searchTerm, selectedProductFilter, productVariants]);

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

      const promises: Promise<any>[] = [];

      if (itemsToAdd.length > 0) {
        promises.push(addProductItemsToVariantService(variantToManageItems.id, itemsToAdd));
      }

      if (itemsToRemove.length > 0) {
        promises.push(removeProductItemsFromVariantService(variantToManageItems.id, itemsToRemove));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        showSuccess('Product items updated successfully!', 'Success');
        await fetchData();
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
        await fetchData();
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
    <PageContainer>
      <PageHeader>
        <PageTitle>{t('productVariants.title')}</PageTitle>
        <ActionButton onClick={handleCreateVariant}>
          <FaPlus style={{ marginRight: '8px' }} />
          {t('productVariants.addNewVariant')}
        </ActionButton>
      </PageHeader>

      <FilterBar>
        <FilterSelect
          value={selectedProductFilter}
          onChange={(e) => setSelectedProductFilter(e.target.value)}
        >
          <option value="">All Products</option>
          {allProducts.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </FilterSelect>
      </FilterBar>

      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Search variants by name, description, or product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingSpinner />
        </div>
      ) : filteredVariants.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>
            <FaTags />
          </EmptyStateIcon>
          <EmptyStateText>
            {searchTerm || selectedProductFilter
              ? t('productVariants.noVariants')
              : t('productVariants.noVariants')}
          </EmptyStateText>
        </EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow isHeader>
                <TableHeaderCell>{t('productVariants.name')}</TableHeaderCell>
                <TableHeaderCell>{t('productVariants.product')}</TableHeaderCell>
                <TableHeaderCell>{t('productVariants.description')}</TableHeaderCell>
                <TableHeaderCell>{t('productVariants.photo')}</TableHeaderCell>
                <TableHeaderCell>{t('productVariants.productItems')}</TableHeaderCell>
                <TableHeaderCell>{t('productVariants.createdAt')}</TableHeaderCell>
                <TableHeaderCell>{t('common.actions')}</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredVariants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell>{variant.name}</TableCell>
                  <TableCell>{variant.product?.name || '—'}</TableCell>
                  <TableCell>{variant?.description || '—'}</TableCell>
                  <ImageCell>
                    {variant.photoUrl ? (
                      <TableImage
                        src={variant?.photoUrl || ''}
                        alt={variant.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span style={{ color: '#999' }}>—</span>
                    )}
                  </ImageCell>
                  <TableCell>
                    {variant.productItems && variant.productItems.length > 0 ? (
                      <ProductItemsList>
                        {variant.productItems.map((item) => (
                          <ProductItemTag key={item.id}>{item.name}</ProductItemTag>
                        ))}
                      </ProductItemsList>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{formatDate(variant.createdAt)}</TableCell>
                  <ActionCell>
                    <MUICustomBtn
                      onClick={() => handleOpenManageItemsModal(variant)}
                      tooltip="Manage Product Items"
                      variant="contained"
                      sx={{
                        bgcolor: '#e8f5e8',
                        color: '#2e7d32',
                        minWidth: 38,
                        width: 38,
                        height: 38,
                        padding: 0,
                        '&:hover': {
                          bgcolor: '#c8e6c9',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <FaLink />
                    </MUICustomBtn>
                    <MUICustomBtn
                      onClick={() => handleEditVariant(variant)}
                      tooltip="Edit Variant"
                      variant="contained"
                      sx={{
                        bgcolor: '#e3f2fd',
                        color: '#1976d2',
                        minWidth: 38,
                        width: 38,
                        height: 38,
                        padding: 0,
                        '&:hover': {
                          bgcolor: '#bbdefb',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <FaEdit />
                    </MUICustomBtn>
                    <MUICustomBtn
                      onClick={() => handleOpenDeleteModal(variant)}
                      tooltip="Delete Variant"
                      variant="contained"
                      sx={{
                        bgcolor: '#ffebee',
                        color: '#d32f2f',
                        minWidth: 38,
                        width: 38,
                        height: 38,
                        padding: 0,
                        '&:hover': {
                          bgcolor: '#ffcdd2',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <FaTrash />
                    </MUICustomBtn>
                  </ActionCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}

      {/* Manage Items Modal */}
      <Modal
        isOpen={isManageItemsModalOpen}
        onClose={handleCloseManageItemsModal}
        title="Manage Product Items"
        size="large"
        footer={
          <>
            <ModalButtonSecondary onClick={handleCloseManageItemsModal}>Cancel</ModalButtonSecondary>
            <ModalButton onClick={handleManageItems} disabled={formLoading}>
              {formLoading ? <LoadingSpinner /> : <>Update Items</>}
            </ModalButton>
          </>
        }
      >
        {variantToManageItems && (
          <div>
            <p style={{ marginBottom: '16px', color: '#666' }}>
              Manage product items for variant: <strong>{variantToManageItems.name}</strong>
            </p>
            <CheckboxContainer>
              {allProductItems.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                  No product items available
                </p>
              ) : (
                allProductItems.map((item) => (
                  <CheckboxItem key={item.id}>
                    <input
                      type="checkbox"
                      checked={selectedProductItems.includes(item.id)}
                      onChange={() => handleProductItemToggle(item.id)}
                      disabled={formLoading}
                    />
                    <span>{item.name}</span>
                  </CheckboxItem>
                ))
              )}
            </CheckboxContainer>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Delete Product Variant"
        footer={
          <>
            <ModalButtonSecondary onClick={handleCloseDeleteModal}>Cancel</ModalButtonSecondary>
            <MUICustomBtn
              onClick={handleDelete}
              disabled={formLoading}
              tooltip="Permanently delete this variant"
              variant="contained"
              color="error"
              sx={{ backgroundColor: '#dc3545', marginTop: 0 }}
            >
              {formLoading ? <LoadingSpinner /> : 'Delete'}
            </MUICustomBtn>
          </>
        }
      >
        {variantToDelete && (
          <p>
            Are you sure you want to delete product variant <strong>{variantToDelete.name}</strong>?
            This action cannot be undone.
          </p>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ProductVariantsPage;

