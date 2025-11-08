import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  getProductVariantsService,
  getProductsService,
  getProductItemsService,
  createProductVariantService,
  updateProductVariantService,
  deleteProductVariantService,
  addProductItemsToVariantService,
  removeProductItemsFromVariantService,
  type ProductVariant,
  type Product,
  type ProductItem,
  type CreateProductVariantRequest,
  type UpdateProductVariantRequest,
} from '../../Services/ApiServices';
import Modal from '../../Components/Common/Modal';
import { useToast } from '../../Utils/ToastContext';
import {
  FormGroup,
  Label,
  Input,
  Select,
  Button,
  LoadingSpinner,
} from '../../Components/Common/FormComponents';
import {
  FaTags,
  FaPlus,
  FaEdit,
  FaTrash,
  FaImage,
  FaBox,
  FaShoppingBag,
  FaLink,
  FaTimes,
  FaUpload,
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

const IconButton = styled.button<{ variant?: 'edit' | 'delete' | 'link' | 'unlink' }>`
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;

  ${(props) => {
    if (props.variant === 'edit') {
      return `
        background: #e3f2fd;
        color: #1976d2;
        &:hover {
          background: #bbdefb;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(25, 118, 210, 0.2);
        }
      `;
    }
    if (props.variant === 'delete') {
      return `
        background: #ffebee;
        color: #d32f2f;
        &:hover {
          background: #ffcdd2;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(211, 47, 47, 0.2);
        }
      `;
    }
    if (props.variant === 'link' || props.variant === 'unlink') {
      return `
        background: #fff3e0;
        color: #f57c00;
        &:hover {
          background: #ffe0b2;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(245, 124, 0, 0.2);
        }
      `;
    }
    return '';
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  svg {
    width: 16px;
    height: 16px;
  }
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

const FileInputWrapper = styled.div`
  position: relative;
`;

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  input[type="file"] {
    display: none;
  }
`;

const ImagePreviewContainer = styled.div`
  margin-top: 16px;
  position: relative;
  display: inline-block;
`;

const ImagePreview = styled.img`
  max-width: 300px;
  max-height: 200px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;

  &:hover {
    background: #c82333;
    transform: scale(1.1);
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
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allProductItems, setAllProductItems] = useState<ProductItem[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<ProductVariant | null>(null);
  const [isManageItemsModalOpen, setIsManageItemsModalOpen] = useState(false);
  const [variantToManageItems, setVariantToManageItems] = useState<ProductVariant | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<CreateProductVariantRequest>({
    productId: '',
    name: '',
    description: null,
    photoUrl: null,
    productItemIds: [],
  });

  const [selectedProductItems, setSelectedProductItems] = useState<string[]>([]);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [variantsResponse, productsResponse, itemsResponse] = await Promise.all([
        getProductVariantsService(),
        getProductsService(),
        getProductItemsService(),
      ]);

      if (variantsResponse.success === 200 && variantsResponse.data) {
        setProductVariants(variantsResponse.data);
      }

      if (productsResponse.success === 200 && productsResponse.data) {
        setAllProducts(productsResponse.data);
      }

      if (itemsResponse.success === 200 && itemsResponse.data) {
        setAllProductItems(itemsResponse.data);
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

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setSelectedVariant(null);
    setFormData({
      productId: '',
      name: '',
      description: null,
      photoUrl: null,
      productItemIds: [],
    });
    setSelectedProductItems([]);
    setSelectedPhotoFile(null);
    setPhotoPreview(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (variant: ProductVariant) => {
    setIsEditMode(true);
    setSelectedVariant(variant);
    setFormData({
      productId: variant.productId,
      name: variant.name,
      description: variant.description || null,
      photoUrl: variant.photoUrl || null,
      productItemIds: variant.productItems?.map((item) => item.id) || [],
    });
    setSelectedProductItems(variant.productItems?.map((item) => item.id) || []);
    setSelectedPhotoFile(null);
    setPhotoPreview(variant.photoUrl ? variant.photoUrl : null);
    setIsModalOpen(true);
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVariant(null);
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'photoUrl' || name === 'description' ? (value === '' ? null : value) : value,
    }));
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhotoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhotoFile(null);
    setPhotoPreview(null);
    setFormData((prev) => ({ ...prev, photoUrl: null }));
  };

  const handleProductItemToggle = (itemId: string) => {
    setSelectedProductItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    console.log(formData);
    console.log(typeof formData);


    try {
      if (isEditMode && selectedVariant) {

        const updateData: UpdateProductVariantRequest = {
          name: formData.name,
          description: formData.description || null,
          photoUrl: formData.photoUrl || null,
          productItemIds: selectedProductItems.length > 0 ? selectedProductItems : undefined,
        };

        const response = await updateProductVariantService(
          selectedVariant.id,
          updateData,
          selectedPhotoFile
        );

        if (response.success === 200) {
          showSuccess(response.message || 'Product variant updated successfully!', 'Success');
          await fetchData();
          setTimeout(() => {
            handleCloseModal();
          }, 1000);
        } else {
          const errorMsg = response.message || 'Failed to update product variant';
          showError(errorMsg, 'Update Failed');
        }
      } else {
        const createData: CreateProductVariantRequest = {
          productId: formData.productId,
          name: formData.name,
          description: formData.description || null,
          photoUrl: formData.photoUrl || null,
          productItemIds: selectedProductItems.length > 0 ? selectedProductItems : [],
        };

        const response = await createProductVariantService(createData, selectedPhotoFile);

        if (response.success === 201) {
          showSuccess(response.message || 'Product variant created successfully!', 'Success');
          await fetchData();
          setTimeout(() => {
            handleCloseModal();
          }, 1000);
        } else {
          const errorMsg = response.message || 'Failed to create product variant';
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
        <PageTitle>Product Variants Management</PageTitle>
        <ActionButton onClick={handleOpenCreateModal}>
          <FaPlus style={{ marginRight: '8px' }} />
          Add New Variant
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
              ? 'No product variants found matching your filters'
              : 'No product variants found. Add your first variant to get started!'}
          </EmptyStateText>
        </EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow isHeader>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Product</TableHeaderCell>
                <TableHeaderCell>Description</TableHeaderCell>
                <TableHeaderCell>Photo</TableHeaderCell>
                <TableHeaderCell>Product Items</TableHeaderCell>
                <TableHeaderCell>Created At</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredVariants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell>{variant.name}</TableCell>
                  <TableCell>{variant.product?.name || '—'}</TableCell>
                  <TableCell>{variant.description || '—'}</TableCell>
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
                    <IconButton
                      variant="link"
                      onClick={() => handleOpenManageItemsModal(variant)}
                      title="Manage Product Items"
                    >
                      <FaLink />
                    </IconButton>
                    <IconButton
                      variant="edit"
                      onClick={() => handleOpenEditModal(variant)}
                      title="Edit Variant"
                    >
                      <FaEdit />
                    </IconButton>
                    <IconButton
                      variant="delete"
                      onClick={() => handleOpenDeleteModal(variant)}
                      title="Delete Variant"
                    >
                      <FaTrash />
                    </IconButton>
                  </ActionCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditMode ? 'Edit Product Variant' : 'Create New Product Variant'}
        size="large"
        footer={
          <>
            <ModalButtonSecondary onClick={handleCloseModal}>Cancel</ModalButtonSecondary>
            <ModalButton onClick={handleSubmit} disabled={formLoading}>
              {formLoading ? (
                <LoadingSpinner />
              ) : isEditMode ? (
                <>
                  <FaEdit /> Update Variant
                </>
              ) : (
                <>
                  <FaPlus /> Create Variant
                </>
              )}
            </ModalButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <FormGroup>
            <Label htmlFor="productId">
              <FaShoppingBag />
              Product
            </Label>
            <Select
              id="productId"
              name="productId"
              value={formData.productId}
              onChange={handleFormChange}
              required
              disabled={formLoading || isEditMode}
            >
              <option value="">Select a product</option>
              {allProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="name">
              <FaTags />
              Variant Name
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Enter variant name (e.g., Normal, 2 Piece, 3 Piece)"
              required
              disabled={formLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">
              Description (Optional)
            </Label>
            <Input
              as="textarea"
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleFormChange}
              placeholder="Enter variant description (optional)"
              rows={3}
              disabled={formLoading}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="photoFile">
              <FaImage />
              Upload Photo (Optional)
            </Label>
            <FileInputWrapper>
              <FileInputLabel htmlFor="photoFile">
                <FaUpload style={{ marginRight: '8px' }} />
                Choose Photo File
                <input
                  type="file"
                  id="photoFile"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handlePhotoFileChange}
                  disabled={formLoading}
                />
              </FileInputLabel>
              {selectedPhotoFile && (
                <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                  Selected: {selectedPhotoFile.name}
                </p>
              )}
            </FileInputWrapper>
            {photoPreview && (
              <ImagePreviewContainer>
                <ImagePreview src={photoPreview} alt="Preview" />
                <RemoveImageButton onClick={handleRemovePhoto} type="button">
                  <FaTimes />
                </RemoveImageButton>
              </ImagePreviewContainer>
            )}
          </FormGroup>

          <FormGroup>
            <Label>
              <FaBox />
              Product Items (Optional)
            </Label>
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
          </FormGroup>
        </form>
      </Modal>

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
            <Button
              onClick={handleDelete}
              disabled={formLoading}
              style={{ background: '#dc3545', marginTop: 0 }}
            >
              {formLoading ? <LoadingSpinner /> : 'Delete'}
            </Button>
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

