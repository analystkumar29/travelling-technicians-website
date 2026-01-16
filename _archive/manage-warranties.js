require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
const chalk = require('chalk');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask a question and get a response
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main menu
async function showMainMenu() {
  console.clear();
  console.log(chalk.bold.blue('=== The Travelling Technicians Warranty Management ==='));
  console.log('');
  console.log('1. View All Active Warranties');
  console.log('2. Search Warranty by Code');
  console.log('3. Register Completed Repair');
  console.log('4. View Pending Warranty Claims');
  console.log('5. Manage Technicians');
  console.log('0. Exit');
  console.log('');
  
  const choice = await askQuestion('Enter your choice: ');
  
  switch (choice) {
    case '1':
      await viewActiveWarranties();
      break;
    case '2':
      await searchWarrantyByCode();
      break;
    case '3':
      await registerRepairCompletion();
      break;
    case '4':
      await viewPendingClaims();
      break;
    case '5':
      await manageTechnicians();
      break;
    case '0':
      console.log(chalk.yellow('Exiting...'));
      rl.close();
      return;
    default:
      console.log(chalk.red('Invalid choice. Press Enter to continue...'));
      await askQuestion('');
      await showMainMenu();
  }
}

// View all active warranties
async function viewActiveWarranties() {
  console.clear();
  console.log(chalk.bold.blue('=== Active Warranties ==='));
  console.log('');
  
  try {
    const { data, error } = await supabase
      .from('warranties')
      .select(`
        warranty_code,
        issue_date,
        expiry_date,
        status,
        booking:booking_id (
          reference_number,
          customer_name,
          customer_email,
          customer_phone,
          device_type,
          device_brand,
          device_model,
          service_type
        )
      `)
      .eq('status', 'active')
      .order('issue_date', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching warranties: ${error.message}`);
    }
    
    if (data.length === 0) {
      console.log(chalk.yellow('No active warranties found.'));
    } else {
      // Calculate days remaining
      const now = new Date();
      data.forEach((warranty, index) => {
        const expiryDate = new Date(warranty.expiry_date);
        const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        
        console.log(chalk.green(`Warranty #${index + 1}: ${warranty.warranty_code}`));
        console.log(`Device: ${warranty.booking.device_brand} ${warranty.booking.device_model}`);
        console.log(`Service: ${warranty.booking.service_type}`);
        console.log(`Customer: ${warranty.booking.customer_name} (${warranty.booking.customer_email})`);
        console.log(`Expiry: ${warranty.expiry_date} (${daysRemaining} days remaining)`);
        console.log('');
      });
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
  }
  
  await askQuestion('Press Enter to return to the main menu...');
  await showMainMenu();
}

