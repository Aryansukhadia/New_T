import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Card,
    Typography,
    Button,
    TextField,
    CircularProgress,
} from '@mui/material';
import MUICustomBtn from '../../../Components/Common/MUICustomBtn';
import {
    Edit as EditIcon,
    ArrowBack as ArrowBackIcon,
    Image as ImageIcon,
    Upload as UploadIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import {
    getReadyMadeInventoryByIdService,
    updateReadyMadeInventoryService,
    type ReadyMadeInventoryItem,
    type UpdateReadyMadeInventoryRequest,
} from '../../../Services/ApiServices';
import { useToast } from '../../../Utils/ToastContext';

const EditReadyMadeInventoryPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

    const [inventory, setInventory] = useState<ReadyMadeInventoryItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState<UpdateReadyMadeInventoryRequest>({
        name: '',
        color: '',
        imageUrl: null,
        price: 0,
        quantity: 0,
        sizeLabel: null,
        sizeNumber: null,
    });

    const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [originalImages, setOriginalImages] = useState<string[]>([]);
    const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);

    const parseImages = (imageUrl: string | null): string[] => {
        if (!imageUrl) return [];
        try {
            const parsed = JSON.parse(imageUrl);
            return Array.isArray(parsed) ? parsed : [imageUrl];
        } catch {
            return [imageUrl];
        }
    };

    const fetchData = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            const response = await getReadyMadeInventoryByIdService(id);

            if (response.success === 200 && response.data) {
                const inventoryData = response.data;
                setInventory(inventoryData);
                setFormData({
                    name: inventoryData.name,
                    color: inventoryData.readyMade?.color || '',
                    imageUrl: inventoryData.readyMade?.imageUrl || null,
                    price: inventoryData.readyMade?.price || 0,
                    quantity: inventoryData.readyMade?.quantity || 0,
                    sizeLabel: inventoryData.readyMade?.sizeLabel || null,
                    sizeNumber: inventoryData.readyMade?.sizeNumber || null,
                });
                const images = inventoryData.readyMade ? parseImages(inventoryData.readyMade.imageUrl) : [];
                setImagePreviews(images);
                setOriginalImages(images);
                setDeletedImageUrls([]);
                setSelectedImageFiles([]);
            } else {
                showError(response.message || 'Failed to load ready-made inventory', 'Error');
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

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'imageUrl'
                ? (value === '' ? null : value)
                : name === 'price'
                    ? (value === '' ? (prev.price || 0) : parseFloat(value) || (prev.price || 0))
                    : name === 'quantity' || name === 'sizeNumber'
                        ? (value === '' ? (name === 'quantity' ? (prev.quantity || 0) : null) : parseInt(value, 10) || (name === 'quantity' ? (prev.quantity || 0) : null))
                        : name === 'sizeLabel'
                            ? (value === '' ? null : value)
                            : value,
        }));
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const remainingOriginalImages = originalImages.filter(
                (img) => !deletedImageUrls.includes(img)
            );
            const existingNewUploadPreviews = imagePreviews.filter(
                (preview) => preview.startsWith('data:') && !originalImages.includes(preview)
            );
            const totalSlots = 5;
            const currentTotal = remainingOriginalImages.length + existingNewUploadPreviews.length;
            const availableSlots = totalSlots - currentTotal;
            const filesToAdd = Array.from(files).slice(0, availableSlots);

            if (filesToAdd.length === 0) {
                return;
            }

            const newFiles = [...selectedImageFiles, ...filesToAdd];
            setSelectedImageFiles(newFiles);

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
        e.target.value = '';
    };

    const handleRemoveImage = (index: number) => {
        const imageToRemove = imagePreviews[index];
        const isOriginalImage = originalImages.includes(imageToRemove);

        if (isOriginalImage) {
            setDeletedImageUrls((prev) => [...prev, imageToRemove]);
        } else {
            const fileIndex = index - originalImages.length;
            if (fileIndex >= 0 && fileIndex < selectedImageFiles.length) {
                setSelectedImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
                setImagePreviews((prev) => prev.filter((_, i) => i !== index));
            }
        }
    };

    const handleUndoDeleteImage = (imageUrl: string) => {
        setDeletedImageUrls((prev) => prev.filter((url) => url !== imageUrl));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setFormLoading(true);

        try {
            if (formData.price !== undefined && (!formData.price || formData.price <= 0)) {
                showError('Price is required and must be greater than 0', 'Validation Error');
                setFormLoading(false);
                return;
            }

            // Check if at least one of sizeLabel or sizeNumber is provided
            const hasSizeLabel = formData.sizeLabel !== undefined && formData.sizeLabel !== null && formData.sizeLabel !== '';
            const hasSizeNumber = formData.sizeNumber !== undefined && formData.sizeNumber !== null;
            const currentSizeLabel = hasSizeLabel ? formData.sizeLabel : (inventory?.readyMade?.sizeLabel || null);
            const currentSizeNumber = hasSizeNumber ? formData.sizeNumber : (inventory?.readyMade?.sizeNumber || null);

            if (!currentSizeLabel && (currentSizeNumber === null || currentSizeNumber === undefined)) {
                showError('Either Size Label or Size Number is required', 'Validation Error');
                setFormLoading(false);
                return;
            }

            const updateData: UpdateReadyMadeInventoryRequest = {
                ...formData,
            };

            const response = await updateReadyMadeInventoryService(
                id,
                updateData,
                selectedImageFiles.length > 0 ? selectedImageFiles : null,
                deletedImageUrls.length > 0 ? deletedImageUrls : null
            );

            if (response.success === 200) {
                showSuccess(response.message || 'Ready-made inventory updated successfully!', 'Success');
                setTimeout(() => {
                    navigate('/dashboard/inventory/ready-made-inventory');
                }, 1000);
            } else {
                const errorMsg = response.message || 'Failed to update ready-made inventory';
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

    if (!inventory) {
        return (
            <Card sx={{ borderRadius: 1.5, p: 3 }}>
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="body1" color="error">
                        Ready-made inventory not found
                    </Typography>
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
                    Edit Ready-Made Inventory
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/dashboard/inventory/ready-made-inventory')}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    Back to Ready-Made Inventory
                </Button>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 2.5
                }}>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Name *
                        </Typography>
                        <TextField
                            fullWidth
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            required
                            disabled={formLoading}
                        />
                    </Box>

                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Color *
                        </Typography>
                        <TextField
                            fullWidth
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleFormChange}
                            required
                            disabled={formLoading}
                        />
                    </Box>

                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Price *
                        </Typography>
                        <TextField
                            fullWidth
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price || ''}
                            onChange={handleFormChange}
                            required
                            disabled={formLoading}
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </Box>
                </Box>

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 2.5
                }}>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Quantity
                        </Typography>
                        <TextField
                            fullWidth
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={formData.quantity || ''}
                            onChange={handleFormChange}
                            disabled={formLoading}
                            inputProps={{ min: 0 }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Size Label *
                        </Typography>
                        <TextField
                            fullWidth
                            id="sizeLabel"
                            name="sizeLabel"
                            value={formData.sizeLabel || ''}
                            onChange={handleFormChange}
                            placeholder="M, L, XL, FreeSize"
                            disabled={formLoading}
                        />
                    </Box>
                </Box>

                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Size Number *
                    </Typography>
                    <TextField
                        fullWidth
                        type="number"
                        id="sizeNumber"
                        name="sizeNumber"
                        value={formData.sizeNumber || ''}
                        onChange={handleFormChange}
                        placeholder="30, 32, 34, 36..."
                        disabled={formLoading}
                        inputProps={{ min: 0 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        * At least one of Size Label or Size Number is required
                    </Typography>
                </Box>

                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ImageIcon sx={{ fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Upload Photo
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
                        Choose Photo File
                        <input
                            type="file"
                            hidden
                            id="photoFile"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleImageFileChange}
                            disabled={formLoading}
                            multiple
                        />
                    </Button>
                    {imagePreviews.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {imagePreviews.map((preview, index) => {
                                const isDeleted = deletedImageUrls.includes(preview);
                                return (
                                    <Box key={index} sx={{ position: 'relative', display: 'inline-block' }}>
                                        <Box
                                            component="img"
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            sx={{
                                                width: 150,
                                                height: 150,
                                                borderRadius: 1,
                                                border: isDeleted ? '2px solid #dc3545' : '2px solid #e0e0e0',
                                                objectFit: 'cover',
                                                opacity: isDeleted ? 0.5 : 1,
                                                filter: isDeleted ? 'blur(2px)' : 'none',
                                            }}
                                        />
                                        {!isDeleted && (
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
                                                    zIndex: 1,
                                                    '&:hover': {
                                                        bgcolor: '#c82333',
                                                        transform: 'scale(1.1)',
                                                    },
                                                }}
                                            >
                                                <CloseIcon sx={{ fontSize: 16 }} />
                                            </MUICustomBtn>
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
                                                    bgcolor: 'rgba(40, 167, 69, 0.95)',
                                                    color: 'white',
                                                    px: 1.5,
                                                    py: 0.75,
                                                    borderRadius: 1,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    zIndex: 2,
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                                                    '&:hover': {
                                                        bgcolor: 'rgba(40, 167, 69, 1)',
                                                        transform: 'translate(-50%, -50%) scale(1.05)',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                                    },
                                                }}
                                            >
                                                Undo Delete
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
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
                        onClick={() => navigate('/dashboard/inventory/ready-made-inventory')}
                        disabled={formLoading}
                        tooltip="Cancel and go back to ready-made inventory"
                        sx={{ textTransform: 'none', fontWeight: 600, minWidth: 140 }}
                    >
                        Cancel
                    </MUICustomBtn>
                    <MUICustomBtn
                        type="submit"
                        variant="contained"
                        disabled={formLoading}
                        startIcon={formLoading ? <CircularProgress size={20} /> : <EditIcon />}
                        tooltip="Update ready-made inventory"
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
                        {formLoading ? '' : 'Update Ready-Made'}
                    </MUICustomBtn>
                </Box>
            </Box>
        </Card>
    );
};

export default EditReadyMadeInventoryPage;

