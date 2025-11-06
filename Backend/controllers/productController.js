import prisma from "../dbConnect/prismaClient.js";
import sendResponse from "../utils/response.js";

export const addProduct = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || typeof name !== "string" || name.trim() === "") {
            return sendResponse(res, 400, "name is required");
        }

        // Check if product with same name already exists
        const existingProduct = await prisma.product.findFirst({
            where: {
                name: name.trim(),
            }
        });

        if (existingProduct) {
            return sendResponse(res, 409, "Product with this name already exists");
        }

        const newProduct = await prisma.product.create({
            data: {
                name: name.trim(),
                description: description && typeof description === "string" && description.trim() !== "" ? description.trim() : null,
            },
            include: {
                variants: true
            }
        });

        return sendResponse(res, 201, "Product created successfully", newProduct);
    } catch (error) {
        console.error("addProduct error:", error);
        return sendResponse(res, 500, "Failed to create product", { error: error.message });
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                variants: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return sendResponse(res, 200, "Products fetched successfully", products);
    } catch (error) {
        console.error("getProducts error:", error);
        return sendResponse(res, 500, "Failed to fetch products", { error: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                variants: true
            }
        });

        if (!product) {
            return sendResponse(res, 404, "Product not found");
        }

        return sendResponse(res, 200, "Product fetched successfully", product);
    } catch (error) {
        console.error("getProductById error:", error);
        return sendResponse(res, 500, "Failed to fetch product", { error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!name || typeof name !== "string" || name.trim() === "") {
            return sendResponse(res, 400, "name is required");
        }

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id }
        });

        if (!existingProduct) {
            return sendResponse(res, 404, "Product not found");
        }

        // Check if another product with same name exists
        const duplicateProduct = await prisma.product.findFirst({
            where: {
                name: name.trim(),
                id: { not: id }
            }
        });

        if (duplicateProduct) {
            return sendResponse(res, 409, "Product with this name already exists");
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name: name.trim(),
                description: description && typeof description === "string" && description.trim() !== "" ? description.trim() : null,
            },
            include: {
                variants: true
            }
        });

        return sendResponse(res, 200, "Product updated successfully", updatedProduct);
    } catch (error) {
        console.error("updateProduct error:", error);
        return sendResponse(res, 500, "Failed to update product", { error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id }
        });

        if (!product) {
            return sendResponse(res, 404, "Product not found");
        }

        // Check if product has variants
        const variantsCount = await prisma.productVariant.count({
            where: { productId: id }
        });

        if (variantsCount > 0) {
            return sendResponse(res, 400, "Cannot delete product with existing variants. Please delete variants first.");
        }

        await prisma.product.delete({
            where: { id }
        });

        return sendResponse(res, 200, "Product deleted successfully");
    } catch (error) {
        console.error("deleteProduct error:", error);
        return sendResponse(res, 500, "Failed to delete product", { error: error.message });
    }
};

