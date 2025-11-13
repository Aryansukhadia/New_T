import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import {
    getCustomerByIdService,
    updateCustomerService,
    type Customer,
    type UpdateCustomerRequest,
} from '../../Services/ApiServices/customerServices';
import { useToast } from '../../Utils/ToastContext';
import {
    FormGroup,
    Label,
    Input,
    Button,
    LoadingSpinner,
} from '../../Components/Common/FormComponents';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';

const PageContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
`;

const BackButton = styled.button`
  padding: 12px 24px;
  background: #f5f5f5;
  color: #333;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #e8e8e8;
    border-color: #ccc;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const SubmitButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 160px;
`;

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
    }, [customerId, navigate, showError, t]);

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
            <PageContainer>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <LoadingSpinner />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader>
                <PageTitle>{t('customers.editCustomerTitle') || 'Edit Customer'}</PageTitle>
                <BackButton onClick={() => navigate(-1)}>
                    <FaArrowLeft /> {t('common.back') || 'Back'}
                </BackButton>
            </PageHeader>

            <FormContainer onSubmit={handleSubmit}>
                <FormGroup>
                    <Label htmlFor="fullName">{t('customers.fullName')} *</Label>
                    <Input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName || ''}
                        onChange={handleFormChange}
                        placeholder={t('customers.fullNamePlaceholder') || 'Enter full name'}
                        required
                        disabled={submitting}
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="emailId">{t('customers.email')} *</Label>
                    <Input
                        type="email"
                        id="emailId"
                        name="emailId"
                        value={formData.emailId || ''}
                        onChange={handleFormChange}
                        placeholder={t('customers.emailPlaceholder') || 'Enter email address'}
                        required
                        disabled={submitting}
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="mobileNo">{t('customers.mobile')} *</Label>
                    <Input
                        type="tel"
                        id="mobileNo"
                        name="mobileNo"
                        value={formData.mobileNo || ''}
                        onChange={handleFormChange}
                        placeholder={t('customers.mobilePlaceholder') || 'Enter mobile number'}
                        required
                        disabled={submitting}
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="address">{t('customers.address')} *</Label>
                    <Input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address || ''}
                        onChange={handleFormChange}
                        placeholder={t('customers.addressPlaceholder') || 'Enter complete address'}
                        required
                        disabled={submitting}
                    />
                </FormGroup>

                <FormGroup>
                    <Label htmlFor="reference">{t('customers.reference') || 'Reference'} ({t('orders.optional')})</Label>
                    <Input
                        type="text"
                        id="reference"
                        name="reference"
                        value={formData.reference || ''}
                        onChange={handleFormChange}
                        placeholder={t('customers.referencePlaceholder') || 'Enter reference (optional)'}
                        disabled={submitting}
                    />
                </FormGroup>

                <Actions>
                    <BackButton type="button" onClick={() => navigate('/dashboard/customers')} disabled={submitting}>
                        {t('common.cancel') || 'Cancel'}
                    </BackButton>
                    <SubmitButton type="submit" disabled={submitting}>
                        {submitting ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <FaEdit /> {t('customers.updateCustomer') || 'Update Customer'}
                            </>
                        )}
                    </SubmitButton>
                </Actions>
            </FormContainer>
        </PageContainer>
    );
};

export default UpdateCustomerPage;
