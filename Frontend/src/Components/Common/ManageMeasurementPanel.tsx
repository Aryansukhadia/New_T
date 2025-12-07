import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Checkroom as CheckroomIcon,
  SouthWest as SouthWestIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
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

interface ManageMeasurementPanelProps {
  customer: Customer | null;
  onMeasurementUpdated?: () => void;
}

const ManageMeasurementPanel: React.FC<ManageMeasurementPanelProps> = ({
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

  useEffect(() => {
    if (customer) {
      fetchMeasurements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  const fetchMeasurements = async () => {
    if (!customer) return;

    try {
      setLoading(true);
      const response = await getCustomerMeasurementsService(customer.customerId);
      if (response.success === 200 && response.data) {
        setMeasurements(response.data);

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
    if (!customer) return;

    setFormLoading(true);
    try {
      if (measurements?.topMeasurement) {
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

  const handleSaveAll = async () => {
    if (isEditingTop || isAddingTop) {
      await handleSaveTop();
    }
    if (isEditingBottom || isAddingBottom) {
      await handleSaveBottom();
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTop(false);
    setIsEditingBottom(false);
    setIsAddingTop(false);
    setIsAddingBottom(false);
    fetchMeasurements();
  };

  const renderMeasurementValue = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return numValue.toFixed(2);
  };

  return (
    <Paper
      sx={{
        background: '#ffffff',
        borderRadius: 1.5,
        border: '2px solid #e0e0e0',
      }}
    >
      {loading ? (
        <Box sx={{ textAlign: 'center', p: 2.5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Top Measurements Section */}
          <Box
            sx={{
              mb: 3,
              p: 2.5,
              bgcolor: '#f9f9f9',
              borderRadius: 1.5,
              border: '2px solid #e0e0e0',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                }}
              >
                <CheckroomIcon sx={{ color: '#667eea' }} />
                Top Measurements
              </Typography>
              {!isEditingTop && !isAddingTop && (
                <Button
                  variant="contained"
                  startIcon={measurements?.topMeasurement ? <EditIcon /> : <AddIcon />}
                  onClick={() => {
                    if (measurements?.topMeasurement) {
                      setIsEditingTop(true);
                    } else {
                      setIsAddingTop(true);
                    }
                  }}
                  disabled={formLoading}
                  sx={{
                    background: '#667eea',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: '#5568d3',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {measurements?.topMeasurement ? 'Edit' : 'Add'}
                </Button>
              )}
            </Box>

            {isEditingTop || isAddingTop ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                <TextField
                  fullWidth
                  label="Length"
                  type="number"
                  name="length"
                  value={topFormData.length}
                  onChange={handleTopFormChange}
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={formLoading}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Shoulder"
                  type="number"
                  name="shoulder"
                  value={topFormData.shoulder}
                  onChange={handleTopFormChange}
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={formLoading}
                  size="small"
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="Sleeve Length"
                    type="number"
                    name="sleeveLength"
                    value={topFormData.sleeveLength}
                    onChange={handleTopFormChange}
                    inputProps={{ step: 0.01, min: 0 }}
                    disabled={formLoading}
                    size="small"
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Sleeve Bottom"
                  type="number"
                  name="sleeveBottom"
                  value={topFormData.sleeveBottom}
                  onChange={handleTopFormChange}
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={formLoading}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Chest"
                  type="number"
                  name="chest"
                  value={topFormData.chest}
                  onChange={handleTopFormChange}
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={formLoading}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Waist"
                  type="number"
                  name="waist"
                  value={topFormData.waist}
                  onChange={handleTopFormChange}
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={formLoading}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Hip"
                  type="number"
                  name="hip"
                  value={topFormData.hip}
                  onChange={handleTopFormChange}
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={formLoading}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Neck"
                  type="number"
                  name="neck"
                  value={topFormData.neck}
                  onChange={handleTopFormChange}
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={formLoading}
                  size="small"
                />
              </Box>
            ) : measurements?.topMeasurement ? (
              <Box
                sx={{
                  bgcolor: 'white',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                }}
              >
                {[
                  { label: 'Length', value: measurements.topMeasurement.length },
                  { label: 'Shoulder', value: measurements.topMeasurement.shoulder },
                  { label: 'Sleeve Length', value: measurements.topMeasurement.sleeveLength },
                  { label: 'Sleeve Bottom', value: measurements.topMeasurement.sleeveBottom },
                  { label: 'Chest', value: measurements.topMeasurement.chest },
                  { label: 'Waist', value: measurements.topMeasurement.waist },
                  { label: 'Hip', value: measurements.topMeasurement.hip },
                  { label: 'Neck', value: measurements.topMeasurement.neck },
                ].map((item, index, arr) => (
                  <Box
                    key={item.label}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: index !== arr.length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: 14 }}>
                      {item.label}:
                    </Typography>
                    <Typography sx={{ color: '#333', fontSize: 14, fontWeight: 500 }}>
                      {renderMeasurementValue(item.value)}"
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 5,
                  px: 2.5,
                  color: '#666',
                  bgcolor: 'white',
                  borderRadius: 1,
                  border: '2px dashed #e0e0e0',
                }}
              >
                <Typography sx={{ fontSize: 14 }}>
                  No top measurements found. Click "Add" to create new measurements.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Bottom Measurements Section */}
          <Box
            sx={{
              mb: 3,
              p: 2.5,
              bgcolor: '#f9f9f9',
              borderRadius: 1.5,
              border: '2px solid #e0e0e0',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                }}
              >
                <SouthWestIcon sx={{ color: '#667eea' }} />
                Bottom Measurements
              </Typography>
              {!isEditingBottom && !isAddingBottom && (
                <Button
                  variant="contained"
                  startIcon={measurements?.bottomMeasurement ? <EditIcon /> : <AddIcon />}
                  onClick={() => {
                    if (measurements?.bottomMeasurement) {
                      setIsEditingBottom(true);
                    } else {
                      setIsAddingBottom(true);
                    }
                  }}
                  disabled={formLoading}
                  sx={{
                    background: '#667eea',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: '#5568d3',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {measurements?.bottomMeasurement ? 'Edit' : 'Add'}
                </Button>
              )}
            </Box>

            {isEditingBottom || isAddingBottom ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                <TextField
                  fullWidth
                  label="Length"
                  type="number"
                  name="length"
                  value={bottomFormData.length}
                  onChange={handleBottomFormChange}
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={formLoading}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Waist"
                  type="number"
                  name="waist"
                  value={bottomFormData.waist}
                  onChange={handleBottomFormChange}
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={formLoading}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Hip"
                  type="number"
                  name="hip"
                  value={bottomFormData.hip}
                  onChange={handleBottomFormChange}
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={formLoading}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Thigh"
                  type="number"
                  name="thigh"
                  value={bottomFormData.thigh}
                  onChange={handleBottomFormChange}
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={formLoading}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Knee"
                  type="number"
                  name="knee"
                  value={bottomFormData.knee}
                  onChange={handleBottomFormChange}
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={formLoading}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Calf"
                  type="number"
                  name="calf"
                  value={bottomFormData.calf}
                  onChange={handleBottomFormChange}
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={formLoading}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Bottom"
                  type="number"
                  name="bottom"
                  value={bottomFormData.bottom}
                  onChange={handleBottomFormChange}
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={formLoading}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Langot"
                  type="number"
                  name="langot"
                  value={bottomFormData.langot}
                  onChange={handleBottomFormChange}
                  inputProps={{ step: 0.01, min: 0 }}
                  disabled={formLoading}
                  size="small"
                />
              </Box>
            ) : measurements?.bottomMeasurement ? (
              <Box
                sx={{
                  bgcolor: 'white',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                }}
              >
                {[
                  { label: 'Length', value: measurements.bottomMeasurement.length },
                  { label: 'Waist', value: measurements.bottomMeasurement.waist },
                  { label: 'Hip', value: measurements.bottomMeasurement.hip },
                  { label: 'Thigh', value: measurements.bottomMeasurement.thigh },
                  { label: 'Knee', value: measurements.bottomMeasurement.knee },
                  { label: 'Calf', value: measurements.bottomMeasurement.calf },
                  { label: 'Bottom', value: measurements.bottomMeasurement.bottom },
                  { label: 'Langot', value: measurements.bottomMeasurement.langot },
                ].map((item, index, arr) => (
                  <Box
                    key={item.label}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: index !== arr.length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, color: '#666', fontSize: 14 }}>
                      {item.label}:
                    </Typography>
                    <Typography sx={{ color: '#333', fontSize: 14, fontWeight: 500 }}>
                      {renderMeasurementValue(item.value)}"
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 5,
                  px: 2.5,
                  color: '#666',
                  bgcolor: 'white',
                  borderRadius: 1,
                  border: '2px dashed #e0e0e0',
                }}
              >
                <Typography sx={{ fontSize: 14 }}>
                  No bottom measurements found. Click "Add" to create new measurements.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          {(isEditingTop || isAddingTop || isEditingBottom || isAddingBottom) && (
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                justifyContent: 'flex-end',
                mt: 3,
                pt: 2.5,
                borderTop: '2px solid #e0e0e0',
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCancelEdit}
                disabled={formLoading}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveAll}
                disabled={formLoading}
                sx={{
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                  },
                }}
              >
                {formLoading ? <CircularProgress size={24} color="inherit" /> : 'Save'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default ManageMeasurementPanel;
