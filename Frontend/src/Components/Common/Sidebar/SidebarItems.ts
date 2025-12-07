// src/components/common/Sidebar/SidebarItems.ts

// Tailor Management System sidebar icons
import {
  FaChartBar,
  FaUsers,
  FaUserLock,
  FaUser,
  FaShoppingBag,
  FaShoppingCart,
  FaChartLine,
  FaDollarSign,
  FaUserCircle,
  FaWarehouse,
  FaCut
} from "react-icons/fa";
import type { ComponentType } from "react";

export interface MenuItem {
  label: string;
  icon?: ComponentType;
  path?: string;
  children?: MenuItem[];
}

interface SidebarItems {
  superAdmin: MenuItem[];
  admin: MenuItem[];
  subAdmin: MenuItem[];
  cutter: MenuItem[];
  stitcher: MenuItem[];
  finisher: MenuItem[];
  deliveryBoy: MenuItem[];
  accountant: MenuItem[];
}

export const sidebarItems: SidebarItems = {
  superAdmin: [
    { label: "Dashboard", icon: FaChartBar, path: "/dashboard" },
    { label: "Profile", icon: FaUserCircle, path: "/dashboard/profile" },
    { label: "Create Admin", icon: FaUserLock, path: "/dashboard/create-admin" },
    { label: "Work Pieces", icon: FaCut, path: "/dashboard/workpieces" },
  ],

  admin: [
    { label: "Dashboard", icon: FaChartBar, path: "/dashboard" },
    { label: "Profile", icon: FaUserCircle, path: "/dashboard/profile" },
    {
      label: "Users", icon: FaUsers, path: "/dashboard/users"
    },
    { label: "Customers", icon: FaUser, path: "/dashboard/customers" },
    {
      label: "Products",
      icon: FaShoppingBag,
      children: [
        { label: "Products", path: "/dashboard/products" },
        { label: "Product Variants", path: "/dashboard/product-variants" },
        { label: "Product Items", path: "/dashboard/product-items" },
      ],
    },
    {
      label: "Inventory",
      icon: FaWarehouse,
      children: [
        { label: "Fabric Inventory", path: "/dashboard/inventory/fabric-inventory" },
        { label: "Ready-Made Inventory", path: "/dashboard/inventory/ready-made-inventory" },
        { label: "Accessory Inventory", path: "/dashboard/inventory/accessory-inventory" },
      ],
    },
    { label: "Orders", icon: FaShoppingCart, path: "/dashboard/orders" },
    { label: "Work Pieces", icon: FaCut, path: "/dashboard/workpieces" },
    { label: "Reports", icon: FaChartLine, path: "/dashboard/reports" },
    { label: "Financials", icon: FaDollarSign, path: "/dashboard/financials" },
  ],

  subAdmin: [
    { label: "Dashboard", icon: FaChartBar, path: "/dashboard" },
    { label: "Profile", icon: FaUserCircle, path: "/dashboard/profile" },
    { label: "Users", icon: FaUsers, path: "/dashboard/users" },
    { label: "Customers", icon: FaUser, path: "/dashboard/customers" },
    {
      label: "Products",
      icon: FaShoppingBag,
      children: [
        { label: "Products", path: "/dashboard/products" },
        { label: "Product Variants", path: "/dashboard/product-variants" },
        { label: "Product Items", path: "/dashboard/product-items" },
      ],
    },
    {
      label: "Inventory",
      icon: FaWarehouse,
      children: [
        { label: "Fabric Inventory", path: "/dashboard/inventory/fabric-inventory" },
        { label: "Ready-Made Inventory", path: "/dashboard/inventory/ready-made-inventory" },
        { label: "Accessory Inventory", path: "/dashboard/inventory/accessory-inventory" },
      ],
    },
    { label: "Orders", icon: FaShoppingCart, path: "/dashboard/orders" },
    { label: "Work Pieces", icon: FaCut, path: "/dashboard/workpieces" },
  ],

  cutter: [
    { label: "Dashboard", icon: FaChartBar, path: "/dashboard" },
    { label: "Profile", icon: FaUserCircle, path: "/dashboard/profile" },
    { label: "Work Pieces", icon: FaCut, path: "/dashboard/workpieces" },
  ],

  stitcher: [
    { label: "Dashboard", icon: FaChartBar, path: "/dashboard" },
    { label: "Profile", icon: FaUserCircle, path: "/dashboard/profile" },
    { label: "Work Pieces", icon: FaCut, path: "/dashboard/workpieces" },
  ],

  finisher: [
    { label: "Dashboard", icon: FaChartBar, path: "/dashboard" },
    { label: "Profile", icon: FaUserCircle, path: "/dashboard/profile" },
    { label: "Work Pieces", icon: FaCut, path: "/dashboard/workpieces" },
  ],

  deliveryBoy: [
    { label: "Dashboard", icon: FaChartBar, path: "/dashboard" },
    { label: "Profile", icon: FaUserCircle, path: "/dashboard/profile" },
    { label: "Work Pieces", icon: FaCut, path: "/dashboard/workpieces" },
  ],

  accountant: [
    { label: "Dashboard", icon: FaChartBar, path: "/dashboard" },
    { label: "Profile", icon: FaUserCircle, path: "/dashboard/profile" },
    { label: "Work Pieces", icon: FaCut, path: "/dashboard/workpieces" },
  ],
};

