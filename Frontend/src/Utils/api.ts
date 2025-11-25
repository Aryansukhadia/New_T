const NODEJS_BASE_URL = import.meta.env.VITE_NODEJS_BASE_URL;

interface EndpointConfig {
    path: string;
    method: string;
    baseUrl: string;
}

interface ApiConfig {
    endpoints: Record<string, EndpointConfig>;
}

interface ApiConfigResult {
    url: string;
    method: string;
    baseUrl: string;
}

export const API_CONFIG: ApiConfig = {
    endpoints: {
        // ============================================
        // AUTHENTICATION ENDPOINTS
        // ============================================
        login: {
            path: '/users/login',
            method: 'POST',
            baseUrl: NODEJS_BASE_URL,
        },
        logout: {
            path: '/auth/logout',
            method: 'POST',
            baseUrl: NODEJS_BASE_URL,
        },
        register: {
            path: '/users',
            method: 'POST',
            baseUrl: NODEJS_BASE_URL,
        },
        createUserByAdmin: {
            path: '/users/admin/create',
            method: 'POST',
            baseUrl: NODEJS_BASE_URL,
        },

        // ============================================
        // USER ENDPOINTS
        // ============================================
        getMe: {
            path: '/users/me',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        changePassword: {
            path: '/users/change-password',
            method: 'POST',
            baseUrl: NODEJS_BASE_URL,
        },
        resetPassword: {
            path: '/users/reset-password/{userId}',
            method: 'POST',
            baseUrl: NODEJS_BASE_URL,
        },
        getUserRoles: {
            path: '/users/roles',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        getUsers: {
            path: '/users',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        getUserById: {
            path: '/users/{id}',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        updateUser: {
            path: '/users/{id}',
            method: 'PUT',
            baseUrl: NODEJS_BASE_URL,
        },
        deleteUser: {
            path: '/users/{id}',
            method: 'DELETE',
            baseUrl: NODEJS_BASE_URL,
        },

        // ============================================
        // ROLE ENDPOINTS
        // ============================================
        getRoles: {
            path: '/roles',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        getRoleById: {
            path: '/roles/{id}',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        createRole: {
            path: '/roles',
            method: 'POST',
            baseUrl: NODEJS_BASE_URL,
        },
        updateRole: {
            path: '/roles/{id}',
            method: 'PUT',
            baseUrl: NODEJS_BASE_URL,
        },
        deleteRole: {
            path: '/roles/{id}',
            method: 'DELETE',
            baseUrl: NODEJS_BASE_URL,
        },

        // ============================================
        // CUSTOMER ENDPOINTS
        // ============================================
        getCustomers: {
            path: '/customers',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        getCustomerById: {
            path: '/customers/{id}',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        createCustomer: {
            path: '/customers',
            method: 'POST',
            baseUrl: NODEJS_BASE_URL,
        },
        updateCustomer: {
            path: '/customers/{id}',
            method: 'PUT',
            baseUrl: NODEJS_BASE_URL,
        },
        deleteCustomer: {
            path: '/customers/{id}',
            method: 'DELETE',
            baseUrl: NODEJS_BASE_URL,
        },

        // ============================================
        // MEASUREMENT ENDPOINTS
        // ============================================
        addMeasurement: {
            path: '/measurements',
            method: 'POST',
            baseUrl: NODEJS_BASE_URL,
        },
        getCustomerMeasurements: {
            path: '/measurements/{customerId}',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        editMeasurement: {
            path: '/measurements',
            method: 'PUT',
            baseUrl: NODEJS_BASE_URL,
        },

        // ============================================
        // PRODUCT ENDPOINTS
        // ============================================
        getProducts: {
            path: '/products',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        getProductById: {
            path: '/products/{id}',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        createProduct: {
            path: '/products',
            method: 'POST',
            baseUrl: NODEJS_BASE_URL,
        },
        updateProduct: {
            path: '/products/{id}',
            method: 'PUT',
            baseUrl: NODEJS_BASE_URL,
        },
        deleteProduct: {
            path: '/products/{id}',
            method: 'DELETE',
            baseUrl: NODEJS_BASE_URL,
        },

        // ============================================
        // PRODUCT VARIANT ENDPOINTS
        // ============================================
        getProductVariants: {
            path: '/productVariants',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        getProductVariantById: {
            path: '/productVariants/{id}',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        createProductVariant: {
            path: '/productVariants',
            method: 'POST',
            baseUrl: NODEJS_BASE_URL,
        },
        updateProductVariant: {
            path: '/productVariants/{id}',
            method: 'PUT',
            baseUrl: NODEJS_BASE_URL,
        },
        deleteProductVariant: {
            path: '/productVariants/{id}',
            method: 'DELETE',
            baseUrl: NODEJS_BASE_URL,
        },
        addProductItemsToVariant: {
            path: '/productVariants/{id}/productItems',
            method: 'POST',
            baseUrl: NODEJS_BASE_URL,
        },
        removeProductItemsFromVariant: {
            path: '/productVariants/{id}/productItems',
            method: 'DELETE',
            baseUrl: NODEJS_BASE_URL,
        },

        // ============================================
        // PRODUCT ITEM ENDPOINTS
        // ============================================
        getProductItems: {
            path: '/productItems',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        getProductItemById: {
            path: '/productItems/{id}',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        createProductItem: {
            path: '/productItems',
            method: 'POST',
            baseUrl: NODEJS_BASE_URL,
        },
        updateProductItem: {
            path: '/productItems/{id}',
            method: 'PUT',
            baseUrl: NODEJS_BASE_URL,
        },
        deleteProductItem: {
            path: '/productItems/{id}',
            method: 'DELETE',
            baseUrl: NODEJS_BASE_URL,
        },

        // ============================================
        // FABRIC INVENTORY ENDPOINTS
        // ============================================
        getFabricInventories: {
            path: '/fabric-inventories',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        getFabricInventoryById: {
            path: '/fabric-inventories/{id}',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        createFabricInventory: {
            path: '/fabric-inventories',
            method: 'POST',
            baseUrl: NODEJS_BASE_URL,
        },
        updateFabricInventory: {
            path: '/fabric-inventories/{id}',
            method: 'PUT',
            baseUrl: NODEJS_BASE_URL,
        },
        deleteFabricInventory: {
            path: '/fabric-inventories/{id}',
            method: 'DELETE',
            baseUrl: NODEJS_BASE_URL,
        },

        // ============================================
        // PRODUCT ORDER ENDPOINTS
        // ============================================
        getBookedOrders: {
            path: '/productOrders',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        getOrderDetails: {
            path: '/productOrders/{id}',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
        bookOrder: {
            path: '/productOrders/book',
            method: 'POST',
            baseUrl: NODEJS_BASE_URL,
        },
        getWorkpieceMeasurements: {
            path: '/productOrders/workpiece/{workpieceId}/measurements',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },

        // ============================================
        // ITEM STATUS ENDPOINTS
        // ============================================
        convertPendingToCutting: {
            path: '/itemStatuses/convert-pending-to-cutting',
            method: 'PATCH',
            baseUrl: NODEJS_BASE_URL,
        },

        // ============================================
        // WORK PIECE ENDPOINTS
        // ============================================
        convertWorkPiecePendingToCutting: {
            path: '/workPieces/{workpieceId}/convert-pending-to-cutting',
            method: 'PATCH',
            baseUrl: NODEJS_BASE_URL,
        },
        getWorkPieceById: {
            path: '/workPieces/{workpieceId}',
            method: 'GET',
            baseUrl: NODEJS_BASE_URL,
        },
    },
};

export const getApiUrl = (endpoint: string, pathParams: Record<string, string> = {}): string => {
    const endpointConfig = API_CONFIG.endpoints[endpoint];

    if (!endpointConfig) {
        throw new Error(`Endpoint ${endpoint} not found in API configuration`);
    }

    const baseUrl = API_CONFIG.endpoints[endpoint].baseUrl;

    // Replace path parameters in the URL
    let path = endpointConfig.path;
    Object.keys(pathParams).forEach(key => {
        path = path.replace(`{${key}}`, pathParams[key]);
    });

    const fullUrl = `${baseUrl}${path}`;

    return fullUrl;
};

export const getApiUrlWithParams = (endpoint: string, pathParams: Record<string, string> = {}, queryParams: Record<string, string> = {}): ApiConfigResult => {
    const endpointConfig = API_CONFIG.endpoints[endpoint];

    if (!endpointConfig) {
        throw new Error(`Endpoint ${endpoint} not found in API configuration`);
    }

    const baseUrl = API_CONFIG.endpoints[endpoint].baseUrl;

    // Replace path parameters in the URL
    let path = endpointConfig.path;
    Object.keys(pathParams).forEach(key => {
        path = path.replace(`{${key}}`, pathParams[key]);
    });

    const fullUrl = `${baseUrl}${path}`;

    const url = new URL(fullUrl);
    Object.keys(queryParams).forEach(key => {
        url.searchParams.append(key, queryParams[key]);
    });

    return {
        url: url.toString(),
        method: endpointConfig.method,
        baseUrl: baseUrl
    };
};

export const getApiConfig = (endpoint: string, pathParams: Record<string, string> = {}): ApiConfigResult => {
    const endpointConfig = API_CONFIG.endpoints[endpoint];

    if (!endpointConfig) {
        throw new Error(`Endpoint ${endpoint} not found in API configuration`);
    }

    const baseUrl = API_CONFIG.endpoints[endpoint].baseUrl;

    // Replace path parameters in the URL
    let path = endpointConfig.path;
    Object.keys(pathParams).forEach(key => {
        path = path.replace(`{${key}}`, pathParams[key]);
    });

    const fullUrl = `${baseUrl}${path}`;

    return {
        url: fullUrl,
        method: endpointConfig.method,
        baseUrl: baseUrl
    };
};

