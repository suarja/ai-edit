#!/usr/bin/env node
/**
 * Script to make a user an admin by their email
 * 
 * Usage:
 *   node scripts/make_admin.js user@example.com
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your .env file');
  process.exit(1);
}

const email = process.argv[2];

if (!email) {
  console.error('Error: Please provide a user email address');
  console.error('Usage: node scripts/make_admin.js user@example.com');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function makeAdmin(email) {
  try {
    // Find the user by email
    const { data: user, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Error finding user:', userError.message);
      return;
    }

    if (!user) {
      console.error(`No user found with email: ${email}`);
      return;
    }

    // Check if user is already an admin
    const { data: existingRole, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError && roleError.code !== 'PGRST116') {
      console.error('Error checking existing role:', roleError.message);
      return;
    }

    if (existingRole) {
      console.log(`User ${email} is already an admin`);
      return;
    }

    // Add admin role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: 'admin',
      });

    if (insertError) {
      console.error('Error adding admin role:', insertError.message);
      return;
    }

    console.log(`Successfully made ${email} an admin`);
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

makeAdmin(email).then(() => process.exit()); 