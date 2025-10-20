/**
 * ðŸ“Š GACP Status & State Management System
 * à¸£à¸°à¸šà¸šà¸ˆà¸±à¸”à¸à¸²à¸£à¸ªà¸–à¸²à¸™à¸°à¹à¸¥à¸°à¹à¸ªà¸”à¸‡à¸œà¸¥à¸—à¸µà¹ˆà¹€à¸‚à¹‰à¸²à¹ƒà¸ˆà¸‡à¹ˆà¸²à¸¢à¸ªà¸³à¸«à¸£à¸±à¸šà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸‡à¸²à¸™
 * 
 * à¸§à¸±à¸•à¸–à¸¸à¸›à¸£à¸°à¸ªà¸‡à¸„à¹Œ:
 * - à¹à¸›à¸¥à¸‡ technical states à¹€à¸›à¹‡à¸™à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸—à¸µà¹ˆà¹€à¸‚à¹‰à¸²à¹ƒà¸ˆà¸‡à¹ˆà¸²à¸¢
 * - à¸ªà¸£à¹‰à¸²à¸‡ Progress Bar à¹à¸ªà¸”à¸‡à¸‚à¸±à¹‰à¸™à¸•à¸­à¸™à¸›à¸±à¸ˆà¸ˆà¸¸à¸šà¸±à¸™
 * - à¸ˆà¸±à¸”à¸à¸²à¸£à¸à¸²à¸£à¹à¸ˆà¹‰à¸‡à¹€à¸•à¸·à¸­à¸™à¹ƒà¸™à¹à¸•à¹ˆà¸¥à¸°à¸‚à¸±à¹‰à¸™à¸•à¸­à¸™
 * - à¸£à¸­à¸‡à¸£à¸±à¸šà¸ à¸²à¸©à¸²à¹„à¸—à¸¢à¹à¸¥à¸°à¸­à¸±à¸‡à¸à¸¤à¸©
 */

const { WORKFLOW_STATES } = require('./gacp-workflow-engine');

// ================================
// à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸ªà¸–à¸²à¸™à¸°à¸—à¸µà¹ˆà¹€à¸‚à¹‰à¸²à¹ƒà¸ˆà¸‡à¹ˆà¸²à¸¢ (User-Friendly States)
// ================================

