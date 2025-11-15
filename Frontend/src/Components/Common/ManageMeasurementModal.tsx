import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button as MuiButton,
} from '@mui/material';
import {
  Checkroom as CheckroomIcon,
  ArrowForward as ArrowForwardIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import Modal from './Modal';
import {
  FormGroup,
  Label,
  Input,
  Button,
  LoadingSpinner,
} from './FormComponents';
import {
  getCustomerMeasurementsService,
  editMeasurementService,
  addMeasurementService,
  type CustomerMeasurementResponse,
  type EditMeasurementRequest,
  type AddMeasurementRequest,
} from '../../Services/ApiServices';
import { useToast } from '../../Utils/ToastContext';
import type { Customer } from '../../Services/ApiServices';


interface ManageMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onMeasurementUpdated?: () => void;
}

const ManageMeasurementModal: React.FC<ManageMeasurementModalProps> = ({
  isOpen,
  onClose,
  customer,
  onMeasurementUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [measurements, setMeasurements] = useState<CustomerMeasurementResponse | null>(null);
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

  const fetchMeasurements = useCallback(async () => {
    if (!customer) return;

    try {
      setLoading(true);
      const response = await getCustomerMeasurementsService(customer.customerId);
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
      console.error('Error fetching measurements:', err);
      showError('Failed to load measurements. Please try again.', 'Error');
    } finally {
      setLoading(false);
    }
  }, [customer, showError]);

  useEffect(() => {
    if (isOpen && customer) {
      fetchMeasurements();
    }
  }, [isOpen, customer, fetchMeasurements]);

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

  const handleSaveAll = async () => {
    // Save whichever section(s) are currently in add/edit mode
    if (isEditingTop || isAddingTop) {
      await handleSaveTop();
    }
    if (isEditingBottom || isAddingBottom) {
      await handleSaveBottom();
    }
  };

  const handleSaveTop = async () => {
    if (!customer) return;

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
          await fetchMeasurements();
          onMeasurementUpdated?.();
        } else {
          showError(response.message || 'Failed to update measurements', 'Error');
        }
      } else {
        // Add new
        const addData: AddMeasurementRequest = {
          customerId: customer.customerId,
          top: topFormData,
        };

        const response = await addMeasurementService(addData);
        if (response.success === 201) {
          showSuccess('Top measurements added successfully!', 'Success');
          setIsAddingTop(false);
          await fetchMeasurements();
          onMeasurementUpdated?.();
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
    if (!customer) return;

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
          await fetchMeasurements();
          onMeasurementUpdated?.();
        } else {
          showError(response.message || 'Failed to update measurements', 'Error');
        }
      } else {
        // Add new
        const addData: AddMeasurementRequest = {
          customerId: customer.customerId,
          bottom: bottomFormData,
        };

        const response = await addMeasurementService(addData);
        if (response.success === 201) {
          showSuccess('Bottom measurements added successfully!', 'Success');
          setIsAddingBottom(false);
          await fetchMeasurements();
          onMeasurementUpdated?.();
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
    fetchMeasurements(); // Reset form data
  };

  const renderMeasurementValue = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue.toFixed(2);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Measurements - ${customer?.fullName || ''}`}
      size="large"
    >
      <Box
        sx={{
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: 1,
        }}
      >
        {loading ? (
          <Box sx={{ textAlign: 'center', padding: 5 }}>
            <LoadingSpinner />
          </Box>
        ) : (
          <>
            {/* Top Measurements Section */}
            <Paper
              sx={{
                marginBottom: 3,
                padding: 2.5,
                background: '#f9f9f9',
                borderRadius: 1.5,
                border: '2px solid #e0e0e0',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 2,
                }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 600,
                    color: '#333',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    '& svg': {
                      color: '#667eea',
                    },
                  }}
                >
                  <CheckroomIcon />
                  Top Measurements
                </Typography>
                {!isEditingTop && !isAddingTop && (
                  <MuiButton
                    onClick={() => {
                      if (measurements?.topMeasurement) {
                        setIsEditingTop(true);
                      } else {
                        setIsAddingTop(true);
                      }
                    }}
                    disabled={formLoading}
                    startIcon={measurements?.topMeasurement ? <EditIcon /> : <AddIcon />}
                    sx={{
                      padding: '8px 16px',
                      background: '#667eea',
                      color: 'white',
                      borderRadius: 1.5,
                      fontSize: '14px',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: '#5568d3',
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        opacity: 0.6,
                        transform: 'none',
                      },
                    }}
                  >
                    {measurements?.topMeasurement ? 'Edit' : 'Add'}
                  </MuiButton>
                )}
              </Box>

              {isEditingTop || isAddingTop ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                    },
                    gap: 2,
                  }}
                >
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
                </Box>
              ) : measurements?.topMeasurement ? (
                <Paper
                  sx={{
                    background: 'white',
                    padding: 2,
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: '14px' }}>Length:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{renderMeasurementValue(measurements.topMeasurement.length)}"</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: '14px' }}>Shoulder:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{renderMeasurementValue(measurements.topMeasurement.shoulder)}"</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: '14px' }}>Sleeve Length:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{renderMeasurementValue(measurements.topMeasurement.sleeveLength)}"</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: '14px' }}>Sleeve Bottom:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{renderMeasurementValue(measurements.topMeasurement.sleeveBottom)}"</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: '14px' }}>Chest:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{renderMeasurementValue(measurements.topMeasurement.chest)}"</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: '14px' }}>Waist:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{renderMeasurementValue(measurements.topMeasurement.waist)}"</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: '14px' }}>Hip:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{renderMeasurementValue(measurements.topMeasurement.hip)}"</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: '14px' }}>Neck:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{renderMeasurementValue(measurements.topMeasurement.neck)}"</Typography>
                  </Box>
                </Paper>
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#666',
                    background: 'white',
                    borderRadius: 1,
                    border: '2px dashed #e0e0e0',
                  }}
                >
                  <Typography sx={{ margin: 0, fontSize: '14px' }}>
                    No top measurements found. Click "Add" to create new measurements.
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Bottom Measurements Section */}
            <Paper
              sx={{
                marginBottom: 3,
                padding: 2.5,
                background: '#f9f9f9',
                borderRadius: 1.5,
                border: '2px solid #e0e0e0',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 2,
                }}
              >
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 600,
                    color: '#333',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    '& svg': {
                      color: '#667eea',
                    },
                  }}
                >
                  <ArrowForwardIcon />
                  Bottom Measurements
                </Typography>
                {!isEditingBottom && !isAddingBottom && (
                  <MuiButton
                    onClick={() => {
                      if (measurements?.bottomMeasurement) {
                        setIsEditingBottom(true);
                      } else {
                        setIsAddingBottom(true);
                      }
                    }}
                    disabled={formLoading}
                    startIcon={measurements?.bottomMeasurement ? <EditIcon /> : <AddIcon />}
                    sx={{
                      padding: '8px 16px',
                      background: '#667eea',
                      color: 'white',
                      borderRadius: 1.5,
                      fontSize: '14px',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: '#5568d3',
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        opacity: 0.6,
                        transform: 'none',
                      },
                    }}
                  >
                    {measurements?.bottomMeasurement ? 'Edit' : 'Add'}
                  </MuiButton>
                )}
              </Box>

              {isEditingBottom || isAddingBottom ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                    },
                    gap: 2,
                  }}
                >
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
                </Box>
              ) : measurements?.bottomMeasurement ? (
                <Paper
                  sx={{
                    background: 'white',
                    padding: 2,
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: '14px' }}>Length:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{renderMeasurementValue(measurements.bottomMeasurement.length)}"</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: '14px' }}>Waist:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{renderMeasurementValue(measurements.bottomMeasurement.waist)}"</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: '14px' }}>Hip:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{renderMeasurementValue(measurements.bottomMeasurement.hip)}"</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: '14px' }}>Thigh:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{renderMeasurementValue(measurements.bottomMeasurement.thigh)}"</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: '14px' }}>Knee:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{renderMeasurementValue(measurements.bottomMeasurement.knee)}"</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: '14px' }}>Calf:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{renderMeasurementValue(measurements.bottomMeasurement.calf)}"</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: '14px' }}>Bottom:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{renderMeasurementValue(measurements.bottomMeasurement.bottom)}"</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: '14px' }}>Langot:</Typography>
                    <Typography sx={{ color: '#333', fontSize: '14px', fontWeight: 500 }}>{renderMeasurementValue(measurements.bottomMeasurement.langot)}"</Typography>
                  </Box>
                </Paper>
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#666',
                    background: 'white',
                    borderRadius: 1,
                    border: '2px dashed #e0e0e0',
                  }}
                >
                  <Typography sx={{ margin: 0, fontSize: '14px' }}>
                    No bottom measurements found. Click "Add" to create new measurements.
                  </Typography>
                </Box>
              )}
            </Paper>
            {(isEditingTop || isAddingTop || isEditingBottom || isAddingBottom) && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  justifyContent: 'flex-end',
                  marginTop: 3,
                  paddingTop: 2.5,
                  borderTop: '2px solid #e0e0e0',
                }}
              >
                <MuiButton
                  onClick={handleCancelEdit}
                  disabled={formLoading}
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
                <Button onClick={handleSaveAll} disabled={formLoading}>
                  {formLoading ? <LoadingSpinner /> : 'Save'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Modal>
  );
};

export default ManageMeasurementModal;

