import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (email, resetUrl) => {
  await transporter.sendMail({
    from: `"TaskForge" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "TaskForge - Password Reset",
    text: `You requested a password reset. Open this link to set a new password: ${resetUrl}. This link expires in 15 minutes. If you did not request this, ignore this email.`,
    html: `
      <h2>Reset your TaskForge password</h2>
      <p>We received a request to reset your password.</p>
      <p>
        <a href="${resetUrl}">Reset Password</a>
      </p>
      <p>This link expires in 15 minutes.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });
};



export const sendEmailChangeVerification = async (
  email,
  verificationUrl
) => {
  await transporter.sendMail({
    from: `"TaskForge" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "TaskForge - Verify Your New Email",
    text: `Verify your new email address using this link: ${verificationUrl}. This link expires in 15 minutes.`,
    html: `
      <h2>Verify your new email address</h2>
      <p>You requested to change your TaskForge email address.</p>
      <p><a href="${verificationUrl}">Verify Email Address</a></p>
      <p>This link expires in 15 minutes.</p>
      <p>If you did not request this change, ignore this email.</p>
    `,
  });
};