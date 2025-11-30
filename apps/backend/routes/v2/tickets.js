/**
 * V2 Ticket Routes
 * Internal communication system for application-related discussions
 */

const express = require('express');
const router = express.Router();
const Ticket = require('../../models/Ticket');
const { farmerOrStaff, canAccessApplication } = require('../../middleware/roleMiddleware');
const { ValidationError } = require('../../shared/errors');
const logger = require('../../shared/logger');

// All routes require authentication
router.use(farmerOrStaff);

/**
 * GET /api/v2/tickets
 * Get user's tickets
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    const tickets = await Ticket.getUserTickets(userId, status);

    res.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v2/tickets/application/:applicationId
 * Get tickets for specific application
 */
router.get('/application/:applicationId', canAccessApplication, async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const tickets = await Ticket.getApplicationTickets(applicationId);

    res.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v2/tickets/:id
 * Get specific ticket details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const ticket = await Ticket.findById(id)
      .populate('applicant', 'fullName email')
      .populate('assignedStaff', 'fullName role')
      .populate('messages.sender', 'fullName role')
      .populate('applicationId', 'applicationNumber currentStatus');

    if (!ticket) {
      throw new ValidationError('Ticket not found');
    }

    // Check access
    if (
      ticket.applicant._id.toString() !== userId.toString() &&
      (!ticket.assignedStaff || ticket.assignedStaff._id.toString() !== userId.toString()) &&
      req.user.role !== 'admin'
    ) {
      throw new ValidationError('Access denied');
    }

    res.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v2/tickets
 * Create a new ticket
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      applicationId,
      subject,
      category = 'general_inquiry',
      priority = 1,
      initialMessage,
      fieldReference,
    } = req.body;

    if (!applicationId || !subject || !initialMessage) {
      throw new ValidationError('Missing required fields');
    }

    const ticket = await Ticket.createTicket({
      applicationId,
      applicant: req.user._id,
      subject,
      category,
      priority,
      messages: [
        {
          sender: req.user._id,
          message: initialMessage,
          fieldReference,
        },
      ],
    });

    logger.info('Ticket created', {
      ticketId: ticket._id,
      applicationId,
      category,
    });

    res.status(201).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v2/tickets/:id/messages
 * Add message to ticket
 */
router.post('/:id/messages', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, fieldReference, attachments = [] } = req.body;
    const userId = req.user._id;

    if (!message) {
      throw new ValidationError('Message is required');
    }

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new ValidationError('Ticket not found');
    }

    // Check access
    if (
      ticket.applicant.toString() !== userId.toString() &&
      (!ticket.assignedStaff || ticket.assignedStaff.toString() !== userId.toString()) &&
      req.user.role !== 'admin'
    ) {
      throw new ValidationError('Access denied');
    }

    await ticket.addMessage(userId, message, fieldReference, attachments);

    logger.info('Message added to ticket', {
      ticketId: ticket._id,
      senderId: userId,
    });

    res.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v2/tickets/:id/resolve
 * Resolve ticket
 */
router.put('/:id/resolve', async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new ValidationError('Ticket not found');
    }

    await ticket.resolve();

    logger.info('Ticket resolved', {
      ticketId: ticket._id,
      resolvedBy: req.user._id,
    });

    res.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v2/tickets/:id/close
 * Close ticket
 */
router.put('/:id/close', async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new ValidationError('Ticket not found');
    }

    await ticket.close();

    logger.info('Ticket closed', {
      ticketId: ticket._id,
      closedBy: req.user._id,
    });

    res.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
