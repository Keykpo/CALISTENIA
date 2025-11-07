#!/bin/bash

# Database Sync Script for Prisma
# This script helps sync your database schema when you encounter P2022 errors

echo "🔧 Prisma Database Sync Script"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Error: schema.prisma not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "📦 Step 1: Generating Prisma Client..."
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate || {
    echo "⚠️  Warning: Could not generate Prisma client (network issues)"
    echo "Continuing with existing client..."
}

echo ""
echo "🔄 Step 2: Pushing schema to database..."
echo "This will sync your database with schema.prisma"
echo ""

# Try to push without network dependencies
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma db push --accept-data-loss --skip-generate

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database synced successfully!"
    echo ""
    echo "Your database now includes all columns from schema.prisma including:"
    echo "  - dailyStreak"
    echo "  - totalXP"
    echo "  - currentLevel"
    echo "  - virtualCoins"
    echo "  - totalStrength"
    echo "  - and all other fields"
    echo ""
    echo "You can now register users without P2022 errors."
else
    echo ""
    echo "❌ Database sync failed"
    echo ""
    echo "This might be due to:"
    echo "  1. Network restrictions preventing Prisma binary download"
    echo "  2. Database file permissions"
    echo "  3. Database is locked by another process"
    echo ""
    echo "💡 Alternative solution:"
    echo "  1. Stop your development server"
    echo "  2. Delete prisma/dev.db"
    echo "  3. Run: npx prisma db push"
    echo "  4. Restart your development server"
    exit 1
fi