const USER_FRIENDLY_STATES = {
  // à¸‚à¸±à¹‰à¸™à¸•à¸­à¸™à¸—à¸µà¹ˆ 1: à¸ªà¸¡à¸±à¸„à¸£à¹à¸¥à¸°à¸ªà¹ˆà¸‡à¸„à¸³à¸‚à¸­
  [WORKFLOW_STATES.DRAFT]: {
    step: 1,
    thai: 'à¸à¸³à¸¥à¸±à¸‡à¸à¸£à¸­à¸à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£',
    english: 'Filling Application',
    description: 'à¹€à¸à¸©à¸•à¸£à¸à¸£à¸à¸³à¸¥à¸±à¸‡à¸à¸£à¸­à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹à¸¥à¸°à¸­à¸±à¸›à¹‚à¸«à¸¥à¸”à¹€à¸­à¸à¸ªà¸²à¸£',
    icon: 'ðŸ“',
    color: '#FFA500', // Orange
    progress: 5,
    actionRequired: 'farmer',
    nextAction: 'à¸ªà¹ˆà¸‡à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹à¸¥à¸°à¹€à¸­à¸à¸ªà¸²à¸£'
  },

  [WORKFLOW_STATES.SUBMITTED]: {
    step: 1,
    thai: 'à¸ªà¹ˆà¸‡à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹à¸¥à¹‰à¸§',
    english: 'Application Submitted',
    description: 'à¹„à¸”à¹‰à¸£à¸±à¸šà¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹à¸¥à¹‰à¸§ à¸£à¸­à¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¸£à¸­à¸šà¹à¸£à¸',
    icon: 'ðŸ“¤',
    color: '#4CAF50', // Green
    progress: 12,
    actionRequired: 'farmer',
    nextAction: 'à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¸£à¸­à¸šà¹à¸£à¸ 5,000 à¸šà¸²à¸—'
  },

  // à¸‚à¸±à¹‰à¸™à¸•à¸­à¸™à¸—à¸µà¹ˆ 2: à¸ˆà¹ˆà¸²à¸¢à¹€à¸‡à¸´à¸™à¸£à¸­à¸šà¹à¸£à¸
  [WORKFLOW_STATES.PAYMENT_PENDING_1]: {
    step: 2,
    thai: 'à¸£à¸­à¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¸£à¸­à¸šà¹à¸£à¸',
    english: 'Awaiting First Payment',
    description: 'à¹‚à¸›à¸£à¸”à¸Šà¸³à¸£à¸°à¸„à¹ˆà¸²à¸˜à¸£à¸£à¸¡à¹€à¸™à¸µà¸¢à¸¡à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¹€à¸­à¸à¸ªà¸²à¸£ 5,000 à¸šà¸²à¸—',
    icon: 'ðŸ’°',
    color: '#FF9800', // Amber
    progress: 20,
    actionRequired: 'farmer',
    nextAction: 'à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™ 5,000 à¸šà¸²à¸—',
    amount: 5000,
    urgent: true
  },

  [WORKFLOW_STATES.PAYMENT_PROCESSING_1]: {
    step: 2,
    thai: 'à¸à¸³à¸¥à¸±à¸‡à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™',
    english: 'Processing Payment',
    description: 'à¸£à¸°à¸šà¸šà¸à¸³à¸¥à¸±à¸‡à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¸£à¸­à¸šà¹à¸£à¸',
    icon: 'â³',
    color: '#2196F3', // Blue
    progress: 25,
    actionRequired: 'system',
    nextAction: 'à¸£à¸­à¸à¸²à¸£à¸¢à¸·à¸™à¸¢à¸±à¸™à¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™'
  },

  // à¸‚à¸±à¹‰à¸™à¸•à¸­à¸™à¸—à¸µà¹ˆ 3: à¸•à¸£à¸§à¸ˆà¹€à¸­à¸à¸ªà¸²à¸£
  [WORKFLOW_STATES.DOCUMENT_REVIEW]: {
    step: 3,
    thai: 'à¸à¸³à¸¥à¸±à¸‡à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¹€à¸­à¸à¸ªà¸²à¸£',
    english: 'Document Under Review',
    description: 'à¹€à¸ˆà¹‰à¸²à¸«à¸™à¹‰à¸²à¸—à¸µà¹ˆà¸à¸³à¸¥à¸±à¸‡à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¹€à¸­à¸à¸ªà¸²à¸£à¸‚à¸­à¸‡à¸—à¹ˆà¸²à¸™',
    icon: 'ðŸ“‹',
    color: '#9C27B0', // Purple
    progress: 35,
    actionRequired: 'staff',
    nextAction: 'à¸£à¸­à¸œà¸¥à¸à¸²à¸£à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¹€à¸­à¸à¸ªà¸²à¸£'
  },

  [WORKFLOW_STATES.DOCUMENT_REVISION]: {
    step: 3,
    thai: 'à¹€à¸­à¸à¸ªà¸²à¸£à¸•à¹‰à¸­à¸‡à¹à¸à¹‰à¹„à¸‚',
    english: 'Document Revision Required',
    description: 'à¹€à¸­à¸à¸ªà¸²à¸£à¸•à¹‰à¸­à¸‡à¹à¸à¹‰à¹„à¸‚à¸•à¸²à¸¡à¸‚à¹‰à¸­à¹€à¸ªà¸™à¸­à¹à¸™à¸°',
    icon: 'âš ï¸',
    color: '#FF5722', // Deep Orange
    progress: 30,
    actionRequired: 'farmer',
    nextAction: 'à¹à¸à¹‰à¹„à¸‚à¹€à¸­à¸à¸ªà¸²à¸£à¸•à¸²à¸¡à¸‚à¹‰à¸­à¹€à¸ªà¸™à¸­à¹à¸™à¸°',
    urgent: true
  },

  [WORKFLOW_STATES.DOCUMENT_REJECTED]: {
    step: 2,
    thai: 'à¹€à¸­à¸à¸ªà¸²à¸£à¸–à¸¹à¸à¸›à¸à¸´à¹€à¸ªà¸˜ - à¸•à¹‰à¸­à¸‡à¸ˆà¹ˆà¸²à¸¢à¹€à¸‡à¸´à¸™à¹ƒà¸«à¸¡à¹ˆ',
    english: 'Document Rejected - New Payment Required',
    description: 'à¹€à¸­à¸à¸ªà¸²à¸£à¸–à¸¹à¸à¸›à¸à¸´à¹€à¸ªà¸˜à¸„à¸£à¸š 2 à¸„à¸£à¸±à¹‰à¸‡ à¸•à¹‰à¸­à¸‡à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¹ƒà¸«à¸¡à¹ˆà¹€à¸žà¸·à¹ˆà¸­à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£à¸•à¹ˆà¸­',
    icon: 'âŒ',
    color: '#F44336', // Red
    progress: 15,
    actionRequired: 'farmer',
    nextAction: 'à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¹ƒà¸«à¸¡à¹ˆ 5,000 à¸šà¸²à¸—',
    amount: 5000,
    urgent: true,
    warning: true
  },

  // à¸‚à¸±à¹‰à¸™à¸•à¸­à¸™à¸—à¸µà¹ˆ 4: à¹€à¸­à¸à¸ªà¸²à¸£à¸œà¹ˆà¸²à¸™
  [WORKFLOW_STATES.DOCUMENT_APPROVED]: {
    step: 4,
    thai: 'à¹€à¸­à¸à¸ªà¸²à¸£à¸œà¹ˆà¸²à¸™à¸à¸²à¸£à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸š',
    english: 'Document Approved',
    description: 'à¹€à¸­à¸à¸ªà¸²à¸£à¸œà¹ˆà¸²à¸™à¸à¸²à¸£à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¹à¸¥à¹‰à¸§ à¸£à¸­à¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¸£à¸­à¸šà¸ªà¸­à¸‡',
    icon: 'âœ…',
    color: '#4CAF50', // Green
    progress: 45,
    actionRequired: 'farmer',
    nextAction: 'à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¸£à¸­à¸šà¸ªà¸­à¸‡ 25,000 à¸šà¸²à¸—'
  },

  // à¸‚à¸±à¹‰à¸™à¸•à¸­à¸™à¸—à¸µà¹ˆ 5: à¸ˆà¹ˆà¸²à¸¢à¹€à¸‡à¸´à¸™à¸£à¸­à¸šà¸ªà¸­à¸‡
  [WORKFLOW_STATES.PAYMENT_PENDING_2]: {
    step: 5,
    thai: 'à¸£à¸­à¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¸£à¸­à¸šà¸ªà¸­à¸‡',
    english: 'Awaiting Second Payment',
    description: 'à¹‚à¸›à¸£à¸”à¸Šà¸³à¸£à¸°à¸„à¹ˆà¸²à¸˜à¸£à¸£à¸¡à¹€à¸™à¸µà¸¢à¸¡à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸ à¸²à¸„à¸ªà¸™à¸²à¸¡ 25,000 à¸šà¸²à¸—',
    icon: 'ðŸ’°',
    color: '#FF9800', // Amber
    progress: 50,
    actionRequired: 'farmer',
    nextAction: 'à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™ 25,000 à¸šà¸²à¸—',
    amount: 25000,
    urgent: true
  },

  [WORKFLOW_STATES.PAYMENT_PROCESSING_2]: {
    step: 5,
    thai: 'à¸à¸³à¸¥à¸±à¸‡à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¸£à¸­à¸šà¸ªà¸­à¸‡',
    english: 'Processing Second Payment',
    description: 'à¸£à¸°à¸šà¸šà¸à¸³à¸¥à¸±à¸‡à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¸£à¸­à¸šà¸ªà¸­à¸‡',
    icon: 'â³',
    color: '#2196F3', // Blue
    progress: 55,
    actionRequired: 'system',
    nextAction: 'à¸£à¸­à¸à¸²à¸£à¸¢à¸·à¸™à¸¢à¸±à¸™à¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™'
  },

  // à¸‚à¸±à¹‰à¸™à¸•à¸­à¸™à¸—à¸µà¹ˆ 6: à¸•à¸£à¸§à¸ˆà¸Ÿà¸²à¸£à¹Œà¸¡
  [WORKFLOW_STATES.INSPECTION_SCHEDULED]: {
    step: 6,
    thai: 'à¹€à¸•à¸£à¸µà¸¢à¸¡à¸™à¸±à¸”à¸•à¸£à¸§à¸ˆà¸Ÿà¸²à¸£à¹Œà¸¡',
    english: 'Preparing Farm Inspection',
    description: 'à¹€à¸ˆà¹‰à¸²à¸«à¸™à¹‰à¸²à¸—à¸µà¹ˆà¸ˆà¸°à¸•à¸´à¸”à¸•à¹ˆà¸­à¸™à¸±à¸”à¸«à¸¡à¸²à¸¢ VDO Call',
    icon: 'ðŸ“…',
    color: '#607D8B', // Blue Grey
    progress: 60,
    actionRequired: 'staff',
    nextAction: 'à¸£à¸­à¸à¸²à¸£à¸™à¸±à¸”à¸«à¸¡à¸²à¸¢ VDO Call'
  },

  [WORKFLOW_STATES.INSPECTION_VDO_CALL]: {
    step: 6,
    thai: 'à¸™à¸±à¸”à¸«à¸¡à¸²à¸¢ VDO Call à¹à¸¥à¹‰à¸§',
    english: 'VDO Call Scheduled',
    description: 'à¸¡à¸µà¸à¸²à¸£à¸™à¸±à¸”à¸«à¸¡à¸²à¸¢ VDO Call à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸Ÿà¸²à¸£à¹Œà¸¡',
    icon: 'ðŸ“¹',
    color: '#3F51B5', // Indigo
    progress: 65,
    actionRequired: 'farmer',
    nextAction: 'à¹€à¸‚à¹‰à¸²à¸£à¹ˆà¸§à¸¡ VDO Call à¸•à¸²à¸¡à¹€à¸§à¸¥à¸²à¸—à¸µà¹ˆà¸™à¸±à¸”à¸«à¸¡à¸²à¸¢',
    urgent: true
  },

  [WORKFLOW_STATES.INSPECTION_ON_SITE]: {
    step: 6,
    thai: 'à¸™à¸±à¸”à¸•à¸£à¸§à¸ˆà¸žà¸·à¹‰à¸™à¸—à¸µà¹ˆà¸ˆà¸£à¸´à¸‡',
    english: 'On-site Inspection Scheduled',
    description: 'à¸ˆà¸³à¹€à¸›à¹‡à¸™à¸•à¹‰à¸­à¸‡à¸¥à¸‡à¸žà¸·à¹‰à¸™à¸—à¸µà¹ˆà¸•à¸£à¸§à¸ˆà¸Ÿà¸²à¸£à¹Œà¸¡à¸ˆà¸£à¸´à¸‡',
    icon: 'ðŸš—',
    color: '#795548', // Brown
    progress: 70,
    actionRequired: 'both',
    nextAction: 'à¸£à¸­à¸à¸²à¸£à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¹ƒà¸™à¸žà¸·à¹‰à¸™à¸—à¸µà¹ˆ',
    urgent: true
  },

  [WORKFLOW_STATES.INSPECTION_COMPLETED]: {
    step: 6,
    thai: 'à¸•à¸£à¸§à¸ˆà¸Ÿà¸²à¸£à¹Œà¸¡à¹€à¸ªà¸£à¹‡à¸ˆà¹à¸¥à¹‰à¸§',
    english: 'Farm Inspection Completed',
    description: 'à¸à¸²à¸£à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸Ÿà¸²à¸£à¹Œà¸¡à¹€à¸ªà¸£à¹‡à¸ˆà¸ªà¸´à¹‰à¸™ à¸£à¸­à¸à¸²à¸£à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´',
    icon: 'âœ…',
    color: '#4CAF50', // Green
    progress: 80,
    actionRequired: 'staff',
    nextAction: 'à¸£à¸­à¸à¸²à¸£à¸žà¸´à¸ˆà¸²à¸£à¸“à¸²à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´'
  },

  // à¸‚à¸±à¹‰à¸™à¸•à¸­à¸™à¸—à¸µà¹ˆ 7: à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´à¸£à¸±à¸šà¸£à¸­à¸‡
  [WORKFLOW_STATES.PENDING_APPROVAL]: {
    step: 7,
    thai: 'à¸£à¸­à¸à¸²à¸£à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´',
    english: 'Pending Final Approval',
    description: 'à¸œà¸¹à¹‰à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´à¸à¸³à¸¥à¸±à¸‡à¸žà¸´à¸ˆà¸²à¸£à¸“à¸²à¸œà¸¥à¸à¸²à¸£à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸š',
    icon: 'ðŸ‘¨â€ðŸ’¼',
    color: '#673AB7', // Deep Purple
    progress: 85,
    actionRequired: 'admin',
    nextAction: 'à¸£à¸­à¸à¸²à¸£à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´à¸ˆà¸²à¸à¸œà¸¹à¹‰à¸šà¸£à¸´à¸«à¸²à¸£'
  },

  [WORKFLOW_STATES.APPROVED]: {
    step: 7,
    thai: 'à¹„à¸”à¹‰à¸£à¸±à¸šà¸à¸²à¸£à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´à¹à¸¥à¹‰à¸§',
    english: 'Application Approved',
    description: 'à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹„à¸”à¹‰à¸£à¸±à¸šà¸à¸²à¸£à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´ à¸à¸³à¸¥à¸±à¸‡à¹€à¸•à¸£à¸µà¸¢à¸¡à¹ƒà¸šà¸£à¸±à¸šà¸£à¸­à¸‡',
    icon: 'ðŸŽ‰',
    color: '#4CAF50', // Green
    progress: 90,
    actionRequired: 'system',
    nextAction: 'à¸£à¸°à¸šà¸šà¸à¸³à¸¥à¸±à¸‡à¸ªà¸£à¹‰à¸²à¸‡à¹ƒà¸šà¸£à¸±à¸šà¸£à¸­à¸‡'
  },

  [WORKFLOW_STATES.REJECTED]: {
    step: 7,
    thai: 'à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¸–à¸¹à¸à¸›à¸à¸´à¹€à¸ªà¸˜',
    english: 'Application Rejected',
    description: 'à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹„à¸¡à¹ˆà¸œà¹ˆà¸²à¸™à¸à¸²à¸£à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´',
    icon: 'âŒ',
    color: '#F44336', // Red
    progress: 0,
    actionRequired: 'none',
    nextAction: 'à¸à¸£à¸°à¸šà¸§à¸™à¸à¸²à¸£à¸ªà¸´à¹‰à¸™à¸ªà¸¸à¸”',
    final: true
  },

  // à¸‚à¸±à¹‰à¸™à¸•à¸­à¸™à¸—à¸µà¹ˆ 8: à¸£à¸±à¸šà¹ƒà¸šà¸£à¸±à¸šà¸£à¸­à¸‡
  [WORKFLOW_STATES.CERTIFICATE_GENERATING]: {
    step: 8,
    thai: 'à¸à¸³à¸¥à¸±à¸‡à¸ªà¸£à¹‰à¸²à¸‡à¹ƒà¸šà¸£à¸±à¸šà¸£à¸­à¸‡',
    english: 'Generating Certificate',
    description: 'à¸£à¸°à¸šà¸šà¸à¸³à¸¥à¸±à¸‡à¸ªà¸£à¹‰à¸²à¸‡à¹ƒà¸šà¸£à¸±à¸šà¸£à¸­à¸‡à¹ƒà¸«à¹‰à¸—à¹ˆà¸²à¸™',
    icon: 'ðŸ“œ',
    color: '#FF9800', // Amber
    progress: 95,
    actionRequired: 'system',
    nextAction: 'à¸£à¸­à¹ƒà¸šà¸£à¸±à¸šà¸£à¸­à¸‡à¹€à¸ªà¸£à¹‡à¸ˆà¸ªà¸´à¹‰à¸™'
  },

  [WORKFLOW_STATES.CERTIFICATE_ISSUED]: {
    step: 8,
    thai: 'à¹„à¸”à¹‰à¸£à¸±à¸šà¹ƒà¸šà¸£à¸±à¸šà¸£à¸­à¸‡à¹à¸¥à¹‰à¸§',
    english: 'Certificate Issued',
    description: 'à¹ƒà¸šà¸£à¸±à¸šà¸£à¸­à¸‡ GACP à¸­à¸­à¸à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢à¹à¸¥à¹‰à¸§ à¸ªà¸²à¸¡à¸²à¸£à¸–à¸”à¸²à¸§à¸™à¹Œà¹‚à¸«à¸¥à¸”à¹„à¸”à¹‰',
    icon: 'ðŸ†',
    color: '#4CAF50', // Green
    progress: 100,
    actionRequired: 'farmer',
    nextAction: 'à¸”à¸²à¸§à¸™à¹Œà¹‚à¸«à¸¥à¸”à¹ƒà¸šà¸£à¸±à¸šà¸£à¸­à¸‡',
    final: true,
    success: true
  },

  // à¸ªà¸–à¸²à¸™à¸°à¸žà¸´à¹€à¸¨à¸©
  [WORKFLOW_STATES.CANCELLED]: {
    step: 0,
    thai: 'à¸¢à¸à¹€à¸¥à¸´à¸à¹à¸¥à¹‰à¸§',
    english: 'Cancelled',
    description: 'à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¸–à¸¹à¸à¸¢à¸à¹€à¸¥à¸´à¸',
    icon: 'ðŸš«',
    color: '#9E9E9E', // Grey
    progress: 0,
    actionRequired: 'none',
    nextAction: 'à¸à¸£à¸°à¸šà¸§à¸™à¸à¸²à¸£à¸ªà¸´à¹‰à¸™à¸ªà¸¸à¸”',
    final: true
  },

  [WORKFLOW_STATES.EXPIRED]: {
    step: 0,
    thai: 'à¸«à¸¡à¸”à¸­à¸²à¸¢à¸¸',
    english: 'Expired',
    description: 'à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¸«à¸¡à¸”à¸­à¸²à¸¢à¸¸à¹à¸¥à¹‰à¸§',
    icon: 'â°',
    color: '#9E9E9E', // Grey
    progress: 0,
    actionRequired: 'none',
    nextAction: 'à¸à¸£à¸°à¸šà¸§à¸™à¸à¸²à¸£à¸ªà¸´à¹‰à¸™à¸ªà¸¸à¸”',
    final: true
  },

  [WORKFLOW_STATES.ON_HOLD]: {
    step: 0,
    thai: 'à¸žà¸±à¸à¸à¸²à¸£à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£',
    english: 'On Hold',
    description: 'à¸žà¸±à¸à¸à¸²à¸£à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£à¸Šà¸±à¹ˆà¸§à¸„à¸£à¸²à¸§',
    icon: 'â¸ï¸',
    color: '#FF9800', // Amber
    progress: 0,
    actionRequired: 'admin',
    nextAction: 'à¸£à¸­à¸à¸²à¸£à¹à¸à¹‰à¹„à¸‚à¸›à¸±à¸à¸«à¸²'
  }
};

