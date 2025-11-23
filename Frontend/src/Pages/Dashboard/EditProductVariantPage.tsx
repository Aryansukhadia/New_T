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
  IconButton,
} from '@mui/material';
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
    imageUrl: null,
    productItemIds: [],
  });

  const [selectedProductItems, setSelectedProductItems] = useState<string[]>([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [originalImages, setOriginalImages] = useState<string[]>([]); // Original image URLs from server
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]); // URLs of images to be deleted

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
          imageUrl: variantData.imageUrl || null,
          productItemIds: variantData.productItems?.map((item) => item.id) || [],
        });
        setSelectedProductItems(variantData.productItems?.map((item) => item.id) || []);
        // Parse existing images
        const images = parseImages(variantData.imageUrl);
        setImagePreviews(images);
        setOriginalImages(images); // Store original images
        setDeletedImageUrls([]); // Reset deleted images
        setSelectedImageFiles([]); // Reset new uploads
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

  const parseImages = (imageUrl: string | null): string[] => {
    if (!imageUrl) return [];
    try {
      const parsed = JSON.parse(imageUrl);
      return Array.isArray(parsed) ? parsed : [imageUrl];
    } catch {
      return [imageUrl];
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'imageUrl' || name === 'description' ? (value === '' ? null : value) : value,
    }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files).slice(0, 5); // Limit to 5 files

      // Calculate remaining original images (not deleted) for slot calculation
      const remainingOriginalImages = originalImages.filter(
        (img) => !deletedImageUrls.includes(img)
      );

      // Get existing new upload previews (data URLs that are not original images)
      const existingNewUploadPreviews = imagePreviews.filter(
        (preview) => preview.startsWith('data:') && !originalImages.includes(preview)
      );

      const totalSlots = 5;
      const currentTotal = remainingOriginalImages.length + existingNewUploadPreviews.length;
      const availableSlots = totalSlots - currentTotal;
      const filesToAdd = fileArray.slice(0, availableSlots);

      if (filesToAdd.length === 0) {
        return; // No slots available
      }

      const newFiles = [...selectedImageFiles, ...filesToAdd];
      setSelectedImageFiles(newFiles);

      // Create previews: keep ALL original images (including deleted ones) + existing new uploads + new file previews
      // Deleted images should remain visible (blurred) in previews
      const newPreviews: string[] = [...originalImages, ...existingNewUploadPreviews];
      let loadedCount = 0;
      const totalNewFiles = filesToAdd.length;

      filesToAdd.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          loadedCount++;
          if (loadedCount === totalNewFiles) {
            setImagePreviews(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const imageToRemove = imagePreviews[index];

    // Calculate remaining original images (not deleted yet)
    const remainingOriginalImages = originalImages.filter(
      (img) => !deletedImageUrls.includes(img)
    );

    // Check if it's an original image (URL) or a new upload (data URL starts with "data:")
    const isOriginalImage = remainingOriginalImages.includes(imageToRemove);

    if (isOriginalImage) {
      // Add to deleted images array (but keep in previews - just blur it)
      setDeletedImageUrls((prev) => [...prev, imageToRemove]);
    } else {
      // It's a new upload (data URL), find the corresponding file index
      // New uploads are added after remaining original images
      const newImageIndex = index - remainingOriginalImages.length;
      if (newImageIndex >= 0 && newImageIndex < selectedImageFiles.length) {
        setSelectedImageFiles((prev) => prev.filter((_, i) => i !== newImageIndex));
        // Remove new uploads from previews (only blur original images)
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
      }
    }
  };

  const handleUndoDeleteImage = (imageUrl: string) => {
    // Remove from deleted images array
    setDeletedImageUrls((prev) => prev.filter((url) => url !== imageUrl));
  };

  const handleRemoveAllImages = () => {
    // Add all original images to deleted list (but keep in previews - just blur them)
    setDeletedImageUrls(originalImages);
    setSelectedImageFiles([]);
    // Keep original images in previews but remove new uploads
    setImagePreviews(originalImages);
    setFormData((prev) => ({ ...prev, imageUrl: null }));
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
      // Calculate remaining images (original images that weren't deleted)
      const remainingOriginalImages = originalImages.filter(
        (img) => !deletedImageUrls.includes(img)
      );

      // Only send truly new files that weren't in the original images
      const newImageFiles = selectedImageFiles; // These are already new files from file input

      // If there are new uploads, backend will combine them with remaining originals
      // Otherwise, send remaining original images
      let finalImageUrl: string | null = null;
      if (newImageFiles.length === 0 && remainingOriginalImages.length > 0) {
        // No new uploads, but we have remaining original images
        finalImageUrl = remainingOriginalImages.length === 1
          ? remainingOriginalImages[0]
          : JSON.stringify(remainingOriginalImages);
      } else if (newImageFiles.length === 0 && remainingOriginalImages.length === 0) {
        // All images deleted, no new images
        finalImageUrl = null;
      }
      // If newImageFiles.length > 0, finalImageUrl stays null
      // Backend will handle combining new uploads with remaining originals

      const updateData: UpdateProductVariantRequest = {
        name: formData.name,
        description: formData.description || null,
        imageUrl: finalImageUrl,
        productItemIds: selectedProductItems.length > 0 ? selectedProductItems : undefined,
      };

      const response = await updateProductVariantService(
        id,
        updateData,
        newImageFiles.length > 0 ? newImageFiles : null,
        deletedImageUrls.length > 0 ? deletedImageUrls : null
      );

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
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 2.5
        }}>
          <Box>
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
          </Box>

          <Box>
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
          </Box>
        </Box>

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
              {t('productVariants.uploadPhoto')} ({t('orders.optional')}) - Max 5 Images
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
              mb: 2,
            }}
          >
            {t('productVariants.choosePhotoFile')}
            <input
              type="file"
              hidden
              id="photoFile"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageFileChange}
              disabled={formLoading || imagePreviews.length >= 5}
            />
          </Button>
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
                {imagePreviews.map((preview, index) => {
                  const isDeleted = deletedImageUrls.includes(preview);
                  return (
                    <Box key={index} sx={{ position: 'relative', display: 'inline-block' }}>
                      <Box
                        component="img"
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: 1,
                          border: isDeleted ? '2px solid #dc3545' : '2px solid #e0e0e0',
                          objectFit: 'cover',
                          filter: isDeleted ? 'blur(4px) grayscale(100%) opacity(0.5)' : 'none',
                          transition: 'all 0.3s ease',
                          cursor: isDeleted ? 'not-allowed' : 'pointer',
                        }}
                      />
                      {!isDeleted && (
                        <IconButton
                          onClick={() => handleRemoveImage(index)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: '#dc3545',
                            color: 'white',
                            width: 24,
                            height: 24,
                            padding: 0,
                            '&:hover': {
                              bgcolor: '#c82333',
                              transform: 'scale(1.1)',
                            },
                          }}
                        >
                          <CloseIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      )}
                      {isDeleted && (
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUndoDeleteImage(preview);
                          }}
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            bgcolor: 'rgba(220, 53, 69, 0.9)',
                            color: 'white',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: 'rgba(220, 53, 69, 1)',
                              transform: 'translate(-50%, -50%) scale(1.05)',
                            },
                          }}
                        >
                          Undo Deleted
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
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