// Search warranty by code
async function searchWarrantyByCode() {
  console.clear();
  console.log(chalk.bold.blue('=== Search Warranty ==='));
  console.log('');
  
  const warrantyCode = await askQuestion('Enter warranty code (e.g., TTW-20250518-1234): ');
  
  try {
    if (!warrantyCode) {
      throw new Error('Warranty code is required');
    }
    
    const { data, error } = await supabase
      .from('warranties')
      .select(`
        *,
        booking:booking_id (
          reference_number,
          customer_name,
          customer_email,
          customer_phone,
          address,
          postal_code,
          city,
          device_type,
          device_brand,
          device_model,
          service_type
        ),
        technician:technician_id (
          full_name,
          email,
          phone
        ),
        repair_completion:repair_completion_id (
          completed_at,
          repair_notes,
          parts_used,
          repair_duration
        )
      `)
      .eq('warranty_code', warrantyCode)
      .single();
    
    if (error) {
      throw new Error(`Warranty not found: ${error.message}`);
    }
    
    // Calculate days remaining
    const now = new Date();
    const expiryDate = new Date(data.expiry_date);
    const daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    console.log(chalk.green('=== Warranty Details ==='));
    console.log(chalk.bold(`Warranty Code: ${data.warranty_code}`));
    console.log(`Status: ${data.status.toUpperCase()}`);
    console.log(`Issue Date: ${data.issue_date}`);
    console.log(`Expiry Date: ${data.expiry_date} (${daysRemaining} days remaining)`);
    
    console.log('');
    console.log(chalk.green('=== Device Details ==='));
    console.log(`Device: ${data.booking.device_brand} ${data.booking.device_model}`);
    console.log(`Service: ${data.booking.service_type}`);
    
    console.log('');
    console.log(chalk.green('=== Customer Details ==='));
    console.log(`Name: ${data.booking.customer_name}`);
    console.log(`Email: ${data.booking.customer_email}`);
    console.log(`Phone: ${data.booking.customer_phone}`);
    if (data.booking.address) {
      console.log(`Address: ${data.booking.address}, ${data.booking.postal_code}, ${data.booking.city || ''}`);
    }
    
    console.log('');
    console.log(chalk.green('=== Repair Details ==='));
    console.log(`Completed: ${new Date(data.repair_completion.completed_at).toLocaleString()}`);
    console.log(`Technician: ${data.technician.full_name}`);
    console.log(`Notes: ${data.repair_completion.repair_notes || 'None'}`);
    
    if (data.repair_completion.parts_used) {
      console.log('');
      console.log(chalk.green('=== Parts Used ==='));
      data.repair_completion.parts_used.forEach(part => {
        console.log(`- ${part.name}: $${part.cost}`);
      });
    }
    
    if (data.status === 'claimed') {
      // Get claim information
      const { data: claimData, error: claimError } = await supabase
        .from('warranty_claims')
        .select('*')
        .eq('warranty_id', data.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (claimError) {
        console.log(chalk.yellow('\nWarranty is marked as claimed but no claim record found.'));
      } else {
        console.log('');
        console.log(chalk.green('=== Claim Details ==='));
        console.log(`Claim Date: ${claimData.claim_date}`);
        console.log(`Issue: ${claimData.issue_description}`);
        console.log(`Status: ${claimData.status.toUpperCase()}`);
        console.log(`Resolution: ${claimData.resolution || 'Pending'}`);
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
  }
  
  await askQuestion('\nPress Enter to return to the main menu...');
  await showMainMenu();
}

// Register repair completion
async function registerRepairCompletion() {
  console.clear();
  console.log(chalk.bold.blue('=== Register Repair Completion ==='));
  console.log('');
  
  try {
    // Get booking ID
    const bookingReference = await askQuestion('Enter booking reference number: ');
    
    if (!bookingReference) {
      throw new Error('Booking reference is required');
    }
    
    // Check if booking exists
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('id, customer_name, customer_email, device_type, device_brand, device_model, service_type, status, repair_status')
      .eq('reference_number', bookingReference)
      .single();
    
    if (bookingError) {
      throw new Error(`Booking not found: ${bookingError.message}`);
    }
    
    if (bookingData.status === 'completed' || bookingData.repair_status === 'completed') {
      throw new Error('This booking has already been marked as completed');
    }
    
    console.log(chalk.green('\nBooking Details:'));
    console.log(`Customer: ${bookingData.customer_name}`);
    console.log(`Email: ${bookingData.customer_email}`);
    console.log(`Device: ${bookingData.device_type} - ${bookingData.device_brand} ${bookingData.device_model}`);
    console.log(`Service: ${bookingData.service_type}`);
    
    // Get technician
    console.log(chalk.green('\nAvailable Technicians:'));
    
    const { data: technicians, error: techniciansError } = await supabase
      .from('technicians')
      .select('id, full_name, email')
      .eq('is_active', true);
    
    if (techniciansError) {
      throw new Error(`Error fetching technicians: ${techniciansError.message}`);
    }
    
    if (technicians.length === 0) {
      throw new Error('No active technicians found');
    }
    
    technicians.forEach((tech, index) => {
      console.log(`${index + 1}. ${tech.full_name} (${tech.email})`);
    });
    
    const techChoice = parseInt(await askQuestion('\nSelect technician (number): '));
    
    if (isNaN(techChoice) || techChoice < 1 || techChoice > technicians.length) {
      throw new Error('Invalid technician selection');
    }
    
    const selectedTechnician = technicians[techChoice - 1];
    
    // Get repair details
    console.log(chalk.green('\nRepair Details:'));
    const repairNotes = await askQuestion('Repair notes: ');
    const repairDuration = parseInt(await askQuestion('Repair duration (minutes): '));
    
    // Parts used
    const parts = [];
    let addMoreParts = true;
    
    while (addMoreParts) {
      const partName = await askQuestion('\nPart name (or leave empty to finish): ');
      
      if (!partName) {
        addMoreParts = false;
        continue;
      }
      
      const partDescription = await askQuestion('Part description: ');
      const partCost = parseFloat(await askQuestion('Part cost: '));
      
      if (isNaN(partCost)) {
        console.log(chalk.yellow('Invalid cost. Using 0.'));
      }
      
      parts.push({
        name: partName,
        description: partDescription,
        cost: isNaN(partCost) ? 0 : partCost
      });
      
      const addAnother = (await askQuestion('Add another part? (y/n): ')).toLowerCase();
      addMoreParts = addAnother === 'y' || addAnother === 'yes';
    }
    
    // Confirm submission
    console.log('');
    console.log(chalk.yellow('Please review the information before submitting:'));
    console.log(`Booking: ${bookingReference}`);
    console.log(`Technician: ${selectedTechnician.full_name}`);
    console.log(`Notes: ${repairNotes}`);
    console.log(`Duration: ${repairDuration} minutes`);
    console.log(`Parts Used: ${parts.length} part(s)`);
    
    const confirm = (await askQuestion('\nSubmit repair completion? (y/n): ')).toLowerCase();
    
    if (confirm !== 'y' && confirm !== 'yes') {
      throw new Error('Submission cancelled');
    }
    
    // Submit repair completion
    const { data, error } = await supabase
      .from('repair_completions')
      .insert([{
        booking_id: bookingData.id,
        technician_id: selectedTechnician.id,
        repair_notes: repairNotes,
        repair_duration: repairDuration,
        parts_used: parts,
        completed_at: new Date().toISOString(),
      }])
      .select();
    
    if (error) {
      throw new Error(`Error registering repair: ${error.message}`);
    }
    
    console.log(chalk.green('\nRepair registered successfully!'));
    console.log('A warranty has been automatically created. The warranty code will be sent to the customer.');
    
  } catch (error) {
    console.error(chalk.red(`\nError: ${error.message}`));
  }
  
  await askQuestion('\nPress Enter to return to the main menu...');
  await showMainMenu();
}

// View pending warranty claims
async function viewPendingClaims() {
  console.clear();
  console.log(chalk.bold.blue('=== Pending Warranty Claims ==='));
  console.log('');
  
  try {
    const { data, error } = await supabase
      .from('warranty_claims')
      .select(`
        *,
        warranty:warranty_id (
          warranty_code,
          booking_id
        ),
        booking:warranty(booking_id) (
          reference_number,
          customer_name,
          customer_email,
          customer_phone,
          device_type,
          device_brand,
          device_model,
          service_type
        )
      `)
      .eq('status', 'pending')
      .order('claim_date', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching claims: ${error.message}`);
    }
    
    if (data.length === 0) {
      console.log(chalk.yellow('No pending warranty claims found.'));
    } else {
      data.forEach((claim, index) => {
        console.log(chalk.green(`Claim #${index + 1} - ${claim.claim_date}`));
        console.log(`Warranty: ${claim.warranty.warranty_code}`);
        console.log(`Device: ${claim.booking.device_brand} ${claim.booking.device_model}`);
        console.log(`Service: ${claim.booking.service_type}`);
        console.log(`Customer: ${claim.booking.customer_name} (${claim.booking.customer_email})`);
        console.log(`Issue: ${claim.issue_description}`);
        console.log('');
      });
      
      // Ask if user wants to process a claim
      const processClaim = (await askQuestion('Process a claim? (y/n): ')).toLowerCase();
      
      if (processClaim === 'y' || processClaim === 'yes') {
        const claimNumber = parseInt(await askQuestion('Enter claim number to process: '));
        
        if (isNaN(claimNumber) || claimNumber < 1 || claimNumber > data.length) {
          throw new Error('Invalid claim number');
        }
        
        const selectedClaim = data[claimNumber - 1];
        
        console.log(chalk.green('\nProcessing Claim:'));
        console.log(`Warranty: ${selectedClaim.warranty.warranty_code}`);
        console.log(`Customer: ${selectedClaim.booking.customer_name}`);
        console.log(`Issue: ${selectedClaim.issue_description}`);
        
        // Get technician
        console.log(chalk.green('\nAvailable Technicians:'));
        
        const { data: technicians, error: techniciansError } = await supabase
          .from('technicians')
          .select('id, full_name, email')
          .eq('is_active', true);
        
        if (techniciansError) {
          throw new Error(`Error fetching technicians: ${techniciansError.message}`);
        }
        
        if (technicians.length === 0) {
          throw new Error('No active technicians found');
        }
        
        technicians.forEach((tech, index) => {
          console.log(`${index + 1}. ${tech.full_name} (${tech.email})`);
        });
        
        const techChoice = parseInt(await askQuestion('\nAssign to technician (number): '));
        
        if (isNaN(techChoice) || techChoice < 1 || techChoice > technicians.length) {
          throw new Error('Invalid technician selection');
        }
        
        const selectedTechnician = technicians[techChoice - 1];
        
        // Get follow-up date
        const followUpDate = await askQuestion('Follow-up date (YYYY-MM-DD): ');
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        
        if (!dateRegex.test(followUpDate)) {
          throw new Error('Invalid date format. Use YYYY-MM-DD');
        }
        
        // Update claim
        const { error: updateError } = await supabase
          .from('warranty_claims')
          .update({
            status: 'in_progress',
            assigned_technician_id: selectedTechnician.id,
            follow_up_date: followUpDate
          })
          .eq('id', selectedClaim.id);
        
        if (updateError) {
          throw new Error(`Error updating claim: ${updateError.message}`);
        }
        
        console.log(chalk.green('\nClaim updated successfully!'));
        console.log(`Assigned to: ${selectedTechnician.full_name}`);
        console.log(`Follow-up date: ${followUpDate}`);
      }
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
  }
  
  await askQuestion('\nPress Enter to return to the main menu...');
  await showMainMenu();
}

// Manage technicians
async function manageTechnicians() {
  console.clear();
  console.log(chalk.bold.blue('=== Manage Technicians ==='));
  console.log('');
  
  try {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .order('full_name');
    
    if (error) {
      throw new Error(`Error fetching technicians: ${error.message}`);
    }
    
    if (data.length === 0) {
      console.log(chalk.yellow('No technicians found.'));
    } else {
      console.log(chalk.green('Current Technicians:'));
      data.forEach((tech, index) => {
        console.log(`${index + 1}. ${tech.full_name} (${tech.email}) - ${tech.is_active ? 'Active' : 'Inactive'}`);
        console.log(`   Specializations: ${tech.specializations.join(', ')}`);
        console.log(`   Service Areas: ${tech.active_service_areas.join(', ')}`);
        console.log('');
      });
    }
    
    console.log('1. Add New Technician');
    console.log('2. Update Technician Status');
    console.log('3. Return to Main Menu');
    console.log('');
    
    const choice = await askQuestion('Enter choice: ');
    
    if (choice === '1') {
      // Add new technician
      console.log(chalk.green('\nAdd New Technician:'));
      const fullName = await askQuestion('Full name: ');
      const email = await askQuestion('Email: ');
      const phone = await askQuestion('Phone: ');
      
      // Get specializations
      console.log(chalk.yellow('\nSpecializations (comma separated):'));
      console.log('Example: mobile,laptop');
      const specializationsInput = await askQuestion('Enter specializations: ');
      const specializations = specializationsInput.split(',').map(s => s.trim()).filter(Boolean);
      
      // Get service areas
      console.log(chalk.yellow('\nService Areas (comma separated postal code prefixes):'));
      console.log('Example: V5K,V5L,V5M');
      const serviceAreasInput = await askQuestion('Enter service areas: ');
      const serviceAreas = serviceAreasInput.split(',').map(s => s.trim()).filter(Boolean);
      
      // Create technician
      const { data: newTech, error: createError } = await supabase
        .from('technicians')
        .insert([{
          full_name: fullName,
          email: email,
          phone: phone,
          specializations: specializations,
          active_service_areas: serviceAreas,
          is_active: true
        }])
        .select();
      
      if (createError) {
        throw new Error(`Error creating technician: ${createError.message}`);
      }
      
      console.log(chalk.green('\nTechnician added successfully!'));
      console.log('NOTE: You still need to create a Supabase Auth user for this technician');
      console.log('and update the technician record with the auth_id.');
      
    } else if (choice === '2' && data.length > 0) {
      // Update technician status
      const techNumber = parseInt(await askQuestion('\nEnter technician number to update: '));
      
      if (isNaN(techNumber) || techNumber < 1 || techNumber > data.length) {
        throw new Error('Invalid technician number');
      }
      
      const selectedTech = data[techNumber - 1];
      const newStatus = !selectedTech.is_active;
      
      const { error: updateError } = await supabase
        .from('technicians')
        .update({ is_active: newStatus })
        .eq('id', selectedTech.id);
      
      if (updateError) {
        throw new Error(`Error updating technician: ${updateError.message}`);
      }
      
      console.log(chalk.green(`\nTechnician ${selectedTech.full_name} is now ${newStatus ? 'active' : 'inactive'}.`));
    }
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
  }
  
  await askQuestion('\nPress Enter to return to the main menu...');
  await showMainMenu();
}

// Start the script
console.log(chalk.bold.green('The Travelling Technicians - Warranty Management CLI'));
console.log(chalk.yellow('This tool allows management of warranties and technicians.'));
console.log('');

showMainMenu(); 