// ================================
// Progress Steps Definition
// ================================

const PROGRESS_STEPS = [
  {
    step: 1,
    title: 'à¸ªà¸¡à¸±à¸„à¸£à¹à¸¥à¸°à¸ªà¹ˆà¸‡à¸„à¸³à¸‚à¸­',
    title_en: 'Application Submission',
    description: 'à¸à¸£à¸­à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹à¸¥à¸°à¸­à¸±à¸›à¹‚à¸«à¸¥à¸”à¹€à¸­à¸à¸ªà¸²à¸£',
    states: [WORKFLOW_STATES.DRAFT, WORKFLOW_STATES.SUBMITTED],
    completed: false
  },
  {
    step: 2,
    title: 'à¸ˆà¹ˆà¸²à¸¢à¹€à¸‡à¸´à¸™à¸£à¸­à¸šà¹à¸£à¸',
    title_en: 'First Payment',
    description: 'à¸„à¹ˆà¸²à¸˜à¸£à¸£à¸¡à¹€à¸™à¸µà¸¢à¸¡à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¹€à¸­à¸à¸ªà¸²à¸£ (5,000 à¸šà¸²à¸—)',
    states: [WORKFLOW_STATES.PAYMENT_PENDING_1, WORKFLOW_STATES.PAYMENT_PROCESSING_1],
    amount: 5000,
    completed: false
  },
  {
    step: 3,
    title: 'à¸•à¸£à¸§à¸ˆà¹€à¸­à¸à¸ªà¸²à¸£',
    title_en: 'Document Review',
    description: 'à¹€à¸ˆà¹‰à¸²à¸«à¸™à¹‰à¸²à¸—à¸µà¹ˆà¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¹€à¸­à¸à¸ªà¸²à¸£',
    states: [
      WORKFLOW_STATES.DOCUMENT_REVIEW,
      WORKFLOW_STATES.DOCUMENT_REVISION,
      WORKFLOW_STATES.DOCUMENT_REJECTED
    ],
    completed: false
  },
  {
    step: 4,
    title: 'à¹€à¸­à¸à¸ªà¸²à¸£à¸œà¹ˆà¸²à¸™',
    title_en: 'Document Approved',
    description: 'à¹€à¸­à¸à¸ªà¸²à¸£à¹„à¸”à¹‰à¸£à¸±à¸šà¸à¸²à¸£à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´',
    states: [WORKFLOW_STATES.DOCUMENT_APPROVED],
    completed: false
  },
  {
    step: 5,
    title: 'à¸ˆà¹ˆà¸²à¸¢à¹€à¸‡à¸´à¸™à¸£à¸­à¸šà¸ªà¸­à¸‡',
    title_en: 'Second Payment',
    description: 'à¸„à¹ˆà¸²à¸˜à¸£à¸£à¸¡à¹€à¸™à¸µà¸¢à¸¡à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸ à¸²à¸„à¸ªà¸™à¸²à¸¡ (25,000 à¸šà¸²à¸—)',
    states: [WORKFLOW_STATES.PAYMENT_PENDING_2, WORKFLOW_STATES.PAYMENT_PROCESSING_2],
    amount: 25000,
    completed: false
  },
  {
    step: 6,
    title: 'à¸•à¸£à¸§à¸ˆà¸Ÿà¸²à¸£à¹Œà¸¡',
    title_en: 'Farm Inspection',
    description: 'VDO Call à¹à¸¥à¸°à¸¥à¸‡à¸žà¸·à¹‰à¸™à¸—à¸µà¹ˆà¸•à¸£à¸§à¸ˆ (à¸–à¹‰à¸²à¸ˆà¸³à¹€à¸›à¹‡à¸™)',
    states: [
      WORKFLOW_STATES.INSPECTION_SCHEDULED,
      WORKFLOW_STATES.INSPECTION_VDO_CALL,
      WORKFLOW_STATES.INSPECTION_ON_SITE,
      WORKFLOW_STATES.INSPECTION_COMPLETED
    ],
    completed: false
  },
  {
    step: 7,
    title: 'à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´à¸£à¸±à¸šà¸£à¸­à¸‡',
    title_en: 'Final Approval',
    description: 'à¸œà¸¹à¹‰à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´à¸žà¸´à¸ˆà¸²à¸£à¸“à¸²à¸œà¸¥à¸à¸²à¸£à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸š',
    states: [
      WORKFLOW_STATES.PENDING_APPROVAL,
      WORKFLOW_STATES.APPROVED,
      WORKFLOW_STATES.REJECTED
    ],
    completed: false
  },
  {
    step: 8,
    title: 'à¸£à¸±à¸šà¹ƒà¸šà¸£à¸±à¸šà¸£à¸­à¸‡',
    title_en: 'Certificate Issuance',
    description: 'à¸”à¸²à¸§à¸™à¹Œà¹‚à¸«à¸¥à¸”à¹ƒà¸šà¸£à¸±à¸šà¸£à¸­à¸‡ GACP',
    states: [WORKFLOW_STATES.CERTIFICATE_GENERATING, WORKFLOW_STATES.CERTIFICATE_ISSUED],
    completed: false
  }
];

