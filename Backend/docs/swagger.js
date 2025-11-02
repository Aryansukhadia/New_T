import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Tailor Backend API",
            version: "1.0.0",
            description: "API documentation for Tailor project",
        },
        servers: [
            { url: "http://localhost:3000", description: "Local" }
        ],
        paths: {
            "/api/roles": {
                get: {
                    summary: "Get all roles",
                    tags: ["Roles"],
                    responses: {
                        "200": {
                            description: "Roles fetched successfully",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "number", example: 200 },
                                            message: { type: "string", example: "Roles fetched successfully" },
                                            data: {
                                                type: "array",
                                                items: { $ref: "#/components/schemas/Role" }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Failed to fetch roles",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                },
                post: {
                    summary: "Create a new role",
                    tags: ["Roles"],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/CreateRoleInput" },
                                example: { roleName: "Admin" }
                            }
                        }
                    },
                    responses: {
                        "201": {
                            description: "Role created successfully",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "number", example: 201 },
                                            message: { type: "string", example: "Role created successfully" },
                                            data: { $ref: "#/components/schemas/Role" }
                                        }
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "roleName is required",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "409": {
                            description: "Role name already exists",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "500": {
                            description: "Failed to create role",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            },
            "/api/roles/{id}": {
                get: {
                    summary: "Get a role by ID",
                    tags: ["Roles"],
                    parameters: [
                        {
                            in: "path",
                            name: "id",
                            required: true,
                            schema: { type: "string" },
                            description: "Role ID (UUID)",
                            example: "a3f7a3fa-9b7c-4a9f-a1a1-1234567890ab"
                        }
                    ],
                    responses: {
                        "200": {
                            description: "Role fetched successfully",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "number", example: 200 },
                                            message: { type: "string", example: "Role fetched successfully" },
                                            data: { $ref: "#/components/schemas/Role" }
                                        }
                                    }
                                }
                            }
                        },
                        "404": {
                            description: "Role not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "500": {
                            description: "Failed to fetch role",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                },
                put: {
                    summary: "Update a role by ID",
                    tags: ["Roles"],
                    parameters: [
                        {
                            in: "path",
                            name: "id",
                            required: true,
                            schema: { type: "string" },
                            description: "Role ID (UUID)",
                            example: "a3f7a3fa-9b7c-4a9f-a1a1-1234567890ab"
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/UpdateRoleInput" },
                                example: { roleName: "Manager" }
                            }
                        }
                    },
                    responses: {
                        "200": {
                            description: "Role updated successfully",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "number", example: 200 },
                                            message: { type: "string", example: "Role updated successfully" },
                                            data: { $ref: "#/components/schemas/Role" }
                                        }
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "roleName is required",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "404": {
                            description: "Role not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "409": {
                            description: "Role name already exists",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "500": {
                            description: "Failed to update role",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                },
                delete: {
                    summary: "Delete a role by ID",
                    tags: ["Roles"],
                    parameters: [
                        {
                            in: "path",
                            name: "id",
                            required: true,
                            schema: { type: "string" },
                            description: "Role ID (UUID)",
                            example: "a3f7a3fa-9b7c-4a9f-a1a1-1234567890ab"
                        }
                    ],
                    responses: {
                        "200": {
                            description: "Role deleted successfully",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "number", example: 200 },
                                            message: { type: "string", example: "Role deleted successfully" },
                                            data: { type: "object", nullable: true }
                                        }
                                    }
                                }
                            }
                        },
                        "404": {
                            description: "Role not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "409": {
                            description: "Cannot delete role: it is referenced by users",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "500": {
                            description: "Failed to delete role",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            },
            "/api/users": {
                get: {
                    summary: "Get all users",
                    tags: ["Users"],
                    responses: {
                        "200": {
                            description: "Users fetched successfully",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "number", example: 200 },
                                            message: { type: "string", example: "Users fetched successfully" },
                                            data: {
                                                type: "array",
                                                items: { $ref: "#/components/schemas/User" }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Failed to fetch users",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                },
                post: {
                    summary: "Create a new user",
                    tags: ["Users"],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/CreateUserInput" },
                                example: {
                                    fullName: "John Doe",
                                    emailId: "john.doe@example.com",
                                    password: "password123",
                                    roleId: "a3f7a3fa-9b7c-4a9f-a1a1-1234567890ab"
                                }
                            }
                        }
                    },
                    responses: {
                        "201": {
                            description: "User created successfully",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "number", example: 201 },
                                            message: { type: "string", example: "User created successfully" },
                                            data: { $ref: "#/components/schemas/User" }
                                        }
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "Validation error",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "404": {
                            description: "Role not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "409": {
                            description: "Email already exists",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "500": {
                            description: "Failed to create user",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            },
            "/api/users/{id}": {
                get: {
                    summary: "Get a user by ID",
                    tags: ["Users"],
                    parameters: [
                        {
                            in: "path",
                            name: "id",
                            required: true,
                            schema: { type: "string" },
                            description: "User ID (UUID)",
                            example: "a3f7a3fa-9b7c-4a9f-a1a1-1234567890ab"
                        }
                    ],
                    responses: {
                        "200": {
                            description: "User fetched successfully",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "number", example: 200 },
                                            message: { type: "string", example: "User fetched successfully" },
                                            data: { $ref: "#/components/schemas/User" }
                                        }
                                    }
                                }
                            }
                        },
                        "404": {
                            description: "User not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "500": {
                            description: "Failed to fetch user",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                },
                put: {
                    summary: "Update a user by ID",
                    tags: ["Users"],
                    parameters: [
                        {
                            in: "path",
                            name: "id",
                            required: true,
                            schema: { type: "string" },
                            description: "User ID (UUID)",
                            example: "a3f7a3fa-9b7c-4a9f-a1a1-1234567890ab"
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/UpdateUserInput" },
                                example: {
                                    fullName: "Jane Doe"
                                }
                            }
                        }
                    },
                    responses: {
                        "200": {
                            description: "User updated successfully",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "number", example: 200 },
                                            message: { type: "string", example: "User updated successfully" },
                                            data: { $ref: "#/components/schemas/User" }
                                        }
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "Validation error",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "404": {
                            description: "User not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "409": {
                            description: "Email already exists",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "500": {
                            description: "Failed to update user",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                },
                delete: {
                    summary: "Delete a user by ID",
                    tags: ["Users"],
                    parameters: [
                        {
                            in: "path",
                            name: "id",
                            required: true,
                            schema: { type: "string" },
                            description: "User ID (UUID)",
                            example: "a3f7a3fa-9b7c-4a9f-a1a1-1234567890ab"
                        }
                    ],
                    responses: {
                        "200": {
                            description: "User deleted successfully",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            success: { type: "number", example: 200 },
                                            message: { type: "string", example: "User deleted successfully" },
                                            data: { type: "object", nullable: true }
                                        }
                                    }
                                }
                            }
                        },
                        "404": {
                            description: "User not found",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "409": {
                            description: "Cannot delete user: it is referenced by other records",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        },
                        "500": {
                            description: "Failed to delete user",
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/ErrorResponse" }
                                }
                            }
                        }
                    }
                }
            }
        },
        components: {
            schemas: {
                Role: {
                    type: "object",
                    properties: {
                        roleId: {
                            type: "string",
                            format: "uuid",
                            example: "a3f7a3fa-9b7c-4a9f-a1a1-1234567890ab",
                            description: "Unique identifier for the role"
                        },
                        roleName: {
                            type: "string",
                            example: "Admin",
                            description: "Name of the role"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-15T10:30:00Z",
                            description: "Timestamp when the role was created"
                        }
                    },
                    required: ["roleId", "roleName", "createdAt"]
                },
                CreateRoleInput: {
                    type: "object",
                    required: ["roleName"],
                    properties: {
                        roleName: {
                            type: "string",
                            example: "Admin",
                            description: "Name of the role to create"
                        }
                    }
                },
                UpdateRoleInput: {
                    type: "object",
                    required: ["roleName"],
                    properties: {
                        roleName: {
                            type: "string",
                            example: "Manager",
                            description: "New name for the role"
                        }
                    }
                },
                User: {
                    type: "object",
                    properties: {
                        userId: {
                            type: "string",
                            format: "uuid",
                            example: "a3f7a3fa-9b7c-4a9f-a1a1-1234567890ab",
                            description: "Unique identifier for the user"
                        },
                        fullName: {
                            type: "string",
                            example: "John Doe",
                            description: "Full name of the user"
                        },
                        emailId: {
                            type: "string",
                            format: "email",
                            example: "john.doe@example.com",
                            description: "Unique email address of the user"
                        },
                        roleId: {
                            type: "string",
                            format: "uuid",
                            example: "a3f7a3fa-9b7c-4a9f-a1a1-1234567890ab",
                            description: "Role ID assigned to the user"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-15T10:30:00Z",
                            description: "Timestamp when the user was created"
                        },
                        role: {
                            type: "object",
                            properties: {
                                roleId: {
                                    type: "string",
                                    format: "uuid",
                                    example: "a3f7a3fa-9b7c-4a9f-a1a1-1234567890ab"
                                },
                                roleName: {
                                    type: "string",
                                    example: "Admin"
                                }
                            }
                        }
                    },
                    required: ["userId", "fullName", "emailId", "roleId", "createdAt"]
                },
                CreateUserInput: {
                    type: "object",
                    required: ["fullName", "emailId", "password", "roleId"],
                    properties: {
                        fullName: {
                            type: "string",
                            example: "John Doe",
                            description: "Full name of the user"
                        },
                        emailId: {
                            type: "string",
                            format: "email",
                            example: "john.doe@example.com",
                            description: "Unique email address for the user"
                        },
                        password: {
                            type: "string",
                            example: "password123",
                            description: "Password for the user"
                        },
                        roleId: {
                            type: "string",
                            format: "uuid",
                            example: "a3f7a3fa-9b7c-4a9f-a1a1-1234567890ab",
                            description: "Role ID to assign to the user"
                        }
                    }
                },
                UpdateUserInput: {
                    type: "object",
                    required: ["fullName"],
                    properties: {
                        fullName: {
                            type: "string",
                            example: "Jane Doe",
                            description: "New full name (required)"
                        }
                    },
                    description: "Only fullName can be updated by users. Email and password cannot be changed through this endpoint."
                },
                ErrorResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "number",
                            description: "HTTP status code"
                        },
                        message: {
                            type: "string",
                            description: "Error message"
                        },
                        data: {
                            type: "object",
                            nullable: true,
                            properties: {
                                error: {
                                    type: "string",
                                    description: "Detailed error message (optional)"
                                }
                            }
                        }
                    },
                    required: ["success", "message"]
                }
            }
        }
    },
    apis: [
        "./routes/**/*.js"
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;


