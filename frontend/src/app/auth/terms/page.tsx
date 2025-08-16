'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';

import { paths } from '@/paths';

export default function Page(): React.JSX.Element {
  const router = useRouter();

  const handleBack = () => {
    router.push(paths.auth.signUp);
  };

  return (
    <Box
      sx={{
        backgroundColor: 'var(--mui-palette-background-default)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4}>
          {/* Back Button */}
          <Box>
            <Button
              startIcon={<ArrowLeftIcon />}
              onClick={handleBack}
              variant="text"
              sx={{ color: 'var(--mui-palette-text-primary)' }}
            >
              Back to Sign Up
            </Button>
          </Box>

          {/* Terms and Conditions Content */}
          <Paper sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Typography variant="h3" component="h1" sx={{ textAlign: 'center', mb: 2 }}>
                Terms and Conditions
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
                Last updated: {new Date().toLocaleDateString()}
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    1. Acceptance of Terms
                  </Typography>
                  <Typography variant="body1" paragraph>
                    By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    2. User Account and Registration
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • You must provide accurate and complete information when creating an account
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • You are responsible for maintaining the confidentiality of your account credentials
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • You must notify us immediately of any unauthorized use of your account
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    3. Privacy and Data Protection
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • We collect and process your personal data in accordance with our Privacy Policy
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • Your data will be stored securely and will not be shared with third parties without consent
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • You have the right to access, modify, or delete your personal data at any time
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    4. Acceptable Use Policy
                  </Typography>
                  <Typography variant="body1" paragraph>
                    You agree not to:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • Use the service for any unlawful purpose or in violation of any applicable laws
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • Upload or transmit any harmful, offensive, or inappropriate content
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • Attempt to gain unauthorized access to any part of the service
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • Interfere with or disrupt the service or servers connected to the service
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    5. Service Availability
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • We strive to maintain high service availability but cannot guarantee 100% uptime
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • Scheduled maintenance will be announced in advance when possible
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • We reserve the right to modify or discontinue the service with reasonable notice
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    6. Intellectual Property
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • All content and materials available through the service are protected by intellectual property rights
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • You retain ownership of content you upload, but grant us license to use it for service operation
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    7. Limitation of Liability
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • The service is provided "as is" without warranties of any kind
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • We shall not be liable for any indirect, incidental, or consequential damages
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • Our total liability shall not exceed the amount paid by you for the service
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    8. Termination
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • You may terminate your account at any time by contacting us
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • We may terminate or suspend your account for violation of these terms
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • Upon termination, your right to use the service will cease immediately
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    9. Changes to Terms
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • We reserve the right to modify these terms at any time
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • Changes will be effective immediately upon posting
                  </Typography>
                  <Typography variant="body1" paragraph>
                    • Continued use of the service constitutes acceptance of modified terms
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    10. Contact Information
                  </Typography>
                  <Typography variant="body1" paragraph>
                    If you have any questions about these Terms and Conditions, please contact us at:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Email: support@deviaskit.com
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Address: 123 Business Street, City, State 12345
                  </Typography>
                </Box>
              </Stack>

              {/* Back Button at Bottom */}
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleBack}
                  size="large"
                >
                  I Understand - Back to Sign Up
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
