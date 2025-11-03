const NODEJS_BASE_URL = import.meta.env.VITE_NODEJS_BASE_URL || 'http://localhost:3000/api';

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

    console.log(`Generated API URL for ${endpoint}:`, fullUrl);

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

    // Add query parameters
    const url = new URL(path, baseUrl);
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

