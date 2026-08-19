const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Smart Placement Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Smart Placement Portal OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 8px;">
          <h2 style="color: #4f46e5; text-align: center;">Smart Placement Portal</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
          <p style="font-size: 16px; color: #334155;">Hello,</p>
          <p style="font-size: 14px; color: #475569;">Your verification OTP for account registration is:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; background: #eef2ff; padding: 8px 24px; border-radius: 6px; display: inline-block;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #64748b;">This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
        </div>
      `,
    });
    console.log(`✉️ OTP email successfully sent to ${email}`);
    return { success: true };
  } catch (err) {
    console.log(`⚠️ Email delivery notice: ${err.message}`);
    console.log(`🔑 [DEV/FALLBACK OTP] Verification OTP for ${email} is: ${otp}`);
    return { success: false, error: err.message };
  }
};

const sendResetPasswordEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Smart Placement Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request - Smart Placement Portal",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 8px;">
          <h2 style="color: #4f46e5; text-align: center;">Smart Placement Portal</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
          <p style="font-size: 16px; color: #334155;">Hello,</p>
          <p style="font-size: 14px; color: #475569;">We received a request to reset your password. Use the verification code below to set a new password:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0284c7; background: #e0f2fe; padding: 8px 24px; border-radius: 6px; display: inline-block;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #64748b;">This reset code is valid for <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log(`✉️ Password reset email sent to ${email}`);
    return { success: true };
  } catch (err) {
    console.log(`⚠️ Email delivery notice (Reset Password): ${err.message}`);
    console.log(`🔑 [DEV/FALLBACK RESET OTP] Password Reset OTP for ${email} is: ${otp}`);
    return { success: false, error: err.message };
  }
};

const sendStatusEmail = async (email, jobTitle, status, studentName) => {
  try {
    const transporter = createTransporter();
    const subject = `Application Status Update: ${jobTitle}`;
    let message = "";

    if (status === "accepted") {
      message = `
        <h3>Congratulations, ${studentName}! 🎉</h3>
        <p>We are pleased to inform you that your application for the position of <strong>${jobTitle}</strong> has been <strong>ACCEPTED</strong>.</p>
        <p>The company will contact you shortly with further details.</p>
      `;
    } else if (status === "rejected") {
      message = `
        <h3>Application Update</h3>
        <p>Dear ${studentName},</p>
        <p>Thank you for your interest in the position of <strong>${jobTitle}</strong>.</p>
        <p>After careful consideration, we regret to inform you that your application has not been selected for the next round.</p>
        <p>We wish you the best in your job search!</p>
      `;
    } else {
      message = `
        <h3>Application Update</h3>
        <p>Your application status for <strong>${jobTitle}</strong> has been updated to: <strong>${status}</strong>.</p>
      `;
    }

    await transporter.sendMail({
      from: `"Smart Placement Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: message,
    });
    return { success: true };
  } catch (err) {
    console.log(`⚠️ Status email notice: ${err.message}`);
    return { success: false, error: err.message };
  }
};

module.exports = { sendEmail, sendResetPasswordEmail, sendStatusEmail };
