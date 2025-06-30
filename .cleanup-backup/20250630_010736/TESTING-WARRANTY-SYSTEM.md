# Testing the Technician and Warranty System

This document contains step-by-step instructions for testing the new technician-driven warranty system.

## Prerequisites

Before starting the tests, ensure you have:

1. Supabase service role key in your `.env.local` file
2. Node.js installed
3. Run the migrations using `node run-technician-warranty-migration.js`

## Test 1: Set Up a Technician

1. Run the technician management script:
   ```
   node scripts/manage-warranties.js
   ```

2. Select option `5` (Manage Technicians)

3. Select option `1` (Add New Technician) and enter the following details:
   - Full name: Test Technician
   - Email: tech@thetravellingtechnicians.com
   - Phone: 604-123-4567
   - Specializations: mobile,laptop
   - Service Areas: V5K,V5L,V5M

4. After adding the technician, note the message about creating a Supabase Auth user.

5. In Supabase dashboard, create an Auth user with the same email address:
   - Go to Authentication > Users
   - Click "Add User"
   - Enter the email and a password

6. Get the User ID (UUID) from Supabase and update the technician record:
   - In Supabase dashboard, go to SQL Editor
   - Execute this query (replace with your actual UUID):
   ```sql
   UPDATE technicians 
   SET auth_id = '00000000-0000-0000-0000-000000000000' 
   WHERE email = 'tech@thetravellingtechnicians.com';
   ```

## Test 2: Register a Completed Repair

1. Create a test booking using the standard booking form:
   - Go to the website at http://localhost:3000/book-online
   - Complete the booking form with your details
   - Note the booking reference number

2. Run the warranty management script:
   ```
   node scripts/manage-warranties.js
   ```

3. Select option `3` (Register Completed Repair)

4. Enter the booking reference number

5. Select the technician from the list

6. Enter repair details:
   - Repair notes: Replaced screen and fixed audio issues
   - Repair duration: 45
   - Add a part: iPhone 12 Screen
   - Part description: OEM replacement screen
   - Part cost: 120
   - Add another part? Yes
   - Add a part: iPhone 12 Speaker
   - Part description: OEM replacement speaker
   - Part cost: 40
   - Add another part? No

7. Review the information and confirm by entering `y`

8. The system should confirm the repair was registered and a warranty was created

## Test 3: View Warranty in the Web Interface

1. Start the web server if not already running:
   ```
   npm run dev
   ```

2. Go to http://localhost:3000/my-warranties

3. Sign in with the customer email used in Test 2

4. You should see the warranty for the repair that was just completed, showing:
   - Device information
   - Warranty status and code
   - Days remaining in the warranty period
   - Option to submit a claim

## Test 4: Search for a Warranty

1. Run the warranty management script:
   ```
   node scripts/manage-warranties.js
   ```

2. Select option `2` (Search Warranty by Code)

3. Enter the warranty code from Test 3

4. Verify that all details are displayed correctly, including:
   - Warranty details (code, status, dates)
   - Device details
   - Customer information
   - Repair details
   - Parts used

## Test 5: Submit and Process a Warranty Claim

1. Go to http://localhost:3000/my-warranties

2. Find the warranty card and click "Submit Warranty Claim"

3. Fill out the claim form:
   - Issue description: Device screen is flickering after repair
   - Preferred date: [select a date]
   - Submit the form

4. Run the warranty management script:
   ```
   node scripts/manage-warranties.js
   ```

5. Select option `4` (View Pending Warranty Claims)

6. You should see the claim that was just submitted

7. Process the claim:
   - Select to process a claim by entering `y`
   - Enter the claim number
   - Select a technician to assign
   - Enter a follow-up date
   - Verify the claim was updated successfully

## Expected Results

After completing these tests, you should have:

1. A technician registered in the system
2. A completed repair with warranty automatically created
3. The warranty visible in the web interface
4. A warranty claim submitted by the customer
5. The claim processed by a technician

If any test fails, check the error messages and review the SQL scripts for potential issues. 