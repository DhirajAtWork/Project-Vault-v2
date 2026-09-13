import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer Transporter with SMTP or Ethereal fallback
 */
const createTransporter = async () => {
  if ((process.env.SMTP_SERVICE === 'gmail' || process.env.SMTP_HOST?.includes('gmail')) && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to Nodemailer Ethereal test account if SMTP credentials aren't set
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('ℹ️ [Nodemailer]: Configured Ethereal Test Account for local emails');
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.warn('⚠️ [Nodemailer]: Could not create Ethereal test account, logging emails to console');
    return null;
  }
};

/**
 * Helper to dispatch HTML emails
 */
const sendMail = async ({ to, subject, html }) => {
  try {
    const transporter = await createTransporter();
    const defaultFrom = process.env.SMTP_USER ? `"Project Vault v2" <${process.env.SMTP_USER}>` : '"Project Vault v2" <no-reply@projectvault.io>';
    const from = process.env.FROM_EMAIL || defaultFrom;

    if (transporter) {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      console.log(`✉️ [Email Sent]: To: ${to} | Subject: "${subject}" | Message ID: ${info.messageId}`);
      if (info.host === 'smtp.ethereal.email' || nodemailer.getTestMessageUrl(info)) {
        console.log(`🔗 [Preview URL]: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return info;
    } else {
      console.log(`✉️ [Console Mail Fallback] To: ${to} | Subject: ${subject}`);
    }
  } catch (error) {
    console.error('❌ [SendMail Exception]:', error.message);
  }
};

/**
 * 1. Send OTP Verification Email
 */
export const sendOtpEmail = async (email, name, otp) => {
  console.log(`🔑 [DEV TEST OTP CODE FOR ${email}]: ${otp}`);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f2; margin: 0; padding: 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 36px; border: 1px solid #e2e8f0; shadow: 0 10px 25px rgba(0,0,0,0.05); }
          .logo { font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 24px; display: inline-block; }
          .title { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
          .text { font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
          .otp-box { background: #f8fafc; border: 2px dashed #059669; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #059669; font-family: monospace; }
          .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">⚡ PROJECT VAULT</div>
          <div class="title">Verify Your Email Address</div>
          <p class="text">Hi <strong>${name}</strong>,<br>Welcome to Project Vault! Please use the 6-digit Verification OTP below to complete your registration:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p class="text">This OTP is valid for <strong>15 minutes</strong>. If you did not request this email, please ignore it.</p>
          <div class="footer">&copy; 2026 Project Vault v2. All rights reserved.</div>
        </div>
      </body>
    </html>
  `;

  await sendMail({
    to: email,
    subject: `${otp} is your Project Vault Verification OTP`,
    html,
  });
};

/**
 * 2. Send Beautiful Welcome Email upon Successful Verification
 */
export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f2; margin: 0; padding: 20px; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; }
          .header-badge { background: #d1fae5; color: #065f46; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 6px 14px; border-radius: 20px; display: inline-block; margin-bottom: 16px; }
          .title { font-size: 26px; font-weight: 800; color: #0f172a; margin-bottom: 14px; }
          .text { font-size: 15px; color: #334155; line-height: 1.7; margin-bottom: 20px; }
          .cta-btn { display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; font-weight: 700; padding: 14px 28px; border-radius: 14px; font-size: 14px; margin-top: 10px; }
          .footer { font-size: 12px; color: #94a3b8; margin-top: 36px; border-top: 1px solid #f1f5f9; padding-top: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-badge">✓ ACCOUNT VERIFIED</div>
          <div class="title">Welcome aboard, ${name}! 🎉</div>
          <p class="text">Your email address has been successfully verified. You are now officially a part of <strong>Project Vault v2</strong> - the premier verified student project showcase and developer ecosystem.</p>
          <p class="text">Log in to your dashboard to manage your verified portfolio projects, explore peer codebases, and connect with top recruiters.</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/dashboard" class="cta-btn">Access Your Dashboard →</a>
          <div class="footer">&copy; 2026 Project Vault v2 • Verified Student Showcase</div>
        </div>
      </body>
    </html>
  `;

  await sendMail({
    to: email,
    subject: `Welcome to Project Vault v2, ${name}!`,
    html,
  });
};

/**
 * 3. Send Password Reset OTP Email
 */
export const sendResetPasswordEmail = async (email, name, otp) => {
  console.log(`🔑 [DEV TEST RESET OTP CODE FOR ${email}]: ${otp}`);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f2; margin: 0; padding: 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 36px; border: 1px solid #e2e8f0; }
          .logo { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 24px; }
          .title { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
          .text { font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 20px; }
          .otp-box { background: #fef2f2; border: 2px dashed #ef4444; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #dc2626; font-family: monospace; }
          .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">⚡ PROJECT VAULT</div>
          <div class="title">Reset Your Password</div>
          <p class="text">Hi <strong>${name}</strong>,<br>We received a request to reset your Project Vault account password. Use the 6-digit Reset OTP code below:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p class="text">This OTP code expires in <strong>15 minutes</strong>. If you did not request a password reset, please secure your account immediately.</p>
          <div class="footer">&copy; 2026 Project Vault v2. All rights reserved.</div>
        </div>
      </body>
    </html>
  `;

  await sendMail({
    to: email,
    subject: `${otp} is your Project Vault Password Reset OTP`,
    html,
  });
};

/**
 * 4. Send Account Removal Notification Email (Admin Action)
 */
export const sendAccountRemovedEmail = async (email, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f2; margin: 0; padding: 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 36px; border: 1px solid #e2e8f0; }
          .logo { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 24px; }
          .alert-badge { background: #fef2f2; color: #991b1b; font-size: 12px; font-weight: 700; text-transform: uppercase; padding: 6px 14px; border-radius: 20px; display: inline-block; margin-bottom: 16px; border: 1px solid #fecaca; }
          .title { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
          .text { font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 20px; }
          .notice-box { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 14px; padding: 18px; margin: 20px 0; }
          .notice-text { font-size: 14px; color: #92400e; line-height: 1.6; }
          .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">⚡ PROJECT VAULT</div>
          <div class="alert-badge">⚠ ACCOUNT REMOVED</div>
          <div class="title">Your Account Has Been Removed</div>
          <p class="text">Hi <strong>${name}</strong>,</p>
          <p class="text">We are writing to inform you that your Project Vault account has been reviewed by our administration team.</p>
          <div class="notice-box">
            <p class="notice-text">
              <strong>Action Taken:</strong> Your account was found with some issue and has been removed by the admin. 
              As a result, your account and all associated data have been permanently deactivated from the platform.
            </p>
          </div>
          <p class="text">If you believe this action was taken in error or would like to appeal this decision, please contact our support team directly.</p>
          <p class="text">We appreciate your understanding.</p>
          <div class="footer">&copy; 2026 Project Vault v2 &bull; Administration Notice</div>
        </div>
      </body>
    </html>
  `;

  await sendMail({
    to: email,
    subject: 'Important: Your Project Vault Account Has Been Removed',
    html,
  });
};

/**
 * 5. Send Collaboration Request Notification to Student Developer (when recruiter requests collaboration)
 */
export const sendCollaborationInquiryEmail = async ({
  studentEmail,
  studentName,
  recruiterName,
  recruiterCompany,
  recruiterRole,
  projectName,
  message,
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.04); }
          .badge { background: #f3e8ff; color: #7e22ce; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 14px; border-radius: 999px; display: inline-block; margin-bottom: 20px; border: 1px solid #e9d5ff; }
          .title { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 12px; letter-spacing: -0.5px; }
          .text { font-size: 15px; color: #334155; line-height: 1.6; margin-bottom: 20px; }
          .recruiter-card { background: #fdf4ff; border: 1px solid #f0abfc; border-radius: 16px; padding: 20px; margin: 24px 0; }
          .recruiter-name { font-size: 16px; font-weight: 800; color: #701a75; }
          .recruiter-sub { font-size: 13px; color: #86198f; margin-top: 4px; }
          .project-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 20px 0; }
          .project-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 6px; }
          .project-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
          .message-quote { font-size: 14px; color: #475569; font-style: italic; line-height: 1.6; border-left: 3px solid #7e22ce; padding-left: 12px; }
          .cta-btn { display: inline-block; background: #7e22ce; color: #ffffff !important; text-decoration: none; font-weight: 700; padding: 14px 28px; border-radius: 14px; font-size: 14px; margin-top: 16px; }
          .footer { font-size: 12px; color: #94a3b8; margin-top: 36px; border-top: 1px solid #f1f5f9; padding-top: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="badge">🤝 New Recruiter Collaboration Request</div>
          <div class="title">Great news, ${studentName}! 🎉</div>
          <p class="text">A verified technical recruiter was impressed by your work on Project Vault and has initiated a direct collaboration request with you.</p>
          
          <div class="recruiter-card">
            <div class="recruiter-name">${recruiterName}</div>
            <div class="recruiter-sub">${recruiterRole || 'Technical Recruiter'} &bull; <strong>${recruiterCompany || 'Talent Acquisition'}</strong></div>
          </div>

          <div class="project-box">
            <div class="project-label">Project of Interest</div>
            <div class="project-title">${projectName}</div>
            <div class="message-quote">"${message}"</div>
          </div>

          <p class="text">Review this inquiry on your dashboard to accept the collaboration and connect with the recruiter.</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/dashboard/analytics" class="cta-btn">View Request & Connect &rarr;</a>
          
          <div class="footer">&copy; 2026 Project Vault v2 &bull; Talent & Collaboration Ecosystem</div>
        </div>
      </body>
    </html>
  `;

  await sendMail({
    to: studentEmail,
    subject: `New Collaboration Request for "${projectName}" from ${recruiterName} (${recruiterCompany})`,
    html,
  });
};

/**
 * 6. Send Collaboration Accepted Notification to Recruiter (when student accepts request)
 */
export const sendCollaborationAcceptedEmail = async ({
  recruiterEmail,
  recruiterName,
  studentName,
  studentEmail,
  studentHeadline,
  projectName,
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.04); }
          .badge { background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 14px; border-radius: 999px; display: inline-block; margin-bottom: 20px; border: 1px solid #bbf7d0; }
          .title { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 12px; letter-spacing: -0.5px; }
          .text { font-size: 15px; color: #334155; line-height: 1.6; margin-bottom: 20px; }
          .student-card { background: #f0fdf4; border: 1px solid #86efac; border-radius: 16px; padding: 20px; margin: 24px 0; }
          .student-name { font-size: 17px; font-weight: 800; color: #14532d; }
          .student-sub { font-size: 13px; color: #166534; margin-top: 4px; }
          .student-email { font-family: monospace; font-size: 14px; color: #047857; margin-top: 8px; font-weight: 700; }
          .project-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; margin: 20px 0; }
          .project-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 4px; }
          .project-title { font-size: 16px; font-weight: 700; color: #0f172a; }
          .cta-btn { display: inline-block; background: #0f172a; color: #ffffff !important; text-decoration: none; font-weight: 700; padding: 14px 28px; border-radius: 14px; font-size: 14px; margin-top: 16px; }
          .footer { font-size: 12px; color: #94a3b8; margin-top: 36px; border-top: 1px solid #f1f5f9; padding-top: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="badge">&check; Collaboration Accepted</div>
          <div class="title">Collaboration Request Accepted! 🎉</div>
          <p class="text">Hi ${recruiterName || 'Talent Acquisition Team'},<br>Good news! <strong>${studentName}</strong> has accepted your collaboration inquiry regarding their project <strong>"${projectName}"</strong> on Project Vault.</p>
          
          <div class="student-card">
            <div class="student-name">${studentName}</div>
            <div class="student-sub">${studentHeadline || 'Student Developer & Engineer'}</div>
            <div class="student-email">Email: <a href="mailto:${studentEmail}" style="color: #047857; text-decoration: underline;">${studentEmail}</a></div>
          </div>

          <div class="project-box">
            <div class="project-label">Connected Project</div>
            <div class="project-title">${projectName}</div>
          </div>

          <p class="text">You can now proceed with direct outreach, schedule an introductory screening, or coordinate technical interviews.</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/dashboard/analytics" class="cta-btn">Open Recruiter Dashboard &rarr;</a>
          
          <div class="footer">&copy; 2026 Project Vault v2 &bull; Verified Candidate Pipeline</div>
        </div>
      </body>
    </html>
  `;

  await sendMail({
    to: recruiterEmail,
    subject: `${studentName} accepted your collaboration request for "${projectName}"`,
    html,
  });
};

/**
 * 7. Send Notification to Recruiter when Project Owner Removes a Project
 */
export const sendProjectRemovedEmail = async ({
  recruiterEmail,
  recruiterName,
  studentName,
  projectName,
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.04); }
          .badge { background: #fef2f2; color: #b91c1c; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 14px; border-radius: 999px; display: inline-block; margin-bottom: 20px; border: 1px solid #fecaca; }
          .title { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 12px; letter-spacing: -0.5px; }
          .text { font-size: 15px; color: #334155; line-height: 1.6; margin-bottom: 20px; }
          .project-box { background: #fff1f2; border: 1px solid #fda4af; border-radius: 16px; padding: 20px; margin: 24px 0; }
          .project-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #9f1239; letter-spacing: 0.5px; margin-bottom: 6px; }
          .project-title { font-size: 18px; font-weight: 800; color: #881337; }
          .notice-text { font-size: 14px; color: #475569; line-height: 1.6; margin-top: 10px; }
          .cta-btn { display: inline-block; background: #0f172a; color: #ffffff !important; text-decoration: none; font-weight: 700; padding: 14px 28px; border-radius: 14px; font-size: 14px; margin-top: 16px; }
          .footer { font-size: 12px; color: #94a3b8; margin-top: 36px; border-top: 1px solid #f1f5f9; padding-top: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="badge">Project Removed Notice</div>
          <div class="title">Project Showcase Removed</div>
          <p class="text">Hi <strong>${recruiterName || 'Talent Acquisition Team'}</strong>,</p>
          <p class="text">We are writing to notify you that the owner of the project (<strong>${studentName || 'the developer'}</strong>) has removed their project showcase from Project Vault.</p>
          
          <div class="project-box">
            <div class="project-label">Removed Project</div>
            <div class="project-title">${projectName}</div>
            <p class="notice-text">
              Any collaboration inquiries or pending outreach associated with this project have been archived and removed from your active showcase queue.
            </p>
          </div>

          <p class="text">You can continue discovering other top verified student engineering projects and active candidates on the platform.</p>
          <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/dashboard/visit-projects" class="cta-btn">Explore Verified Projects &rarr;</a>
          
          <div class="footer">&copy; 2026 Project Vault v2 &bull; Talent & Collaboration Ecosystem</div>
        </div>
      </body>
    </html>
  `;

  await sendMail({
    to: recruiterEmail,
    subject: `Notice: Project "${projectName}" was removed by its developer - Project Vault`,
    html,
  });
};


