export interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
}

export type ProductCategory = "apparel" | "decor" | "watches" | "fragrances";

export interface Product {
  id: string;
  name: string;
  designer: string;
  category: ProductCategory;
  price: number;
  image: string;
  description: string;
  longDescription: string;
  details: string[];
  stock: number;
  featured: boolean;
  rating: number;
  reviews: Review[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  engraving?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
