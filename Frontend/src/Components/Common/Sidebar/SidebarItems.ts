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
  FaDollarSign
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
}

export const sidebarItems: SidebarItems = {
  superAdmin: [
    { label: "Dashboard", icon: FaChartBar, path: "/dashboard" },
    { label: "Create Admin", icon: FaUserLock, path: "/dashboard/create-admin" },
  ],

  admin: [
    { label: "Dashboard", icon: FaChartBar, path: "/dashboard" },
    {
      label: "Users",
      icon: FaUsers,
      children: [
        { label: "All Users", path: "/dashboard/users" },
        { label: "Add User", path: "/dashboard/users/add" },
      ],
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
      label: "Orders",
      icon: FaShoppingCart,
      children: [
        { label: "All Orders", path: "/dashboard/orders" },
        { label: "Book Order", path: "/dashboard/orders/book" },
      ],
    },
    { label: "Reports", icon: FaChartLine, path: "/dashboard/reports" },
    { label: "Financials", icon: FaDollarSign, path: "/dashboard/financials" },
  ],

  subAdmin: [
    { label: "Dashboard", icon: FaChartBar, path: "/dashboard" },
    {
      label: "Users",
      icon: FaUsers,
      children: [
        { label: "All Users", path: "/dashboard/users" },
        { label: "Add User", path: "/dashboard/users/add" },
      ],
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
      label: "Orders",
      icon: FaShoppingCart,
      children: [
        { label: "All Orders", path: "/dashboard/orders" },
        { label: "Book Order", path: "/dashboard/orders/book" },
      ],
    },
  ],
};

