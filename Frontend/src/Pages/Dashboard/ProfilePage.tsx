import { useState, useEffect } from 'react';
import { getMeService, changePasswordService, type UserResponse } from '../../Services/ApiServices';
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
    const { showSuccess, showError } = useToast();

    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [passwordFormLoading, setPasswordFormLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [passwordData, setPasswordData] = useState({
        password: '',
    });

    useEffect(() => {
        fetchUserProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const response = await getMeService();
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

        // Validate password
        const validation = validatePassword(passwordData.password);
        if (!validation.isValid) {
            showError(validation.message, 'Validation Error');
            return;
        }

        setPasswordFormLoading(true);

        try {
            const response = await changePasswordService(passwordData);

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
            <Card sx={{ borderRadius: 1.5, p: 4 }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 4
                }}>
                    {/* Left Side - Avatar */}
                    <Box sx={{
                        flex: '0 0 280px',
                        textAlign: 'center',
                    }}>
                        <Avatar
                            sx={{
                                width: 150,
                                height: 150,
                                mx: 'auto',
                                mb: 2,
                                fontSize: 56,
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }}
                        >
                            {getInitials(user.fullName)}
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
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
                                fontSize: 14,
                                mb: 3,
                            }}
                        >
                            {user.role}
                        </Box>
                        <Divider sx={{ my: 3 }} />
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
                            }}
                        >
                            Change Password
                        </Button>
                    </Box>

                    {/* Right Side - Profile Information */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                            Profile Information
                        </Typography>

                        {/* User ID */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                            <Box
                                sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 1.5,
                                    bgcolor: '#e3f2fd',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <PersonIcon sx={{ color: '#1976d2', fontSize: 28 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                    User ID
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 16 }}>
                                    {user.userId}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Email */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                            <Box
                                sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 1.5,
                                    bgcolor: '#f3e5f5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <EmailIcon sx={{ color: '#9c27b0', fontSize: 28 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                    Email Address
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: 16 }}>
                                    {user.emailId}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Role */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                            <Box
                                sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 1.5,
                                    bgcolor: '#e8f5e9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <ShieldIcon sx={{ color: '#4caf50', fontSize: 28 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                    Role
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 16 }}>
                                    {user.role}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Created At */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 1.5,
                                    bgcolor: '#fff3e0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <CalendarIcon sx={{ color: '#ff9800', fontSize: 28 }} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                    Member Since
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: 16 }}>
                                    {formatDate(user.createdAt)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Card>

            {/* Change Password Dialog */}
            <Dialog open={isChangePasswordModalOpen} onClose={handleCloseChangePasswordModal} maxWidth="sm" fullWidth>
                <DialogTitle>Change Password</DialogTitle>
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
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleCloseChangePasswordModal}
                        variant="outlined"
                        disabled={passwordFormLoading}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleChangePassword}
                        disabled={passwordFormLoading}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                            },
                            textTransform: 'none',
                            fontWeight: 600,
                            minWidth: 140,
                        }}
                    >
                        {passwordFormLoading ? <CircularProgress size={20} /> : 'Change Password'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfilePage;

