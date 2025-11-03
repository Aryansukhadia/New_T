import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  FormGroup,
  Label,
  Input,
  Button,
  LoadingSpinner,
} from '../../Components/Common/FormComponents';
import {
  getCustomerMeasurementsService,
  editMeasurementService,
  addMeasurementService,
  getCustomerByIdService,
  type CustomerMeasurementResponse,
  type EditMeasurementRequest,
  type AddMeasurementRequest,
} from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';
import { FaRuler, FaTshirt, FaLongArrowAltRight, FaEdit, FaPlus, FaArrowLeft } from 'react-icons/fa';

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

const CustomerInfo = styled.div`
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 2px solid #e0e0e0;
`;

const CustomerName = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
`;

const CustomerEmail = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const MeasurementsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MeasurementSection = styled.div`
  padding: 24px;
  background: #f9f9f9;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  min-height: 400px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;

  svg {
    color: #667eea;
  }
`;

const EditButton = styled.button`
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #5568d3;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const MeasurementDisplay = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const MeasurementRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const MeasurementLabel = styled.span`
  font-weight: 600;
  color: #666;
  font-size: 15px;
`;

const MeasurementValue = styled.span`
  color: #333;
  font-size: 15px;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
  background: white;
  border-radius: 8px;
  border: 2px dashed #e0e0e0;
`;

const EmptyStateText = styled.p`
  margin: 0;
  font-size: 15px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid #e0e0e0;
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  background: #f5f5f5;
  color: #333;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e8e8e8;
    border-color: #ccc;
    transform: translateY(-1px);
  }
