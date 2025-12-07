import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import {
  bookOrderService,
  getAvailableReadyMadeItemsService,
  type BookOrderRequest,
  type OrderItem,
  type AvailableReadyMadeItem,
} from '../../Services/ApiServices/productOrderServices';
import { getCustomersService, createCustomerService, type Customer } from '../../Services/ApiServices/customerServices';
import { getProductsService, getProductVariantsService, type Product, type ProductVariant } from '../../Services/ApiServices/productServices';
import { useToast } from '../../Utils/ToastContext';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Collapse,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  ExpandMore as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  Straighten as RulerIcon,
} from '@mui/icons-material';
import ManageMeasurementPanel from '../../Components/Common/ManageMeasurementPanel';

const BookOrderPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { t } = useTranslation();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [readyMadeItems, setReadyMadeItems] = useState<AvailableReadyMadeItem[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const customerSelectRef = useRef<HTMLSelectElement>(null);
  const [showCreateCustomerForm, setShowCreateCustomerForm] = useState(false);
  const [createCustomerLoading, setCreateCustomerLoading] = useState(false);
  const [newlyCreatedCustomer, setNewlyCreatedCustomer] = useState<Customer | null>(null);
  const [isCustomerAccordionOpen, setIsCustomerAccordionOpen] = useState(false);
  const [isMeasurementAccordionOpen, setIsMeasurementAccordionOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState(false);

  const [orderFormData, setOrderFormData] = useState<BookOrderRequest>({
    customerId: '',
    deliveryDate: null,
    notes: null,
    items: [],
  });
  const [newCustomerForm, setNewCustomerForm] = useState({
    fullName: '',
    emailId: '',
    mobileNo: '',
    address: '',
    reference: '',
  });

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await getCustomersService();
      if (response.success === 200 && response.data) {
        setCustomers(response.data.customers);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      showError('Failed to load customers', 'Error');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await getProductsService();
      if (response.success === 200 && response.data) {
        setProducts(response.data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      showError('Failed to load products', 'Error');
    }
  }, [showError]);

  const fetchReadyMadeItems = useCallback(async () => {
    try {
      const response = await getAvailableReadyMadeItemsService();
      if (response.success === 200 && response.data) {
        setReadyMadeItems(response.data.items);
      }
    } catch (err) {
      console.error('Error fetching ready-made items:', err);
      showError('Failed to load ready-made items', 'Error');
    }
  }, [showError]);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchReadyMadeItems();
  }, [fetchCustomers, fetchProducts, fetchReadyMadeItems]);

  const handleAddOrderItem = () => {
    setOrderFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemType: 'custom',
          productId: '',
          productVariantId: '',
          readyMadeInventoryId: '',
          quantity: 1,
        },
      ],
    }));
  };

  const handleRemoveOrderItem = (index: number) => {
    setOrderFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleOrderItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    setOrderFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };

      // If itemType changed, reset relevant fields
      if (field === 'itemType' && typeof value === 'string') {
        if (value === 'custom') {
          newItems[index].readyMadeInventoryId = '';
        } else if (value === 'readyMade') {
          newItems[index].productId = '';
          newItems[index].productVariantId = '';
          setProductVariants([]);
        }
      }

      // If productId changed, reset productVariantId and fetch variants
      if (field === 'productId' && typeof value === 'string') {
        newItems[index].productVariantId = '';
        if (value) {
          fetchProductVariants(value);
        } else {
          setProductVariants([]);
        }
      }

      return {
        ...prev,
        items: newItems,
      };
    });
  };

  const fetchProductVariants = useCallback(async (productId: string) => {
    try {
      const response = await getProductVariantsService(productId);
      if (response.success === 200 && response.data) {
        setProductVariants(response.data.productVariants);
      }
    } catch (err) {
      console.error('Error fetching product variants:', err);
      showError('Failed to load product variants', 'Error');
    }
  }, [showError]);

  const handleBookOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await bookOrderService(orderFormData);

      if (response.success === 201) {
        showSuccess(response.message || 'Order booked successfully!', 'Success');
        setTimeout(() => {
          navigate('/dashboard/orders');
        }, 1000);
      } else {
        const errorMsg = response.message || 'Failed to book order';
        showError(errorMsg, 'Booking Failed');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const errorMsg = axiosError.response?.data?.message || 'An error occurred';
        showError(errorMsg, 'Booking Failed');
      } else {
        const errorMsg = 'An unexpected error occurred';
        showError(errorMsg, 'Booking Failed');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const resetNewCustomerForm = () => {
    setNewCustomerForm({
      fullName: '',
      emailId: '',
      mobileNo: '',
      address: '',
      reference: '',
    });
  };

  const handleOpenCreateCustomerForm = () => {
    setNewCustomer(true);
    resetNewCustomerForm();
    setShowCreateCustomerForm(true);
    setIsCustomerAccordionOpen(true);
    setIsMeasurementAccordionOpen(false);
  };

  const handleCreateCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomerForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateCustomer = async () => {
    if (
      !newCustomerForm.fullName.trim() ||
      !newCustomerForm.emailId.trim() ||
      !newCustomerForm.mobileNo.trim() ||
      !newCustomerForm.address.trim()
    ) {
      showError('Please fill in all required customer details', 'Validation Error');
      return;
    }

    setCreateCustomerLoading(true);
    try {
      const response = await createCustomerService({
        fullName: newCustomerForm.fullName.trim(),
        emailId: newCustomerForm.emailId.trim(),
        mobileNo: newCustomerForm.mobileNo.trim(),
        address: newCustomerForm.address.trim(),
        reference: newCustomerForm.reference.trim() || null,
      });

      if ((response.success === 201 || response.success === 200) && response.data) {
        const createdCustomer = response.data;
        setCustomers((prev) => [createdCustomer, ...prev]);
        setOrderFormData((prev) => ({ ...prev, customerId: createdCustomer.customerId }));
        setNewlyCreatedCustomer(createdCustomer);
        showSuccess(response.message || 'Customer created successfully!', 'Success');
        // Keep accordions visible; move focus to measurement accordion
        setIsCustomerAccordionOpen(false);
        setIsMeasurementAccordionOpen(true);
      } else {
        const errorMsg = response.message || 'Failed to create customer';
        showError(errorMsg, 'Create Failed');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        const errorMsg = axiosError.response?.data?.message || 'Failed to create customer';
        showError(errorMsg, 'Create Failed');
      } else {
        showError('An unexpected error occurred', 'Create Failed');
      }
    } finally {
      setCreateCustomerLoading(false);
    }
  };

  const handleMeasurementUpdated = () => {
    showSuccess('Measurements saved successfully!', 'Success');
    setIsMeasurementAccordionOpen(false);
    setNewCustomer(false);
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

  return (
    <Card sx={{ borderRadius: 1.5, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('orders.bookNewOrder')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard/orders')}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {t('common.back')} {t('orders.title')}
        </Button>
      </Box>

      <Box component="form" onSubmit={handleBookOrder} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {t('orders.customer')} *
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
              <Button
                type="button"
                variant="outlined"
                onClick={handleOpenCreateCustomerForm}
                disabled={formLoading || newCustomer}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#e0e0e0',
                  color: '#333',
                  bgcolor: '#f8f9fa',
                  '&:hover': {
                    borderColor: '#667eea',
                    color: '#667eea',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(102, 126, 234, 0.2)',
                  },
                }}
              >
                {t('orders.newCustomerButton') || 'Create New Customer'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => {
                  customerSelectRef.current?.focus();
                  setNewCustomer(false)
                }}
                disabled={formLoading || !newCustomer}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: '#e0e0e0',
                  color: '#333',
                  bgcolor: '#f8f9fa',
                  '&:hover': {
                    borderColor: '#667eea',
                    color: '#667eea',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(102, 126, 234, 0.2)',
                  },
                }}
              >
                {t('orders.existingCustomerButton') || 'Select Existing Customer'}
              </Button>
            </Box>
            {newCustomer && (
              <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  endIcon={isCustomerAccordionOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                  onClick={() => setIsCustomerAccordionOpen((o) => !o)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: '#e0e0e0',
                    color: '#333',
                    bgcolor: '#f8f9fa',
                  }}
                >
                  {t('customers.addNewCustomerTitle') || 'Add New Customer'}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<RulerIcon />}
                  endIcon={isMeasurementAccordionOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                  onClick={() => setIsMeasurementAccordionOpen((o) => !o)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: '#e0e0e0',
                    color: '#333',
                    bgcolor: '#f8f9fa',
                  }}
                >
                  {t('customers.measurements') || 'Measurements'}
                </Button>
              </Box>
            )}
          </Box>
          {!newCustomer && (
            <TextField
              fullWidth
              select
              id="customerId"
              inputRef={customerSelectRef}
              value={orderFormData.customerId}
              onChange={(e) => setOrderFormData((prev) => ({ ...prev, customerId: e.target.value }))}
              required
              disabled={formLoading}
            >
              <MenuItem value="">{t('orders.customer')} {t('common.select') || 'Select'}</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer.customerId} value={customer.customerId}>
                  {customer.fullName} ({customer.emailId})
                </MenuItem>
              ))}
            </TextField>
          )}
        </Box>
        {showCreateCustomerForm && newCustomer && (
          <>
            <Collapse in={isCustomerAccordionOpen}>
              <Box sx={{ width: '100%', border: '2px solid #e0e0e0', borderRadius: 1.5, p: 2, bgcolor: '#ffffff', mb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      {t('customers.fullName')} *
                    </Typography>
                    <TextField
                      fullWidth
                      id="newCustomerFullName"
                      name="fullName"
                      value={newCustomerForm.fullName}
                      onChange={handleCreateCustomerChange}
                      required
                      disabled={createCustomerLoading}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      {t('customers.email')} *
                    </Typography>
                    <TextField
                      fullWidth
                      id="newCustomerEmail"
                      type="email"
                      name="emailId"
                      value={newCustomerForm.emailId}
                      onChange={handleCreateCustomerChange}
                      required
                      disabled={createCustomerLoading}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      {t('customers.mobile')} *
                    </Typography>
                    <TextField
                      fullWidth
                      id="newCustomerMobile"
                      name="mobileNo"
                      value={newCustomerForm.mobileNo}
                      onChange={handleCreateCustomerChange}
                      required
                      disabled={createCustomerLoading}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      {t('customers.address')} *
                    </Typography>
                    <TextField
                      fullWidth
                      id="newCustomerAddress"
                      name="address"
                      value={newCustomerForm.address}
                      onChange={handleCreateCustomerChange}
                      required
                      disabled={createCustomerLoading}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      {t('customers.reference') || 'Reference'} ({t('orders.optional')})
                    </Typography>
                    <TextField
                      fullWidth
                      id="newCustomerReference"
                      name="reference"
                      value={newCustomerForm.reference}
                      onChange={handleCreateCustomerChange}
                      disabled={createCustomerLoading}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => {
                        setShowCreateCustomerForm(false);
                        setIsCustomerAccordionOpen(false);
                        setIsMeasurementAccordionOpen(false);
                      }}
                      disabled={createCustomerLoading}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="button"
                      variant="contained"
                      onClick={handleCreateCustomer}
                      disabled={createCustomerLoading}
                      startIcon={createCustomerLoading ? <CircularProgress size={20} /> : <PersonAddIcon />}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                        },
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {createCustomerLoading ? '' : t('customers.createCustomer') || 'Create Customer'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Collapse>
            <Collapse in={isMeasurementAccordionOpen}>
              <Box sx={{ width: '100%', border: '2px solid #e0e0e0', borderRadius: 1.5, p: 2, bgcolor: '#ffffff', mb: 2 }}>
                {newlyCreatedCustomer ? (
                  <ManageMeasurementPanel
                    customer={newlyCreatedCustomer}
                    onMeasurementUpdated={handleMeasurementUpdated}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', py: 2.5, color: 'text.secondary' }}>
                    <Typography variant="body2">
                      {t('customers.createFirst') || 'Please create the customer first to add measurements.'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Collapse>
          </>
        )}

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {t('orders.deliveryDate')} ({t('orders.optional')})
          </Typography>
          <TextField
            fullWidth
            type="date"
            id="deliveryDate"
            value={orderFormData.deliveryDate || ''}
            onChange={(e) =>
              setOrderFormData((prev) => ({
                ...prev,
                deliveryDate: e.target.value || null,
              }))
            }
            disabled={formLoading}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {t('orders.notes')} ({t('orders.optional')})
          </Typography>
          <TextField
            fullWidth
            id="notes"
            value={orderFormData.notes || ''}
            onChange={(e) =>
              setOrderFormData((prev) => ({
                ...prev,
                notes: e.target.value || null,
              }))
            }
            placeholder="Enter any additional notes"
            disabled={formLoading}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, m: 0 }}>
              {t('orders.orderItems')} *
            </Typography>
            <Button
              type="button"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddOrderItem}
              sx={{
                py: 1,
                px: 2,
                fontSize: 12,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {t('orders.addItem')}
            </Button>
          </Box>

          {orderFormData.items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 2.5, color: 'text.secondary' }}>
              <Typography variant="body2">
                {t('orders.noItemsAdded') || 'No items added. Click "Add Item" to add products to the order.'}
              </Typography>
            </Box>
          ) : (
            orderFormData.items.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-end',
                  mb: 2,
                  p: 2,
                  bgcolor: '#f8f9fa',
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: 'flex', gap: 1.5, flex: 1, flexWrap: 'wrap' }}>
                  {/* Item Type Selector */}
                  <Box sx={{ flex: 1, minWidth: 150 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Item Type *
                    </Typography>
                    <TextField
                      fullWidth
                      select
                      value={item.itemType || 'custom'}
                      onChange={(e) => handleOrderItemChange(index, 'itemType', e.target.value)}
                      required
                      disabled={formLoading}
                    >
                      <MenuItem value="custom">Custom (Tailored)</MenuItem>
                      <MenuItem value="readyMade">Ready-Made</MenuItem>
                    </TextField>
                  </Box>

                  {/* Conditional Fields Based on Item Type */}
                  {(item.itemType || 'custom') === 'custom' ? (
                    <>
                      <Box sx={{ flex: 1, minWidth: 150 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          {t('orders.product')} *
                        </Typography>
                        <TextField
                          fullWidth
                          select
                          value={item.productId || ''}
                          onChange={(e) => handleOrderItemChange(index, 'productId', e.target.value)}
                          required
                          disabled={formLoading}
                        >
                          <MenuItem value="">{t('orders.product')} {t('common.select') || 'Select'}</MenuItem>
                          {products.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 150 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          {t('orders.variant')} *
                        </Typography>
                        <TextField
                          fullWidth
                          select
                          value={item.productVariantId || ''}
                          onChange={(e) => handleOrderItemChange(index, 'productVariantId', e.target.value)}
                          required
                          disabled={formLoading || !item.productId}
                        >
                          <MenuItem value="">{t('orders.variant')} {t('common.select') || 'Select'}</MenuItem>
                          {productVariants
                            .filter((variant) => variant.productId === item.productId)
                            .map((variant) => (
                              <MenuItem key={variant.id} value={variant.id}>
                                {variant.name}
                              </MenuItem>
                            ))}
                        </TextField>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ flex: 2, minWidth: 300 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Ready-Made Item *
                      </Typography>
                      <TextField
                        fullWidth
                        select
                        value={item.readyMadeInventoryId || ''}
                        onChange={(e) => handleOrderItemChange(index, 'readyMadeInventoryId', e.target.value)}
                        required
                        disabled={formLoading}
                      >
                        <MenuItem value="">Select Ready-Made Item</MenuItem>
                        {readyMadeItems.map((readyMade) => (
                          <MenuItem key={readyMade.id} value={readyMade.id}>
                            {readyMade.name} - {readyMade.readyMade?.color || 'N/A'}
                            {readyMade.readyMade?.sizeLabel && ` (${readyMade.readyMade.sizeLabel})`}
                            {readyMade.readyMade?.sizeNumber && ` (${readyMade.readyMade.sizeNumber})`}
                            {' - Stock: '}{readyMade.readyMade?.quantity || 0}
                            {readyMade.readyMade?.price && ` - ₹${Number(readyMade.readyMade.price).toFixed(2)}`}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  )}

                  {/* Quantity Field */}
                  <Box sx={{ flex: 1, minWidth: 150 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      {t('orders.quantity')} *
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      inputProps={{
                        min: 1,
                        max: item.itemType === 'readyMade'
                          ? readyMadeItems.find(rm => rm.id === item.readyMadeInventoryId)?.readyMade?.quantity
                          : undefined
                      }}
                      value={item.quantity}
                      onChange={(e) => handleOrderItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      required
                      disabled={formLoading}
                    />
                  </Box>
                </Box>
                <Button
                  type="button"
                  onClick={() => handleRemoveOrderItem(index)}
                  disabled={formLoading}
                  title="Remove Item"
                  sx={{
                    p: 1.5,
                    bgcolor: '#ffebee',
                    color: '#d32f2f',
                    border: 'none',
                    borderRadius: 1,
                    minWidth: 'auto',
                    height: 'fit-content',
                    '&:hover': {
                      bgcolor: '#ffcdd2',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </Button>
              </Box>
            ))
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3, pt: 3, borderTop: '2px solid #e0e0e0' }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => navigate('/dashboard/orders')}
            disabled={formLoading}
            sx={{ textTransform: 'none', fontWeight: 600, minWidth: 140 }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formLoading || orderFormData.items.length === 0}
            startIcon={formLoading ? <CircularProgress size={20} /> : <ShoppingCartIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              },
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 140,
            }}
          >
            {formLoading ? '' : t('orders.bookOrder')}
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default BookOrderPage;

