export interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
}

export type ProductCategory = string;

export interface Product {
  id: string;
  name: string;
  slug: string;
  designer: string;
  category: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  longDescription: string;
  details: string[];
  stock: number;
  featured: boolean;
  rating: number;
  reviews: Review[];
  seoTitle?: string;
  seoDescription?: string;
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

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  publishDate: string;
  readTime: string;
  seoTitle?: string;
  seoDescription?: string;
}
