require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase
    .from('vendor_reviews')
    .select('vendor_id, rating')
    .eq('vendor_id', '0b049322-7a6a-45a0-8dd1-160c31b394c5');
  console.log('Reviews:', data);
  console.log('Error:', error);
}

test();
