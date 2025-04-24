import User from './models/User.js';
import bcrypt from 'bcryptjs';
import sequelize from './config/database.js';
import { QueryTypes } from 'sequelize';

async function fixPasswordMismatch() {
  try {
    console.log('Fixing password mismatch issues...');
    
    // Get the email from command line arguments or use a default
    const targetEmail = process.argv[2] || 'string5@email.com';
    const newPassword = process.argv[3] || 'string';
    
    console.log(`Checking user with email: ${targetEmail}`);
    
    // 1. First check if the user exists
    const user = await User.scope('withPassword').findOne({ 
      where: { email: targetEmail } 
    });
    
    if (!user) {
      console.log(`❌ User with email ${targetEmail} not found`);
      process.exit(1);
    }
    
    console.log('✅ User found in database');
    console.log(`ID: ${user.id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    
    // 2. Check if password exists
    if (!user.password) {
      console.log('❌ User has no password stored');
    } else {
      console.log(`Current password hash: ${user.password.substring(0, 20)}...`);
      
      // 3. Test the current password
      try {
        const testPassword = newPassword;
        console.log(`Testing password: "${testPassword}"`);
        
        const isMatch = await bcrypt.compare(testPassword, user.password);
        
        if (isMatch) {
          console.log('✅ Password matches! The issue might be elsewhere.');
          
          // Test the login function logic
          console.log('\nSimulating login function logic:');
          
          // Get user with password
          const loginUser = await User.scope('withPassword').findOne({ 
            where: { email: targetEmail } 
          });
          
          if (!loginUser) {
            console.log('❌ User not found during login simulation');
          } else {
            console.log('✅ User found during login simulation');
            
            // Check password
            const loginMatch = await bcrypt.compare(testPassword, loginUser.password);
            
            if (!loginMatch) {
              console.log('❌ Password mismatch during login simulation');
            } else {
              console.log('✅ Password verified during login simulation');
              console.log('The login function should work correctly.');
            }
          }
        } else {
          console.log('❌ Password does not match');
          
          // 4. Reset the password
          console.log('\nResetting password...');
          
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          
          // Update using direct query to avoid any model hooks
          await sequelize.query(
            "UPDATE \"Users\" SET password = :password WHERE email = :email",
            { 
              replacements: { 
                email: targetEmail,
                password: hashedPassword
              },
              type: QueryTypes.UPDATE 
            }
          );
          
          console.log('✅ Password has been reset');
          
          // Verify the new password
          const updatedUser = await User.scope('withPassword').findOne({ 
            where: { email: targetEmail } 
          });
          
          const verifyMatch = await bcrypt.compare(newPassword, updatedUser.password);
          
          if (verifyMatch) {
            console.log('✅ New password verified successfully');
          } else {
            console.log('❌ New password verification failed');
          }
        }
      } catch (error) {
        console.error('Error during password comparison:', error);
      }
    }
    
    console.log('\nPassword fix completed');
    console.log('User credentials:');
    console.log(`Email: ${targetEmail}`);
    console.log(`Password: ${newPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing password mismatch:', error);
    process.exit(1);
  }
}

// Connect to database and run fix
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    fixPasswordMismatch();
  })
  .catch(err => {
    console.error('Unable to connect to database:', err);
    process.exit(1);
  }); 