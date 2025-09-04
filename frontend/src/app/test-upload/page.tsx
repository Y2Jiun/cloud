'use client';

import { TestUpload } from '@/components/test-upload';
import { Stack, Typography } from '@mui/material';

export default function TestUploadPage() {
  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Typography variant="h4">
        🧪 Test Local Upload System
      </Typography>
      <Typography variant="body1" color="text.secondary">
        This page demonstrates both file upload and URL upload functionality.
      </Typography>
      <TestUpload />
    </Stack>
  );
}
