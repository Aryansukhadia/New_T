import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMeService, getUserByIdService, changePasswordService, resetPasswordService, getUserInfo, type UserResponse } from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';
import { validatePassword } from '../../Utils/passwordValidation';
import {
    Box,
    Card,
    Typography,
    TextField,
    CircularProgress,
    Avatar,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    InputAdornment,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Shield as ShieldIcon,
    CalendarToday as CalendarIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';

const ProfilePage = () => {
    const { userId: urlUserId } = useParams<{ userId?: string }>();
    const { showSuccess, showError } = useToast();
    const currentUser = getUserInfo();

    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [passwordFormLoading, setPasswordFormLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [passwordData, setPasswordData] = useState({
        password: '',
    });

    // Check if viewing own profile or another user's profile
    const isViewingOwnProfile = !urlUserId || urlUserId === currentUser?.userId;

    useEffect(() => {
        fetchUserProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlUserId]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            let response;

            if (urlUserId) {
                // Fetch specific user by ID
                response = await getUserByIdService(urlUserId);
            } else {
                // Fetch current user's profile
                response = await getMeService();
            }

            if (response.success === 200 && response.data) {
                setUser(response.data);
            } else {
                showError(response.message || 'Failed to load profile', 'Error');
            }
        } catch (err: unknown) {
            console.error('Error fetching profile:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                showError(axiosError.response?.data?.message || 'Failed to load profile', 'Error');
            } else {
                showError('Failed to load profile. Please try again.', 'Error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChangePasswordModal = () => {
        setPasswordData({ password: '' });
        setShowPassword(false);
        setIsChangePasswordModalOpen(true);
    };

    const handleCloseChangePasswordModal = () => {
        setIsChangePasswordModalOpen(false);
        setPasswordData({ password: '' });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ password: e.target.value });
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        const passwordToValidate = passwordData.password;
        // Validate password
        const validation = validatePassword(passwordToValidate);
        if (!validation.isValid) {
            showError(validation.message, 'Validation Error');
            return;
        }

        setPasswordFormLoading(true);

        try {
            let response;

            if (isViewingOwnProfile) {
                // Use changePasswordService for own profile
                response = await changePasswordService({ password: passwordToValidate });
            } else if (urlUserId) {
                // Use resetPasswordService for other users
                response = await resetPasswordService(urlUserId, { newPassword: passwordToValidate });
            } else {
                throw new Error('Invalid state: no userId available');
            }

            if (response.success === 200) {
                showSuccess(response.message || 'Password changed successfully!', 'Success');
                setTimeout(() => {
                    handleCloseChangePasswordModal();
                }, 1000);
            } else {
                const errorMsg = response.message || 'Failed to change password';
                showError(errorMsg, 'Change Password Failed');
            }
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                const errorMsg = axiosError.response?.data?.message || 'An error occurred';
                showError(errorMsg, 'Change Password Failed');
            } else {
                const errorMsg = 'An unexpected error occurred';
                showError(errorMsg, 'Change Password Failed');
            }
        } finally {
            setPasswordFormLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'superAdmin':
                return '#dc3545';
            case 'admin':
                return '#007bff';
            case 'subAdmin':
                return '#28a745';
            default:
                return '#6c757d';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (!user) {
        return (
            <Card sx={{ borderRadius: 1.5, p: 3 }}>
                <Typography variant="h6" color="error">
                    Failed to load user profile
                </Typography>
            </Card>
        );
    }

    return (
        <Box>
            <Card sx={{ borderRadius: 1.5, p: { xs: 2, sm: 3, md: 4 } }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 3, md: 4 }
                }}>
                    {/* Left Side - Avatar */}
                    <Box sx={{
                        flex: { xs: '1', md: '0 0 280px' },
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                        <Avatar
                            sx={{
                                width: { xs: 120, sm: 150 },
                                height: { xs: 120, sm: 150 },
                                mb: 2,
                                fontSize: { xs: 48, sm: 56 },
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }}
                        >
                            {getInitials(user.fullName)}
                        </Avatar>
                        <Typography variant="h5" sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            fontSize: { xs: '1.25rem', sm: '1.5rem' }
                        }}>
                            {user.fullName}
                        </Typography>
                        <Box
                            sx={{
                                display: 'inline-block',
                                px: 2,
                                py: 0.5,
                                borderRadius: 2,
                                bgcolor: getRoleBadgeColor(user.role),
                                color: 'white',
                                fontWeight: 600,
                                fontSize: { xs: 13, sm: 14 },
                                mb: 3,
                            }}
                        >
                            {user.role}
                        </Box>
                        <Divider sx={{ my: 3, width: '100%', display: { xs: 'none', md: 'block' } }} />
                        <Button
                            variant="contained"
                            startIcon={<LockIcon />}
                            onClick={handleOpenChangePasswordModal}
                            fullWidth
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                },
                                textTransform: 'none',
                                fontWeight: 600,
                                py: 1.5,
                                maxWidth: { xs: '100%', md: '280px' },
                            }}
                        >
                            {isViewingOwnProfile ? 'Change Password' : 'Reset Password'}
                        </Button>
                    </Box>

                    {/* Right Side - Profile Information */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            mb: 3,
                            fontSize: { xs: '1.1rem', sm: '1.25rem' }
                        }}>
                            Profile Information
                        </Typography>

                        {/* User ID */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 3, 
                            gap: { xs: 1.5, sm: 2 },
                            flexWrap: { xs: 'wrap', sm: 'nowrap' }
                        }}>
                            <Box
                                sx={{
                                    width: { xs: 45, sm: 50 },
                                    height: { xs: 45, sm: 50 },
                                    borderRadius: 1.5,
                                    bgcolor: '#e3f2fd',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <PersonIcon sx={{ color: '#1976d2', fontSize: { xs: 24, sm: 28 } }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                    User ID
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    fontWeight: 600, 
                                    fontFamily: 'monospace', 
                                    fontSize: { xs: 14, sm: 16 },
                                    wordBreak: 'break-all'
                                }}>
                                    {user.userId}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Email */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 3, 
                            gap: { xs: 1.5, sm: 2 },
                            flexWrap: { xs: 'wrap', sm: 'nowrap' }
                        }}>
                            <Box
                                sx={{
                                    width: { xs: 45, sm: 50 },
                                    height: { xs: 45, sm: 50 },
                                    borderRadius: 1.5,
                                    bgcolor: '#f3e5f5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <EmailIcon sx={{ color: '#9c27b0', fontSize: { xs: 24, sm: 28 } }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                    Email Address
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    fontWeight: 600, 
                                    fontSize: { xs: 14, sm: 16 },
                                    wordBreak: 'break-word'
                                }}>
                                    {user.emailId}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Role */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 3, 
                            gap: { xs: 1.5, sm: 2 },
                            flexWrap: { xs: 'wrap', sm: 'nowrap' }
                        }}>
                            <Box
                                sx={{
                                    width: { xs: 45, sm: 50 },
                                    height: { xs: 45, sm: 50 },
                                    borderRadius: 1.5,
                                    bgcolor: '#e8f5e9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <ShieldIcon sx={{ color: '#4caf50', fontSize: { xs: 24, sm: 28 } }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                    Role
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    fontWeight: 600, 
                                    textTransform: 'capitalize', 
                                    fontSize: { xs: 14, sm: 16 }
                                }}>
                                    {user.role}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Created At */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: { xs: 1.5, sm: 2 },
                            flexWrap: { xs: 'wrap', sm: 'nowrap' }
                        }}>
                            <Box
                                sx={{
                                    width: { xs: 45, sm: 50 },
                                    height: { xs: 45, sm: 50 },
                                    borderRadius: 1.5,
                                    bgcolor: '#fff3e0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <CalendarIcon sx={{ color: '#ff9800', fontSize: { xs: 24, sm: 28 } }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                    Member Since
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    fontWeight: 600, 
                                    fontSize: { xs: 14, sm: 16 }
                                }}>
                                    {formatDate(user.createdAt)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Card>

            {/* Change Password Dialog */}
            <Dialog 
                open={isChangePasswordModalOpen} 
                onClose={handleCloseChangePasswordModal} 
                maxWidth="sm" 
                fullWidth
                fullScreen={false}
                sx={{
                    '& .MuiDialog-paper': {
                        m: { xs: 2, sm: 3 },
                        width: { xs: 'calc(100% - 32px)', sm: '100%' }
                    }
                }}
            >
                <DialogTitle sx={{ 
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    pb: 1
                }}>
                    {isViewingOwnProfile ? 'Change Password' : 'Reset Password'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleChangePassword} sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.password}
                            onChange={handlePasswordChange}
                            required
                            disabled={passwordFormLoading}
                            helperText="Password must be 6-12 characters with at least one capital letter, number, and special character"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            disabled={passwordFormLoading}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiInputBase-input': {
                                    fontSize: { xs: '0.9rem', sm: '1rem' }
                                },
                                '& .MuiFormHelperText-root': {
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                }
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ 
                    p: { xs: 2, sm: 2 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                }}>
                    <Button
                        onClick={handleCloseChangePasswordModal}
                        variant="outlined"
                        disabled={passwordFormLoading}
                        fullWidth={window.innerWidth < 600}
                        sx={{ 
                            textTransform: 'none', 
                            fontWeight: 600,
                            order: { xs: 2, sm: 1 }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleChangePassword}
                        disabled={passwordFormLoading}
                        variant="contained"
                        fullWidth={window.innerWidth < 600}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                            },
                            textTransform: 'none',
                            fontWeight: 600,
                            minWidth: { sm: 140 },
                            order: { xs: 1, sm: 2 }
                        }}
                    >
                        {passwordFormLoading ? <CircularProgress size={20} /> : (isViewingOwnProfile ? 'Change Password' : 'Reset Password')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfilePage;

