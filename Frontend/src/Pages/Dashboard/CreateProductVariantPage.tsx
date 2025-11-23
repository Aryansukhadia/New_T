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
    const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
        const file = e.target.files?.[0];
        if (file) {
            setSelectedPhotoFile(file);
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
        setFormData((prev) => ({ ...prev, imageUrl: null }));
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

            const response = await createProductVariantService(createData, selectedPhotoFile ? [selectedPhotoFile] : null);

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
        <Card sx={{ borderRadius: 1.5, p: 3 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {t('productVariants.createNewVariant')}
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

