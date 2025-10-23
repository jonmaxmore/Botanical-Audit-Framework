/**
 * Storybook Stories: RescheduleDialog Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { RescheduleDialog } from './RescheduleDialog';

const meta = {
  title: 'Components/RescheduleDialog',
  component: RescheduleDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    maxReschedule: { control: 'number' },
    isLoading: { control: 'boolean' },
  },
} satisfies Meta<typeof RescheduleDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

interface DialogWrapperProps {
  maxReschedule?: number;
  isLoading?: boolean;
  applicationId?: string;
  currentInspection?: { date: string; time: string };
  rescheduleCount?: number;
  onConfirm?: (date: Date, reason: string) => void;
}

// Wrapper component for interactive state
const DialogWrapper = (args: DialogWrapperProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        เปิด Dialog
      </button>
      <RescheduleDialog {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};

// First reschedule - allowed
export const FirstReschedule: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    applicationId: 'APP-001',
    currentInspection: {
      id: 'INSP-001',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      inspectorName: 'นายสมชาย ใจดี',
    },
    rescheduleCount: 0,
    maxReschedule: 1,
    isLoading: false,
    onConfirm: async data => {
      console.log('Reschedule confirmed', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
  render: args => <DialogWrapper {...args} />,
};

// Last chance - warning shown
export const LastChance: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    applicationId: 'APP-002',
    currentInspection: {
      id: 'INSP-002',
      scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      inspectorName: 'นางสาวมาลี สวยงาม',
    },
    rescheduleCount: 0,
    maxReschedule: 1,
    isLoading: false,
    onConfirm: async data => {
      console.log('Last reschedule', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
  render: args => <DialogWrapper {...args} />,
};

// Limit reached - cannot reschedule
export const LimitReached: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    applicationId: 'APP-003',
    currentInspection: {
      id: 'INSP-003',
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      inspectorName: 'นายวิชัย ขยัน',
    },
    rescheduleCount: 1,
    maxReschedule: 1,
    isLoading: false,
    onConfirm: async data => {
      console.log('Should not be called', data);
    },
  },
  render: args => <DialogWrapper {...args} />,
};

// Loading state
export const Loading: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    applicationId: 'APP-004',
    currentInspection: {
      id: 'INSP-004',
      scheduledDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      inspectorName: 'นายประสิทธิ์ เก่งดี',
    },
    rescheduleCount: 0,
    maxReschedule: 1,
    isLoading: true,
    onConfirm: async data => {
      console.log('Loading', data);
    },
  },
  render: args => <DialogWrapper {...args} />,
};

// With error
export const WithError: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    applicationId: 'APP-005',
    currentInspection: {
      id: 'INSP-005',
      scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      inspectorName: 'นางสมหวัง ทำดี',
    },
    rescheduleCount: 0,
    maxReschedule: 1,
    isLoading: false,
    onConfirm: async data => {
      console.log('Error will be thrown', data);
      throw new Error('ไม่สามารถเลื่อนการตรวจได้ กรุณาลองใหม่อีกครั้ง');
    },
  },
  render: args => <DialogWrapper {...args} />,
};
