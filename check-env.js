import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Print environment variables (redacting sensitive info)
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Check database URL
const dbUrl = process.env.DATABASE_URL || process.env.PG_URI;
if (dbUrl) {
  // Redact password from output
  const redactedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
  console.log('Database URL:', redactedUrl);
} else {
  console.error('No database URL found in environment variables!');
}

// Check if .env file exists
if (fs.existsSync('.env')) {
  console.log('.env file exists');
  
  // Read .env file content (redacting sensitive info)
  const envContent = fs.readFileSync('.env', 'utf8')
    .split('\n')
    .map(line => {
      // Redact passwords and secrets
      if (line.includes('PASSWORD') || line.includes('SECRET') || line.includes('KEY')) {
        const parts = line.split('=');
        if (parts.length > 1) {
          return `${parts[0]}=****`;
        }
      }
      return line;
    })
    .join('\n');
  
  console.log('.env file content (redacted):');
  console.log(envContent);
} else {
  console.error('.env file does not exist!');
} 