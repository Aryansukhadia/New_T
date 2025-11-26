// src/config/roleRoutes.tsx

import type { ReactNode } from 'react';
import DashboardHome from '../Pages/Dashboard/DashboardHome';
import CreateAdminPage from '../Pages/Dashboard/CreateAdminPage';
import AddUserPage from '../Pages/Dashboard/AddUserPage';
import UsersPage from '../Pages/Dashboard/UsersPage';
import RolesPage from '../Pages/Dashboard/RolesPage';
import CustomersPage from '../Pages/Dashboard/CustomersPage';
import CreateCustomerPage from '../Pages/Dashboard/CreateCustomerPage';
import UpdateCustomerPage from '../Pages/Dashboard/UpdateCustomerPage';
import ManageMeasurementPage from '../Pages/Dashboard/ManageMeasurementPage';
import ReportsPage from '../Pages/Dashboard/ReportsPage';
import FinancialsPage from '../Pages/Dashboard/FinancialsPage';
import OrdersPage from '../Pages/Dashboard/OrdersPage';
import BookOrderPage from '../Pages/Dashboard/BookOrderPage';
import OrderDetailsPage from '../Pages/Dashboard/OrderDetailsPage';
import WorkPieceDetailsPage from '../Pages/Dashboard/WorkPieceDetailsPage';
import ProductItemsPage from '../Pages/Dashboard/ProductItemsPage';
import ProductItemDetailsPage from '../Pages/Dashboard/ProductItemDetailsPage';
import ProductsPage from '../Pages/Dashboard/ProductsPage';
import ProductVariantsPage from '../Pages/Dashboard/ProductVariantsPage';
import CreateProductVariantPage from '../Pages/Dashboard/CreateProductVariantPage';
import EditProductVariantPage from '../Pages/Dashboard/EditProductVariantPage';
import ProfilePage from '../Pages/Dashboard/ProfilePage';
import FabricInventoriesPage from '../Pages/Inventory/FabricInventory/FabricInventoriesPage';
import CreateFabricInventoryPage from '../Pages/Inventory/FabricInventory/CreateFabricInventoryPage';
import EditFabricInventoryPage from '../Pages/Inventory/FabricInventory/EditFabricInventoryPage';
import ReadyMadeInventoriesPage from '../Pages/Inventory/ReadyMadeInventory/ReadyMadeInventoriesPage';
import CreateReadyMadeInventoryPage from '../Pages/Inventory/ReadyMadeInventory/CreateReadyMadeInventoryPage';
import EditReadyMadeInventoryPage from '../Pages/Inventory/ReadyMadeInventory/EditReadyMadeInventoryPage';
import AccessoryInventoriesPage from '../Pages/Inventory/AccessoryInventory/AccessoryInventoriesPage';
import CreateAccessoryInventoryPage from '../Pages/Inventory/AccessoryInventory/CreateAccessoryInventoryPage';
import EditAccessoryInventoryPage from '../Pages/Inventory/AccessoryInventory/EditAccessoryInventoryPage';

export interface RouteConfig {
    path: string;
    component: () => ReactNode;
    requireAuth?: boolean;
    allowedRoles?: string[];
}

export interface RoleRoutes {
    superAdmin: RouteConfig[];
    admin: RouteConfig[];
    subAdmin: RouteConfig[];
}

