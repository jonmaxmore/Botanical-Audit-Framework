/**
 * Storybook Stories: CancellationDialog Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CancellationDialog } from './CancellationDialog';

const meta = {
  title: 'Components/CancellationDialog',
  component: CancellationDialog,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    hasPaidFee: { control: 'boolean' },
    isLoading: { control: 'boolean' }
  }
} satisfies Meta<typeof CancellationDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

interface DialogWrapperProps {
  applicationId: string;
  applicationStatus: string;
  hasPaidFee?: boolean;
  paidAmount?: number;
  isLoading?: boolean;
  onConfirm: (data: {
    applicationId: string;
    reason: string;
    acknowledgedNoRefund: boolean;
    additionalNotes?: string;
  }) => Promise<void>;
}

// Wrapper component for interactive state
const DialogWrapper = (args: DialogWrapperProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg"
      >
        เปิด Dialog
      </button>
      <CancellationDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        applicationId={args.applicationId}
        applicationStatus={args.applicationStatus}
        hasPaidFee={args.hasPaidFee ?? false}
        paidAmount={args.paidAmount}
        isLoading={args.isLoading}
        onConfirm={args.onConfirm}
      />
    </div>
  );
};

// Pending application - no payment
export const PendingNoPay: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    applicationId: 'APP-001',
    applicationStatus: 'รออนุมัติ',
    hasPaidFee: false,
    paidAmount: 0,
    isLoading: false,
    onConfirm: async data => {
      console.log('Cancellation confirmed', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  },
  render: args => <DialogWrapper {...args} />
};

// With payment - shows no refund policy
export const WithPayment: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    applicationId: 'APP-002',
    applicationStatus: 'รอตรวจสอบ',
    hasPaidFee: true,
    paidAmount: 5000,
    isLoading: false,
    onConfirm: async data => {
      console.log('Cancellation with payment', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  },
  render: args => <DialogWrapper {...args} />
};

// Multiple payments
export const MultiplePayments: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    applicationId: 'APP-003',
    applicationStatus: 'รอการตรวจสอบครั้งที่ 5',
    hasPaidFee: true,
    paidAmount: 10000, // 2 payments
    isLoading: false,
    onConfirm: async data => {
      console.log('Cancel with multiple payments', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  },
  render: args => <DialogWrapper {...args} />
};

// Loading state
export const Loading: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    applicationId: 'APP-004',
    applicationStatus: 'รออนุมัติ',
    hasPaidFee: true,
    paidAmount: 5000,
    isLoading: true,
    onConfirm: async data => {
      console.log('Loading', data);
    }
  },
  render: args => <DialogWrapper {...args} />
};

// With error
export const WithError: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    applicationId: 'APP-005',
    applicationStatus: 'รอตรวจสอบ',
    hasPaidFee: false,
    paidAmount: 0,
    isLoading: false,
    onConfirm: async data => {
      console.log('Error will be thrown', data);
      throw new Error('ไม่สามารถยกเลิกใบสมัครได้ กรุณาติดต่อเจ้าหน้าที่');
    }
  },
  render: args => <DialogWrapper {...args} />
};

// Different cancellation reasons
export const DifferentReasons: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    applicationId: 'APP-006',
    applicationStatus: 'รอตรวจสอบ',
    hasPaidFee: true,
    paidAmount: 5000,
    isLoading: false,
    onConfirm: async data => {
      console.log('Reason selected', { reason: data.reason, notes: data.additionalNotes });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  },
  render: args => <DialogWrapper {...args} />
};
