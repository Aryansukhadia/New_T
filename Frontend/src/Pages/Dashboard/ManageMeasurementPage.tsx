import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
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
import {
  Straighten as StraightenIcon,
  Checkroom as CheckroomIcon,
  ArrowRightAlt as ArrowRightAltIcon,
  Edit as EditIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

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

  const fetchCustomerAndMeasurements = useCallback(async () => {
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
  }, [customerId, showError]);

  useEffect(() => {
    if (customerId) {
      fetchCustomerAndMeasurements();
    }
  }, [customerId, fetchCustomerAndMeasurements]);

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

  type FieldConfig = { name: string; label: string };

  const topFieldConfigs: FieldConfig[] = [
    { name: 'length', label: 'Length' },
    { name: 'shoulder', label: 'Shoulder' },
    { name: 'sleeveLength', label: 'Sleeve Length' },
    { name: 'sleeveBottom', label: 'Sleeve Bottom' },
    { name: 'chest', label: 'Chest' },
    { name: 'waist', label: 'Waist' },
    { name: 'hip', label: 'Hip' },
    { name: 'neck', label: 'Neck' },
  ];

  const bottomFieldConfigs: FieldConfig[] = [
    { name: 'length', label: 'Length' },
    { name: 'waist', label: 'Waist' },
    { name: 'hip', label: 'Hip' },
    { name: 'thigh', label: 'Thigh' },
    { name: 'knee', label: 'Knee' },
    { name: 'calf', label: 'Calf' },
    { name: 'bottom', label: 'Bottom' },
    { name: 'langot', label: 'Langot' },
  ];

  const renderMeasurementRows = (
    configs: FieldConfig[],
    data?: Record<string, number | string | undefined>,
  ) => {
    if (!data) {
      return null;
    }

    return (
      <Box>
        {configs.map((field) => (
          <Box
            key={field.name}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              py: 1.5,
              borderBottom: '1px solid #f0f0f0',
              '&:last-of-type': { borderBottom: 'none' },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {field.label}:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {renderMeasurementValue(data[field.name] ?? 0)}"
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 1.5, p: 3 }}>
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  const renderMeasurementForm = (
    configs: FieldConfig[],
    formData: Record<string, number>,
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onSave: () => Promise<void> | void,
  ) => (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
        }}
      >
        {configs.map((field) => (
          <Box key={field.name}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {field.label}
            </Typography>
            <TextField
              fullWidth
              type="number"
              name={field.name}
              value={formData[field.name] ?? 0}
              onChange={handleChange}
              inputProps={{ step: 0.01, min: 0 }}
              disabled={formLoading}
            />
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          justifyContent: 'flex-end',
          mt: 3,
          pt: 2,
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <Button
          variant="outlined"
          onClick={handleCancelEdit}
          disabled={formLoading}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={formLoading}
          startIcon={formLoading ? <CircularProgress size={20} /> : undefined}
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
          {formLoading ? '' : 'Save'}
        </Button>
      </Box>
    </Box>
  );

  const renderEmptyState = (message: string) => (
    <Box
      sx={{
        textAlign: 'center',
        py: 6,
        border: '2px dashed #e0e0e0',
        borderRadius: 1,
        bgcolor: 'white',
        color: 'text.secondary',
      }}
    >
      <Typography variant="body2">{message}</Typography>
    </Box>
  );

  return (
    <Card sx={{ borderRadius: 1.5, p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Back
        </Button>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
          <StraightenIcon color="primary" />
          Manage Measurements
        </Typography>
      </Box>

      <Card sx={{ p: 2, mb: 3, bgcolor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {customerName}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {customerEmail}
        </Typography>
      </Card>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
        <Box>
          <Card sx={{ p: 3, minHeight: 420, border: '1px solid #e0e0e0', bgcolor: '#f9f9f9' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckroomIcon color="primary" />
                Top Measurements
              </Typography>
              {!isEditingTop && !isAddingTop && (
                <Button
                  variant="contained"
                  onClick={() => {
                    if (measurements?.topMeasurement) {
                      setIsEditingTop(true);
                    } else {
                      setIsAddingTop(true);
                    }
                  }}
                  startIcon={measurements?.topMeasurement ? <EditIcon /> : <AddIcon />}
                  disabled={formLoading}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                    },
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {measurements?.topMeasurement ? 'Edit' : 'Add'}
                </Button>
              )}
            </Box>
            {isEditingTop || isAddingTop
              ? renderMeasurementForm(
                topFieldConfigs,
                topFormData as Record<string, number>,
                handleTopFormChange,
                handleSaveTop,
              )
              : measurements?.topMeasurement
                ? (
                  <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                    {renderMeasurementRows(
                      topFieldConfigs,
                      measurements.topMeasurement as unknown as Record<string, number | string | undefined>,
                    )}
                  </Box>
                )
                : renderEmptyState('No top measurements found. Click "Add" to create new measurements.')}
          </Card>
        </Box>

        <Box>
          <Card sx={{ p: 3, minHeight: 420, border: '1px solid #e0e0e0', bgcolor: '#f9f9f9' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ArrowRightAltIcon color="primary" />
                Bottom Measurements
              </Typography>
              {!isEditingBottom && !isAddingBottom && (
                <Button
                  variant="contained"
                  onClick={() => {
                    if (measurements?.bottomMeasurement) {
                      setIsEditingBottom(true);
                    } else {
                      setIsAddingBottom(true);
                    }
                  }}
                  startIcon={measurements?.bottomMeasurement ? <EditIcon /> : <AddIcon />}
                  disabled={formLoading}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                    },
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  {measurements?.bottomMeasurement ? 'Edit' : 'Add'}
                </Button>
              )}
            </Box>
            {isEditingBottom || isAddingBottom
              ? renderMeasurementForm(
                bottomFieldConfigs,
                bottomFormData as Record<string, number>,
                handleBottomFormChange,
                handleSaveBottom,
              )
              : measurements?.bottomMeasurement
                ? (
                  <Box sx={{ bgcolor: 'white', p: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
                    {renderMeasurementRows(
                      bottomFieldConfigs,
                      measurements.bottomMeasurement as unknown as Record<string, number | string | undefined>,
                    )}
                  </Box>
                )
                : renderEmptyState('No bottom measurements found. Click "Add" to create new measurements.')}
          </Card>
        </Box>
      </Box>
    </Card>
  );
};

export default ManageMeasurementPage;

