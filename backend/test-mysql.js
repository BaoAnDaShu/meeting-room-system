const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('Testing MySQL connection...');
    
    // Try to connect to MySQL server
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '123456',
    });
    
    console.log('Connected to MySQL server successfully!');
    
    // Check if database exists
    const [rows] = await connection.execute(
      'SHOW DATABASES LIKE ?',
      ['meeting_room_db']
    );
    
    if (rows.length > 0) {
      console.log('Database meeting_room_db exists!');
    } else {
      console.log('Database meeting_room_db does not exist. Creating it...');
      await connection.execute('CREATE DATABASE meeting_room_db');
      console.log('Database created successfully!');
    }
    
    await connection.end();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Check username and password.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Database does not exist.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. MySQL server is not running or not accessible.');
    } else {
      console.error('Other error:', error);
    }
  }
}

testConnection();
