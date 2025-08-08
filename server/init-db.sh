#!/bin/sh

echo "db user ${DB_USER}"
echo "db password ${DB_PASSWORD}"
echo "db name ${DB_NAME}"
echo "db host ${DB_HOST}"
export PGPASSWORD=${DB_PASSWORD}

echo "PGPASSWORD is ${PGPASSWORD}"

# Wait for PostgreSQL to be available
echo "Waiting for PostgreSQL to be available..."
while ! pg_isready -h ${DB_HOST} -U "${DB_USER}"; do
  sleep 1
done

echo "PostgreSQL is available. Checking database schema..."

# Create migrations tracking table if it doesn't exist
psql -h ${DB_HOST} -U "${DB_USER}" -d ${DB_NAME} -c "
CREATE TABLE IF NOT EXISTS migration_history (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT NOW()
);"

# Function to check if a migration has been applied
migration_applied() {
    local filename=$1
    local count=$(psql -h ${DB_HOST} -U "${DB_USER}" -d ${DB_NAME} -t -c "SELECT COUNT(*) FROM migration_history WHERE filename = '$filename';")
    [ "$(echo $count | tr -d '[:space:]')" -gt "0" ]
}

# Function to apply a migration
apply_migration() {
    local filepath=$1
    local filename=$(basename "$filepath")
    
    echo "Applying migration: $filename"
    if psql -h ${DB_HOST} -U "${DB_USER}" -d ${DB_NAME} -f "$filepath"; then
        psql -h ${DB_HOST} -U "${DB_USER}" -d ${DB_NAME} -c "INSERT INTO migration_history (filename) VALUES ('$filename');"
        echo "Migration $filename applied successfully."
    else
        echo "Error applying migration $filename"
        exit 1
    fi
}

# Apply migrations in order
echo "Checking for pending migrations..."

# List all .sql files in migrations directory and sort them
for migration_file in $(ls /app/migrations/*.sql 2>/dev/null | sort); do
    filename=$(basename "$migration_file")
    
    if migration_applied "$filename"; then
        echo "Migration $filename already applied, skipping."
    else
        apply_migration "$migration_file"
    fi
done

echo "Database initialization complete."
