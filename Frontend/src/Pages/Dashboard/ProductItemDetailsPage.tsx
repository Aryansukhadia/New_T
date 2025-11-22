import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  IconButton,
  Stack,
  TextField,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Category as CategoryIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Inventory as InventoryIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import {
  getProductItemByIdService,
  updateProductItemService,
  type ProductItem,
  type UpdateProductItemRequest,
} from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';

interface ProductItemDetails extends ProductItem {
  variants?: Array<{
    id: string;
    name: string;
    productId: string;
    description: string | null;
    photoUrl: string | null;
    createdAt: string;
  }>;
  itemStatuses?: Array<{
    id: string;
    status: string;
    updatedAt: string;
    remarks: string | null;
    updatedBy: {
      userId: string;
      fullName: string;
      emailId: string;
    } | null;
    orderItem: {
      id: string;
      productOrderId: string;
      quantity: number;
    } | null;
  }>;
}

const ProductItemDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const { showSuccess, showError } = useToast();

  const [productItem, setProductItem] = useState<ProductItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: null as string | null,
  });
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [originalImages, setOriginalImages] = useState<string[]>([]); // Original image URLs from server
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]); // URLs of images to be deleted

  const fetchProductItemDetails = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await getProductItemByIdService(id);
      if (response.success === 200 && response.data) {
        const data = response.data as ProductItemDetails;
        setProductItem(data);
        // Initialize form data
        setFormData({
          name: data.name,
          imageUrl: data.imageUrl,
        });
        // Parse existing images
        const images = parseImages(data.imageUrl);
        setImagePreviews(images);
        setOriginalImages(images); // Store original images
        setDeletedImageUrls([]); // Reset deleted images
      } else {
        showError(response.message || 'Failed to load product item details', 'Error');
      }
    } catch (err: unknown) {
      console.error('Error fetching product item details:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'Failed to load product item details', 'Error');
      } else {
        showError('Failed to load product item details. Please try again.', 'Error');
      }
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    if (id) {
      fetchProductItemDetails();
    }
  }, [id, fetchProductItemDetails]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'cutting':
      case 'redaytostich':
        return 'info';
      case 'stitching':
      case 'readytofinishing':
        return 'primary';
      case 'finishing':
        return 'secondary';
      case 'readytodeliver':
        return 'success';
      default:
        return 'default';
    }
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
      const remainingOriginalImages = originalImages.filter(
        (img) => !deletedImageUrls.includes(img)
      );
      const totalSlots = 5;
      const availableSlots = totalSlots - remainingOriginalImages.length;
      const filesToAdd = fileArray.slice(0, availableSlots);

      const newFiles = [...selectedImageFiles, ...filesToAdd];
      setSelectedImageFiles(newFiles);

      // Create previews for new files and keep existing previews (remaining original + new)
      const newPreviews: string[] = [...remainingOriginalImages];
      let loadedCount = 0;
      const totalNewFiles = filesToAdd.length;

      if (totalNewFiles === 0) {
        setImagePreviews(newPreviews);
        return;
      }

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

  const handleSave = async () => {
    if (!productItem || !id) return;

    setFormLoading(true);

    try {
      // Calculate remaining images (original images that weren't deleted)
      const remainingOriginalImages = originalImages.filter(
        (img) => !deletedImageUrls.includes(img)
      );

      // Filter out any files that might be duplicates of existing images
      // Only send truly new files that weren't in the original images
      // Note: We can't directly compare File objects to URLs, so we rely on the fact that
      // selectedImageFiles only contains newly uploaded files (not existing ones)
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

      const updateData: UpdateProductItemRequest = {
        name: formData.name,
        imageUrl: finalImageUrl,
      };

      const response = await updateProductItemService(
        id,
        updateData,
        newImageFiles.length > 0 ? newImageFiles : null,
        deletedImageUrls.length > 0 ? deletedImageUrls : null
      );

      if (response.success === 200) {
        showSuccess(response.message || 'Product item updated successfully!', 'Success');
        // Refresh data and exit edit mode
        await fetchProductItemDetails();
        navigate(`/dashboard/product-items/${id}`);
      } else {
        const errorMsg = response.message || 'Failed to update product item';
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

  const handleCancel = () => {
    // Reset form data to original values
    if (productItem) {
      setFormData({
        name: productItem.name,
        imageUrl: productItem.imageUrl,
      });
      const images = parseImages(productItem.imageUrl);
      setImagePreviews(images);
      setOriginalImages(images);
      setSelectedImageFiles([]);
      setDeletedImageUrls([]);
    }
    navigate(`/dashboard/product-items/${id}`);
  };

  const handleEdit = () => {
    navigate(`/dashboard/product-items/${id}?edit=true`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!productItem) {
    return (
      <Card sx={{ borderRadius: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Product Item Details
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard/product-items')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Back to Product Items
          </Button>
        </Box>
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Typography variant="body1">
            Product item not found
          </Typography>
        </Box>
      </Card>
    );
  }

  const images = isEditMode ? imagePreviews : parseImages(productItem.imageUrl);
  const mainImage = images[selectedImageIndex] || images[0] || '';

  return (
    <Box>
      {/* Breadcrumb and Back Button */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/product-items')}
          sx={{ textTransform: 'none', color: '#666' }}
        >
          Back to Product Items
        </Button>
        {!isEditMode && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
              },
            }}
          >
            Edit Product Item
          </Button>
        )}
      </Box>

      <Card sx={{ borderRadius: 2, p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* Left Side - Image Gallery */}
          <Box sx={{ width: { xs: '100%', md: '40%' } }}>
            <Box sx={{ position: 'relative' }}>

              {/* Main Image Display */}
              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '1',
                  bgcolor: '#fff',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {mainImage ? (
                  <>
                    <Box
                      component="img"
                      src={mainImage}
                      alt={productItem.name}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        cursor: deletedImageUrls.includes(mainImage) ? 'not-allowed' : 'pointer',
                        transition: 'transform 0.3s ease',
                        filter: deletedImageUrls.includes(mainImage)
                          ? 'blur(4px) grayscale(100%) opacity(0.5)'
                          : 'none',
                        '&:hover': {
                          transform: deletedImageUrls.includes(mainImage) ? 'none' : 'scale(1.05)',
                        },
                      }}
                      onClick={() => !deletedImageUrls.includes(mainImage) && window.open(mainImage, '_blank')}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {deletedImageUrls.includes(mainImage) && (
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUndoDeleteImage(mainImage);
                        }}
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          bgcolor: 'rgba(220, 53, 69, 0.9)',
                          color: 'white',
                          px: 3,
                          py: 1.5,
                          borderRadius: 2,
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                          zIndex: 1,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'rgba(220, 53, 69, 1)',
                            transform: 'translate(-50%, -50%) scale(1.05)',
                          },
                        }}
                      >
                        Click to Undo Deletion
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', color: '#999' }}>
                    <InventoryIcon sx={{ fontSize: 64, mb: 1 }} />
                    <Typography variant="body2">No Image Available</Typography>
                  </Box>
                )}
              </Box>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    overflowX: 'auto',
                    pb: 1,
                    '&::-webkit-scrollbar': {
                      height: 6,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: '#ccc',
                      borderRadius: 3,
                    },
                  }}
                >
                  {images.map((img, index) => {
                    const isDeleted = deletedImageUrls.includes(img);
                    return (
                      <Box
                        key={index}
                        onClick={() => !isDeleted && setSelectedImageIndex(index)}
                        sx={{
                          minWidth: 80,
                          width: 80,
                          height: 80,
                          borderRadius: 1,
                          border: selectedImageIndex === index
                            ? '3px solid #1976d2'
                            : isDeleted
                              ? '2px solid #dc3545'
                              : '2px solid #e0e0e0',
                          overflow: 'hidden',
                          cursor: isDeleted ? 'not-allowed' : 'pointer',
                          bgcolor: '#fff',
                          transition: 'all 0.2s ease',
                          opacity: isDeleted ? 0.6 : 1,
                          '&:hover': {
                            borderColor: isDeleted ? '#dc3545' : '#1976d2',
                            transform: isDeleted ? 'none' : 'scale(1.05)',
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={img}
                          alt={`${productItem.name} ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: isDeleted ? 'blur(3px) grayscale(100%)' : 'none',
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>

          {/* Right Side - Product Information */}
          <Box sx={{ width: { xs: '100%', md: '60%' } }}>
            <Box>
              {/* Product Title / Name Field */}
              {isEditMode ? (
                <TextField
                  fullWidth
                  label="Product Item Name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  disabled={formLoading}
                  sx={{ mb: 2 }}
                />
              ) : (
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    color: '#1a1a1a',
                    lineHeight: 1.3,
                  }}
                >
                  {productItem.name}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Image Upload Section (Edit Mode) */}
              {isEditMode && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ImageIcon sx={{ fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Upload Images (Optional - Max 5)
                    </Typography>
                  </Box>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    disabled={formLoading || imagePreviews.length >= 5}
                    sx={{
                      textTransform: 'none',
                      mb: 2,
                    }}
                  >
                    Choose Image Files
                    <input
                      type="file"
                      hidden
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
              )}

              {/* Key Information Cards */}
              <Stack spacing={2} sx={{ mb: 3 }}>
                <Card
                  sx={{
                    p: 2,
                    bgcolor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Created Date
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#666', ml: 4 }}>
                    {formatDate(productItem.createdAt)}
                  </Typography>
                </Card>

                {/* Action Buttons (Edit Mode) */}
                {isEditMode && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={formLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                      onClick={handleSave}
                      disabled={formLoading || !formData.name.trim()}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                        },
                        flex: 1,
                      }}
                    >
                      {formLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={formLoading}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        flex: 1,
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}

                {productItem.variants && productItem.variants.length > 0 && (
                  <Card
                    sx={{
                      p: 2,
                      bgcolor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CategoryIcon sx={{ color: '#2196f3', fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Product Variants
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#666', ml: 4 }}>
                      {productItem.variants.length} variant(s) available
                    </Typography>
                  </Card>
                )}

                {productItem.itemStatuses && productItem.itemStatuses.length > 0 && (
                  <Card
                    sx={{
                      p: 2,
                      bgcolor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <HistoryIcon sx={{ color: '#ff9800', fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Status History
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#666', ml: 4 }}>
                      {productItem.itemStatuses.length} status update(s) recorded
                    </Typography>
                  </Card>
                )}
              </Stack>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Product Variants Section */}
        {productItem.variants && productItem.variants.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CategoryIcon sx={{ fontSize: 24, color: '#2196f3' }} />
              Product Variants
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Variant Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Created At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productItem.variants.map((variant) => (
                    <TableRow key={variant.id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {variant.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {variant.description || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {formatDate(variant.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Item Statuses Section */}
        {productItem.itemStatuses && productItem.itemStatuses.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon sx={{ fontSize: 24, color: '#ff9800' }} />
              Status History
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Updated By</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Updated At</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#666' }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productItem.itemStatuses.map((status) => (
                    <TableRow key={status.id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                      <TableCell>
                        <Chip
                          label={status.status.replace(/([A-Z])/g, ' $1').trim()}
                          color={getStatusColor(status.status)}
                          size="small"
                          sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        {status.updatedBy ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {status.updatedBy.fullName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              {status.updatedBy.emailId}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: '#999' }}>—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {formatDate(status.updatedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {status.remarks || '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Empty States */}
        {(!productItem.variants || productItem.variants.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary', mb: 3 }}>
            <CategoryIcon sx={{ fontSize: 48, mb: 1, color: '#ccc' }} />
            <Typography variant="body1">
              No product variants associated with this item
            </Typography>
          </Box>
        )}

        {(!productItem.itemStatuses || productItem.itemStatuses.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <HistoryIcon sx={{ fontSize: 48, mb: 1, color: '#ccc' }} />
            <Typography variant="body1">
              No status history available for this item
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default ProductItemDetailsPage;
