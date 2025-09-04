// Simple test to verify local upload system
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Local Upload System');
console.log('==============================\n');

// Check if upload directories exist
const uploadDir = path.join(__dirname, 'uploads');
const imagesDir = path.join(uploadDir, 'images');
const evidenceDir = path.join(uploadDir, 'evidence');
const profilesDir = path.join(uploadDir, 'profiles');

console.log('📁 Checking upload directories...');

const dirs = [
  { name: 'uploads', path: uploadDir },
  { name: 'images', path: imagesDir },
  { name: 'evidence', path: evidenceDir },
  { name: 'profiles', path: profilesDir }
];

dirs.forEach(dir => {
  if (fs.existsSync(dir.path)) {
    console.log(`✅ ${dir.name} directory exists: ${dir.path}`);
  } else {
    console.log(`❌ ${dir.name} directory missing: ${dir.path}`);
  }
});

console.log('\n🔗 Test URLs (when server is running):');
console.log('📊 Backend: http://localhost:5000/health');
console.log('🖼️ Images: http://localhost:5000/api/uploads/images/[filename]');
console.log('📋 Evidence: http://localhost:5000/api/uploads/evidence/[filename]');
console.log('👤 Profiles: http://localhost:5000/api/uploads/profiles/[filename]');

console.log('\n🚀 How to test upload:');
console.log('1. Start backend: npm run dev');
console.log('2. Use frontend or Postman to upload files');
console.log('3. Files will be saved in backend/uploads/ folders');

console.log('\n✅ Local upload system is ready!');
