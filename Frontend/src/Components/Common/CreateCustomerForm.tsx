import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import {
    createCustomerService,
    type CreateCustomerRequest,
} from '../../Services/ApiServices/customerServices';
import { useToast } from '../../Utils/ToastContext';
import {
    FormGroup,
    Label,
    Input,
    Button,
    LoadingSpinner,
} from './FormComponents';
import { FaArrowLeft, FaUserPlus } from 'react-icons/fa';

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
  color: #333;
  margin: 0;
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
        <PageContainer>
            <PageHeader>
                <PageTitle>{t('customers.addNewCustomerTitle') || 'Add New Customer'}</PageTitle>
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
                        value={formData.fullName}
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
                        value={formData.emailId}
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
                        value={formData.mobileNo}
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
                        value={formData.address}
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
                                <FaUserPlus /> {t('customers.createCustomer') || 'Create Customer'}
                            </>
                        )}
                    </SubmitButton>
                </Actions>
            </FormContainer>
        </PageContainer>
    );
};

export default CreateCustomerForm;