// ================================
// Status Management Class
// ================================

class GACPStatusManager {
  constructor() {
    this.states = USER_FRIENDLY_STATES;
    this.steps = PROGRESS_STEPS;
  }

  /**
   * à¹à¸›à¸¥à¸‡à¸ªà¸–à¸²à¸™à¸°à¹€à¸—à¸„à¸™à¸´à¸„à¹€à¸›à¹‡à¸™à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸—à¸µà¹ˆà¹€à¸‚à¹‰à¸²à¹ƒà¸ˆà¸‡à¹ˆà¸²à¸¢
   */
  getDisplayStatus(currentState, language = 'thai') {
    const status = this.states[currentState];
    if (!status) {
      return {
        thai: 'à¸ªà¸–à¸²à¸™à¸°à¹„à¸¡à¹ˆà¸—à¸£à¸²à¸š',
        english: 'Unknown Status',
        description: 'à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸£à¸°à¸šà¸¸à¸ªà¸–à¸²à¸™à¸°à¹„à¸”à¹‰',
        icon: 'â“',
        color: '#9E9E9E',
        progress: 0
      };
    }

    return {
      title: language === 'thai' ? status.thai : status.english,
      description: status.description,
      icon: status.icon,
      color: status.color,
      progress: status.progress,
      step: status.step,
      actionRequired: status.actionRequired,
      nextAction: status.nextAction,
      amount: status.amount,
      urgent: status.urgent || false,
      warning: status.warning || false,
      final: status.final || false,
      success: status.success || false
    };
  }

