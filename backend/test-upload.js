const { uploadFromUrl } = require('./dist/utils/imageUtils');

async function testUpload() {
  console.log('🧪 Testing Local Image Upload System');
  console.log('===================================\n');

  // Test uploading from URL
  const testImageUrl = 'https://via.placeholder.com/300x200/0066cc/ffffff?text=Test+Image';
  
  console.log('📥 Testing URL upload...');
  console.log(`URL: ${testImageUrl}`);
  
  try {
    const result = await uploadFromUrl(testImageUrl, {
      folder: 'images',
      filename: 'test-image.png'
    });
    
    if (result) {
      console.log('✅ Upload successful!');
      console.log(`📁 File saved as: ${result.filename}`);
      console.log(`🔗 Access URL: ${result.url}`);
      console.log(`📊 File size: ${result.size} bytes`);
      console.log(`🎨 MIME type: ${result.mimetype}`);
    } else {
      console.log('❌ Upload failed');
    }
  } catch (error) {
    console.error('❌ Error during upload:', error.message);
  }
  
  console.log('\n🎯 How to test:');
  console.log('1. Start your backend server: npm run dev');
  console.log('2. Visit: http://localhost:5000/api/uploads/images/test-image.png');
  console.log('3. You should see the test image');
}

testUpload();
