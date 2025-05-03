import supabase from '../supabase';

// This script tests the connection between company_orders and order_items tables

async function testOrdersConnection() {
  console.log('Testing company_orders and order_items connection...');
  
  try {
    // Test 1: Create a test order
    console.log('Creating test order...');
    const { data: orderData, error: orderError } = await supabase
      .from('company_orders')
      .insert([
        {
          order_no: Date.now().toString() + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          company_id: 'test-company',
          order_supplier: 'test-supplier',
          order_date: new Date().toISOString().split('T')[0],
          order_total_amount: 100,
          order_status: 'Pending'
        }
      ])
      .select();

    if (orderError) throw orderError;
    console.log('Test order created:', orderData[0]);
    
    const orderId = orderData[0].order_id;
    
    // Test 2: Create order items for the test order
    console.log('Creating test order items...');
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .insert([
        {
          order_id: orderId,
          item_name: 'Test Item 1',
          quantity: 2,
          price: 25
        },
        {
          order_id: orderId,
          item_name: 'Test Item 2',
          quantity: 1,
          price: 50
        }
      ])
      .select();

    if (itemsError) throw itemsError;
    console.log('Test order items created:', itemsData);
    
    // Test 3: Fetch the order with its items
    console.log('Fetching order with items...');
    const { data: orderWithItems, error: fetchError } = await supabase
      .from('company_orders')
      .select('*')
      .eq('order_id', orderId)
      .single();
      
    if (fetchError) throw fetchError;
    
    const { data: items, error: fetchItemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
      
    if (fetchItemsError) throw fetchItemsError;
    
    console.log('Order with items:', {
      ...orderWithItems,
      items: items
    });
    
    // Test 4: Clean up - delete test data
    console.log('Cleaning up test data...');
    const { error: deleteItemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);
      
    if (deleteItemsError) throw deleteItemsError;
    
    const { error: deleteOrderError } = await supabase
      .from('company_orders')
      .delete()
      .eq('order_id', orderId);
      
    if (deleteOrderError) throw deleteOrderError;
    
    console.log('Test data cleaned up successfully');
    console.log('All tests passed! The company_orders and order_items tables are connected correctly.');
    
  } catch (error) {
    console.error('Error testing company_orders connection:', error);
  }
}

// Run the test
testOrdersConnection();

export default testOrdersConnection;