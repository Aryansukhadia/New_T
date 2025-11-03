import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  getCustomersService,
  type Customer,
  addMeasurementService,
  type AddMeasurementRequest,
} from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';
import {
  FormGroup,
  Label,
  Input,
  Select,
  Button,
  LoadingSpinner,
} from '../../Components/Common/FormComponents';
import {
  FaRuler,
  FaUser,
  FaTshirt,
  FaLongArrowAltRight,
  FaArrowLeft,
} from 'react-icons/fa';

const PageContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  padding: 10px 16px;
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
    transform: translateY(-1px);
  }
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    color: #667eea;
  }
`;

const FormContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const MeasurementSection = styled.div`
  margin-bottom: 32px;
  padding: 24px;
  background: #f9f9f9;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    color: #667eea;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 2px solid #e0e0e0;

  input[type='checkbox'] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  label {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    cursor: pointer;
    margin: 0;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #e0e0e0;
`;

const SubmitButton = styled(Button)`
  min-width: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const CancelButton = styled.button`
  padding: 14px 28px;
  background: #f5f5f5;
  color: #333;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;

  &:hover {
    background: #e8e8e8;
    border-color: #ccc;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const AddMeasurementPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [includeTop, setIncludeTop] = useState(true);
  const [includeBottom, setIncludeBottom] = useState(true);

  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<AddMeasurementRequest>({
    customerId: '',
    top: {
      length: 0,
      shoulder: 0,
      sleeveLength: 0,
      sleeveBottom: 0,
      chest: 0,
      waist: 0,
      hip: 0,
      neck: 0,
    },
    bottom: {
      length: 0,
      waist: 0,
      hip: 0,
      thigh: 0,
      knee: 0,
      calf: 0,
      bottom: 0,
      langot: 0,
    },
  });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCustomersService();
      if (response.success === 200 && response.data) {
        setCustomers(response.data);
      } else {
        showError(response.message || 'Failed to load customers', 'Error');
      }
    } catch (err: unknown) {
      console.error('Error fetching customers:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        showError(axiosError.response?.data?.message || 'Failed to load customers', 'Error');
      } else {
        showError('Failed to load customers. Please try again.', 'Error');
      }
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'customerId') {
      setFormData((prev) => ({
        ...prev,
        customerId: value,
      }));
      return;
    }

    // Handle top measurements
    if (name.startsWith('top_')) {
      const field = name.replace('top_', '');
      setFormData((prev) => ({
        ...prev,
        top: {
          ...prev.top!,
          [field]: parseFloat(value) || 0,
        },
      }));
      return;
    }

    // Handle bottom measurements
    if (name.startsWith('bottom_')) {
      const field = name.replace('bottom_', '');
      setFormData((prev) => ({
        ...prev,
        bottom: {
          ...prev.bottom!,
          [field]: parseFloat(value) || 0,
        },
      }));
      return;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerId) {
      showError('Please select a customer', 'Validation Error');
      return;
    }

    if (!includeTop && !includeBottom) {
      showError('Please select at least one measurement type (Top or Bottom)', 'Validation Error');
      return;
    }

    setFormLoading(true);

    try {
      const requestData: AddMeasurementRequest = {
        customerId: formData.customerId,
      };

      if (includeTop) {
        requestData.top = formData.top;
      }

      if (includeBottom) {
        requestData.bottom = formData.bottom;
      }

      const response = await addMeasurementService(requestData);

      if (response.success === 201) {
        showSuccess(response.message || 'Measurements added successfully!', 'Success');
        setTimeout(() => {
          navigate('/dashboard/measurements');
        }, 1000);
      } else {
        const errorMsg = response.message || 'Failed to add measurements';
        showError(errorMsg, 'Error');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const errorMsg = axiosError.response?.data?.message || 'An error occurred';
        showError(errorMsg, 'Error');
      } else {
        const errorMsg = 'An unexpected error occurred';
        showError(errorMsg, 'Error');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/measurements');
  };

  return (
    <PageContainer>
      <PageHeader>
        <BackButton onClick={handleCancel}>
          <FaArrowLeft />
          Back
        </BackButton>
        <PageTitle>
          <FaRuler />
          Add Measurements
        </PageTitle>
      </PageHeader>

      <FormContainer>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="customerId">
              <FaUser />
              Select Customer
            </Label>
            <Select
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleFormChange}
              required
              disabled={formLoading || loading}
            >
              <option value="">-- Select a customer --</option>
              {customers.map((customer) => (
                <option key={customer.customerId} value={customer.customerId}>
                  {customer.fullName} - {customer.emailId}
                </option>
              ))}
            </Select>
          </FormGroup>

          {/* Top Measurements Section */}
          <MeasurementSection>
            <CheckboxContainer>
              <input
                type="checkbox"
                id="includeTop"
                checked={includeTop}
                onChange={(e) => setIncludeTop(e.target.checked)}
                disabled={formLoading}
              />
              <label htmlFor="includeTop">
                <FaTshirt style={{ marginRight: '8px', color: '#667eea' }} />
                Include Top Measurements
              </label>
            </CheckboxContainer>

            {includeTop && (
              <>
                <SectionTitle>
                  <FaTshirt />
                  Top Measurements (in inches)
                </SectionTitle>
                <GridContainer>
                  <FormGroup>
                    <Label htmlFor="top_length">Length</Label>
                    <Input
                      type="number"
                      id="top_length"
                      name="top_length"
                      value={formData.top?.length || 0}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required={includeTop}
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="top_shoulder">Shoulder</Label>
                    <Input
                      type="number"
                      id="top_shoulder"
                      name="top_shoulder"
                      value={formData.top?.shoulder || 0}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required={includeTop}
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="top_sleeveLength">Sleeve Length</Label>
                    <Input
                      type="number"
                      id="top_sleeveLength"
                      name="top_sleeveLength"
                      value={formData.top?.sleeveLength || 0}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required={includeTop}
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="top_sleeveBottom">Sleeve Bottom</Label>
                    <Input
                      type="number"
                      id="top_sleeveBottom"
                      name="top_sleeveBottom"
                      value={formData.top?.sleeveBottom || 0}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required={includeTop}
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="top_chest">Chest</Label>
                    <Input
                      type="number"
                      id="top_chest"
                      name="top_chest"
                      value={formData.top?.chest || 0}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required={includeTop}
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="top_waist">Waist</Label>
                    <Input
                      type="number"
                      id="top_waist"
                      name="top_waist"
                      value={formData.top?.waist || 0}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required={includeTop}
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="top_hip">Hip</Label>
                    <Input
                      type="number"
                      id="top_hip"
                      name="top_hip"
                      value={formData.top?.hip || 0}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required={includeTop}
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="top_neck">Neck</Label>
                    <Input
                      type="number"
                      id="top_neck"
                      name="top_neck"
                      value={formData.top?.neck || 0}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required={includeTop}
                      disabled={formLoading}
                    />
                  </FormGroup>
                </GridContainer>
              </>
            )}
          </MeasurementSection>

          {/* Bottom Measurements Section */}
          <MeasurementSection>
            <CheckboxContainer>
              <input
                type="checkbox"
                id="includeBottom"
                checked={includeBottom}
                onChange={(e) => setIncludeBottom(e.target.checked)}
                disabled={formLoading}
              />
              <label htmlFor="includeBottom">
                <FaLongArrowAltRight style={{ marginRight: '8px', color: '#667eea' }} />
                Include Bottom Measurements
              </label>
            </CheckboxContainer>

            {includeBottom && (
              <>
                <SectionTitle>
                  <FaLongArrowAltRight />
                  Bottom Measurements (in inches)
                </SectionTitle>
                <GridContainer>
                  <FormGroup>
                    <Label htmlFor="bottom_length">Length</Label>
                    <Input
                      type="number"
                      id="bottom_length"
                      name="bottom_length"
                      value={formData.bottom?.length || 0}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required={includeBottom}
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="bottom_waist">Waist</Label>
                    <Input
                      type="number"
                      id="bottom_waist"
                      name="bottom_waist"
                      value={formData.bottom?.waist || 0}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required={includeBottom}
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="bottom_hip">Hip</Label>
                    <Input
                      type="number"
                      id="bottom_hip"
                      name="bottom_hip"
                      value={formData.bottom?.hip || 0}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required={includeBottom}
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="bottom_thigh">Thigh</Label>
                    <Input
                      type="number"
                      id="bottom_thigh"
                      name="bottom_thigh"
                      value={formData.bottom?.thigh || 0}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required={includeBottom}
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="bottom_knee">Knee</Label>
                    <Input
                      type="number"
                      id="bottom_knee"
                      name="bottom_knee"
                      value={formData.bottom?.knee || 0}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required={includeBottom}
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="bottom_calf">Calf</Label>
                    <Input
                      type="number"
                      id="bottom_calf"
                      name="bottom_calf"
                      value={formData.bottom?.calf || 0}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required={includeBottom}
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="bottom_bottom">Bottom</Label>
                    <Input
                      type="number"
                      id="bottom_bottom"
                      name="bottom_bottom"
                      value={formData.bottom?.bottom || 0}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required={includeBottom}
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="bottom_langot">Langot</Label>
                    <Input
                      type="number"
                      id="bottom_langot"
                      name="bottom_langot"
                      value={formData.bottom?.langot || 0}
                      onChange={handleFormChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required={includeBottom}
                      disabled={formLoading}
                    />
                  </FormGroup>
                </GridContainer>
              </>
            )}
          </MeasurementSection>

          <ButtonContainer>
            <CancelButton type="button" onClick={handleCancel} disabled={formLoading}>
              Cancel
            </CancelButton>
            <SubmitButton type="submit" disabled={formLoading}>
              {formLoading ? <LoadingSpinner /> : 'Add Measurements'}
            </SubmitButton>
          </ButtonContainer>
        </form>
      </FormContainer>
    </PageContainer>
  );
};

export default AddMeasurementPage;

