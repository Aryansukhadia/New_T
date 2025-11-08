import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  getProductItemsService,
  createProductItemService,
  updateProductItemService,
  deleteProductItemService,
  type ProductItem,
  type CreateProductItemRequest,
  type UpdateProductItemRequest,
} from '../../Services/ApiServices';
import Modal from '../../Components/Common/Modal';
import { useToast } from '../../Utils/ToastContext';
import {
  FormGroup,
  Label,
  Input,
  Button,
  LoadingSpinner,
} from '../../Components/Common/FormComponents';
import {
  FaBox,
  FaPlus,
  FaEdit,
  FaTrash,
  FaImage,
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

const IconButton = styled.button<{ variant?: 'edit' | 'delete' }>`
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
    <PageContainer>
      <PageHeader>
        <PageTitle>Product Items Management</PageTitle>
        <ActionButton onClick={handleOpenCreateModal}>
          <FaPlus style={{ marginRight: '8px' }} />
          Add New Product Item
        </ActionButton>
      </PageHeader>

      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Search product items by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingSpinner />
        </div>
      ) : filteredProductItems.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>
            <FaBox />
          </EmptyStateIcon>
          <EmptyStateText>
            {searchTerm
              ? 'No product items found matching your search'
              : 'No product items found. Add your first product item to get started!'}
          </EmptyStateText>
        </EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow isHeader>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Image</TableHeaderCell>
                <TableHeaderCell>Created At</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredProductItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <ImageCell>
                    {item.imageUrl ? (
                      <TableImage
                        src={item?.imageUrl || ''}
                        alt={item.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span style={{ color: '#999' }}>—</span>
                    )}
                  </ImageCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <ActionCell>
                    <IconButton
                      variant="edit"
                      onClick={() => handleOpenEditModal(item)}
                      title="Edit Product Item"
                    >
                      <FaEdit />
                    </IconButton>
                    <IconButton
                      variant="delete"
                      onClick={() => handleOpenDeleteModal(item)}
                      title="Delete Product Item"
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
        title={isEditMode ? 'Edit Product Item' : 'Create New Product Item'}
        size="large"
        footer={
          <>
            <ModalButtonSecondary onClick={handleCloseModal}>Cancel</ModalButtonSecondary>
            <ModalButton onClick={handleSubmit} disabled={formLoading}>
              {formLoading ? (
                <LoadingSpinner />
              ) : isEditMode ? (
                <>
                  <FaEdit /> Update Product Item
                </>
              ) : (
                <>
                  <FaPlus /> Create Product Item
                </>
              )}
            </ModalButton>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <FormGroup>
            <Label htmlFor="name">
              <FaBox />
              Product Item Name
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Enter product item name (e.g., Shirt, Pant, Blazer)"
              required
              disabled={formLoading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="imageFile">
              <FaImage />
              Upload Image (Optional)
            </Label>
            <FileInputWrapper>
              <FileInputLabel htmlFor="imageFile">
                <FaUpload style={{ marginRight: '8px' }} />
                Choose Image File
                <input
                  type="file"
                  id="imageFile"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageFileChange}
                  disabled={formLoading}
                />
              </FileInputLabel>
              {selectedImageFile && (
                <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                  Selected: {selectedImageFile.name}
                </p>
              )}
            </FileInputWrapper>
            {imagePreview && (
              <ImagePreviewContainer>
                <ImagePreview src={imagePreview} alt="Preview" />
                <RemoveImageButton onClick={handleRemoveImage} type="button">
                  <FaTimes />
                </RemoveImageButton>
              </ImagePreviewContainer>
            )}
          </FormGroup>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title="Delete Product Item"
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
        {productItemToDelete && (
          <p>
            Are you sure you want to delete product item <strong>{productItemToDelete.name}</strong>?
            This action cannot be undone.
          </p>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ProductItemsPage;

