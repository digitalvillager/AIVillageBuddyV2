#!/bin/sh

# Export database credentials for migration script
export DB_USER="${DB_USER:-postgres}"
export DB_PASSWORD="${DB_PASSWORD:-postgres}"

# Extract database credentials from DATABASE_URL if they're not set
if [ -n "$DATABASE_URL" ] && [ -z "$DB_PASSWORD" ]; then
    # Extract password from DATABASE_URL format: postgresql://user:password@host:port/database
    DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    export DB_PASSWORD
fi

if [ -n "$DATABASE_URL" ] && [ -z "$DB_USER" ]; then
    # Extract user from DATABASE_URL format: postgresql://user:password@host:port/database
    DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    export DB_USER
fi

./init-db.sh
npm start