  /**
   * à¸ªà¸£à¹‰à¸²à¸‡ Progress Bar à¸•à¸²à¸¡à¸ªà¸–à¸²à¸™à¸°à¸›à¸±à¸ˆà¸ˆà¸¸à¸šà¸±à¸™
   */
  generateProgressBar(currentState, language = 'thai') {
    const currentStatus = this.states[currentState];
    if (!currentStatus) return null;

    const currentStep = currentStatus.step;
    const progress = [];

    this.steps.forEach((step) => {
      const isCompleted = step.step < currentStep;
      const isCurrent = step.step === currentStep;

      // à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸§à¹ˆà¸² step à¸™à¸µà¹‰à¸¡à¸µà¸ªà¸–à¸²à¸™à¸°à¸—à¸µà¹ˆà¸œà¹ˆà¸²à¸™à¹à¸¥à¹‰à¸§à¸«à¸£à¸·à¸­à¹„à¸¡à¹ˆ
      let stepStatus = 'upcoming';
      if (isCompleted) {
        stepStatus = 'completed';
      } else if (isCurrent) {
        stepStatus = 'current';
      }

      // à¸ªà¸³à¸«à¸£à¸±à¸š step à¸—à¸µà¹ˆà¸–à¸¹à¸ reject à¸«à¸£à¸·à¸­à¸¡à¸µà¸›à¸±à¸à¸«à¸²
      if (isCurrent && currentStatus.warning) {
        stepStatus = 'error';
      }

      progress.push({
        step: step.step,
        title: language === 'thai' ? step.title : step.title_en,
        description: step.description,
        status: stepStatus,
        amount: step.amount,
        completed: isCompleted,
        current: isCurrent,
        icon: this.getStepIcon(step.step, stepStatus),
        states: step.states
      });
    });

    return {
      currentStep,
      totalSteps: this.steps.length,
      progress: currentStatus.progress,
      steps: progress
    };
  }

