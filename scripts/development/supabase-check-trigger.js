// Script to check for triggers in the database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkTriggers() {
  console.log('=== CHECKING DATABASE TRIGGERS ===');
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }
  
  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
  
  try {
    // Look for triggers in the database
    console.log('Checking for triggers on the bookings table...');
    
    const { data: triggers, error: triggerError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT t.tgname AS trigger_name, 
               p.proname AS function_name, 
               pg_get_triggerdef(t.oid) AS trigger_definition
        FROM pg_trigger t
        JOIN pg_proc p ON t.tgfoid = p.oid
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE c.relname = 'bookings' 
        AND n.nspname = 'public';
      `
    });
    
    if (triggerError) {
      console.error('Error checking triggers:', triggerError);
    } else {
      console.log('Trigger check result:');
      console.log(triggers);
      
      // If we found any triggers, check their function definitions
      if (triggers && triggers.rows && triggers.rows.length > 0) {
        console.log('\nFound triggers, checking function definitions...');
        
        for (const trigger of triggers.rows) {
          console.log(`\nChecking function: ${trigger.function_name}`);
          
          const { data: funcDef, error: funcError } = await supabase.rpc('execute_sql', {
            sql_query: `
              SELECT pg_get_functiondef(oid) AS function_definition
              FROM pg_proc 
              WHERE proname = '${trigger.function_name}';
            `
          });
          
          if (funcError) {
            console.error(`Error checking function ${trigger.function_name}:`, funcError);
          } else {
            console.log(`Function definition for ${trigger.function_name}:`);
            console.log(funcDef);
          }
        }
      }
    }
    
    // Check for a function that might be called through the trigger
    console.log('\nChecking for functions that reference "model"...');
    const { data: modelFuncs, error: modelError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT p.proname AS function_name, 
               pg_get_functiondef(p.oid) AS function_definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND pg_get_functiondef(p.oid) LIKE '%model%';
      `
    });
    
    if (modelError) {
      console.error('Error checking for model functions:', modelError);
    } else {
      console.log('Functions referencing "model":');
      console.log(modelFuncs);
    }
    
    // Add a device_model column if it doesn't exist
    console.log('\nChecking if device_model column exists...');
    const { data: modelCol, error: modelColError } = await supabase.rpc('execute_sql', {
      sql_query: `
        SELECT column_name, data_type
        FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'device_model';
      `
    });
    
    if (modelColError) {
      console.error('Error checking device_model column:', modelColError);
    } else {
      console.log('device_model column check:');
      console.log(modelCol);
      
      // If device_model doesn't exist, add it
      if (!modelCol.rows || modelCol.rows.length === 0) {
        console.log('\nAdding device_model column...');
        const { data: addCol, error: addColError } = await supabase.rpc('execute_sql', {
          sql_query: `
            ALTER TABLE public.bookings ADD COLUMN device_model TEXT;
          `
        });
        
        if (addColError) {
          console.error('Error adding device_model column:', addColError);
        } else {
          console.log('device_model column added:', addCol);
        }
      }
    }
    
    // Add a model column as well for the trigger
    console.log('\nAdding model column...');
    const { data: addModelCol, error: addModelError } = await supabase.rpc('execute_sql', {
      sql_query: `
        ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS model TEXT;
      `
    });
    
    if (addModelError) {
      console.error('Error adding model column:', addModelError);
    } else {
      console.log('model column added:', addModelCol);
    }
    
  } catch (err) {
    console.error('Exception during trigger check:', err);
  }
}

// Run the trigger check
checkTriggers(); 