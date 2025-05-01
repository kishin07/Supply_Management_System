# Orders and Order Items Integration

## Overview
This document explains the integration between the `orders` and `order_items` tables in Supabase for the Supply Management System. The integration allows companies to create orders with multiple items and suppliers to view and manage these orders.

## Database Structure

### Orders Table
The `orders` table stores the main order information:

| Column Name | Type | Description |
|-------------|------|-------------|
| order_id | uuid | Primary key, automatically generated |
| order_no | string | Order number (e.g., ORD-2023-001) |
| company_id | string | ID of the company placing the order |
| order_supplier | uuid | ID of the supplier receiving the order |
| order_date | date | Date when the order was placed |
| order_total_amount | number | Total amount of the order |
| order_status | string | Status of the order (Pending, Processing, Shipped, Delivered) |

### Order Items Table
The `order_items` table stores the individual items within each order:

| Column Name | Type | Description |
|-------------|------|-------------|
| item_id | uuid | Primary key, automatically generated |
| order_id | uuid | Foreign key referencing orders.order_id |
| item_name | string | Name of the item |
| quantity | number | Quantity ordered |
| price | number | Price per unit |

## Implementation Details

### Changes Made

1. **ManageOrders Component (Company View)**
   - Updated to use Supabase for CRUD operations
   - Modified to create entries in both tables when a new order is created
   - Implemented proper relationship between orders and order items

2. **OrderView Component (Supplier View)**
   - Updated to fetch orders and their items from Supabase
   - Implemented status updates that persist to the database

### How It Works

1. **Creating an Order**:
   - When a company creates a new order, the system:
     - First creates a record in the `orders` table
     - Then creates records in the `order_items` table for each item, linking them to the order

2. **Viewing Orders**:
   - Companies can view all their orders with items
   - Suppliers can view only orders assigned to them

3. **Updating Orders**:
   - When an order is updated, the system:
     - Updates the record in the `orders` table
     - Deletes existing items and creates new ones in the `order_items` table

4. **Deleting Orders**:
   - When an order is deleted, the system:
     - First deletes all related items from the `order_items` table
     - Then deletes the record from the `orders` table

## Testing

A test script has been created to verify the connection between the tables:

```
src/utils/testOrdersConnection.js
```

This script tests:
1. Creating a test order
2. Adding items to the order
3. Fetching the order with its items
4. Cleaning up test data

## Setup Instructions

### Supabase Table Creation

If the tables don't exist in your Supabase project, create them with the following SQL:

```sql
-- Create orders table
CREATE TABLE orders (
  order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no TEXT NOT NULL,
  company_id TEXT NOT NULL,
  order_supplier UUID NOT NULL,
  order_date DATE NOT NULL,
  order_total_amount NUMERIC NOT NULL,
  order_status TEXT NOT NULL
);

-- Create order_items table
CREATE TABLE order_items (
  item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(order_id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

### Row Level Security (Optional)

For better security, consider adding Row Level Security policies:

```sql
-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy for companies to see only their orders
CREATE POLICY company_orders_policy ON orders 
  FOR ALL 
  USING (company_id = auth.uid());

-- Policy for suppliers to see only orders assigned to them
CREATE POLICY supplier_orders_policy ON orders 
  FOR ALL 
  USING (order_supplier = auth.uid());

-- Enable RLS on order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy for order_items based on order access
CREATE POLICY order_items_policy ON order_items 
  FOR ALL 
  USING (order_id IN (SELECT order_id FROM orders WHERE company_id = auth.uid() OR order_supplier = auth.uid()));
```

## Troubleshooting

If you encounter issues with the integration:

1. Check the browser console for error messages
2. Verify that both tables exist in your Supabase project
3. Ensure your Supabase API key has the necessary permissions
4. Run the test script to verify the connection between tables