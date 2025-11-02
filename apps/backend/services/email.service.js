/**
 * Email Notification Service
 * Handles sending email notifications using nodemailer
 */

const nodemailer = require('nodemailer');
const logger = require('../shared/logger');
const emailLogger = logger.createLogger('email-service');
const emailTemplates = require('./email-templates');

let transporter = null;

/**
 * Initialize email transporter
 */
function initialize() {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };

  // For development, use ethereal.email (fake SMTP service)
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
    emailLogger.info('Using development mode - emails will be logged only');
    return;
  }

  try {
    transporter = nodemailer.createTransporter(config);

    // Verify connection
    transporter.verify(error => {
      if (error) {
        emailLogger.error('Email transporter verification failed:', error);
      } else {
        emailLogger.info('Email service ready');
      }
    });
  } catch (error) {
    emailLogger.error('Failed to initialize email service:', error);
  }
}

/**
 * Send notification email
 * @param {Object} notification - Notification document
 * @returns {Promise<Object>} - Send result
 */
async function sendNotificationEmail(notification) {
  try {
    // Get user email
    const { Notification } = require('../models/Notification');
    const notificationWithUser = await Notification.findById(notification._id).populate(
      'userId',
      'email fullName'
    );

    if (!notificationWithUser || !notificationWithUser.userId) {
      throw new Error('User not found for notification');
    }

    const user = notificationWithUser.userId;
    const userEmail = user.email;
    const userName = user.fullName || 'User';

    // Generate email content
    const emailContent = generateEmailContent(notification, userName);

    // In development mode, just log the email
    if (process.env.NODE_ENV === 'development' && !transporter) {
      emailLogger.info('Development mode - Email would be sent:', {
        to: userEmail,
        subject: emailContent.subject,
        text: emailContent.text.substring(0, 100) + '...'
      });
      return { success: true, mode: 'development' };
    }

    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }

    // Send email
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'GACP Platform'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: userEmail,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);

    emailLogger.info(`Email sent to ${userEmail}:`, info.messageId);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    emailLogger.error('Error sending notification email:', error);
    throw error;
  }
}

/**
 * Generate email content based on notification type
 * @param {Object} notification - Notification document
 * @param {String} userName - User's full name
 * @returns {Object} - Email content (subject, text, html)
 */
function generateEmailContent(notification, userName) {
  const { type, title, message, actionUrl, actionLabel } = notification;

  // Base subject and content
  let subject = `[GACP Platform] ${title}`;
  let text = `สวัสดี ${userName},\n\n${message}`;
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #2e7d32; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">GACP Platform</h1>
      </div>
      <div style="padding: 30px; background-color: #f5f5f5;">
        <h2 style="color: #2e7d32;">สวัสดี ${userName}</h2>
        <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">${title}</h3>
          <p style="color: #666; line-height: 1.6;">${message}</p>
        </div>
  `;

  // Add action button if present
  if (actionUrl && actionLabel) {
    text += `\n\n${actionLabel}: ${actionUrl}`;
    html += `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${actionUrl}" style="background-color: #2e7d32; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            ${actionLabel}
          </a>
        </div>
    `;
  }

  // Add type-specific content
  switch (type) {
    case 'application_submitted':
      html += `
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #1565c0;">
            📋 คำขอของคุณได้รับการบันทึกเรียบร้อยแล้ว เจ้าหน้าที่จะตรวจสอบและติดต่อกลับภายใน 3-5 วันทำการ
          </p>
        </div>
      `;
      break;

    case 'certificate_issued':
      html += `
        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #2e7d32;">
            ✅ ยินดีด้วย! คุณได้รับใบรับรอง GACP เรียบร้อยแล้ว
          </p>
        </div>
      `;
      break;

    case 'inspection_scheduled':
      html += `
        <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #ef6c00;">
            📅 โปรดเตรียมความพร้อมสำหรับการตรวจประเมิน
          </p>
        </div>
      `;
      break;

    case 'payment_required':
      html += `
        <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #c62828;">
            💰 โปรดชำระค่าธรรมเนียมเพื่อดำเนินการต่อ
          </p>
        </div>
      `;
      break;
  }

  // Footer
  text += '\n\nขอแสดงความนับถือ\nทีมงาน GACP Platform';
  html += `
      </div>
      <div style="background-color: #424242; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0; font-size: 12px;">
          © ${new Date().getFullYear()} GACP Platform. All rights reserved.
        </p>
        <p style="margin: 10px 0 0 0; font-size: 12px;">
          หากคุณไม่ต้องการรับอีเมลนี้ คุณสามารถ
          <a href="${process.env.FRONTEND_URL}/notifications/preferences" style="color: #4fc3f7;">
            ปรับการตั้งค่าการแจ้งเตือน
          </a>
        </p>
      </div>
    </div>
  `;

  return { subject, text, html };
}

/**
 * Send bulk email to multiple recipients
 * @param {Array<String>} emails - Array of email addresses
 * @param {String} subject - Email subject
 * @param {String} text - Plain text content
 * @param {String} html - HTML content
 * @returns {Promise<Array>} - Send results
 */
async function sendBulkEmail(emails, subject, text, html) {
  if (!transporter) {
    if (process.env.NODE_ENV === 'development') {
      emailLogger.info('Development mode - Bulk email would be sent to:', emails);
      return { success: true, mode: 'development', count: emails.length };
    }
    throw new Error('Email transporter not initialized');
  }

  const results = [];

  for (const email of emails) {
    try {
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'GACP Platform'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject,
        text,
        html
      };

      const info = await transporter.sendMail(mailOptions);
      results.push({ email, success: true, messageId: info.messageId });
    } catch (error) {
      emailLogger.error(`Failed to send email to ${email}:`, error);
      results.push({ email, success: false, error: error.message });
    }
  }

  return results;
}

/**
 * Send test email
 * @param {String} toEmail - Recipient email
 * @returns {Promise<Object>} - Send result
 */
async function sendTestEmail(toEmail) {
  const testContent = {
    subject: '[GACP Platform] Test Email',
    text: 'This is a test email from GACP Platform notification system.',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2e7d32;">Test Email</h2>
        <p>This is a test email from GACP Platform notification system.</p>
        <p>If you received this email, the email service is working correctly.</p>
      </div>
    `
  };

  if (!transporter) {
    if (process.env.NODE_ENV === 'development') {
      emailLogger.info('Development mode - Test email would be sent to:', toEmail);
      return { success: true, mode: 'development' };
    }
    throw new Error('Email transporter not initialized');
  }

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'GACP Platform'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: testContent.subject,
    text: testContent.text,
    html: testContent.html
  };

  const info = await transporter.sendMail(mailOptions);

  emailLogger.info(`Test email sent to ${toEmail}:`, info.messageId);

  return {
    success: true,
    messageId: info.messageId
  };
}

