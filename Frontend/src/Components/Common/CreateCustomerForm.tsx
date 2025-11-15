import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button as MuiButton,
    TextField,
    Paper,
    CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useTranslation } from '../../hooks/useTranslation';
import {
    createCustomerService,
    type CreateCustomerRequest,
} from '../../Services/ApiServices/customerServices';
import { useToast } from '../../Utils/ToastContext';


const CreateCustomerForm = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const { t } = useTranslation();

    const [formData, setFormData] = useState<CreateCustomerRequest>({
        fullName: '',
        emailId: '',
        mobileNo: '',
        address: '',
        reference: null,
    });

    const [submitting, setSubmitting] = useState(false);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'reference' ? (value === '' ? null : value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await createCustomerService(formData);

            if (response.success === 201 || response.success === 200) {
                showSuccess(response.message || t('customers.createSuccess') || 'Customer created successfully!', 'Success');
                setTimeout(() => navigate('/dashboard/customers'), 800);
            } else {
                const errorMsg = response.message || t('customers.createFailed') || 'Failed to create customer';
                showError(errorMsg, 'Create Failed');
            }
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                const errorMsg = axiosError.response?.data?.message || t('customers.createFailed') || 'Failed to create customer';
                showError(errorMsg, 'Create Failed');
            } else {
                const errorMsg = t('customers.unexpectedError') || 'An unexpected error occurred';
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
                padding: 3,
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
                    }}
                >
                    {t('customers.addNewCustomerTitle') || 'Add New Customer'}
                </Typography>
                <MuiButton
                    onClick={() => navigate(-1)}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                        padding: '12px 24px',
                        background: '#f5f5f5',
                        color: '#333',
                        border: '2px solid #e0e0e0',
                        borderRadius: 2,
                        fontSize: '14px',
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
                    {t('common.back') || 'Back'}
                </MuiButton>
            </Box>

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    maxWidth: 600,
                }}
            >
                <Box sx={{ marginBottom: 2 }}>
                    <TextField
                        label={`${t('customers.fullName')} *`}
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleFormChange}
                        placeholder={t('customers.fullNamePlaceholder') || 'Enter full name'}
                        required
                        disabled={submitting}
                        fullWidth
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
                        label={`${t('customers.email')} *`}
                        type="email"
                        id="emailId"
                        name="emailId"
                        value={formData.emailId}
                        onChange={handleFormChange}
                        placeholder={t('customers.emailPlaceholder') || 'Enter email address'}
                        required
                        disabled={submitting}
                        fullWidth
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
                        label={`${t('customers.mobile')} *`}
                        type="tel"
                        id="mobileNo"
                        name="mobileNo"
                        value={formData.mobileNo}
                        onChange={handleFormChange}
                        placeholder={t('customers.mobilePlaceholder') || 'Enter mobile number'}
                        required
                        disabled={submitting}
                        fullWidth
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
                        label={`${t('customers.address')} *`}
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleFormChange}
                        placeholder={t('customers.addressPlaceholder') || 'Enter complete address'}
                        required
                        disabled={submitting}
                        fullWidth
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
                        label={`${t('customers.reference') || 'Reference'} (${t('orders.optional')})`}
                        type="text"
                        id="reference"
                        name="reference"
                        value={formData.reference || ''}
                        onChange={handleFormChange}
                        placeholder={t('customers.referencePlaceholder') || 'Enter reference (optional)'}
                        disabled={submitting}
                        fullWidth
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

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 1.5,
                        marginTop: 3,
                    }}
                >
                    <MuiButton
                        type="button"
                        onClick={() => navigate('/dashboard/customers')}
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
                        {t('common.cancel') || 'Cancel'}
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
                        {submitting
                            ? (t('common.submitting') || 'Submitting...')
                            : (t('customers.createCustomer') || 'Create Customer')
                        }
                    </MuiButton>
                </Box>
            </Box>
        </Paper>
    );
};

export default CreateCustomerForm;


