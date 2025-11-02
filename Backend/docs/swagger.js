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


