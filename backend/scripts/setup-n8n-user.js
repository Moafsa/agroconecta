#!/usr/bin/env node

/**
 * Script to create a dedicated n8n user with limited permissions
 * Usage: node setup-n8n-user.js
 */

const { PrismaClient } = require('@prisma/client');

async function setupN8nUser() {
  const prisma = new PrismaClient();

  try {
    console.log('🔧 Setting up n8n database user...');

    // SQL commands to create n8n user with limited permissions
    const setupCommands = [
      // Create n8n user
      `CREATE USER n8n_user WITH PASSWORD '${process.env.N8N_DB_PASSWORD || 'n8n_secure_password_2024'}';`,
      
      // Grant connection to database
      `GRANT CONNECT ON DATABASE agro_conecta TO n8n_user;`,
      
      // Grant usage on schema
      `GRANT USAGE ON SCHEMA public TO n8n_user;`,
      
      // Grant SELECT permissions on all existing tables
      `GRANT SELECT ON ALL TABLES IN SCHEMA public TO n8n_user;`,
      
      // Grant SELECT permissions on all sequences (for ID fields)
      `GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO n8n_user;`,
      
      // Set default privileges for future tables
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO n8n_user;`,
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO n8n_user;`,
      
      // Optional: Grant INSERT/UPDATE for specific automation tables if needed
      // Uncomment the lines below if n8n needs to write data
      // `GRANT INSERT, UPDATE ON interacoes TO n8n_user;`,
      // `GRANT INSERT, UPDATE ON historico_mensagens TO n8n_user;`,
    ];

    // Execute each command
    for (const command of setupCommands) {
      try {
        await prisma.$executeRawUnsafe(command);
        console.log(`✅ Executed: ${command.substring(0, 50)}...`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  User already exists, skipping creation`);
        } else {
          console.error(`❌ Error executing command: ${command}`);
          console.error(error.message);
        }
      }
    }

    console.log('\n🎉 n8n user setup completed!');
    console.log('\n📋 Connection details for n8n:');
    console.log(`Host: ${process.env.DB_HOST || '65.109.224.186'}`);
    console.log(`Port: 5432`);
    console.log(`Database: agro_conecta`);
    console.log(`User: n8n_user`);
    console.log(`Password: ${process.env.N8N_DB_PASSWORD || 'n8n_secure_password_2024'}`);
    console.log(`SSL Mode: prefer`);

  } catch (error) {
    console.error('❌ Error setting up n8n user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
if (require.main === module) {
  setupN8nUser();
}

module.exports = { setupN8nUser };
