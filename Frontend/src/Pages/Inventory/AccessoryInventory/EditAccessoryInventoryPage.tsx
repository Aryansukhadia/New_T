import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Card,
    Typography,
    Button,
    TextField,
    CircularProgress,
    IconButton,
} from '@mui/material';
import MUICustomBtn from '../../../Components/Common/MUICustomBtn';
import {
    Edit as EditIcon,
    ArrowBack as ArrowBackIcon,
    Image as ImageIcon,
    Upload as UploadIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import {
    getAccessoryInventoryByIdService,
    updateAccessoryInventoryService,
    type AccessoryInventoryItem,
    type UpdateAccessoryInventoryRequest,
} from '../../../Services/ApiServices';
import { useToast } from '../../../Utils/ToastContext';

interface Property {
    key: string;
    value: string;
}

const EditAccessoryInventoryPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

    const [inventory, setInventory] = useState<AccessoryInventoryItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);

    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [properties, setProperties] = useState<Property[]>([{ key: '', value: '' }]);

    const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [originalImages, setOriginalImages] = useState<string[]>([]);
    const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);

    const parseImages = (imageUrl: string | any): string[] => {
        if (!imageUrl) return [];
        try {
            if (typeof imageUrl === 'string') {
                const parsed = JSON.parse(imageUrl);
                return Array.isArray(parsed) ? parsed : [imageUrl];
            }
            return Array.isArray(imageUrl) ? imageUrl : [imageUrl];
        } catch {
            return typeof imageUrl === 'string' ? [imageUrl] : [];
        }
    };

    const fetchData = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            const response = await getAccessoryInventoryByIdService(id);

            if (response.success === 200 && response.data) {
                const inventoryData = response.data;
                setInventory(inventoryData);
                setName(inventoryData.name);

                // Extract quantity from separate column
                setQuantity(inventoryData.accessory?.quantity !== undefined && inventoryData.accessory?.quantity !== null ? String(inventoryData.accessory.quantity) : '');

                // Convert properties object to key-value pairs (excluding imageUrl)
                const props = inventoryData.accessory?.properties || {};
                const propertiesArray: Property[] = Object.keys(props)
                    .filter(key => key !== 'imageUrl') // Exclude imageUrl from properties editor
                    .map(key => ({
                        key,
                        value: String(props[key])
                    }));

                if (propertiesArray.length === 0) {
                    propertiesArray.push({ key: '', value: '' });
                }
                setProperties(propertiesArray);

                const imageUrl = props.imageUrl || null;
                const images = parseImages(imageUrl);
                setImagePreviews(images);
                setOriginalImages(images);
                setDeletedImageUrls([]);
                setSelectedImageFiles([]);
            } else {
                showError(response.message || 'Failed to load accessory inventory', 'Error');
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

    const handlePropertyChange = (index: number, field: 'key' | 'value', value: string) => {
        const newProperties = [...properties];
        newProperties[index] = { ...newProperties[index], [field]: value };
        setProperties(newProperties);
    };

    const handleAddProperty = () => {
        setProperties([...properties, { key: '', value: '' }]);
    };

    const handleRemoveProperty = (index: number) => {
        if (properties.length > 1) {
            setProperties(properties.filter((_, i) => i !== index));
        }
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
            if (!quantity || quantity.trim() === '' || isNaN(parseInt(quantity, 10)) || parseInt(quantity, 10) < 0) {
                showError('Quantity is required and must be a non-negative integer', 'Validation Error');
                setFormLoading(false);
                return;
            }

            // Build properties object from key-value pairs (excluding quantity)
            const existingProperties = inventory?.accessory?.properties || {};
            const propertiesObj: Record<string, any> = {};

            // Update properties from form
            properties.forEach((prop) => {
                if (prop.key && prop.key.trim() !== '') {
                    const key = prop.key.trim();
                    // Skip quantity if it's added as a property (it's a separate field)
                    if (key.toLowerCase() === 'quantity') {
                        return;
                    }
                    const value = prop.value.trim();

                    if (value !== '') {
                        // Try to parse as number if it looks like a number
                        if (!isNaN(Number(value)) && value !== '') {
                            propertiesObj[key] = Number(value);
                        } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                            propertiesObj[key] = value.toLowerCase() === 'true';
                        } else {
                            propertiesObj[key] = value;
                        }
                    } else {
                        // Remove property if value is empty
                        delete propertiesObj[key];
                    }
                }
            });

            // Preserve imageUrl - it will be updated by the backend
            const imageUrl = existingProperties.imageUrl;
            if (imageUrl) {
                propertiesObj.imageUrl = imageUrl;
            }

            const updateData: UpdateAccessoryInventoryRequest = {
                name: name.trim(),
                quantity: parseInt(quantity, 10),
                properties: propertiesObj,
            };

            const response = await updateAccessoryInventoryService(
                id,
                updateData,
                selectedImageFiles.length > 0 ? selectedImageFiles : null,
                deletedImageUrls.length > 0 ? deletedImageUrls : null
            );

            if (response.success === 200) {
                showSuccess(response.message || 'Accessory inventory updated successfully!', 'Success');
                setTimeout(() => {
                    navigate('/dashboard/inventory/accessory-inventory');
                }, 1000);
            } else {
                const errorMsg = response.message || 'Failed to update accessory inventory';
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
                        Accessory inventory not found
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
                    Edit Accessory Inventory
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/dashboard/inventory/accessory-inventory')}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    Back to Accessory Inventory
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
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={formLoading}
                        />
                    </Box>

                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Quantity *
                        </Typography>
                        <TextField
                            fullWidth
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="0"
                            required
                            disabled={formLoading}
                            inputProps={{ min: 0 }}
                        />
                    </Box>
                </Box>

                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Properties
                        </Typography>
                        <Button
                            type="button"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={handleAddProperty}
                            disabled={formLoading}
                            sx={{ textTransform: 'none' }}
                        >
                            Add Property
                        </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {properties.map((property, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <TextField
                                    placeholder="Property key (e.g., type, color, size)"
                                    value={property.key}
                                    onChange={(e) => handlePropertyChange(index, 'key', e.target.value)}
                                    disabled={formLoading}
                                    sx={{ flex: 1 }}
                                />
                                <TextField
                                    placeholder="Property value"
                                    value={property.value}
                                    onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
                                    disabled={formLoading}
                                    sx={{ flex: 1 }}
                                />
                                <IconButton
                                    onClick={() => handleRemoveProperty(index)}
                                    disabled={formLoading || properties.length === 1}
                                    color="error"
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Add custom properties as key-value pairs. Values will be automatically converted to numbers or booleans when applicable.
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
                        onClick={() => navigate('/dashboard/inventory/accessory-inventory')}
                        disabled={formLoading}
                        tooltip="Cancel and go back to accessory inventory"
                        sx={{ textTransform: 'none', fontWeight: 600, minWidth: 140 }}
                    >
                        Cancel
                    </MUICustomBtn>
                    <MUICustomBtn
                        type="submit"
                        variant="contained"
                        disabled={formLoading}
                        startIcon={formLoading ? <CircularProgress size={20} /> : <EditIcon />}
                        tooltip="Update accessory inventory"
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
                        {formLoading ? '' : 'Update Accessory'}
                    </MUICustomBtn>
                </Box>
            </Box>
        </Card>
    );
};

export default EditAccessoryInventoryPage;
