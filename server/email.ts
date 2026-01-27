import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const mailOptions = {
      from: `"Donet.in" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
}

export async function sendBookingNotification(
  customerEmail: string,
  driverEmail: string,
  bookingDetails: any
): Promise<void> {
  const customerHtml = `
    <h2>Booking Confirmed!</h2>
    <p>Your booking has been confirmed with driver ${bookingDetails.driverName}.</p>
    <p>Pickup: ${bookingDetails.pickupLocation}</p>
    <p>Time: ${new Date(bookingDetails.createdAt).toLocaleString()}</p>
    <p>Contact: ${bookingDetails.driverPhone}</p>
  `;

  const driverHtml = `
    <h2>New Booking!</h2>
    <p>You have a new booking request from ${bookingDetails.customerName}.</p>
    <p>Pickup: ${bookingDetails.pickupLocation}</p>
    <p>Time: ${new Date(bookingDetails.createdAt).toLocaleString()}</p>
    <p>Contact: ${bookingDetails.customerPhone}</p>
  `;

  await Promise.all([
    sendEmail({
      to: customerEmail,
      subject: 'Booking Confirmed - Donet.in',
      html: customerHtml,
    }),
    sendEmail({
      to: driverEmail,
      subject: 'New Booking Request - Donet.in',
      html: driverHtml,
    }),
  ]);
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const html = `
    <h2>Welcome to Donet.in!</h2>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${process.env.FRONTEND_URL}/verify?token=${token}">Verify Email</a>
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - Donet.in',
    html,
  });
}