// Initialize on module load
initialize();

/**
 * Send welcome email to new user
 */
async function sendWelcomeEmail(toEmail, userName, farmName) {
  const emailContent = emailTemplates.welcomeEmail(userName, toEmail, farmName);

  if (!transporter) {
    if (process.env.NODE_ENV === 'development') {
      emailLogger.info('Development mode - Welcome email would be sent to:', toEmail);
      return { success: true, mode: 'development' };
    }
    throw new Error('Email transporter not initialized');
  }

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'GACP Platform'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html
  };

  const info = await transporter.sendMail(mailOptions);
  emailLogger.info(`Welcome email sent to ${toEmail}:`, info.messageId);

  return { success: true, messageId: info.messageId };
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(toEmail, userName, resetToken) {
  const emailContent = emailTemplates.passwordResetEmail(userName, resetToken);

  if (!transporter) {
    if (process.env.NODE_ENV === 'development') {
      emailLogger.info('Development mode - Password reset email would be sent to:', toEmail);
      return { success: true, mode: 'development' };
    }
    throw new Error('Email transporter not initialized');
  }

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'GACP Platform'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html
  };

  const info = await transporter.sendMail(mailOptions);
  emailLogger.info(`Password reset email sent to ${toEmail}:`, info.messageId);

  return { success: true, messageId: info.messageId };
}

/**
 * Send application submitted confirmation
 */
async function sendApplicationSubmittedEmail(toEmail, userName, applicationNumber, farmName) {
  const emailContent = emailTemplates.applicationSubmittedEmail(
    userName,
    applicationNumber,
    farmName
  );

  if (!transporter) {
    if (process.env.NODE_ENV === 'development') {
      emailLogger.info('Development mode - Application submitted email would be sent to:', toEmail);
      return { success: true, mode: 'development' };
    }
    throw new Error('Email transporter not initialized');
  }

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'GACP Platform'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html
  };

  const info = await transporter.sendMail(mailOptions);
  emailLogger.info(`Application submitted email sent to ${toEmail}:`, info.messageId);

  return { success: true, messageId: info.messageId };
}

/**
 * Send application approved notification
 */
async function sendApplicationApprovedEmail(
  toEmail,
  userName,
  applicationNumber,
  farmName,
  certificateNumber
) {
  const emailContent = emailTemplates.applicationApprovedEmail(
    userName,
    applicationNumber,
    farmName,
    certificateNumber
  );

  if (!transporter) {
    if (process.env.NODE_ENV === 'development') {
      emailLogger.info('Development mode - Application approved email would be sent to:', toEmail);
      return { success: true, mode: 'development' };
    }
    throw new Error('Email transporter not initialized');
  }

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'GACP Platform'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html
  };

  const info = await transporter.sendMail(mailOptions);
  emailLogger.info(`Application approved email sent to ${toEmail}:`, info.messageId);

  return { success: true, messageId: info.messageId };
}

/**
 * Send application rejected notification
 */
async function sendApplicationRejectedEmail(
  toEmail,
  userName,
  applicationNumber,
  farmName,
  reason
) {
  const emailContent = emailTemplates.applicationRejectedEmail(
    userName,
    applicationNumber,
    farmName,
    reason
  );

  if (!transporter) {
    if (process.env.NODE_ENV === 'development') {
      emailLogger.info('Development mode - Application rejected email would be sent to:', toEmail);
      return { success: true, mode: 'development' };
    }
    throw new Error('Email transporter not initialized');
  }

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'GACP Platform'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html
  };

  const info = await transporter.sendMail(mailOptions);
  emailLogger.info(`Application rejected email sent to ${toEmail}:`, info.messageId);

  return { success: true, messageId: info.messageId };
}

/**
 * Send certificate expiring notification
 */
async function sendCertificateExpiringEmail(
  toEmail,
  userName,
  certificateNumber,
  farmName,
  daysLeft
) {
  const emailContent = emailTemplates.certificateExpiringEmail(
    userName,
    certificateNumber,
    farmName,
    daysLeft
  );

  if (!transporter) {
    if (process.env.NODE_ENV === 'development') {
      emailLogger.info('Development mode - Certificate expiring email would be sent to:', toEmail);
      return { success: true, mode: 'development' };
    }
    throw new Error('Email transporter not initialized');
  }

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'GACP Platform'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html
  };

  const info = await transporter.sendMail(mailOptions);
  emailLogger.info(`Certificate expiring email sent to ${toEmail}:`, info.messageId);

  return { success: true, messageId: info.messageId };
}

module.exports = {
  initialize,
  sendNotificationEmail,
  sendBulkEmail,
  sendTestEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendApplicationSubmittedEmail,
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendCertificateExpiringEmail
};
