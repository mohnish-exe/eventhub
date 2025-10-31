// Oracle Database Configuration
// Update these values with your actual Oracle database connection details

export const ORACLE_CONFIG = {
  // Oracle Database Connection
  user: 'system', // Replace with your Oracle username
  password: 'root', // Replace with your Oracle password
  connectString: 'localhost:1521/XE', // Replace with your Oracle connection string
  
  // Connection Pool Settings
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 60,
  poolPingInterval: 60,
};

// Note: Make sure your Oracle database is running and accessible
// The connection string format is: host:port/service_name
// For Oracle XE: localhost:1521/XE
// For Oracle Express Edition: localhost:1521/XEPDB1
// For your "DBMS project" connection, update the connectString accordingly