  /**
   * à¸”à¸¶à¸‡ icon à¸ªà¸³à¸«à¸£à¸±à¸šà¹à¸•à¹ˆà¸¥à¸° step
   */
  getStepIcon(step, status) {
    const icons = {
      1: { completed: 'âœ…', current: 'ðŸ“', error: 'âŒ', upcoming: 'â­•' },
      2: { completed: 'âœ…', current: 'ðŸ’°', error: 'âŒ', upcoming: 'â­•' },
      3: { completed: 'âœ…', current: 'ðŸ“‹', error: 'âš ï¸', upcoming: 'â­•' },
      4: { completed: 'âœ…', current: 'ðŸ‘', error: 'âŒ', upcoming: 'â­•' },
      5: { completed: 'âœ…', current: 'ðŸ’°', error: 'âŒ', upcoming: 'â­•' },
      6: { completed: 'âœ…', current: 'ðŸ“¹', error: 'âŒ', upcoming: 'â­•' },
      7: { completed: 'âœ…', current: 'ðŸ‘¨â€ðŸ’¼', error: 'âŒ', upcoming: 'â­•' },
      8: { completed: 'âœ…', current: 'ðŸ†', error: 'âŒ', upcoming: 'â­•' }
    };

    return icons[step]?.[status] || 'â­•';
  }

