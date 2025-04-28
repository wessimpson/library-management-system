#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BLUE='\033[0;34m'

# Header
echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}  Library Management System Setup ${NC}"
echo -e "${BLUE}=================================${NC}"

# Function to check command existence
command_exists() { command -v "$1" >/dev/null 2>&1; }

# Check dependencies
echo -e "${YELLOW}Checking required dependencies...${NC}"
for cmd in node npm mysql; do
  if command_exists $cmd; then
    echo -e "${GREEN}✓ $cmd is installed${NC}"
  else
    echo -e "${RED}$cmd is missing. Please install it before continuing.${NC}"
    exit 1
  fi
done

# Install server dependencies
echo -e "${YELLOW}Installing server dependencies...${NC}"
npm install

# Install client dependencies
echo -e "${YELLOW}Installing client dependencies...${NC}"
(cd client && npm install --legacy-peer-deps)

# Set up .env
echo -e "${YELLOW}Setting up environment variables...${NC}"
if [ ! -f "./server/.env" ]; then
  echo "Creating server/.env file..."
  read -p "MySQL Host (default: 127.0.0.1): " DB_HOST
  DB_HOST=${DB_HOST:-127.0.0.1}

  read -p "MySQL Username (default: root): " DB_USER
  DB_USER=${DB_USER:-root}

  read -s -p "MySQL Password: " DB_PASSWORD
  echo

  read -p "MySQL Database Name (default: library_management): " DB_NAME
  DB_NAME=${DB_NAME:-library_management}

  JWT_SECRET=$(openssl rand -hex 16)

  cat > ./server/.env <<EOF
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
JWT_SECRET=$JWT_SECRET
JWT_EXPIRE=30d
PORT=5000
EOF
  echo -e "${GREEN}✓ Environment file created at ./server/.env${NC}"
else
  echo -e "${GREEN}✓ Environment file already exists${NC}"
fi

# Load environment variables
set -o allexport
source ./server/.env
set +o allexport

# Validate env variables
if [[ -z "$DB_HOST" || -z "$DB_USER" || -z "$DB_PASSWORD" || -z "$DB_NAME" ]]; then
  echo -e "${RED}Environment variables are not correctly set. Exiting.${NC}"
  exit 1
fi

# Test MySQL connection
echo -e "${YELLOW}Checking MySQL credentials...${NC}"
if ! mysql --connect-expired-password --host="$DB_HOST" --user="$DB_USER" --password="$DB_PASSWORD" --protocol=TCP -e "SELECT 1;" 2>/dev/null; then
  if ! mysql --host="$DB_HOST" --user="$DB_USER" --password="$DB_PASSWORD" -e "SELECT 1;" 2>/dev/null; then
    echo -e "${RED}Cannot connect to MySQL. Please check your credentials.${NC}"
    exit 1
  fi
fi

# Create database if not exists
echo -e "${YELLOW}Setting up database '${DB_NAME}'...${NC}"
MYSQL_CMD="mysql --connect-expired-password --host=\"$DB_HOST\" --user=\"$DB_USER\" --password=\"$DB_PASSWORD\" --protocol=TCP"
# Try with TCP protocol first (for remote connections)
eval $MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || \
# Fall back to default connection method (for localhost socket)
mysql --host="$DB_HOST" --user="$DB_USER" --password="$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Load database schema
if [ -f "./setup-database.sql" ]; then
  echo -e "${YELLOW}Loading database schema...${NC}"
  # Try with TCP protocol first
  eval $MYSQL_CMD "$DB_NAME" < ./setup-database.sql 2>/dev/null || \
  # Fall back to default connection method
  mysql --host="$DB_HOST" --user="$DB_USER" --password="$DB_PASSWORD" "$DB_NAME" < ./setup-database.sql
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database schema loaded successfully${NC}"
  else
    echo -e "${RED}Failed to load database schema.${NC}"
    exit 1
  fi
else
  echo -e "${RED}setup-database.sql not found. Skipping schema load.${NC}"
fi

# Load sample data
if [ -f "./sample-data.sql" ]; then
  echo -e "${YELLOW}Loading sample data...${NC}"
  # Try with TCP protocol first
  eval $MYSQL_CMD "$DB_NAME" < ./sample-data.sql 2>/dev/null || \
  # Fall back to default connection method
  mysql --host="$DB_HOST" --user="$DB_USER" --password="$DB_PASSWORD" "$DB_NAME" < ./sample-data.sql
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Sample data loaded successfully${NC}"
  else
    echo -e "${RED}Failed to load sample data.${NC}"
    # Don't exit here, as we can continue even without sample data
    echo -e "${YELLOW}Continuing without sample data...${NC}"
  fi
else
  echo -e "${YELLOW}sample-data.sql not found. Skipping sample data load.${NC}"
fi

# Final message
echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN} Setup completed successfully!${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo

# Instructions
echo -e "To start the application, run: ${BLUE}npm run dev${NC}"
echo -e "Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "Backend API: ${BLUE}http://localhost:5000${NC}"
echo

echo -e "${YELLOW}Default Login Credentials:${NC}"
echo -e "Admin: Email: ${BLUE}admin@library.com${NC} Password: ${BLUE}password123${NC}"
echo -e "Member: Email: ${BLUE}john.doe@email.com${NC} Password: ${BLUE}password123${NC}"
echo
