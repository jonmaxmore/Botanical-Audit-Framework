/**
 * Storybook Stories: CountdownTimer Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CountdownTimer } from './CountdownTimer';

const meta = {
  title: 'Components/CountdownTimer',
  component: CountdownTimer,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    initialSeconds: { control: 'number' },
    warningThreshold: { control: 'number' },
    criticalThreshold: { control: 'number' },
    autoStart: { control: 'boolean' },
    showPauseButton: { control: 'boolean' }
  }
} satisfies Meta<typeof CountdownTimer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story - Full version with 15 minutes
export const Default: Story = {
  args: {
    initialSeconds: 900, // 15 minutes
    autoStart: true
  }
};

// Warning state - 2 minutes remaining
export const WarningState: Story = {
  args: {
    initialSeconds: 120,
    autoStart: true
  }
};

// Critical state - 30 seconds remaining
export const CriticalState: Story = {
  args: {
    initialSeconds: 30,
    autoStart: true
  }
};

// With pause button
export const WithPauseButton: Story = {
  args: {
    initialSeconds: 900,
    autoStart: true,
    showPauseButton: true
  }
};

// Compact version
export const Compact: Story = {
  args: {
    initialSeconds: 900,
    autoStart: true
  },
  render: args => (
    <div className="flex items-center gap-2 bg-gray-800 text-white p-2 rounded">
      <CountdownTimer {...args} />
    </div>
  )
};

// With callbacks
export const WithCallbacks: Story = {
  args: {
    initialSeconds: 10,
    autoStart: true,
    onTimeout: () => alert('⏰ เวลาหมด!'),
    onTick: remaining => console.log('Remaining:', remaining)
  }
};
