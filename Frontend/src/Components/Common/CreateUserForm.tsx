import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button as MuiButton,
    TextField,
    Paper,
    CircularProgress,
    MenuItem,
    InputAdornment,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
    ArrowBack as ArrowBackIcon,
    PersonAdd as PersonAddIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import MUICustomBtn from './MUICustomBtn';
import { createUserByAdminService, getUserInfo } from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';
import { getAvailableRoles } from '../../Utils/roles';

const CreateUserForm = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

    const [formData, setFormData] = useState<{
        fullName: string;
        emailId: string;
        password: string;
        role: string;
    }>({
        fullName: '',
        emailId: '',
        password: '',
        role: '',
    });

    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<Array<{ name: string; value: string }>>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);

    // Fetch available roles based on current user's role
    useEffect(() => {
        const currentUser = getUserInfo();
        if (currentUser?.role) {
            const roles = getAvailableRoles(currentUser.role);
            setAvailableRoles(roles);
        } else {
            setAvailableRoles([]);
        }
        setLoadingRoles(false);
    }, []);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        setFormData((prev) => ({
            ...prev,
            role: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await createUserByAdminService({
                fullName: formData.fullName,
                emailId: formData.emailId,
                password: formData.password,
                role: formData.role as 'superAdmin' | 'admin' | 'subAdmin' | 'cutter' | 'stitcher' | 'finisher' | 'deliveryBoy' | 'accountant',
            });

            if (response.success === 201 || response.success === 200) {
                showSuccess(response.message || 'User created successfully!', 'Success');
                setTimeout(() => navigate('/dashboard/users'), 800);
            } else {
                const errorMsg = response.message || 'Failed to create user';
                showError(errorMsg, 'Create Failed');
            }
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                const errorMsg = axiosError.response?.data?.message || 'Failed to create user';
                showError(errorMsg, 'Create Failed');
            } else {
                const errorMsg = 'An unexpected error occurred';
                showError(errorMsg, 'Create Failed');
            }
        } finally {
            setSubmitting(false);
        }
    };

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
                    Add New User
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
                        placeholder="Enter full name (e.g., John Doe)"
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
                        label="Email Address *"
                        type="email"
                        id="emailId"
                        name="emailId"
                        value={formData.emailId}
                        onChange={handleFormChange}
                        placeholder="Enter email address (e.g., john.doe@example.com)"
                        required
                        disabled={submitting}
                        fullWidth
                        InputProps={{
                            startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
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
                        label="Password *"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleFormChange}
                        placeholder="Enter password (minimum 6 characters)"
                        required
                        disabled={submitting}
                        fullWidth
                        inputProps={{ minLength: 6 }}
                        InputProps={{
                            startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <MUICustomBtn
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={submitting}
                                        tooltip="Toggle password visibility"
                                        variant="text"
                                        sx={{
                                            minWidth: 'auto',
                                            padding: 1,
                                        }}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </MUICustomBtn>
                                </InputAdornment>
                            ),
                        }}
                        helperText="Password must be at least 6 characters long"
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
                        label="Role *"
                        select
                        id="role"
                        name="role"
                        value={formData.role || ''}
                        onChange={handleSelectChange}
                        required
                        disabled={submitting || loadingRoles}
                        fullWidth
                        SelectProps={{
                            displayEmpty: true,
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
                    >
                        {loadingRoles ? (
                            <MenuItem value="" disabled>Loading roles...</MenuItem>
                        ) : availableRoles.length === 0 ? (
                            <MenuItem value="" disabled>No roles available</MenuItem>
                        ) : (
                            availableRoles.map((role) => (
                                <MenuItem key={role.value} value={role.value}>
                                    {role.name}
                                </MenuItem>
                            ))
                        )}
                    </TextField>
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
                                <PersonAddIcon />
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
                        {submitting ? 'Creating...' : 'Create User'}
                    </MuiButton>
                </Box>
            </Box>
        </Paper>
    );
};

export default CreateUserForm;

