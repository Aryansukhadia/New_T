import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import {
  getProductVariantByIdService,
  getProductsService,
  getProductItemsService,
  updateProductVariantService,
  type ProductVariant,
  type Product,
  type ProductItem,
  type UpdateProductVariantRequest,
} from '../../Services/ApiServices';
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
  FaEdit,
  FaArrowLeft,
  FaImage,
  FaBox,
  FaShoppingBag,
  FaTags,
  FaUpload,
  FaTimes,
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

const BackButton = styled.button`
  padding: 12px 24px;
  background: #f5f5f5;
  color: #333;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #e8e8e8;
    border-color: #ccc;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ActionButton = styled(Button)`
  padding: 14px 28px;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;

  svg {
    font-size: 14px;
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #e0e0e0;
`;

const EditProductVariantPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { t } = useTranslation();

  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allProductItems, setAllProductItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState<UpdateProductVariantRequest>({
    name: '',
    description: null,
    photoUrl: null,
    productItemIds: [],
  });

  const [selectedProductItems, setSelectedProductItems] = useState<string[]>([]);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [variantResponse, productsResponse, itemsResponse] = await Promise.all([
        getProductVariantByIdService(id),
        getProductsService(),
        getProductItemsService(),
      ]);

      if (variantResponse.success === 200 && variantResponse.data) {
        const variantData = variantResponse.data;
        setVariant(variantData);
        setFormData({
          name: variantData.name,
          description: variantData.description || null,
          photoUrl: variantData.photoUrl || null,
          productItemIds: variantData.productItems?.map((item) => item.id) || [],
        });
        setSelectedProductItems(variantData.productItems?.map((item) => item.id) || []);
        setPhotoPreview(variantData.photoUrl ? variantData.photoUrl : null);
      } else {
        showError(variantResponse.message || 'Failed to load product variant', 'Error');
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
  }, [id, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    if (!id) return;

    setFormLoading(true);

    try {
      const updateData: UpdateProductVariantRequest = {
        name: formData.name,
        description: formData.description || null,
        photoUrl: formData.photoUrl || null,
        productItemIds: selectedProductItems.length > 0 ? selectedProductItems : undefined,
      };

      const response = await updateProductVariantService(id, updateData, selectedPhotoFile);

      if (response.success === 200) {
        showSuccess(response.message || 'Product variant updated successfully!', 'Success');
        setTimeout(() => {
          navigate('/dashboard/product-variants');
        }, 1000);
      } else {
        const errorMsg = response.message || 'Failed to update product variant';
        showError(errorMsg, 'Update Failed');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const errorMsg = axiosError.response?.data?.message || 'An error occurred';
        showError(errorMsg, 'Update Failed');
      } else {
        const errorMsg = 'An unexpected error occurred';
        showError(errorMsg, 'Update Failed');
      }
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingSpinner />
        </div>
      </PageContainer>
    );
  }

  if (!variant) {
    return (
      <PageContainer>
        <PageHeader>
          <PageTitle>Edit Product Variant</PageTitle>
          <BackButton onClick={() => navigate('/dashboard/product-variants')}>
            <FaArrowLeft /> Back to Variants
          </BackButton>
        </PageHeader>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Product variant not found
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>{t('productVariants.editVariant')} - {variant.name}</PageTitle>
        <BackButton onClick={() => navigate('/dashboard/product-variants')}>
          <FaArrowLeft /> {t('common.back')} {t('productVariants.title')}
        </BackButton>
      </PageHeader>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <FormRow>
          <FormGroup>
            <Label htmlFor="productId">
              <FaShoppingBag />
              {t('productVariants.product')}
            </Label>
            <Select
              id="productId"
              name="productId"
              value={variant.productId}
              disabled
              style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
            >
              <option value={variant.productId}>
                {variant.product?.name || t('productVariants.product')}
              </option>
            </Select>
            <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
              {t('productVariants.productCannotChange')}
            </p>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="name">
              <FaTags />
              {t('productVariants.variantName')} *
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
        </FormRow>

        <FormGroup>
          <Label htmlFor="description">{t('productVariants.description')} ({t('orders.optional')})</Label>
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
            {t('productVariants.uploadPhoto')} ({t('orders.optional')})
          </Label>
          <FileInputWrapper>
            <FileInputLabel htmlFor="photoFile">
              <FaUpload style={{ marginRight: '8px' }} />
              {t('productVariants.choosePhotoFile')}
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
            {t('productVariants.productItems')} ({t('orders.optional')})
          </Label>
          <CheckboxContainer>
            {allProductItems.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                {t('productVariants.noProductItems')}
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

        <FormActions>
          <BackButton type="button" onClick={() => navigate('/dashboard/product-variants')} disabled={formLoading}>
            {t('common.cancel')}
          </BackButton>
          <ActionButton type="submit" disabled={formLoading}>
            {formLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <FaEdit /> {t('productVariants.updateVariant')}
              </>
            )}
          </ActionButton>
        </FormActions>
      </form>
    </PageContainer>
  );
};

export default EditProductVariantPage;

