// ============================================
// API CONFIGURATION
// ============================================

// Base URLs
const NODEJS_BASE_URL = 'http://localhost:3000/api';

// API Endpoint Configuration
export const API_CONFIG = {
    baseUrl: NODEJS_BASE_URL,
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
    },
} as const;

// Type for endpoint keys
export type EndpointKey = keyof typeof API_CONFIG.endpoints;

// Type for endpoint configuration
export interface EndpointConfig {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    baseUrl: string;
}

/**
 * Get the full API URL for a given endpoint
 * 
 * @param endpoint - The endpoint key from API_CONFIG.endpoints
 * @param pathParams - Optional object with path parameters to replace in the URL
 * @returns The full API URL string
 * 
 * @example
 * getApiUrl('getUserById', { id: '123' })
 * // Returns: 'http://localhost:3000/api/users/123'
 * 
 * @example
 * getApiUrl('getCustomers')
 * // Returns: 'http://localhost:3000/api/customers'
 */
export const getApiUrl = (endpoint: EndpointKey, pathParams: Record<string, string> = {}): string => {
    const endpointConfig = API_CONFIG.endpoints[endpoint];

    if (!endpointConfig) {
        throw new Error(`Endpoint ${endpoint} not found in API configuration`);
    }

    let baseUrl = endpointConfig.baseUrl;

    // Replace path parameters in the URL
    let path = endpointConfig.path;
    Object.keys(pathParams).forEach((key) => {
        path = path.replace(`{${key}}`, pathParams[key]);
    });

    // Remove trailing slash from baseUrl if present
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }

    // Ensure path starts with /
    if (!path.startsWith('/')) {
        path = '/' + path;
    }

    const fullUrl = `${baseUrl}${path}`;
    console.log(`Generated API URL for ${endpoint}:`, fullUrl);

    return fullUrl;
};

/**
 * Get endpoint configuration by key
 * 
 * @param endpoint - The endpoint key from API_CONFIG.endpoints
 * @returns The endpoint configuration object
 */
export const getEndpointConfig = (endpoint: EndpointKey): EndpointConfig => {
    const endpointConfig = API_CONFIG.endpoints[endpoint];

    if (!endpointConfig) {
        throw new Error(`Endpoint ${endpoint} not found in API configuration`);
    }

    return endpointConfig;
};

