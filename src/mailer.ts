import nodemailer from 'nodemailer';

export class MailtrapMailer {
    transporter: nodemailer.Transporter
    constructor() {
        if (!process.env.MAILTRAP_USER ||!process.env.MAILTRAP_PASSWORD) {
            throw new Error('Missing MAILTRAP_USER or MAILTRAP_PASSWORD environment variables');
        }
        if (!process.env.MAILTRAP_EMAIL_FROM) {
            throw new Error('Missing MAILTRAP_EMAIL_FROM environment variable');
        }
        // Looking to send emails in production? Check out our Email API/SMTP product!
        this.transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: process.env.MAILTRAP_USER,
              pass: process.env.MAILTRAP_PASSWORD
            }
          });
        this.transporter.verify((error, success) => {
            if (error) {
                console.log("Error verifying SMTP server: ", error);
                throw error;
            } else {
                console.log('SMTP Server is ready');
            }
        });
    }
    async sendMail(to: string, subject: string, text: string): Promise<any> {
        const mailOptions = {
            from: process.env.MAILTRAP_EMAIL_FROM,
            to,
            subject,
            text,
        };
        return this.transporter.sendMail(mailOptions)
                .then((info) => {
                    console.log('Message sent: %s', info.messageId);
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                    return info;
                })
                .catch((error) => {
                    console.error('Error sending mail: ', error);
                    throw error;
                });
    }
}
