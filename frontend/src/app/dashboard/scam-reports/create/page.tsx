import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import Button from '@mui/material/Button';
import Link from 'next/link';

import { config } from '@/config';
import { ScamReportForm } from '@/components/dashboard/scam-reports/scam-report-form';

export const metadata = { title: `Create Scam Report | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
        <Button
          component={Link}
          href="/dashboard/scam-reports"
          startIcon={<ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />}
          variant="outlined"
        >
          Back to Reports
        </Button>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Create Scam Report</Typography>
          <Typography color="text.secondary" variant="body1">
            Report a scam to help protect others in the community
          </Typography>
        </Stack>
      </Stack>
      <ScamReportForm />
    </Stack>
  );
}
