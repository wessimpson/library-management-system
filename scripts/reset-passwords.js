const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

// Database config
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function resetPasswords() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('Updating passwords in the database...');
    // The new correct hash for 'password123'
    const hash = '$2a$10$.CRM87LOmi6nd1WB10K1uuMkGTiVlNWblFhSCL3oLqnKfMCzJDXjO';
    
    // Update all passwords to use the new hash
    const [result] = await connection.execute(`
      UPDATE Members 
      SET Password = ?
      WHERE Email IN ('admin@library.com', 'john.doe@email.com', 'jane.smith@email.com', 
                    'michael.j@email.com', 'emily.w@email.com');
    `, [hash]);
    
    console.log(`Updated ${result.affectedRows} user passwords successfully.`);
    
    await connection.end();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error resetting passwords:', error);
  }
}

resetPasswords();