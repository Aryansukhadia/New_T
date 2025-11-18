import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Button as MuiButton,
    TextField,
    Paper,
    CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';
import { useTranslation } from '../../hooks/useTranslation';
import {
    getCustomerByIdService,
    updateCustomerService,
    type Customer,
    type UpdateCustomerRequest,
} from '../../Services/ApiServices/customerServices';
import { useToast } from '../../Utils/ToastContext';


const UpdateCustomerPage = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const { t } = useTranslation();

    const [formData, setFormData] = useState<UpdateCustomerRequest>({
        fullName: '',
        emailId: '',
        mobileNo: '',
        address: '',
        reference: null,
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchCustomer = async () => {
            if (!customerId) return;
            try {
                const response = await getCustomerByIdService(customerId);
                if (response.success === 200 && response.data) {
                    const customer: Customer = response.data;
                    setFormData({
                        fullName: customer.fullName,
                        emailId: customer.emailId,
                        mobileNo: customer.mobileNo,
                        address: customer.address,
                        reference: customer.reference,
                    });
                } else {
                    showError(response.message || t('customers.fetchFailed') || 'Failed to load customer details', 'Error');
                    navigate('/dashboard/customers');
                }
            } catch (err: unknown) {
                console.error('fetch customer error', err);
                showError(t('customers.fetchFailed') || 'Failed to load customer details', 'Error');
                navigate('/dashboard/customers');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [customerId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'reference' ? (value === '' ? null : value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerId) return;

        setSubmitting(true);
        try {
            const response = await updateCustomerService(customerId, formData);
            if (response.success === 200) {
                showSuccess(response.message || t('customers.updateSuccess') || 'Customer updated successfully!', 'Success');
                setTimeout(() => navigate('/dashboard/customers'), 800);
            } else {
                const errorMsg = response.message || t('customers.updateFailed') || 'Failed to update customer';
                showError(errorMsg, 'Update Failed');
            }
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                const errorMsg = axiosError.response?.data?.message || t('customers.updateFailed') || 'Failed to update customer';
                showError(errorMsg, 'Update Failed');
            } else {
                const errorMsg = t('customers.unexpectedError') || 'An unexpected error occurred';
                showError(errorMsg, 'Update Failed');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Paper
                sx={{
                    background: 'white',
                    borderRadius: 3,
                    padding: 3,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
            >
                <Box sx={{ textAlign: 'center', padding: 5 }}>
                    <CircularProgress size={40} />
                </Box>
            </Paper>
        );
    }

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
                    {t('customers.editCustomerTitle') || 'Edit Customer'}
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
                        value={formData.fullName || ''}
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
                        value={formData.emailId || ''}
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
                        value={formData.mobileNo || ''}
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
                        value={formData.address || ''}
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
                        {submitting
                            ? (t('common.submitting') || 'Submitting...')
                            : (t('customers.updateCustomer') || 'Update Customer')
                        }
                    </MuiButton>
                </Box>
            </Box>
        </Paper>
    );
};

export default UpdateCustomerPage;
