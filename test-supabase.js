const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://oblzuqdlnddsfoouvxsj.supabase.co";
const supabaseKey = "sb_publishable_fWj9LXT_rIhOKdGXNWe31A_N_NR8JBv";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('orders').insert([{
    order_id: "ORD-TEST-123",
    name: "Test Name",
    phone: "0555000000",
    phone_2: "",
    wilaya: "Test",
    commune: "Test",
    adresse: "Test",
    product: "Test Product",
    product_var: "Test",
    quantity: 1,
    product_pr: 100,
    delivery_pric: 0,
    total_price: 100,
    delivery_mod: "Domicile"
  }]);

  if (error) {
    console.error("Supabase Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success:", data);
  }
}

test();
