import User from './models/User.js';
import bcrypt from 'bcryptjs';
import sequelize from './config/database.js';

async function testLogin() {
  try {
    console.log('Testing login functionality...');
    
    // 1. Check if User model has the correct scopes
    console.log('\nChecking User model configuration:');
    console.log('Default scope excludes password:', 
      User.options.defaultScope.attributes.exclude.includes('password'));
    console.log('withPassword scope exists:', !!User.options.scopes.withPassword);
    
    // 2. Create a test user
    const testEmail = 'testlogin@example.com';
    const testPassword = 'password123';
    
    // Check if user already exists
    let testUser = await User.findOne({ where: { email: testEmail } });
    
    if (!testUser) {
      console.log('\nCreating test user...');
      
      // Create user with explicit password hashing
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      testUser = await User.create({
        name: 'Test Login User',
        email: testEmail,
        password: hashedPassword,
        phone: '1234567890',
        role: 'user'
      });
      
      console.log('Test user created with ID:', testUser.id);
    } else {
      console.log('\nTest user already exists with ID:', testUser.id);
      
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await testUser.update({ password: hashedPassword });
      console.log('Test user password updated');
    }
    
    // 3. Test finding user with default scope (should exclude password)
    console.log('\nTesting default scope (should NOT include password):');
    const userDefaultScope = await User.findOne({ where: { email: testEmail } });
    
    if (userDefaultScope) {
      console.log('User found with default scope');
      console.log('Has password field:', !!userDefaultScope.password);
      console.log('User data:', userDefaultScope.toJSON());
    } else {
      console.log('User not found with default scope');
    }
    
    // 4. Test finding user with withPassword scope
    console.log('\nTesting withPassword scope (should include password):');
    const userWithPassword = await User.scope('withPassword').findOne({ 
      where: { email: testEmail } 
    });
    
    if (userWithPassword) {
      console.log('User found with withPassword scope');
      console.log('Has password field:', !!userWithPassword.password);
      console.log('Password hash:', userWithPassword.password.substring(0, 10) + '...');
      
      // Test password comparison
      const isMatch = await bcrypt.compare(testPassword, userWithPassword.password);
      console.log('Password comparison result:', isMatch);
      
      // Test instance method
      if (userWithPassword.comparePassword) {
        const isMatchMethod = await userWithPassword.comparePassword(testPassword);
        console.log('Password comparison using instance method:', isMatchMethod);
      } else {
        console.log('comparePassword instance method not found');
      }
    } else {
      console.log('User not found with withPassword scope');
    }
    
    // 5. Simulate login process
    console.log('\nSimulating login process:');
    const loginUser = await User.scope('withPassword').findOne({ 
      where: { email: testEmail } 
    });
    
    if (loginUser) {
      console.log('User found for login');
      console.log('Has password field:', !!loginUser.password);
      
      const loginMatch = await bcrypt.compare(testPassword, loginUser.password);
      console.log('Login password match:', loginMatch);
      
      if (loginMatch) {
        console.log('Login would be successful');
      } else {
        console.log('Login would fail due to password mismatch');
      }
    } else {
      console.log('User not found for login');
    }
    
    console.log('\nTest completed');
    console.log('Test user credentials:');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing login:', error);
    process.exit(1);
  }
}

// Connect to database and run test
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    testLogin();
  })
  .catch(err => {
    console.error('Unable to connect to database:', err);
    process.exit(1);
  }); 