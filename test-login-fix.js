import User from './models/User.js';
import bcrypt from 'bcryptjs';
import sequelize from './config/database.js';

async function testLoginFix() {
  try {
    console.log('Testing login fix...');
    
    // 1. Check if User model has the correct scopes
    console.log('\nChecking User model configuration:');
    console.log('Default scope excludes password:', 
      User.options.defaultScope.attributes.exclude.includes('password'));
    console.log('withPassword scope exists:', !!User.options.scopes.withPassword);
    
    // 2. Create a test user
    const testEmail = 'testfix@example.com';
    
    // Check if user already exists
    let testUser = await User.findOne({ where: { email: testEmail } });
    
    if (!testUser) {
      console.log('\nCreating test user...');
      
      // Create user with explicit password hashing
      const hashedPassword = await bcrypt.hash('testpassword', 10);
      
      testUser = await User.create({
        name: 'Test Fix User',
        email: testEmail,
        password: hashedPassword,
        phone: '1234567890',
        role: 'user'
      });
      
      console.log('Test user created with ID:', testUser.id);
    } else {
      console.log('\nTest user already exists with ID:', testUser.id);
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
      const isMatch = await bcrypt.compare('testpassword', userWithPassword.password);
      console.log('Password comparison result:', isMatch);
    } else {
      console.log('User not found with withPassword scope');
    }
    
    console.log('\nTest completed');
    console.log('Test user credentials:');
    console.log('Email:', testEmail);
    console.log('Password: testpassword');
    
    process.exit(0);
  } catch (error) {
    console.error('Error testing login fix:', error);
    process.exit(1);
  }
}

// Connect to database and run test
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    testLoginFix();
  })
  .catch(err => {
    console.error('Unable to connect to database:', err);
    process.exit(1);
  }); 