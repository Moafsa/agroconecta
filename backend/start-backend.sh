#!/bin/bash

echo "🚀 Starting AgroConecta Backend..."

# Function to wait for database
wait_for_db() {
    echo "⏳ Waiting for database connection..."
    
    for i in {1..30}; do
        if npx prisma db ping > /dev/null 2>&1; then
            echo "✅ Database connection established!"
            return 0
        fi
        echo "⏳ Attempt $i/30: Database not ready, waiting 2 seconds..."
        sleep 2
    done
    
    echo "❌ Failed to connect to database after 60 seconds"
    exit 1
}

# Function to run migrations safely
run_migrations() {
    echo "🔄 Running database migrations..."
    
    if npx prisma migrate deploy; then
        echo "✅ Migrations completed successfully!"
    else
        echo "⚠️ Migration failed, but continuing..."
        # Don't exit here, maybe database is already migrated
    fi
}

# Function to seed database
seed_database() {
    echo "🌱 Checking if database needs seeding..."
    
    # Check if there are any plans in the database
    if node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        prisma.plano.count().then(count => {
            if (count === 0) {
                console.log('🌱 Database needs seeding...');
                process.exit(0);
            } else {
                console.log('✅ Database already has data, skipping seed');
                process.exit(1);
            }
        }).catch(() => process.exit(1));
    "; then
        echo "🌱 Running database seed..."
        if [ -f "scripts/create-sample-plans.js" ]; then
            node scripts/create-sample-plans.js || echo "⚠️ Seeding failed, continuing..."
        fi
    fi
}

# Main execution
echo "🔧 Environment: $NODE_ENV"
echo "🔧 Port: $PORT"
echo "🔧 Database URL: ${DATABASE_URL:0:30}..."

# Wait for database
wait_for_db

# Run migrations
run_migrations

# Seed database if needed
seed_database

# Start the application
echo "🚀 Starting Node.js application..."
exec node server-prisma.js
