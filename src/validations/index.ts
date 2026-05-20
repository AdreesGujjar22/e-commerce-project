import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(2, "Product name must contain at least 2 characters"),
  designer: z.string().min(2, "Designer name must contain at least 2 characters"),
  category: z.string().min(1, "Please select or create a valid category"),
  price: z.number().min(0, "Price must be a positive number"),
  image: z.string().url("Must be a valid display image URL"),
  images: z.array(z.string().url("Must be valid URL")).optional().default([]),
  description: z.string().min(5, "Brief description is too short"),
  longDescription: z.string().min(10, "Full description must be detailed"),
  details: z.array(z.string()).default([]),
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
  featured: z.boolean().default(false),
  seoTitle: z.string().optional().default(""),
  seoDescription: z.string().optional().default(""),
});

export const OrderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  image: z.string(),
  price: z.number().min(0),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const OrderSchema = z.object({
  customerName: z.string().min(2, "A full guest name is required"),
  customerEmail: z.string().email("A valid client email is required"),
  shippingAddress: z.string().min(5, "A complete delivery address is required"),
  items: z.array(OrderItemSchema).min(1, "Ordered items list cannot be empty"),
  totalAmount: z.number().min(0),
  paymentMethod: z.string().optional(),
});

export const CartItemInputSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).default(1),
  size: z.string().optional().default("M"),
  engraving: z.string().optional().default(""),
});

export const AuthInputSchema = z.object({
  email: z.string().email("A valid email address is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().optional(),
});
