# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image uploads in your application.

## Prerequisites

- Cloudinary account (free tier available)
- Backend server running

## Step 1: Create Cloudinary Account

1. **Sign up for Cloudinary**:
   - Go to [Cloudinary](https://cloudinary.com/)
   - Create a free account

2. **Get your credentials**:
   - After signing up, go to your Dashboard
   - You'll see your account details:
     - Cloud Name
     - API Key
     - API Secret

## Step 2: Configure Environment Variables

1. **Update your `.env` file** in the backend directory:
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name-here
   CLOUDINARY_API_KEY=your-api-key-here
   CLOUDINARY_API_SECRET=your-api-secret-here
   ```

2. **Replace the placeholder values** with your actual Cloudinary credentials

## Step 3: Test Image Upload

1. **Start your backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Test the upload endpoint** using a tool like Postman or curl:
   ```bash
   curl -X POST \
     http://localhost:5000/api/upload/image \
     -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
     -F 'image=@path/to/your/image.jpg'
   ```

## API Endpoints

### Upload Image
- **URL**: `POST /api/upload/image`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Form-data with `image` field
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "url": "https://res.cloudinary.com/...",
      "publicId": "dashboard-app/...",
      "format": "jpg",
      "width": 800,
      "height": 600
    }
  }
  ```

### Delete Image
- **URL**: `DELETE /api/upload/image/:publicId`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Image deleted successfully"
  }
  ```

## Image Transformations

The upload endpoint automatically applies these transformations:
- **Size limit**: 800x600 pixels (maintains aspect ratio)
- **Quality**: Auto-optimized
- **Format**: Auto-optimized (WebP when supported)

## File Restrictions

- **File types**: Only image files (jpg, png, gif, webp, etc.)
- **File size**: Maximum 5MB per file
- **Rate limiting**: 10 uploads per minute per IP

## Frontend Integration

### Using fetch API:
```javascript
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  return result;
};
```

### Using axios:
```javascript
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post('/api/upload/image', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};
```

## Error Handling

Common errors and solutions:

### 1. "Invalid credentials"
- Check your Cloudinary credentials in `.env`
- Ensure no extra spaces in the values

### 2. "File too large"
- Image exceeds 5MB limit
- Compress the image before uploading

### 3. "Only image files are allowed"
- Ensure you're uploading a valid image file
- Check the file extension and MIME type

### 4. "Too many upload requests"
- Rate limit exceeded (10 uploads per minute)
- Wait before trying again

## Cloudinary Dashboard

Use the Cloudinary dashboard to:
- View uploaded images
- Monitor usage and bandwidth
- Set up additional transformations
- Configure upload presets
- Manage folders and organization

## Advanced Configuration

### Custom Upload Presets
You can create upload presets in Cloudinary dashboard for:
- Automatic image optimization
- Custom transformations
- Folder organization
- Access control

### Folder Organization
Images are automatically organized in the `dashboard-app` folder. You can customize this in the upload controller:

```typescript
const uploadResponse = await cloudinary.uploader.upload(fileStr, {
  folder: 'your-custom-folder',
  // ... other options
});
```

## Security Considerations

1. **Never expose API secrets** in frontend code
2. **Use signed uploads** for sensitive applications
3. **Implement proper authentication** before allowing uploads
4. **Set up rate limiting** to prevent abuse
5. **Validate file types** on both client and server

## Troubleshooting

### Check Configuration
```bash
# In your backend directory
node -e "console.log(process.env.CLOUDINARY_CLOUD_NAME)"
```

### Test Connection
Create a simple test script:
```javascript
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test the connection
cloudinary.api.ping()
  .then(result => console.log('✅ Cloudinary connected:', result))
  .catch(error => console.error('❌ Cloudinary error:', error));
```

## Free Tier Limits

Cloudinary free tier includes:
- 25 GB storage
- 25 GB monthly bandwidth
- 1,000 transformations per month
- Basic image and video management

For production applications, consider upgrading to a paid plan for higher limits and additional features.
