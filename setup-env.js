const fs = require('fs');
const path = require('path');

const envContent = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/ems
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('.env file created successfully');
  console.log('Please update the JWT_SECRET with a secure key in production');
} else {
  console.log('.env file already exists');
}
