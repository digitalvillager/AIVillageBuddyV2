#!/bin/sh
#

echo "start.sh started at $(date)"


# Export database credentials for migration script
export DB_USER="${DB_USER:-buddy}"
export DB_PASSWORD="${DB_PASSWORD:-buddy}"
export DB_NAME="${DB_NAME:-buddy}"
export DB_HOST="${DB_HOST:-buddydb}"

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

echo "DB USER: ${DB_USER}"
echo "DB PASSWORD: ${DB_PASSWORD}"
echo "DB NAME: ${DB_NAME}"

./init-db.sh
npm start
