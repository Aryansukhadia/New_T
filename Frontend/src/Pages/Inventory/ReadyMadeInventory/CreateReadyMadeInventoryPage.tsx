import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    Image as ImageIcon,
    Upload as UploadIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import {
    createReadyMadeInventoryService,
    type CreateReadyMadeInventoryRequest,
} from '../../../Services/ApiServices';
import { useToast } from '../../../Utils/ToastContext';

const CreateReadyMadeInventoryPage = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState<CreateReadyMadeInventoryRequest>({
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
    const [imageUrls, setImageUrls] = useState<string[]>([]);

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
        setImagePreviews((prev) => {
            const filePreviews = prev.filter(preview => preview.startsWith('data:'));
            return [...parsedUrls, ...filePreviews];
        });
    }, [formData.imageUrl]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'imageUrl'
                ? (value === '' ? null : value)
                : name === 'price'
                    ? (value === '' ? 0 : parseFloat(value) || 0)
                    : name === 'quantity' || name === 'sizeNumber'
                        ? (value === '' ? (name === 'quantity' ? 0 : null) : parseInt(value, 10) || (name === 'quantity' ? 0 : null))
                        : name === 'sizeLabel'
                            ? (value === '' ? null : value)
                            : value,
        }));
    };

    const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const totalSlots = 5;
            const currentTotal = imageUrls.length + selectedImageFiles.length;
            const availableSlots = totalSlots - currentTotal;

            if (availableSlots <= 0) {
                showError('Maximum 5 images allowed', 'Limit Reached');
                return;
            }

            const fileArray = Array.from(files).slice(0, availableSlots);
            const newFiles = [...selectedImageFiles, ...fileArray];
            setSelectedImageFiles(newFiles);

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
        e.target.value = '';
    };

    const handleRemoveImage = (index: number) => {
        const imageToRemove = imagePreviews[index];
        const isUrlImage = !imageToRemove.startsWith('data:') && imageUrls.includes(imageToRemove);

        if (isUrlImage) {
            const urlIndex = imageUrls.findIndex(url => url === imageToRemove);
            if (urlIndex !== -1) {
                const newImageUrls = imageUrls.filter((_, i) => i !== urlIndex);
                setImageUrls(newImageUrls);
                const newImageUrl = newImageUrls.length === 0
                    ? null
                    : newImageUrls.length === 1
                        ? newImageUrls[0]
                        : JSON.stringify(newImageUrls);
                setFormData((prev) => ({ ...prev, imageUrl: newImageUrl }));
                const filePreviews = imagePreviews.filter(preview => preview.startsWith('data:'));
                setImagePreviews([...newImageUrls, ...filePreviews]);
            }
        } else {
            const fileIndex = index - imageUrls.length;
            if (fileIndex >= 0 && fileIndex < selectedImageFiles.length) {
                setSelectedImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
                setImagePreviews((prev) => {
                    const filePreviews = prev.filter(preview => preview.startsWith('data:'));
                    const newFilePreviews = filePreviews.filter((_, i) => i !== fileIndex);
                    return [...imageUrls, ...newFilePreviews];
                });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            if (selectedImageFiles.length === 0 && !formData.imageUrl) {
                showError('Please upload at least one image', 'Validation Error');
                setFormLoading(false);
                return;
            }

            if (!formData.price || formData.price <= 0) {
                showError('Price is required and must be greater than 0', 'Validation Error');
                setFormLoading(false);
                return;
            }

            if (!formData.sizeLabel && (!formData.sizeNumber || formData.sizeNumber === null)) {
                showError('Either Size Label or Size Number is required', 'Validation Error');
                setFormLoading(false);
                return;
            }

            const createData: CreateReadyMadeInventoryRequest = {
                ...formData,
            };

            const response = await createReadyMadeInventoryService(createData, selectedImageFiles.length > 0 ? selectedImageFiles : null);

            if (response.success === 201) {
                showSuccess(response.message || 'Ready-made inventory created successfully!', 'Success');
                setTimeout(() => {
                    navigate('/dashboard/inventory/ready-made-inventory');
                }, 1000);
            } else {
                const errorMsg = response.message || 'Failed to create ready-made inventory';
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
                    Create New Ready-Made Inventory
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
                            placeholder="Enter inventory name"
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
                            placeholder="Enter color"
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
                            placeholder="0.00"
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
                            placeholder="0"
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
                            Upload Photo *
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
                        startIcon={formLoading ? <CircularProgress size={20} /> : <AddIcon />}
                        tooltip="Create new ready-made inventory"
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
                        {formLoading ? '' : 'Create Ready-Made'}
                    </MUICustomBtn>
                </Box>
            </Box>
        </Card>
    );
};

export default CreateReadyMadeInventoryPage;

