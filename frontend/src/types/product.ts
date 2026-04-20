// product.ts

export interface Product {
    id: number;
    internal_product_number: string;
    customer_product_number: string;
    product_name: string;
    customer_id: number;
}

export interface ProductWithCustomer extends Omit<Product, 'customer_id'> {
    customer: {
    id: number;
    name: string;
    };
}

export interface ProductFormData {
    internal_product_number: string;
    customer_product_number: string;
    product_name: string;
    customer_id: number;
}