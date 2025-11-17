import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import {
  getProductVariantByIdService,
  getProductItemsService,
  updateProductVariantService,
  type ProductVariant,
  type ProductItem,
  type UpdateProductVariantRequest,
} from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import MUICustomBtn from '../../Components/Common/MUICustomBtn';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Image as ImageIcon,
  Inventory as BoxIcon,
  ShoppingBag as ShoppingBagIcon,
  LocalOffer as TagsIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const EditProductVariantPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { t } = useTranslation();

  const [variant, setVariant] = useState<ProductVariant | null>(null);
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
      const [variantResponse, itemsResponse] = await Promise.all([
        getProductVariantByIdService(id),
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

      if (itemsResponse.success === 200 && itemsResponse.data) {
        setAllProductItems(itemsResponse.data.productItems);
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
      <Card sx={{ borderRadius: 1.5, p: 3 }}>
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  if (!variant) {
    return (
      <Card sx={{ borderRadius: 1.5, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Edit Product Variant
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard/product-variants')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Back to Variants
          </Button>
        </Box>
        <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
          <Typography variant="body1">Product variant not found</Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 1.5, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('productVariants.editVariant')} - {variant.name}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/product-variants')}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {t('common.back')} {t('productVariants.title')}
        </Button>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Grid container spacing={2.5}>
          <Grid xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ShoppingBagIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t('productVariants.product')}
              </Typography>
            </Box>
            <TextField
              fullWidth
              id="productId"
              name="productId"
              value={variant.productId}
              disabled
              select
              sx={{ bgcolor: '#f5f5f5' }}
            >
              <MenuItem value={variant.productId}>
                {variant.product?.name || t('productVariants.product')}
              </MenuItem>
            </TextField>
            <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary', display: 'block' }}>
              {t('productVariants.productCannotChange')}
            </Typography>
          </Grid>

          <Grid xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TagsIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t('productVariants.variantName')} *
              </Typography>
            </Box>
            <TextField
              fullWidth
              id="name"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Enter variant name (e.g., Normal, 2 Piece, 3 Piece)"
              required
              disabled={formLoading}
            />
          </Grid>
        </Grid>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {t('productVariants.description')} ({t('orders.optional')})
          </Typography>
          <TextField
            fullWidth
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleFormChange}
            placeholder="Enter variant description (optional)"
            multiline
            rows={3}
            disabled={formLoading}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ImageIcon sx={{ fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {t('productVariants.uploadPhoto')} ({t('orders.optional')})
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
            {t('productVariants.choosePhotoFile')}
            <input
              type="file"
              hidden
              id="photoFile"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handlePhotoFileChange}
              disabled={formLoading}
            />
          </Button>
          {selectedPhotoFile && (
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              Selected: {selectedPhotoFile.name}
            </Typography>
          )}
          {photoPreview && (
            <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
              <Box
                component="img"
                src={photoPreview}
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
                onClick={handleRemovePhoto}
                tooltip="Remove photo"
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

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <BoxIcon sx={{ fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {t('productVariants.productItems')} ({t('orders.optional')})
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              maxHeight: 300,
              overflowY: 'auto',
              p: 1.5,
              border: '2px solid #e0e0e0',
              borderRadius: 1,
              bgcolor: '#fafafa',
            }}
          >
            {allProductItems.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2.5 }}>
                {t('productVariants.noProductItems')}
              </Typography>
            ) : (
              allProductItems.map((item) => (
                <FormControlLabel
                  key={item.id}
                  control={
                    <Checkbox
                      checked={selectedProductItems.includes(item.id)}
                      onChange={() => handleProductItemToggle(item.id)}
                      disabled={formLoading}
                    />
                  }
                  label={item.name}
                  sx={{
                    p: 1,
                    borderRadius: 0.5,
                    transition: 'background 0.2s',
                    '&:hover': {
                      bgcolor: '#f0f0f0',
                    },
                  }}
                />
              ))
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3, pt: 3, borderTop: '2px solid #e0e0e0' }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => navigate('/dashboard/product-variants')}
            disabled={formLoading}
            sx={{ textTransform: 'none', fontWeight: 600, minWidth: 140 }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formLoading}
            startIcon={formLoading ? <CircularProgress size={20} /> : <EditIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              },
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 140,
            }}
          >
            {formLoading ? '' : t('productVariants.updateVariant')}
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default EditProductVariantPage;

