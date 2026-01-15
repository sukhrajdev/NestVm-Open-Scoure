import nodemailer from "nodemailer";

// Function to send verification email
export async function sendVerificationEmail(toEmail, verificationToken) {
    try {
        // Create a transporter object using SMTP transport
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });


        // Email content
        const mailOptions = {
            from: `"No Reply" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: "Email Verification",
            html: `<p>Please verify your email by clicking the link below:</p>
                   <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}">Verify Email</a>`,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${toEmail}`);
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Could not send verification email");
    }
}