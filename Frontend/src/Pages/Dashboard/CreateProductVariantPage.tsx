import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    Typography,
    Button,
    TextField,
    CircularProgress,
    Checkbox,
    FormControlLabel,
    MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import MUICustomBtn from '../../Components/Common/MUICustomBtn';
import {
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    Image as ImageIcon,
    Inventory as InventoryIcon,
    ShoppingBag as ShoppingBagIcon,
    LocalOffer as LocalOfferIcon,
    Upload as UploadIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { useTranslation } from '../../hooks/useTranslation';
import {
    getProductsService,
    getProductItemsService,
    createProductVariantService,
    type Product,
    type ProductItem,
    type CreateProductVariantRequest,
} from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';

const CreateProductVariantPage = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const { t } = useTranslation();

    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allProductItems, setAllProductItems] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState<CreateProductVariantRequest>({
        productId: '',
        name: '',
        description: null,
        imageUrl: null,
        productItemIds: [],
    });

    const [selectedProductItems, setSelectedProductItems] = useState<string[]>([]);
    const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [productsResponse, itemsResponse] = await Promise.all([
                getProductsService(),
                getProductItemsService(),
            ]);

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

    // Parse imageUrl from formData and update previews
    const parseImages = (imageUrl: string | null): string[] => {
        if (!imageUrl) return [];
        try {
            const parsed = JSON.parse(imageUrl);
            return Array.isArray(parsed) ? parsed : [imageUrl];
        } catch {
            return [imageUrl];
        }
    };

    // Update imageUrls when formData.imageUrl changes
    useEffect(() => {
        const parsedUrls = parseImages(formData.imageUrl || null);
        setImageUrls(parsedUrls);
        // Update previews: URL images first, then file previews
        setImagePreviews((prev) => {
            const filePreviews = prev.filter(preview => preview.startsWith('data:'));
            return [...parsedUrls, ...filePreviews];
        });
    }, [formData.imageUrl]);

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'imageUrl' || name === 'description' ? (value === '' ? null : value) : value,
        }));
    };

    const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const totalSlots = 5;
            // Count both URL images and file uploads
            const currentTotal = imageUrls.length + selectedImageFiles.length;
            const availableSlots = totalSlots - currentTotal;

            if (availableSlots <= 0) {
                showError('Maximum 5 images allowed', 'Limit Reached');
                return;
            }

            const fileArray = Array.from(files).slice(0, availableSlots);
            const newFiles = [...selectedImageFiles, ...fileArray];
            setSelectedImageFiles(newFiles);

            // Create previews for new files (keep URL images + existing file previews + new file previews)
            const existingFilePreviews = imagePreviews.filter(preview => preview.startsWith('data:'));
            const newPreviews: string[] = [...imageUrls, ...existingFilePreviews];
            let loadedCount = 0;
            const totalNewFiles = fileArray.length;

            fileArray.forEach((file) => {
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
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    const handleRemoveImage = (index: number) => {
        const imageToRemove = imagePreviews[index];

        // Check if it's a URL image (not a data URL) or a file preview (starts with data:)
        const isUrlImage = !imageToRemove.startsWith('data:') && imageUrls.includes(imageToRemove);

        if (isUrlImage) {
            // Find the actual index in imageUrls array
            const urlIndex = imageUrls.findIndex(url => url === imageToRemove);
            if (urlIndex !== -1) {
                // Remove from URL images
                const newImageUrls = imageUrls.filter((_, i) => i !== urlIndex);
                setImageUrls(newImageUrls);
                // Update formData.imageUrl
                const newImageUrl = newImageUrls.length === 0
                    ? null
                    : newImageUrls.length === 1
                        ? newImageUrls[0]
                        : JSON.stringify(newImageUrls);
                setFormData((prev) => ({ ...prev, imageUrl: newImageUrl }));
                // Update previews: URL images + file previews
                const filePreviews = imagePreviews.filter(preview => preview.startsWith('data:'));
                setImagePreviews([...newImageUrls, ...filePreviews]);
            }
        } else {
            // It's a file upload - find the corresponding file index
            // File previews come after URL images in imagePreviews
            const fileIndex = index - imageUrls.length;
            if (fileIndex >= 0 && fileIndex < selectedImageFiles.length) {
                setSelectedImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
                // Update previews: keep URL images, remove the file preview at this index
                setImagePreviews((prev) => {
                    const filePreviews = prev.filter(preview => preview.startsWith('data:'));
                    const newFilePreviews = filePreviews.filter((_, i) => i !== fileIndex);
                    return [...imageUrls, ...newFilePreviews];
                });
            }
        }
    };

    const handleProductItemToggle = (itemId: string) => {
        setSelectedProductItems((prev) =>
            prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const createData: CreateProductVariantRequest = {
                productId: formData.productId,
                name: formData.name,
                description: formData.description || null,
                imageUrl: formData.imageUrl || null,
                productItemIds: selectedProductItems.length > 0 ? selectedProductItems : [],
            };

            const response = await createProductVariantService(createData, selectedImageFiles.length > 0 ? selectedImageFiles : null);

            if (response.success === 201) {
                showSuccess(response.message || 'Product variant created successfully!', 'Success');
                setTimeout(() => {
                    navigate('/dashboard/product-variants');
                }, 1000);
            } else {
                const errorMsg = response.message || 'Failed to create product variant';
                showError(errorMsg, 'Create Failed');
            }
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                const errorMsg = axiosError.response?.data?.message || 'An error occurred';
                showError(errorMsg, 'Create Failed');
            } else {
                const errorMsg = 'An unexpected error occurred';
                showError(errorMsg, 'Create Failed');
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

    return (
        <Card sx={{ borderRadius: 1.5, p: { xs: 2, sm: 3 } }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    mb: 3,
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                }}
            >
                <Typography variant="h5" sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }}>
                    {t('productVariants.createNewVariant')}
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/dashboard/product-variants')}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        px: 2,
                        py: 1,
                    }}
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
                                {t('productVariants.product')} *
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            select
                            id="productId"
                            name="productId"
                            value={formData.productId}
                            onChange={handleFormChange}
                            required
                            disabled={formLoading}
                        >
                            <MenuItem value="">{t('common.select')} {t('productVariants.product')}</MenuItem>
                            {allProducts.map((product) => (
                                <MenuItem key={product.id} value={product.id}>
                                    {product.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocalOfferIcon sx={{ fontSize: 20 }} />
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
                            multiple
                        />
                    </Button>
                    {imagePreviews.length > 0 && (
                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                            {imagePreviews.length} image(s) selected ({imageUrls.length} URL(s), {selectedImageFiles.length} file(s))
                        </Typography>
                    )}
                    {imagePreviews.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {imagePreviews.map((preview, index) => (
                                <Box key={index} sx={{ position: 'relative', display: 'inline-block' }}>
                                    <Box
                                        component="img"
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        sx={{
                                            width: 150,
                                            height: 150,
                                            borderRadius: 1,
                                            border: '2px solid #e0e0e0',
                                            objectFit: 'cover',
                                        }}
                                    />
                                    <MUICustomBtn
                                        onClick={() => handleRemoveImage(index)}
                                        tooltip="Remove image"
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
                            ))}
                        </Box>
                    )}
                </Box>

                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <InventoryIcon sx={{ fontSize: 20 }} />
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
                            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
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
                                        '&:hover': {
                                            bgcolor: '#f0f0f0',
                                        },
                                    }}
                                />
                            ))
                        )}
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1.5,
                        mt: 3,
                        pt: 3,
                        borderTop: '2px solid #e0e0e0',
                        flexDirection: { xs: 'column', sm: 'row' },
                    }}
                >
                    <MUICustomBtn
                        type="button"
                        variant="outlined"
                        onClick={() => navigate('/dashboard/product-variants')}
                        disabled={formLoading}
                        tooltip="Cancel and go back to product variants"
                        sx={{ textTransform: 'none', fontWeight: 600, minWidth: 140 }}
                    >
                        {t('common.cancel')}
                    </MUICustomBtn>
                    <MUICustomBtn
                        type="submit"
                        variant="contained"
                        disabled={formLoading}
                        startIcon={formLoading ? <CircularProgress size={20} /> : <AddIcon />}
                        tooltip="Create new product variant"
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
                        {formLoading ? '' : t('productVariants.createVariant')}
                    </MUICustomBtn>
                </Box>
            </Box>
        </Card>
    );
};

export default CreateProductVariantPage;

