import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMeService, getUserByIdService, resetPasswordService, getUserInfo, type UserResponse } from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';
import { validatePassword } from '../../Utils/passwordValidation';
import ChangePasswordDialog from '../../Components/Dialogs/ChangePasswordDialog';
import {
    Box,
    Card,
    Typography,
    CircularProgress,
    Avatar,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    InputAdornment,
    Alert,
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
    const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
    const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
    const [resetPassword, setResetPassword] = useState('');
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

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

    const handleOpenChangePasswordDialog = () => {
        if (isViewingOwnProfile) {
            setIsChangePasswordDialogOpen(true);
        } else {
            setResetPassword('');
            setShowResetPassword(false);
            setIsResetPasswordDialogOpen(true);
        }
    };

    const handleCloseChangePasswordDialog = () => {
        setIsChangePasswordDialogOpen(false);
    };

    const handleCloseResetPasswordDialog = () => {
        setIsResetPasswordDialogOpen(false);
        setResetPassword('');
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!urlUserId) {
            showError('User ID is missing', 'Error');
            return;
        }

        // Validate password
        const validation = validatePassword(resetPassword);
        if (!validation.isValid) {
            showError(validation.message, 'Validation Error');
            return;
        }

        setResetPasswordLoading(true);

        try {
            const response = await resetPasswordService(urlUserId, { newPassword: resetPassword });

            if (response.success === 200) {
                showSuccess(response.message || 'Password reset successfully! User will be prompted to change it on next login.', 'Success');
                handleCloseResetPasswordDialog();
            } else {
                showError(response.message || 'Failed to reset password', 'Error');
            }
        } catch (err: unknown) {
            console.error('Error resetting password:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                showError(axiosError.response?.data?.message || 'Failed to reset password', 'Error');
            } else {
                showError('Failed to reset password. Please try again.', 'Error');
            }
        } finally {
            setResetPasswordLoading(false);
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
                            onClick={handleOpenChangePasswordDialog}
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

            {/* Change Password Dialog - For own profile */}
            {isViewingOwnProfile && (
                <ChangePasswordDialog
                    open={isChangePasswordDialogOpen}
                    onClose={handleCloseChangePasswordDialog}
                    isForced={false}
                />
            )}

            {/* Reset Password Dialog - For admins resetting other users' passwords */}
            {!isViewingOwnProfile && (
                <Dialog
                    open={isResetPasswordDialogOpen}
                    onClose={handleCloseResetPasswordDialog}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                        }
                    }}
                >
                    <DialogTitle sx={{ pb: 1 }}>
                        <Typography variant="h5" component="div" fontWeight={600}>
                            Reset Password for {user?.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Set a new password for this user. They will be required to change it on their next login.
                        </Typography>
                    </DialogTitle>

                    <Box component="form" onSubmit={handleResetPassword}>
                        <DialogContent sx={{ pt: 2 }}>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                The user will receive a <strong>needToResetPassword</strong> flag and must change this password on their next login.
                            </Alert>

                            <TextField
                                fullWidth
                                type={showResetPassword ? 'text' : 'password'}
                                label="New Password"
                                value={resetPassword}
                                onChange={(e) => setResetPassword(e.target.value)}
                                helperText="Must be at least 8 characters with uppercase, lowercase, number, and special character"
                                required
                                disabled={resetPasswordLoading}
                                margin="normal"
                                variant="outlined"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowResetPassword(!showResetPassword)}
                                                disabled={resetPasswordLoading}
                                                edge="end"
                                                aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showResetPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </DialogContent>

                        <DialogActions sx={{ px: 3, pb: 3 }}>
                            <Button
                                onClick={handleCloseResetPasswordDialog}
                                disabled={resetPasswordLoading}
                                variant="outlined"
                                color="inherit"
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={resetPasswordLoading}
                                variant="contained"
                                sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                                    },
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                {resetPasswordLoading ? <CircularProgress size={20} color="inherit" /> : 'Reset Password'}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>
            )}
        </Box>
    );
};

export default ProfilePage;

