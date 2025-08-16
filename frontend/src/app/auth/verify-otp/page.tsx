import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { GuestGuard } from '@/components/auth/guest-guard';
import { Layout } from '@/components/auth/layout';
import { VerifyOtpForm } from '@/components/auth/verify-otp-form';

export const metadata = { title: `Verify OTP | Auth | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Layout>
      <GuestGuard>
        <VerifyOtpForm />
      </GuestGuard>
    </Layout>
  );
}
