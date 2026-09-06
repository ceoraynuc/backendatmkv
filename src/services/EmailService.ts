import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendResetEmail(
  email: string,
  resetLink: string,
): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'MK Volunteers - Password Reset',
    html: `
      <h2>Password Reset</h2>
      <p>You requested to reset your password.</p>
      <p>
        <a href="${resetLink}">
          Click here to reset your password
        </a>
      </p>
      <p>This link will expire soon.</p>
    `,
  });
}