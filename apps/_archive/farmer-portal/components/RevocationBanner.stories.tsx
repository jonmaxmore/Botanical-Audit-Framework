/**
 * Storybook Stories: RevocationBanner Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { RevocationBanner } from './RevocationBanner';

const meta = {
  title: 'Components/RevocationBanner',
  component: RevocationBanner,
  parameters: {
    layout: 'padded'
  },
  tags: ['autodocs'],
  argTypes: {
    waitPeriodDays: { control: 'number' },
    dismissible: { control: 'boolean' }
  }
} satisfies Meta<typeof RevocationBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

// During wait period - 20 days remaining
export const DuringWaitPeriod: Story = {
  args: {
    certificateId: 'CERT-001',
    revokedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    revocationReason: 'ตรวจพบการไม่ปฏิบัติตามมาตรฐาน GAP',
    waitPeriodDays: 30,
    userId: 'user-123'
  }
};

// Just revoked - 30 days remaining
export const JustRevoked: Story = {
  args: {
    certificateId: 'CERT-002',
    revokedAt: new Date(), // Today
    revocationReason: 'ใบรับรองหมดอายุและไม่ต่ออายุ',
    waitPeriodDays: 30,
    userId: 'user-123'
  }
};

// Almost ready - 2 days remaining
export const AlmostReady: Story = {
  args: {
    certificateId: 'CERT-003',
    revokedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
    revocationReason: 'พบสารเคมีต้องห้ามในการตรวจสอบ',
    waitPeriodDays: 30,
    userId: 'user-123'
  }
};

// Can apply now
export const CanApplyNow: Story = {
  args: {
    certificateId: 'CERT-004',
    revokedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
    revocationReason: 'เกษตรกรขอยกเลิกด้วยเหตุผลส่วนตัว',
    waitPeriodDays: 30,
    userId: 'user-123'
  }
};

// Dismissible version
export const Dismissible: Story = {
  args: {
    certificateId: 'CERT-005',
    revokedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    revocationReason: 'ตรวจพบการไม่ปฏิบัติตามมาตรฐาน GAP',
    waitPeriodDays: 30,
    userId: 'user-123',
    dismissible: true
  }
};

// Compact version (dashboard widget)
export const CompactWidget: Story = {
  args: {
    certificateId: 'CERT-006',
    revokedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    revocationReason: 'ตรวจพบการไม่ปฏิบัติตามมาตรฐาน GAP',
    waitPeriodDays: 30,
    userId: 'user-123'
  },
  render: args => (
    <div className="max-w-md">
      <RevocationBanner {...args} />
    </div>
  )
};
