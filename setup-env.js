const fs = require('fs');
const path = require('path');

const envContent = `NEXT_PUBLIC_API_URL=http://localhost:5000/api
`;

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('.env.local file created successfully');
} else {
  console.log('.env.local file already exists');
}