export const roleRoutes: RoleRoutes = {
    superAdmin: [
        {
            path: '',
            component: () => <DashboardHome />,
            requireAuth: true,
            allowedRoles: ['superAdmin'],
        },
        {
            path: 'profile',
            component: () => <ProfilePage />,
            requireAuth: true,
            allowedRoles: ['superAdmin'],
        },
        {
            path: 'create-admin',
            component: () => <CreateAdminPage />,
            requireAuth: true,
            allowedRoles: ['superAdmin'],
        },
    ],

    admin: [
        {
            path: '',
            component: () => <DashboardHome />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'profile',
            component: () => <ProfilePage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'users',
            component: () => <UsersPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'users/add',
            component: () => <AddUserPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'users/:userId',
            component: () => <ProfilePage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'roles',
            component: () => <RolesPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'customers',
            component: () => <CustomersPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'customers/create',
            component: () => <CreateCustomerPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'customers/edit/:customerId',
            component: () => <UpdateCustomerPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'measurements/manage/:customerId',
            component: () => <ManageMeasurementPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'product-items',
            component: () => <ProductItemsPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'product-items/:id',
            component: () => <ProductItemDetailsPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'products',
            component: () => <ProductsPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'product-variants',
            component: () => <ProductVariantsPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'product-variants/create',
            component: () => <CreateProductVariantPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'product-variants/edit/:id',
            component: () => <EditProductVariantPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'inventory/fabric-inventory',
            component: () => <FabricInventoriesPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'inventory/fabric-inventory/create',
            component: () => <CreateFabricInventoryPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'inventory/fabric-inventory/edit/:id',
            component: () => <EditFabricInventoryPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'inventory/ready-made-inventory',
            component: () => <ReadyMadeInventoriesPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'inventory/ready-made-inventory/create',
            component: () => <CreateReadyMadeInventoryPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'inventory/ready-made-inventory/edit/:id',
            component: () => <EditReadyMadeInventoryPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'inventory/accessory-inventory',
            component: () => <AccessoryInventoriesPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'inventory/accessory-inventory/create',
            component: () => <CreateAccessoryInventoryPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'inventory/accessory-inventory/edit/:id',
            component: () => <EditAccessoryInventoryPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'orders',
            component: () => <OrdersPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'orders/book',
            component: () => <BookOrderPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'orders/:id',
            component: () => <OrderDetailsPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'workpiece/:workpieceId',
            component: () => <WorkPieceDetailsPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'reports',
            component: () => <ReportsPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
        {
            path: 'financials',
            component: () => <FinancialsPage />,
            requireAuth: true,
            allowedRoles: ['admin'],
        },
    ],

    subAdmin: [
        {
            path: '',
            component: () => <DashboardHome />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'profile',
            component: () => <ProfilePage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'users',
            component: () => <UsersPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'users/add',
            component: () => <AddUserPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'users/:userId',
            component: () => <ProfilePage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'customers',
            component: () => <CustomersPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'customers/create',
            component: () => <CreateCustomerPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'customers/edit/:customerId',
            component: () => <UpdateCustomerPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'measurements/manage/:customerId',
            component: () => <ManageMeasurementPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'product-items',
            component: () => <ProductItemsPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'product-items/:id',
            component: () => <ProductItemDetailsPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'products',
            component: () => <ProductsPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'product-variants',
            component: () => <ProductVariantsPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'product-variants/create',
            component: () => <CreateProductVariantPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'product-variants/edit/:id',
            component: () => <EditProductVariantPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'inventory/fabric-inventory',
            component: () => <FabricInventoriesPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'inventory/fabric-inventory/create',
            component: () => <CreateFabricInventoryPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'inventory/fabric-inventory/edit/:id',
            component: () => <EditFabricInventoryPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'inventory/ready-made-inventory',
            component: () => <ReadyMadeInventoriesPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'inventory/ready-made-inventory/create',
            component: () => <CreateReadyMadeInventoryPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'inventory/ready-made-inventory/edit/:id',
            component: () => <EditReadyMadeInventoryPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'inventory/accessory-inventory',
            component: () => <AccessoryInventoriesPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'inventory/accessory-inventory/create',
            component: () => <CreateAccessoryInventoryPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'inventory/accessory-inventory/edit/:id',
            component: () => <EditAccessoryInventoryPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'orders',
            component: () => <OrdersPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'orders/book',
            component: () => <BookOrderPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'orders/:id',
            component: () => <OrderDetailsPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
        {
            path: 'workpiece/:workpieceId',
            component: () => <WorkPieceDetailsPage />,
            requireAuth: true,
            allowedRoles: ['subAdmin'],
        },
    ],
};

// Helper function to get all unique routes from all roles
// Merges allowedRoles for duplicate paths
export const getAllRoutes = (): RouteConfig[] => {
    const routeMap = new Map<string, RouteConfig>();

    // Combine all routes from all roles
    const allRoleRoutes = [
        ...roleRoutes.superAdmin,
        ...roleRoutes.admin,
        ...roleRoutes.subAdmin,
    ];

    // Merge routes with same path by combining allowedRoles
    allRoleRoutes.forEach((route) => {
        if (routeMap.has(route.path)) {
            // Merge allowedRoles if path already exists
            const existingRoute = routeMap.get(route.path)!;
            const mergedRoles = [
                ...(existingRoute.allowedRoles || []),
                ...(route.allowedRoles || [])
            ];
            // Remove duplicates
            existingRoute.allowedRoles = Array.from(new Set(mergedRoles));
        } else {
            // Add new route with a copy of allowedRoles
            routeMap.set(route.path, {
                ...route,
                allowedRoles: route.allowedRoles ? [...route.allowedRoles] : undefined
            });
        }
    });

    return Array.from(routeMap.values());
};

