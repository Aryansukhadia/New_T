import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Button as MuiButton,
    TextField,
    Paper,
    CircularProgress,
    Chip,
} from '@mui/material';
import { 
    ArrowBack as ArrowBackIcon, 
    Edit as EditIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
} from '@mui/icons-material';
import {
    getUserByIdService,
    updateUserService,
    type UserResponse,
} from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';

const UpdateUserForm = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

    const [formData, setFormData] = useState({
        fullName: '',
    });

    const [userDetails, setUserDetails] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            try {
                const response = await getUserByIdService(userId);
                if (response.success === 200 && response.data) {
                    const user: UserResponse = response.data;
                    setUserDetails(user);
                    setFormData({
                        fullName: user.fullName,
                    });
                } else {
                    showError(response.message || 'Failed to load user details', 'Error');
                    navigate('/dashboard/users');
                }
            } catch (err: unknown) {
                console.error('fetch user error', err);
                showError('Failed to load user details', 'Error');
                navigate('/dashboard/users');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        setSubmitting(true);
        try {
            const response = await updateUserService(userId, formData);
            if (response.success === 200) {
                showSuccess(response.message || 'User updated successfully!', 'Success');
                setTimeout(() => navigate('/dashboard/users'), 800);
            } else {
                const errorMsg = response.message || 'Failed to update user';
                showError(errorMsg, 'Update Failed');
            }
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                const errorMsg = axiosError.response?.data?.message || 'Failed to update user';
                showError(errorMsg, 'Update Failed');
            } else {
                const errorMsg = 'An unexpected error occurred';
                showError(errorMsg, 'Update Failed');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'superAdmin':
                return { bgcolor: '#e3f2fd', color: '#1976d2' };
            case 'admin':
                return { bgcolor: '#f3e5f5', color: '#9c27b0' };
            case 'subAdmin':
                return { bgcolor: '#fff3e0', color: '#f57c00' };
            case 'cutter':
                return { bgcolor: '#e8f5e9', color: '#2e7d32' };
            case 'stitcher':
                return { bgcolor: '#fce4ec', color: '#c2185b' };
            case 'finisher':
                return { bgcolor: '#f3e5f5', color: '#7b1fa2' };
            case 'deliveryBoy':
                return { bgcolor: '#e1f5fe', color: '#0277bd' };
            case 'accountant':
                return { bgcolor: '#fff9c4', color: '#f57f17' };
            default:
                return { bgcolor: '#f5f5f5', color: '#616161' };
        }
    };

    if (loading) {
        return (
            <Paper
                sx={{
                    background: 'white',
                    borderRadius: 3,
                    padding: { xs: 2, sm: 3 },
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 400,
                }}
            >
                <CircularProgress />
            </Paper>
        );
    }

    if (!userDetails) {
        return null;
    }

    const { bgcolor, color } = getRoleColor(userDetails.role);

    return (
        <Paper
            sx={{
                background: 'white',
                borderRadius: 3,
                padding: { xs: 2, sm: 3 },
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 3,
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontWeight: 700,
                        color: '#333',
                        margin: 0,
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                >
                    Edit User
                </Typography>
                <MuiButton
                    onClick={() => navigate(-1)}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                        padding: { xs: '10px 20px', sm: '12px 24px' },
                        background: '#f5f5f5',
                        color: '#333',
                        border: '2px solid #e0e0e0',
                        borderRadius: 2,
                        fontSize: { xs: '13px', sm: '14px' },
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            background: '#e8e8e8',
                            borderColor: '#ccc',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        },
                    }}
                >
                    Back
                </MuiButton>
            </Box>

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                <Box sx={{ marginBottom: 2 }}>
                    <TextField
                        label="Full Name *"
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleFormChange}
                        placeholder="Enter full name"
                        required
                        disabled={submitting}
                        fullWidth
                        InputProps={{
                            startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                background: '#fafafa',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                '& fieldset': {
                                    borderColor: '#e0e0e0',
                                    borderWidth: 2,
                                },
                                '&:hover fieldset': {
                                    borderColor: '#ccc',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#667eea',
                                    boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)',
                                },
                                '&.Mui-focused': {
                                    background: 'white',
                                    transform: 'translateY(-1px)',
                                },
                            },
                        }}
                    />
                </Box>

                <Box sx={{ marginBottom: 2 }}>
                    <TextField
                        label="Email Address"
                        type="email"
                        id="emailId"
                        name="emailId"
                        value={userDetails.emailId}
                        disabled
                        fullWidth
                        InputProps={{
                            startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                        helperText="Email address cannot be modified after account creation"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                background: '#f5f5f5',
                                borderRadius: '12px',
                                '& fieldset': {
                                    borderColor: '#e0e0e0',
                                    borderWidth: 2,
                                },
                            },
                        }}
                    />
                </Box>

                <Box sx={{ marginBottom: 2 }}>
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AdminPanelSettingsIcon sx={{ color: 'action.active' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            Role
                        </Typography>
                    </Box>
                    <Chip
                        label={userDetails.role}
                        sx={{
                            bgcolor,
                            color,
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            height: 36,
                            px: 1,
                        }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                        Role cannot be modified after account creation
                    </Typography>
                </Box>

                <Box sx={{ marginBottom: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>Created At:</strong> {new Date(userDetails.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Typography>
                    {userDetails.updatedAt && (
                        <Typography variant="body2" color="text.secondary">
                            <strong>Last Updated:</strong> {new Date(userDetails.updatedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Typography>
                    )}
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1.5,
                        marginTop: 3,
                        flexDirection: { xs: 'column', sm: 'row' }
                    }}
                >
                    <MuiButton
                        type="button"
                        onClick={() => navigate('/dashboard/users')}
                        disabled={submitting}
                        sx={{
                            padding: '12px 24px',
                            background: '#f5f5f5',
                            color: '#333',
                            border: '2px solid #e0e0e0',
                            borderRadius: 2,
                            fontSize: '14px',
                            fontWeight: 600,
                            '&:hover': {
                                background: '#e8e8e8',
                                borderColor: '#ccc',
                            },
                        }}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        type="submit"
                        disabled={submitting}
                        startIcon={
                            submitting ? (
                                <CircularProgress size={20} sx={{ color: 'white' }} />
                            ) : (
                                <EditIcon />
                            )
                        }
                        sx={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            borderRadius: 1,
                            fontSize: '16px',
                            fontWeight: 600,
                            minWidth: 160,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)',
                            },
                            '&:active': {
                                transform: 'translateY(0)',
                            },
                            '&:disabled': {
                                opacity: 0.6,
                                transform: 'none',
                            },
                        }}
                    >
                        {submitting ? 'Updating...' : 'Update User'}
                    </MuiButton>
                </Box>
            </Box>
        </Paper>
    );
};

export default UpdateUserForm;