  /**
   * à¸ªà¸£à¹‰à¸²à¸‡à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¹à¸ˆà¹‰à¸‡à¹€à¸•à¸·à¸­à¸™
   */
  generateNotification(currentState, applicationData = {}) {
    const status = this.getDisplayStatus(currentState);
    
    const notification = {
      type: this.getNotificationType(status),
      title: status.title,
      message: status.description,
      action: status.nextAction,
      urgent: status.urgent,
      icon: status.icon,
      color: status.color
    };

    // à¹€à¸žà¸´à¹ˆà¸¡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹€à¸‰à¸žà¸²à¸°à¸•à¸²à¸¡à¸ªà¸–à¸²à¸™à¸°
    if (status.amount) {
      notification.amount = status.amount;
      notification.formattedAmount = this.formatCurrency(status.amount);
    }

    // à¹€à¸žà¸´à¹ˆà¸¡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ deadline à¸«à¸£à¸·à¸­à¹€à¸§à¸¥à¸²à¸ªà¸³à¸„à¸±à¸
    if (applicationData.deadline) {
      notification.deadline = applicationData.deadline;
      notification.daysLeft = this.calculateDaysLeft(applicationData.deadline);
    }

    return notification;
  }

  /**
   * à¸à¸³à¸«à¸™à¸”à¸›à¸£à¸°à¹€à¸ à¸—à¸à¸²à¸£à¹à¸ˆà¹‰à¸‡à¹€à¸•à¸·à¸­à¸™
   */
  getNotificationType(status) {
    if (status.success) return 'success';
    if (status.warning || status.urgent) return 'warning';
    if (status.final && !status.success) return 'error';
    return 'info';
  }

