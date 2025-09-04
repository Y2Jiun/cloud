'use client';

import React, { useState } from 'react';
import { Button, TextField, Box, Typography, Alert, Card, CardContent } from '@mui/material';
import { apiClient } from '@/lib/api-client';

export function TestUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await apiClient.uploadImage(selectedFile, 'profiles');
      setUploadResult(result);
      if (!result.success) {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlUpload = async () => {
    if (!imageUrl) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await apiClient.uploadImageFromUrl(imageUrl, 'evidence');
      setUploadResult(result);
      if (!result.success) {
        setError(result.error || 'URL upload failed');
      }
    } catch (err) {
      setError('URL upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          🧪 Test Local Upload System
        </Typography>
        
        {/* File Upload */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            📁 File Upload (Profile Pictures)
          </Typography>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            style={{ marginBottom: 16 }}
          />
          <br />
          <Button 
            variant="contained" 
            onClick={handleFileUpload}
            disabled={!selectedFile || loading}
          >
            Upload File
          </Button>
        </Box>

        {/* URL Upload */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            🔗 URL Upload (Evidence Images)
          </Typography>
          <TextField
            fullWidth
            label="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            sx={{ mb: 2 }}
          />
          <Button 
            variant="contained" 
            onClick={handleUrlUpload}
            disabled={!imageUrl || loading}
          >
            Upload from URL
          </Button>
        </Box>

        {/* Results */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {uploadResult && uploadResult.success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              ✅ Upload successful!<br />
              📁 Filename: {uploadResult.data.filename}<br />
              🔗 URL: {uploadResult.data.url}<br />
              📊 Size: {uploadResult.data.size} bytes
            </Typography>
            {uploadResult.data.url && (
              <Box sx={{ mt: 2 }}>
                <img 
                  src={`http://localhost:5000${uploadResult.data.url}`}
                  alt="Uploaded"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
              </Box>
            )}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary">
          💡 Files are saved locally in backend/uploads/ folders<br />
          📁 Profile pics → /profiles/<br />
          📋 Evidence → /evidence/<br />
          🖼️ General → /images/
        </Typography>
      </CardContent>
    </Card>
  );
}
