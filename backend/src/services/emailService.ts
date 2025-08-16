import nodemailer from "nodemailer";

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    // You can use Gmail, Outlook, or any SMTP service
    const emailConfig: EmailConfig = {
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || "", // Your email
        pass: process.env.EMAIL_PASS || "", // Your email password or app password
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    try {
      // In development mode, just log the OTP instead of sending email
      if (
        process.env.NODE_ENV === "development" &&
        (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)
      ) {
        console.log("🔐 OTP EMAIL (Development Mode):");
        console.log(`📧 To: ${email}`);
        console.log(`🔢 OTP: ${otp}`);
        console.log("⏰ Expires in: 1 minute");
        console.log("-----------------------------------");
        return true;
      }

      const mailOptions = {
        from: `"Devias Kit" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset - Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #15b79e; margin: 0;">Devias Kit</h1>
              <p style="color: #64748b; margin: 5px 0;">Your gateway to a powerful dashboard experience</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: white; margin: 0 0 15px 0;">Password Reset Request</h2>
              <p style="color: rgba(255,255,255,0.9); margin: 0;">We received a request to reset your password</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
              <p style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Your verification code is:</p>
              <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #15b79e; display: inline-block;">
                <span style="font-size: 32px; font-weight: bold; color: #15b79e; letter-spacing: 8px;">${otp}</span>
              </div>
              <p style="color: #64748b; margin: 15px 0 0 0; font-size: 14px;">This code will expire in 1 minute</p>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. 
                Your account remains secure.
              </p>
            </div>
            
            <div style="text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p style="margin: 0;">This email was sent from Devias Kit Dashboard</p>
              <p style="margin: 5px 0 0 0;">© 2024 Devias Kit. All rights reserved.</p>
            </div>
          </div>
        `,
        text: `
          Devias Kit - Password Reset
          
          We received a request to reset your password.
          
          Your verification code is: ${otp}
          
          This code will expire in 1 minute.
          
          If you didn't request this password reset, please ignore this email.
          
          © 2024 Devias Kit. All rights reserved.
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("OTP email sent successfully:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending OTP email:", error);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("Email service is ready");
      return true;
    } catch (error) {
      console.error("Email service connection failed:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
