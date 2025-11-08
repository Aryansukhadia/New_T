import apiInstance from '../../Utils/ApiUtils';
import type { ApiResponse } from '../../Utils/ApiUtils';
import { getApiUrl } from '../../Utils/api';

// ============================================
// PRODUCT TYPES
// ============================================

export interface Product {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  variants?: ProductVariant[];
}

export interface CreateProductRequest {
  name: string;
  description?: string | null;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string | null;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  createdAt: string;
  product?: Product;
  productItems?: ProductItem[];
}

export interface CreateProductVariantRequest {
  productId: string;
  name: string;
  description?: string | null;
  photoUrl?: string | null;
  productItemIds?: string[];
}

export interface UpdateProductVariantRequest {
  productId?: string;
  name?: string;
  description?: string | null;
  photoUrl?: string | null;
  productItemIds?: string[];
}

export interface ProductItem {
  id: string;
  name: string;
  imageUrl: string | null;
  createdAt: string;
  variants?: ProductVariant[];
}

export interface CreateProductItemRequest {
  name: string;
  imageUrl?: string | null;
}

export interface UpdateProductItemRequest {
  name?: string;
  imageUrl?: string | null;
}

// ============================================
// PRODUCT SERVICES
// ============================================

/**
 * Get All Products Service
 * GET /api/products
 * 
 * @returns Promise with list of products
 */
export const getProductsService = async (): Promise<ApiResponse<Product[]>> => {
  const response = await apiInstance.get<ApiResponse<Product[]>>(
    getApiUrl('getProducts')
  );
  return response.data;
};

/**
 * Get Product By ID Service
 * GET /api/products/:id
 * 
 * @param productId - Product ID
 * @returns Promise with product data
 */
export const getProductByIdService = async (
  productId: string
): Promise<ApiResponse<Product>> => {
  const response = await apiInstance.get<ApiResponse<Product>>(
    getApiUrl('getProductById', { id: productId })
  );
  return response.data;
};

/**
 * Create Product Service
 * POST /api/products
 * 
 * @param productData - Product data to be created
 * @returns Promise with created product data
 */
export const createProductService = async (
  productData: CreateProductRequest
): Promise<ApiResponse<Product>> => {
  const response = await apiInstance.post<ApiResponse<Product>>(
    getApiUrl('createProduct'),
    productData
  );
  return response.data;
};

/**
 * Update Product Service
 * PUT /api/products/:id
 * 
 * @param productId - Product ID
 * @param productData - Product data to update
 * @returns Promise with updated product data
 */
export const updateProductService = async (
  productId: string,
  productData: UpdateProductRequest
): Promise<ApiResponse<Product>> => {
  const response = await apiInstance.put<ApiResponse<Product>>(
    getApiUrl('updateProduct', { id: productId }),
    productData
  );
  return response.data;
};

/**
 * Delete Product Service
 * DELETE /api/products/:id
 * 
 * @param productId - Product ID
 * @returns Promise with success message
 */
export const deleteProductService = async (
  productId: string
): Promise<ApiResponse<null>> => {
  const response = await apiInstance.delete<ApiResponse<null>>(
    getApiUrl('deleteProduct', { id: productId })
  );
  return response.data;
};

// ============================================
// PRODUCT VARIANT SERVICES
// ============================================

/**
 * Get All Product Variants Service
 * GET /api/productVariants?productId=xxx
 * 
 * @param productId - Optional product ID filter
 * @returns Promise with list of product variants
 */
export const getProductVariantsService = async (
  productId?: string
): Promise<ApiResponse<ProductVariant[]>> => {
  const url = productId
    ? `${getApiUrl('getProductVariants')}?productId=${productId}`
    : getApiUrl('getProductVariants');
  const response = await apiInstance.get<ApiResponse<ProductVariant[]>>(url);
  return response.data;
};

/**
 * Get Product Variant By ID Service
 * GET /api/productVariants/:id
 * 
 * @param variantId - Product Variant ID
 * @returns Promise with product variant data
 */
export const getProductVariantByIdService = async (
  variantId: string
): Promise<ApiResponse<ProductVariant>> => {
  const response = await apiInstance.get<ApiResponse<ProductVariant>>(
    getApiUrl('getProductVariantById', { id: variantId })
  );
  return response.data;
};

/**
 * Create Product Variant Service
 * POST /api/productVariants
 * 
 * @param variantData - Product variant data to be created
 * @param photoFile - Optional photo file to upload
 * @returns Promise with created product variant data
 */