  /**
   * à¸ˆà¸±à¸”à¸£à¸¹à¸›à¹à¸šà¸šà¹€à¸‡à¸´à¸™
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * à¸„à¸³à¸™à¸§à¸“à¸ˆà¸³à¸™à¸§à¸™à¸§à¸±à¸™à¸—à¸µà¹ˆà¹€à¸«à¸¥à¸·à¸­
   */
  calculateDaysLeft(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  /**
   * à¸”à¸¶à¸‡à¸£à¸²à¸¢à¸à¸²à¸£à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”à¸•à¸²à¸¡à¸šà¸—à¸šà¸²à¸—
   */
  getTasksByRole(applications, role) {
    const tasks = [];

    applications.forEach(app => {
      const status = this.getDisplayStatus(app.currentState);
      
      // à¸à¸£à¸­à¸‡à¸•à¸²à¸¡ role à¸—à¸µà¹ˆà¸•à¹‰à¸­à¸‡à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£
      if (this.shouldShowToRole(status.actionRequired, role)) {
        tasks.push({
          applicationId: app.id,
          applicationNumber: app.applicationNumber,
          farmerName: app.farmerName,
          status: status,
          notification: this.generateNotification(app.currentState, app),
          updatedAt: app.updatedAt,
          priority: this.getPriority(status)
        });
      }
    });

    // à¹€à¸£à¸µà¸¢à¸‡à¸•à¸²à¸¡ priority à¹à¸¥à¹‰à¸§à¸•à¸²à¸¡ updatedAt
    return tasks.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Priority à¸ªà¸¹à¸‡à¸à¹ˆà¸­à¸™
      }
      return new Date(b.updatedAt) - new Date(a.updatedAt); // à¸¥à¹ˆà¸²à¸ªà¸¸à¸”à¸à¹ˆà¸­à¸™
    });
  }

  /**
   * à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸§à¹ˆà¸²à¸„à¸§à¸£à¹à¸ªà¸”à¸‡à¹ƒà¸«à¹‰ role à¸™à¸µà¹‰à¸«à¸£à¸·à¸­à¹„à¸¡à¹ˆ
   */
  shouldShowToRole(actionRequired, role) {
    const roleMap = {
      farmer: ['farmer', 'both'],
      staff: ['staff', 'both'],
      admin: ['admin', 'both'],
      system: [] // à¹„à¸¡à¹ˆà¹à¸ªà¸”à¸‡à¸‡à¸²à¸™à¸‚à¸­à¸‡à¸£à¸°à¸šà¸š
    };

    return roleMap[role]?.includes(actionRequired) || false;
  }

  /**
   * à¸à¸³à¸«à¸™à¸”à¸£à¸°à¸”à¸±à¸šà¸„à¸§à¸²à¸¡à¸ªà¸³à¸„à¸±à¸
   */
  getPriority(status) {
    if (status.urgent) return 3; // à¸ªà¸¹à¸‡à¸ªà¸¸à¸”
    if (status.warning) return 2; // à¸›à¸²à¸™à¸à¸¥à¸²à¸‡  
    return 1; // à¸›à¸à¸•à¸´
  }

  /**
   * à¸ªà¸£à¹‰à¸²à¸‡ Dashboard Summary
   */
  generateDashboardSummary(applications, role = 'farmer') {
    const summary = {
      total: applications.length,
      byStatus: {},
      byStep: {},
      tasks: {
        urgent: 0,
        pending: 0,
        completed: 0
      },
      payments: {
        phase1: { pending: 0, completed: 0, total: 0 },
        phase2: { pending: 0, completed: 0, total: 0 }
      },
      timeline: []
    };

    applications.forEach(app => {
      const status = this.getDisplayStatus(app.currentState);
      
      // Count by status
      const statusKey = status.title;
      summary.byStatus[statusKey] = (summary.byStatus[statusKey] || 0) + 1;
      
      // Count by step
      summary.byStep[status.step] = (summary.byStep[status.step] || 0) + 1;
      
      // Count tasks
      if (this.shouldShowToRole(status.actionRequired, role)) {
        if (status.urgent) summary.tasks.urgent++;
        else if (!status.final) summary.tasks.pending++;
      }
      
      if (status.final && status.success) summary.tasks.completed++;
      
      // Payment summary
      if (app.payments?.phase1?.status === 'completed') {
        summary.payments.phase1.completed++;
        summary.payments.phase1.total += 5000;
      } else if (app.payments?.phase1?.status === 'pending') {
        summary.payments.phase1.pending++;
      }
      
      if (app.payments?.phase2?.status === 'completed') {
        summary.payments.phase2.completed++;
        summary.payments.phase2.total += 25000;
      } else if (app.payments?.phase2?.status === 'pending') {
        summary.payments.phase2.pending++;
      }
    });

    return summary;
  }
}

// Export
module.exports = {
  GACPStatusManager,
  USER_FRIENDLY_STATES,
  PROGRESS_STEPS,
  WORKFLOW_STATES // Re-export for convenience
}; 
  
 