`;

const ManageMeasurementPage = () => {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [measurements, setMeasurements] = useState<CustomerMeasurementResponse | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isEditingTop, setIsEditingTop] = useState(false);
  const [isEditingBottom, setIsEditingBottom] = useState(false);
  const [isAddingTop, setIsAddingTop] = useState(false);
  const [isAddingBottom, setIsAddingBottom] = useState(false);

  const { showSuccess, showError } = useToast();

  const [topFormData, setTopFormData] = useState({
    length: 0,
    shoulder: 0,
    sleeveLength: 0,
    sleeveBottom: 0,
    chest: 0,
    waist: 0,
    hip: 0,
    neck: 0,
  });

  const [bottomFormData, setBottomFormData] = useState({
    length: 0,
    waist: 0,
    hip: 0,
    thigh: 0,
    knee: 0,
    calf: 0,
    bottom: 0,
    langot: 0,
  });

  useEffect(() => {
    if (customerId) {
      fetchCustomerAndMeasurements();
    }
  }, [customerId]);

  const fetchCustomerAndMeasurements = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      
      // Fetch customer info
      const customerResponse = await getCustomerByIdService(customerId);
      if (customerResponse.success === 200 && customerResponse.data) {
        setCustomerName(customerResponse.data.fullName);
        setCustomerEmail(customerResponse.data.emailId);
      }

      // Fetch measurements
      const response = await getCustomerMeasurementsService(customerId);
      if (response.success === 200 && response.data) {
        setMeasurements(response.data);
        
        // Pre-fill form data if measurements exist
        if (response.data.topMeasurement) {
          setTopFormData({
            length: Number(response.data.topMeasurement.length),
            shoulder: Number(response.data.topMeasurement.shoulder),
            sleeveLength: Number(response.data.topMeasurement.sleeveLength),
            sleeveBottom: Number(response.data.topMeasurement.sleeveBottom),
            chest: Number(response.data.topMeasurement.chest),
            waist: Number(response.data.topMeasurement.waist),
            hip: Number(response.data.topMeasurement.hip),
            neck: Number(response.data.topMeasurement.neck),
          });
        }
        
        if (response.data.bottomMeasurement) {
          setBottomFormData({
            length: Number(response.data.bottomMeasurement.length),
            waist: Number(response.data.bottomMeasurement.waist),
            hip: Number(response.data.bottomMeasurement.hip),
            thigh: Number(response.data.bottomMeasurement.thigh),
            knee: Number(response.data.bottomMeasurement.knee),
            calf: Number(response.data.bottomMeasurement.calf),
            bottom: Number(response.data.bottomMeasurement.bottom),
            langot: Number(response.data.bottomMeasurement.langot),
          });
        }
      } else {
        showError(response.message || 'Failed to load measurements', 'Error');
      }
    } catch (err: unknown) {
      console.error('Error fetching data:', err);
      showError('Failed to load data. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleTopFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTopFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleBottomFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBottomFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSaveTop = async () => {
    if (!customerId) return;

    setFormLoading(true);
    try {
      if (measurements?.topMeasurement) {
        // Edit existing
        const editData: EditMeasurementRequest = {
          topMeasurementId: measurements.topMeasurement.topMeasurementId,
          top: topFormData,
        };

        const response = await editMeasurementService(editData);
        if (response.success === 200) {
          showSuccess('Top measurements updated successfully!', 'Success');
          setIsEditingTop(false);
          await fetchCustomerAndMeasurements();
        } else {
          showError(response.message || 'Failed to update measurements', 'Error');
        }
      } else {
        // Add new
        const addData: AddMeasurementRequest = {
          customerId: customerId,
          top: topFormData,
        };

        const response = await addMeasurementService(addData);
        if (response.success === 201) {
          showSuccess('Top measurements added successfully!', 'Success');
          setIsAddingTop(false);
          await fetchCustomerAndMeasurements();
        } else {
          showError(response.message || 'Failed to add measurements', 'Error');
        }
      }
    } catch (err: unknown) {
      console.error('Error saving top measurements:', err);
      showError('An error occurred while saving measurements', 'Error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveBottom = async () => {
    if (!customerId) return;

    setFormLoading(true);
    try {
      if (measurements?.bottomMeasurement) {
        // Edit existing
        const editData: EditMeasurementRequest = {
          bottomMeasurementId: measurements.bottomMeasurement.bottomMeasurementId,
          bottom: bottomFormData,
        };

        const response = await editMeasurementService(editData);
        if (response.success === 200) {
          showSuccess('Bottom measurements updated successfully!', 'Success');
          setIsEditingBottom(false);
          await fetchCustomerAndMeasurements();
        } else {
          showError(response.message || 'Failed to update measurements', 'Error');
        }
      } else {
        // Add new
        const addData: AddMeasurementRequest = {
          customerId: customerId,
          bottom: bottomFormData,
        };

        const response = await addMeasurementService(addData);
        if (response.success === 201) {
          showSuccess('Bottom measurements added successfully!', 'Success');
          setIsAddingBottom(false);
          await fetchCustomerAndMeasurements();
        } else {
          showError(response.message || 'Failed to add measurements', 'Error');
        }
      }
    } catch (err: unknown) {
      console.error('Error saving bottom measurements:', err);
      showError('An error occurred while saving measurements', 'Error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTop(false);
    setIsEditingBottom(false);
    setIsAddingTop(false);
    setIsAddingBottom(false);
    fetchCustomerAndMeasurements(); // Reset form data
  };

  const renderMeasurementValue = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue.toFixed(2);
  };

  const handleBack = () => {
    navigate('/dashboard/customers');
  };

  return (
    <PageContainer>
      <PageHeader>
        <BackButton onClick={handleBack}>
          <FaArrowLeft />
          Back
        </BackButton>
        <PageTitle>
          <FaRuler />
          Manage Measurements
        </PageTitle>
      </PageHeader>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <CustomerInfo>
            <CustomerName>{customerName}</CustomerName>
            <CustomerEmail>{customerEmail}</CustomerEmail>
          </CustomerInfo>

          <MeasurementsContainer>
          {/* Top Measurements Section */}
          <MeasurementSection>
            <SectionHeader>
              <SectionTitle>
                <FaTshirt />
                Top Measurements
              </SectionTitle>
              {!isEditingTop && !isAddingTop && (
                <EditButton
                  onClick={() => {
                    if (measurements?.topMeasurement) {
                      setIsEditingTop(true);
                    } else {
                      setIsAddingTop(true);
                    }
                  }}
                  disabled={formLoading}
                >
                  {measurements?.topMeasurement ? (
                    <>
                      <FaEdit /> Edit
                    </>
                  ) : (
                    <>
                      <FaPlus /> Add
                    </>
                  )}
                </EditButton>
              )}
            </SectionHeader>

            {isEditingTop || isAddingTop ? (
              <div>
                <GridContainer>
                  <FormGroup>
                    <Label htmlFor="length">Length</Label>
                    <Input
                      type="number"
                      id="length"
                      name="length"
                      value={topFormData.length}
                      onChange={handleTopFormChange}
                      step="0.01"
                      min="0"
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="shoulder">Shoulder</Label>
                    <Input
                      type="number"
                      id="shoulder"
                      name="shoulder"
                      value={topFormData.shoulder}
                      onChange={handleTopFormChange}
                      step="0.01"
                      min="0"
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="sleeveLength">Sleeve Length</Label>
                    <Input
                      type="number"
                      id="sleeveLength"
                      name="sleeveLength"
                      value={topFormData.sleeveLength}
                      onChange={handleTopFormChange}
                      step="0.01"
                      min="0"
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="sleeveBottom">Sleeve Bottom</Label>
                    <Input
                      type="number"
                      id="sleeveBottom"
                      name="sleeveBottom"
                      value={topFormData.sleeveBottom}
                      onChange={handleTopFormChange}
                      step="0.01"
                      min="0"
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="chest">Chest</Label>
                    <Input
                      type="number"
                      id="chest"
                      name="chest"
                      value={topFormData.chest}
                      onChange={handleTopFormChange}
                      step="0.01"
                      min="0"
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="waist">Waist</Label>
                    <Input
                      type="number"
                      id="waist"
                      name="waist"
                      value={topFormData.waist}
                      onChange={handleTopFormChange}
                      step="0.01"
                      min="0"
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="hip">Hip</Label>
                    <Input
                      type="number"
                      id="hip"
                      name="hip"
                      value={topFormData.hip}
                      onChange={handleTopFormChange}
                      step="0.01"
                      min="0"
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="neck">Neck</Label>
                    <Input
                      type="number"
                      id="neck"
                      name="neck"
                      value={topFormData.neck}
                      onChange={handleTopFormChange}
                      step="0.01"
                      min="0"
                      disabled={formLoading}
                    />
                  </FormGroup>
                </GridContainer>
                <ButtonContainer>
                  <CancelButton onClick={handleCancelEdit} disabled={formLoading}>
                    Cancel
                  </CancelButton>
                  <Button onClick={handleSaveTop} disabled={formLoading}>
                    {formLoading ? <LoadingSpinner /> : 'Save'}
                  </Button>
                </ButtonContainer>
              </div>
            ) : measurements?.topMeasurement ? (
              <MeasurementDisplay>
                <MeasurementRow>
                  <MeasurementLabel>Length:</MeasurementLabel>
                  <MeasurementValue>{renderMeasurementValue(measurements.topMeasurement.length)}"</MeasurementValue>
                </MeasurementRow>
                <MeasurementRow>
                  <MeasurementLabel>Shoulder:</MeasurementLabel>
                  <MeasurementValue>{renderMeasurementValue(measurements.topMeasurement.shoulder)}"</MeasurementValue>
                </MeasurementRow>
                <MeasurementRow>
                  <MeasurementLabel>Sleeve Length:</MeasurementLabel>
                  <MeasurementValue>{renderMeasurementValue(measurements.topMeasurement.sleeveLength)}"</MeasurementValue>
                </MeasurementRow>
                <MeasurementRow>
                  <MeasurementLabel>Sleeve Bottom:</MeasurementLabel>
                  <MeasurementValue>{renderMeasurementValue(measurements.topMeasurement.sleeveBottom)}"</MeasurementValue>
                </MeasurementRow>
                <MeasurementRow>
                  <MeasurementLabel>Chest:</MeasurementLabel>
                  <MeasurementValue>{renderMeasurementValue(measurements.topMeasurement.chest)}"</MeasurementValue>
                </MeasurementRow>
                <MeasurementRow>
                  <MeasurementLabel>Waist:</MeasurementLabel>
                  <MeasurementValue>{renderMeasurementValue(measurements.topMeasurement.waist)}"</MeasurementValue>
                </MeasurementRow>
                <MeasurementRow>
                  <MeasurementLabel>Hip:</MeasurementLabel>
                  <MeasurementValue>{renderMeasurementValue(measurements.topMeasurement.hip)}"</MeasurementValue>
                </MeasurementRow>
                <MeasurementRow>
                  <MeasurementLabel>Neck:</MeasurementLabel>
                  <MeasurementValue>{renderMeasurementValue(measurements.topMeasurement.neck)}"</MeasurementValue>
                </MeasurementRow>
              </MeasurementDisplay>
            ) : (
              <EmptyState>
                <EmptyStateText>No top measurements found. Click "Add" to create new measurements.</EmptyStateText>
              </EmptyState>
            )}
          </MeasurementSection>

          {/* Bottom Measurements Section */}
          <MeasurementSection>
            <SectionHeader>
              <SectionTitle>
                <FaLongArrowAltRight />
                Bottom Measurements
              </SectionTitle>
              {!isEditingBottom && !isAddingBottom && (
                <EditButton
                  onClick={() => {
                    if (measurements?.bottomMeasurement) {
                      setIsEditingBottom(true);
                    } else {
                      setIsAddingBottom(true);
                    }
                  }}
                  disabled={formLoading}
                >
                  {measurements?.bottomMeasurement ? (
                    <>
                      <FaEdit /> Edit
                    </>
                  ) : (
                    <>
                      <FaPlus /> Add
                    </>
                  )}
                </EditButton>
              )}
            </SectionHeader>

            {isEditingBottom || isAddingBottom ? (
              <div>
                <GridContainer>
                  <FormGroup>
                    <Label htmlFor="bottom_length">Length</Label>
                    <Input
                      type="number"
                      id="bottom_length"
                      name="length"
                      value={bottomFormData.length}
                      onChange={handleBottomFormChange}
                      step="0.01"
                      min="0"
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="bottom_waist">Waist</Label>
                    <Input
                      type="number"
                      id="bottom_waist"
                      name="waist"
                      value={bottomFormData.waist}
                      onChange={handleBottomFormChange}
                      step="0.01"
                      min="0"
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="bottom_hip">Hip</Label>
                    <Input
                      type="number"
                      id="bottom_hip"
                      name="hip"
                      value={bottomFormData.hip}
                      onChange={handleBottomFormChange}
                      step="0.01"
                      min="0"
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="bottom_thigh">Thigh</Label>
                    <Input
                      type="number"
                      id="bottom_thigh"
                      name="thigh"
                      value={bottomFormData.thigh}
                      onChange={handleBottomFormChange}
                      step="0.01"
                      min="0"
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="bottom_knee">Knee</Label>
                    <Input
                      type="number"
                      id="bottom_knee"
                      name="knee"
                      value={bottomFormData.knee}
                      onChange={handleBottomFormChange}
                      step="0.01"
                      min="0"
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="bottom_calf">Calf</Label>
                    <Input
                      type="number"
                      id="bottom_calf"
                      name="calf"
                      value={bottomFormData.calf}
                      onChange={handleBottomFormChange}
                      step="0.01"
                      min="0"
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="bottom_bottom">Bottom</Label>
                    <Input
                      type="number"
                      id="bottom_bottom"
                      name="bottom"
                      value={bottomFormData.bottom}
                      onChange={handleBottomFormChange}
                      step="0.01"
                      min="0"
                      disabled={formLoading}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="bottom_langot">Langot</Label>
                    <Input
                      type="number"
                      id="bottom_langot"
                      name="langot"
                      value={bottomFormData.langot}
                      onChange={handleBottomFormChange}
                      step="0.01"
                      min="0"
                      disabled={formLoading}
                    />
                  </FormGroup>
                </GridContainer>
                <ButtonContainer>
                  <CancelButton onClick={handleCancelEdit} disabled={formLoading}>
                    Cancel
                  </CancelButton>
                  <Button onClick={handleSaveBottom} disabled={formLoading}>
                    {formLoading ? <LoadingSpinner /> : 'Save'}
                  </Button>
                </ButtonContainer>
              </div>
            ) : measurements?.bottomMeasurement ? (
              <MeasurementDisplay>
                <MeasurementRow>
                  <MeasurementLabel>Length:</MeasurementLabel>
                  <MeasurementValue>{renderMeasurementValue(measurements.bottomMeasurement.length)}"</MeasurementValue>
                </MeasurementRow>
                <MeasurementRow>
                  <MeasurementLabel>Waist:</MeasurementLabel>
                  <MeasurementValue>{renderMeasurementValue(measurements.bottomMeasurement.waist)}"</MeasurementValue>
                </MeasurementRow>
                <MeasurementRow>
                  <MeasurementLabel>Hip:</MeasurementLabel>
                  <MeasurementValue>{renderMeasurementValue(measurements.bottomMeasurement.hip)}"</MeasurementValue>
                </MeasurementRow>
                <MeasurementRow>
                  <MeasurementLabel>Thigh:</MeasurementLabel>
                  <MeasurementValue>{renderMeasurementValue(measurements.bottomMeasurement.thigh)}"</MeasurementValue>
                </MeasurementRow>
                <MeasurementRow>
                  <MeasurementLabel>Knee:</MeasurementLabel>
                  <MeasurementValue>{renderMeasurementValue(measurements.bottomMeasurement.knee)}"</MeasurementValue>
                </MeasurementRow>
                <MeasurementRow>
                  <MeasurementLabel>Calf:</MeasurementLabel>
                  <MeasurementValue>{renderMeasurementValue(measurements.bottomMeasurement.calf)}"</MeasurementValue>
                </MeasurementRow>
                <MeasurementRow>
                  <MeasurementLabel>Bottom:</MeasurementLabel>
                  <MeasurementValue>{renderMeasurementValue(measurements.bottomMeasurement.bottom)}"</MeasurementValue>
                </MeasurementRow>
                <MeasurementRow>
                  <MeasurementLabel>Langot:</MeasurementLabel>
                  <MeasurementValue>{renderMeasurementValue(measurements.bottomMeasurement.langot)}"</MeasurementValue>
                </MeasurementRow>
              </MeasurementDisplay>
            ) : (
              <EmptyState>
                <EmptyStateText>No bottom measurements found. Click "Add" to create new measurements.</EmptyStateText>
              </EmptyState>
              )}
          </MeasurementSection>
          </MeasurementsContainer>
        </>
      )}
    </PageContainer>
  );
};

export default ManageMeasurementPage;