export const createProductVariantService = async (
  variantData: CreateProductVariantRequest,
  photoFile?: File | null
): Promise<ApiResponse<ProductVariant>> => {
  const formData = new FormData();
  formData.append('productId', variantData.productId);
  formData.append('name', variantData.name);
  if (variantData.description) {
    formData.append('description', variantData.description);
  }
  if (variantData.photoUrl) {
    formData.append('photoUrl', variantData.photoUrl);
  }
  // Always send productItemIds, even if empty array
  formData.append('productItemIds', JSON.stringify(variantData.productItemIds || []));
  if (photoFile) {
    formData.append('photo', photoFile);
  }

  const response = await apiInstance.post<ApiResponse<ProductVariant>>(
    getApiUrl('createProductVariant'),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Update Product Variant Service
 * PUT /api/productVariants/:id
 * 
 * @param variantId - Product Variant ID
 * @param variantData - Product variant data to update
 * @param photoFile - Optional photo file to upload
 * @returns Promise with updated product variant data
 */
export const updateProductVariantService = async (
  variantId: string,
  variantData: UpdateProductVariantRequest,
  photoFile?: File | null
): Promise<ApiResponse<ProductVariant>> => {
  const formData = new FormData();
  if (variantData.productId !== undefined) {
    formData.append('productId', variantData.productId);
  }
  if (variantData.name !== undefined) {
    formData.append('name', variantData.name);
  }
  if (variantData.description !== undefined) {
    formData.append('description', variantData.description || '');
  }
  if (variantData.photoUrl !== undefined) {
    formData.append('photoUrl', variantData.photoUrl || '');
  }
  if (variantData.productItemIds !== undefined) {
    formData.append('productItemIds', JSON.stringify(variantData.productItemIds));
  }
  if (photoFile) {
    formData.append('photo', photoFile);
  }

  const response = await apiInstance.put<ApiResponse<ProductVariant>>(
    getApiUrl('updateProductVariant', { id: variantId }),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Delete Product Variant Service
 * DELETE /api/productVariants/:id
 * 
 * @param variantId - Product Variant ID
 * @returns Promise with success message
 */
export const deleteProductVariantService = async (
  variantId: string
): Promise<ApiResponse<null>> => {
  const response = await apiInstance.delete<ApiResponse<null>>(
    getApiUrl('deleteProductVariant', { id: variantId })
  );
  return response.data;
};

/**
 * Add Product Items to Variant Service
 * POST /api/productVariants/:id/productItems
 * 
 * @param variantId - Product Variant ID
 * @param productItemIds - Array of product item IDs to add
 * @returns Promise with updated product variant data
 */
export const addProductItemsToVariantService = async (
  variantId: string,
  productItemIds: string[]
): Promise<ApiResponse<ProductVariant>> => {
  const response = await apiInstance.post<ApiResponse<ProductVariant>>(
    getApiUrl('addProductItemsToVariant', { id: variantId }),
    { productItemIds }
  );
  return response.data;
};

/**
 * Remove Product Items from Variant Service
 * DELETE /api/productVariants/:id/productItems
 * 
 * @param variantId - Product Variant ID
 * @param productItemIds - Array of product item IDs to remove
 * @returns Promise with updated product variant data
 */
export const removeProductItemsFromVariantService = async (
  variantId: string,
  productItemIds: string[]
): Promise<ApiResponse<ProductVariant>> => {
  const response = await apiInstance.delete<ApiResponse<ProductVariant>>(
    getApiUrl('removeProductItemsFromVariant', { id: variantId }),
    { data: { productItemIds } }
  );
  return response.data;
};

// ============================================
// PRODUCT ITEM SERVICES
// ============================================

/**
 * Get All Product Items Service
 * GET /api/productItems
 * 
 * @returns Promise with list of product items
 */
export const getProductItemsService = async (): Promise<ApiResponse<ProductItem[]>> => {
  const response = await apiInstance.get<ApiResponse<ProductItem[]>>(
    getApiUrl('getProductItems')
  );
  return response.data;
};

/**
 * Get Product Item By ID Service
 * GET /api/productItems/:id
 * 
 * @param productItemId - Product Item ID
 * @returns Promise with product item data
 */
export const getProductItemByIdService = async (
  productItemId: string
): Promise<ApiResponse<ProductItem>> => {
  const response = await apiInstance.get<ApiResponse<ProductItem>>(
    getApiUrl('getProductItemById', { id: productItemId })
  );
  return response.data;
};

/**
 * Create Product Item Service
 * POST /api/productItems
 * 
 * @param productItemData - Product item data to be created
 * @param imageFile - Optional image file to upload
 * @returns Promise with created product item data
 */
export const createProductItemService = async (
  productItemData: CreateProductItemRequest,
  imageFile?: File | null
): Promise<ApiResponse<ProductItem>> => {
  const formData = new FormData();
  formData.append('name', productItemData.name);
  if (productItemData.imageUrl) {
    formData.append('imageUrl', productItemData.imageUrl);
  }
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await apiInstance.post<ApiResponse<ProductItem>>(
    getApiUrl('createProductItem'),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Update Product Item Service
 * PUT /api/productItems/:id
 * 
 * @param productItemId - Product Item ID
 * @param productItemData - Product item data to update
 * @param imageFile - Optional image file to upload
 * @returns Promise with updated product item data
 */
export const updateProductItemService = async (
  productItemId: string,
  productItemData: UpdateProductItemRequest,
  imageFile?: File | null
): Promise<ApiResponse<ProductItem>> => {
  const formData = new FormData();
  if (productItemData.name !== undefined) {
    formData.append('name', productItemData.name);
  }
  if (productItemData.imageUrl !== undefined) {
    formData.append('imageUrl', productItemData.imageUrl || '');
  }
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await apiInstance.put<ApiResponse<ProductItem>>(
    getApiUrl('updateProductItem', { id: productItemId }),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Delete Product Item Service
 * DELETE /api/productItems/:id
 * 
 * @param productItemId - Product Item ID
 * @returns Promise with success message
 */
export const deleteProductItemService = async (
  productItemId: string
): Promise<ApiResponse<null>> => {
  const response = await apiInstance.delete<ApiResponse<null>>(
    getApiUrl('deleteProductItem', { id: productItemId })
  );
  return response.data;
};

