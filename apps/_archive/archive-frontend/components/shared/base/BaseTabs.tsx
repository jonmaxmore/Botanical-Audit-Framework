/**
 * BaseTabs Component
 * 
 * Reusable tabs component for organizing content into separate views.
 * Consolidates tab logic from:
 * - farmer-portal
 * - admin-portal  
 * - certificate-portal
 * 
 * Features:
 * - Multiple variants (underline, contained, pills)
 * - Keyboard navigation (Arrow keys, Home, End)
 * - Icon support in tabs
 * - Badge/counter support
 * - Disabled tabs
 * - Controlled/Uncontrolled modes
 * - Full ARIA accessibility
 * - Lazy loading support
 * - Custom styling per tab
 * - Type-safe props
 * 
 * @version 1.0.0
 * @created November 4, 2025
 */

'use client';

import React, { ReactNode, useState, useRef, KeyboardEvent } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type TabVariant = 'underline' | 'contained' | 'pills';
export type TabSize = 'small' | 'medium' | 'large';

export interface Tab {
  /**
   * Unique identifier for the tab
   */
  id: string;

  /**
   * Label text for the tab
   */
  label: string;

  /**
   * Content to display when tab is active
   */
  content: ReactNode;

  /**
   * Icon to display before label
   */
  icon?: ReactNode;

  /**
   * Badge content (number or text)
   */
  badge?: ReactNode;

  /**
   * Disable this tab
   * @default false
   */
  disabled?: boolean;

  /**
   * Additional CSS classes for this tab
   */
  className?: string;
}

export interface BaseTabsProps {
  /**
   * Array of tab configurations
   */
  tabs: Tab[];

  /**
   * Visual variant of tabs
   * @default 'underline'
   */
  variant?: TabVariant;

  /**
   * Size of tabs
   * @default 'medium'
   */
  size?: TabSize;

  /**
   * Currently active tab ID (controlled mode)
   */
  activeTab?: string;

  /**
   * Default active tab ID (uncontrolled mode)
   * @default first tab's id
   */
  defaultActiveTab?: string;

  /**
   * Callback when active tab changes
   */
  onChange?: (tabId: string) => void;

  /**
   * Lazy load tab content (only render active tab)
   * @default false
   */
  lazy?: boolean;

  /**
   * Full width tabs (stretch to fill container)
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Center align tabs
   * @default false
   */
  centered?: boolean;

  /**
   * Additional CSS classes for tab container
   */
  className?: string;

  /**
   * Additional CSS classes for tab panel
   */
  panelClassName?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function BaseTabs({
  tabs,
  variant = 'underline',
  size = 'medium',
  activeTab: controlledActiveTab,
  defaultActiveTab,
  onChange,
  lazy = false,
  fullWidth = false,
  centered = false,
  className = '',
  panelClassName = '',
}: BaseTabsProps) {
  // State for uncontrolled mode
  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState<string>(
    defaultActiveTab || tabs[0]?.id || ''
  );

  // Determine if controlled
  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : uncontrolledActiveTab;

  // Refs for keyboard navigation
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.disabled) return;

    if (!isControlled) {
      setUncontrolledActiveTab(tabId);
    }
    onChange?.(tabId);
  };

  // Keyboard navigation
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const enabledTabs = tabs.filter(t => !t.disabled);
    const currentEnabledIndex = enabledTabs.findIndex(t => t.id === tabs[currentIndex].id);

    let nextIndex = currentEnabledIndex;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = currentEnabledIndex > 0 ? currentEnabledIndex - 1 : enabledTabs.length - 1;
        break;

      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = currentEnabledIndex < enabledTabs.length - 1 ? currentEnabledIndex + 1 : 0;
        break;

      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        nextIndex = enabledTabs.length - 1;
        break;

      default:
        return;
    }

    const nextTab = enabledTabs[nextIndex];
    if (nextTab) {
      handleTabChange(nextTab.id);
      tabRefs.current.get(nextTab.id)?.focus();
    }
  };

  // Size classes
  const sizeClasses = {
    small: 'text-sm px-3 py-2',
    medium: 'text-base px-4 py-2.5',
    large: 'text-lg px-5 py-3',
  };

  // Icon size classes
  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  // Get tab button classes
  const getTabClasses = (tab: Tab, isActive: boolean) => {
    const baseClasses = [
      'inline-flex items-center gap-2 font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      sizeClasses[size],
      tab.disabled && 'opacity-50 cursor-not-allowed',
      !tab.disabled && 'cursor-pointer',
    ];

    const variantClasses = {
      underline: [
        'border-b-2',
        isActive
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300',
      ],
      contained: [
        'rounded-t-lg',
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      ],
      pills: [
        'rounded-full',
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      ],
    };

    return [...baseClasses, ...variantClasses[variant], tab.className]
      .filter(Boolean)
      .join(' ');
  };

  // Tab list classes
  const tabListClasses = [
    'flex',
    variant === 'underline' && 'border-b border-gray-200',
    variant === 'contained' && 'gap-1',
    variant === 'pills' && 'gap-2',
    fullWidth && 'w-full',
    centered && 'justify-center',
    !centered && !fullWidth && 'justify-start',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Get active tab content
  const activeTabContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div className="w-full">
      {/* Tab List */}
      <div
        role="tablist"
        className={tabListClasses}
        aria-orientation="horizontal"
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              ref={el => {
                if (el) tabRefs.current.set(tab.id, el);
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              className={getTabClasses(tab, isActive)}
              onClick={() => handleTabChange(tab.id)}
              onKeyDown={e => handleKeyDown(e, index)}
              style={fullWidth ? { flex: 1 } : undefined}
            >
              {/* Icon */}
              {tab.icon && (
                <span className={`${iconSizeClasses[size]} flex-shrink-0`}>
                  {tab.icon}
                </span>
              )}

              {/* Label */}
              <span>{tab.label}</span>

              {/* Badge */}
              {tab.badge && (
                <span
                  className={`
                    inline-flex items-center justify-center
                    ${size === 'small' ? 'text-xs px-1.5 py-0.5' : ''}
                    ${size === 'medium' ? 'text-xs px-2 py-0.5' : ''}
                    ${size === 'large' ? 'text-sm px-2 py-1' : ''}
                    rounded-full
                    ${isActive ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}
                    font-semibold
                  `}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className={`mt-4 ${panelClassName}`}>
        {lazy ? (
          // Lazy mode: only render active tab
          <div
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            tabIndex={0}
          >
            {activeTabContent}
          </div>
        ) : (
          // Eager mode: render all tabs, show/hide with CSS
          tabs.map(tab => (
            <div
              key={tab.id}
              role="tabpanel"
              id={`tabpanel-${tab.id}`}
              aria-labelledby={`tab-${tab.id}`}
              hidden={tab.id !== activeTab}
              tabIndex={0}
              className={tab.id === activeTab ? 'block' : 'hidden'}
            >
              {tab.content}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
