export interface Product {
  // imageUrl: string;
  id: number;
  name: string;
  // description: string;
  quantity: number;
  price: number;
}

export interface ProductsResponse {
  data: Product[];
  pagination: {
    hasNextPage: boolean;
    nextCursor?: string;
    limit: number;
    order: string;
  };
}
