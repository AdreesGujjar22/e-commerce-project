// app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getProductsAction } from "../../../actions/product.actions";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category") || undefined;
  const featuredOnly = searchParams.get("featured") === "true";
  const searchQuery = searchParams.get("search") || undefined;
  const sortBy = searchParams.get("sort") || undefined;
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;

  const result = await getProductsAction({
    category,
    featuredOnly,
    searchQuery,
    sortBy,
    page,
    limit,
  });

  return NextResponse.json(result);
}