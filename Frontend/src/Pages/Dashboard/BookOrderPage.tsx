import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from '../../hooks/useTranslation';
import {
  bookOrderService,
  type BookOrderRequest,
  type OrderItem,
} from '../../Services/ApiServices/productOrderServices';
import { getCustomersService, createCustomerService, type Customer } from '../../Services/ApiServices/customerServices';
import { getProductsService, getProductVariantsService, type Product, type ProductVariant } from '../../Services/ApiServices/productServices';
import { useToast } from '../../Utils/ToastContext';
import {
  FormGroup,
  Label,
  Input,
  Button,
  LoadingSpinner,
} from '../../Components/Common/FormComponents';
import {
  FaShoppingCart,
  FaPlus,
  FaTrash,
  FaArrowLeft,
  FaUserPlus,
  FaChevronDown,
  FaChevronRight,
  FaRuler,
} from 'react-icons/fa';
import ManageMeasurementPanel from '../../Components/Common/ManageMeasurementPanel';

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

const ActionButton = styled(Button)`
  padding: 14px 28px;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;

  svg {
    font-size: 14px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const CustomerButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
`;

const OrderItemRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const OrderItemFields = styled.div`
  display: flex;
  gap: 12px;
  flex: 1;
  flex-wrap: wrap;
`;

const OrderItemField = styled.div`
  flex: 1;
  min-width: 150px;
`;

const RemoveItemButton = styled.button`
  padding: 12px;
  background: #ffebee;
  color: #d32f2f;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  height: fit-content;

  &:hover {
    background: #ffcdd2;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const EmptyStateText = styled.p`
  font-size: 14px;
  margin: 0;
`;

const AccordionHeader = styled.button`
  width: fit-content;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  cursor: pointer;
  font-weight: 700;
  color: #333;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
`;

const AccordionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 12px;
`;

const AccordionContent = styled.div`
  width: 100%;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  background: #ffffff;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #e0e0e0;
`;

const CustomerActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const CustomerActionButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  background: #f8f9fa;
  color: #333;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #667eea;
    color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const AccordionSelectionBox = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const BookOrderPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { t } = useTranslation();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
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
        setCustomers(response.data);
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
        setProducts(response.data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      showError('Failed to load products', 'Error');
    }
  }, [showError]);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, [fetchCustomers, fetchProducts]);

  const handleAddOrderItem = () => {
    setOrderFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: '',
          productVariantId: '',
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
        setProductVariants(response.data);
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
        <PageTitle>{t('orders.bookNewOrder')}</PageTitle>
        <BackButton onClick={() => navigate('/dashboard/orders')}>
          <FaArrowLeft /> {t('common.back')} {t('orders.title')}
        </BackButton>
      </PageHeader>

      <form onSubmit={handleBookOrder} style={{ display: 'flex', flexDirection: 'column' }}>
        <FormGroup>
          <Label htmlFor="customerId">{t('orders.customer')} *</Label>
          <CustomerButtonContainer>
            <CustomerActionButtons>
              <CustomerActionButton
                type="button"
                onClick={handleOpenCreateCustomerForm}
                disabled={formLoading || newCustomer}
              >
                {t('orders.newCustomerButton') || 'Create New Customer'}
              </CustomerActionButton>
              <CustomerActionButton
                type="button"
                onClick={() => {
                  customerSelectRef.current?.focus();
                  setNewCustomer(false)
                }}
                disabled={formLoading || !newCustomer}
              >
                {t('orders.existingCustomerButton') || 'Select Existing Customer'}
              </CustomerActionButton>
            </CustomerActionButtons>
            {newCustomer && (
              <AccordionSelectionBox>
                <AccordionHeader
                  type="button"
                  onClick={() => setIsCustomerAccordionOpen((o) => !o)}
                  aria-expanded={isCustomerAccordionOpen}
                >
                  <AccordionTitle>
                    <FaUserPlus /> {t('customers.addNewCustomerTitle') || 'Add New Customer'}
                  </AccordionTitle>
                  {isCustomerAccordionOpen ? <FaChevronDown /> : <FaChevronRight />}
                </AccordionHeader>
                <AccordionHeader
                  type="button"
                  onClick={() => setIsMeasurementAccordionOpen((o) => !o)}
                  aria-expanded={isMeasurementAccordionOpen}
                >
                  <AccordionTitle>
                    <FaRuler /> {t('customers.measurements') || 'Measurements'}
                  </AccordionTitle>
                  {isMeasurementAccordionOpen ? <FaChevronDown /> : <FaChevronRight />}
                </AccordionHeader>
              </AccordionSelectionBox>
            )}
          </CustomerButtonContainer>
          {!newCustomer && (
            <Select
              id="customerId"
              ref={customerSelectRef}
              value={orderFormData.customerId}
              onChange={(e) => setOrderFormData((prev) => ({ ...prev, customerId: e.target.value }))}
              required
              disabled={formLoading}
            >
              <option value="">{t('orders.customer')} {t('common.select') || 'Select'}</option>
              {customers.map((customer) => (
                <option key={customer.customerId} value={customer.customerId}>
                  {customer.fullName} ({customer.emailId})
                </option>
              ))}
            </Select>
          )}
        </FormGroup>
        {showCreateCustomerForm && newCustomer && (
          <>
            {isCustomerAccordionOpen && (
              <AccordionContent>
                <FormGroup>
                  <Label htmlFor="newCustomerFullName">{t('customers.fullName')} *</Label>
                  <Input
                    id="newCustomerFullName"
                    name="fullName"
                    value={newCustomerForm.fullName}
                    onChange={handleCreateCustomerChange}
                    required
                    disabled={createCustomerLoading}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="newCustomerEmail">{t('customers.email')} *</Label>
                  <Input
                    id="newCustomerEmail"
                    type="email"
                    name="emailId"
                    value={newCustomerForm.emailId}
                    onChange={handleCreateCustomerChange}
                    required
                    disabled={createCustomerLoading}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="newCustomerMobile">{t('customers.mobile')} *</Label>
                  <Input
                    id="newCustomerMobile"
                    name="mobileNo"
                    value={newCustomerForm.mobileNo}
                    onChange={handleCreateCustomerChange}
                    required
                    disabled={createCustomerLoading}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="newCustomerAddress">{t('customers.address')} *</Label>
                  <Input
                    id="newCustomerAddress"
                    name="address"
                    value={newCustomerForm.address}
                    onChange={handleCreateCustomerChange}
                    required
                    disabled={createCustomerLoading}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="newCustomerReference">{t('customers.reference') || 'Reference'} ({t('orders.optional')})</Label>
                  <Input
                    id="newCustomerReference"
                    name="reference"
                    value={newCustomerForm.reference}
                    onChange={handleCreateCustomerChange}
                    disabled={createCustomerLoading}
                  />
                </FormGroup>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <CustomerActionButton
                    type="button"
                    onClick={() => {
                      setShowCreateCustomerForm(false);
                      setIsCustomerAccordionOpen(false);
                      setIsMeasurementAccordionOpen(false);
                    }}
                    disabled={createCustomerLoading}
                  >
                    {t('common.cancel')}
                  </CustomerActionButton>
                  <Button type="button" onClick={handleCreateCustomer} disabled={createCustomerLoading}>
                    {createCustomerLoading ? <LoadingSpinner /> : <><FaUserPlus /> {t('customers.createCustomer') || 'Create Customer'}</>}
                  </Button>
                </div>
              </AccordionContent>
            )}
            {isMeasurementAccordionOpen && (
              <AccordionContent>
                {newlyCreatedCustomer ? (
                  <ManageMeasurementPanel
                    customer={newlyCreatedCustomer}
                    onMeasurementUpdated={handleMeasurementUpdated}
                  />
                ) : (
                  <EmptyState>
                    <EmptyStateText>{t('customers.createFirst') || 'Please create the customer first to add measurements.'}</EmptyStateText>
                  </EmptyState>
                )}
              </AccordionContent>
            )}
          </>
        )}

        <FormGroup>
          <Label htmlFor="deliveryDate">{t('orders.deliveryDate')} ({t('orders.optional')})</Label>
          <Input
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
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="notes">{t('orders.notes')} ({t('orders.optional')})</Label>
          <Input
            type="text"
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
        </FormGroup>

        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Label style={{ margin: 0 }}>{t('orders.orderItems')} *</Label>
            <ActionButton type="button" onClick={handleAddOrderItem} style={{ padding: '8px 16px', fontSize: '12px' }}>
              <FaPlus /> {t('orders.addItem')}
            </ActionButton>
          </div>

          {orderFormData.items.length === 0 ? (
            <EmptyState>
              <EmptyStateText>{t('orders.noItemsAdded') || 'No items added. Click "Add Item" to add products to the order.'}</EmptyStateText>
            </EmptyState>
          ) : (
            orderFormData.items.map((item, index) => (
              <OrderItemRow key={index}>
                <OrderItemFields>
                  <OrderItemField>
                    <Label>{t('orders.product')} *</Label>
                    <Select
                      value={item.productId}
                      onChange={(e) => handleOrderItemChange(index, 'productId', e.target.value)}
                      required
                      disabled={formLoading}
                    >
                      <option value="">{t('orders.product')} {t('common.select') || 'Select'}</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </Select>
                  </OrderItemField>
                  <OrderItemField>
                    <Label>{t('orders.variant')} *</Label>
                    <Select
                      value={item.productVariantId}
                      onChange={(e) => handleOrderItemChange(index, 'productVariantId', e.target.value)}
                      required
                      disabled={formLoading || !item.productId}
                    >
                      <option value="">{t('orders.variant')} {t('common.select') || 'Select'}</option>
                      {productVariants
                        .filter((variant) => variant.productId === item.productId)
                        .map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.name}
                          </option>
                        ))}
                    </Select>
                  </OrderItemField>
                  <OrderItemField>
                    <Label>{t('orders.quantity')} *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleOrderItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      required
                      disabled={formLoading}
                    />
                  </OrderItemField>
                </OrderItemFields>
                <RemoveItemButton
                  type="button"
                  onClick={() => handleRemoveOrderItem(index)}
                  disabled={formLoading}
                  title="Remove Item"
                >
                  <FaTrash />
                </RemoveItemButton>
              </OrderItemRow>
            ))
          )}
        </div>

        <FormActions>
          <BackButton type="button" onClick={() => navigate('/dashboard/orders')} disabled={formLoading}>
            {t('common.cancel')}
          </BackButton>
          <ActionButton type="submit" disabled={formLoading || orderFormData.items.length === 0}>
            {formLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <FaShoppingCart /> {t('orders.bookOrder')}
              </>
            )}
          </ActionButton>
        </FormActions>
      </form>

      {/* Measurement panel is rendered within the accordion above when opened */}
    </PageContainer>
  );
};

export default BookOrderPage;

