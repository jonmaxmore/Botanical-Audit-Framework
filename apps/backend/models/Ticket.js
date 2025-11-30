/**
 * Ticket Model (V2)
 * For internal communication threads between Admin and User
 * Replaces external email communication with in-app messaging
 */

const mongoose = require('mongoose');

const ticketMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxLength: 2000,
    },
    // Field reference for contextual feedback
    fieldReference: {
      type: String, // e.g., "farmInformation.landOwnership.documents"
    },
    // Attachments
    attachments: [
      {
        filename: String,
        path: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

const ticketSchema = new mongoose.Schema(
  {
    // Link to application
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },

    // Participants
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Ticket status
    status: {
      type: String,
      enum: ['open', 'in_progress', 'waiting_user', 'waiting_staff', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },

    // Subject/Title
    subject: {
      type: String,
      required: true,
      maxLength: 200,
    },

    // Category
    category: {
      type: String,
      enum: ['document_correction', 'payment_issue', 'general_inquiry', 'technical_support'],
      default: 'general_inquiry',
    },

    // Priority
    priority: {
      type: Number,
      default: 1,
      enum: [0, 1, 2, 3], // 0=low, 1=normal, 2=high, 3=urgent
    },

    // Message thread
    messages: [ticketMessageSchema],

    // Revision tracking
    revisionCount: {
      type: Number,
      default: 0,
    },

    // Auto-close after resolution
    resolvedAt: Date,
    closedAt: Date,
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Indexes
ticketSchema.index({ applicationId: 1, status: 1 });
ticketSchema.index({ applicant: 1, status: 1 });
ticketSchema.index({ assignedStaff: 1, status: 1 });

// Instance methods
ticketSchema.methods.addMessage = function (senderId, message, fieldReference = null, attachments = []) {
  this.messages.push({
    sender: senderId,
    message,
    fieldReference,
    attachments,
  });

  // Update status based on sender
  // If staff sends, set to waiting_user; if user sends, set to waiting_staff
  // (This logic can be refined based on business rules)

  return this.save();
};

ticketSchema.methods.resolve = function () {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  return this.save();
};

ticketSchema.methods.close = function () {
  this.status = 'closed';
  this.closedAt = new Date();
  return this.save();
};

// Static methods
ticketSchema.statics.createTicket = async function (data) {
  const ticket = new this(data);
  await ticket.save();
  return ticket;
};

ticketSchema.statics.getApplicationTickets = function (applicationId) {
  return this.find({ applicationId })
    .sort({ createdAt: -1 })
    .populate('applicant', 'fullName email')
    .populate('assignedStaff', 'fullName role')
    .populate('messages.sender', 'fullName role');
};

ticketSchema.statics.getUserTickets = function (userId, status = null) {
  const query = {
    $or: [{ applicant: userId }, { assignedStaff: userId }],
  };
  if (status) {
    query.status = status;
  }
  return this.find(query)
    .sort({ priority: -1, updatedAt: -1 })
    .populate('applicationId', 'applicationNumber currentStatus')
    .populate('applicant', 'fullName')
    .populate('assignedStaff', 'fullName');
};

module.exports = mongoose.model('Ticket', ticketSchema);
