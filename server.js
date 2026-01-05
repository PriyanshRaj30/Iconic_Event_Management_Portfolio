import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true
}));
app.use(express.json());

// Serve static files (CSS, JS, images, etc.) from root directory
app.use(express.static(__dirname));

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

app.post("/send-email", async (req, res) => {
    const { name, email, phone, message } = req.body;

    try {
        await transporter.sendMail({
            from: `"Iconic Events" <${process.env.SMTP_USER}>`,
            to: process.env.RECEIVER_EMAIL,
            subject: "New Event Inquiry",
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Message:</strong><br/>${message}</p>
            `,
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

app.post("/send-booking", async (req, res) => {
    const { customer, services, total } = req.body;

    try {
        // Create service list HTML
        const servicesList = services.map(service => `
            <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 12px;">${service.category}</td>
                <td style="padding: 12px;">${service.name}</td>
                <td style="padding: 12px; text-align: right;">₹${service.price.toLocaleString('en-IN')}</td>
            </tr>
        `).join('');

        await transporter.sendMail({
            from: `"Iconic Events" <${process.env.SMTP_USER}>`,
            to: process.env.RECEIVER_EMAIL,
            subject: "🎉 New Service Booking Request",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #D4AF37; border-bottom: 3px solid #D4AF37; padding-bottom: 10px;">
                        New Service Booking Request
                    </h2>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Customer Information</h3>
                        <p style="margin: 8px 0;"><strong>Name:</strong> ${customer?.name || 'N/A'}</p>
                        <p style="margin: 8px 0;"><strong>Email:</strong> ${customer?.email || 'N/A'}</p>
                        <p style="margin: 8px 0;"><strong>Phone:</strong> ${customer?.phone || 'N/A'}</p>
                        ${customer?.eventDate ? `<p style="margin: 8px 0;"><strong>Event Date:</strong> ${customer.eventDate}</p>` : ''}
                        ${customer?.specialRequests ? `<p style="margin: 8px 0;"><strong>Special Requests:</strong><br/>${customer.specialRequests}</p>` : ''}
                    </div>
                    
                    <h3 style="color: #333;">Selected Services</h3>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <thead>
                            <tr style="background: #D4AF37; color: white;">
                                <th style="padding: 12px; text-align: left;">Category</th>
                                <th style="padding: 12px; text-align: left;">Service</th>
                                <th style="padding: 12px; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${servicesList}
                        </tbody>
                        <tfoot>
                            <tr style="background: #f9f9f9; font-weight: bold; font-size: 18px;">
                                <td colspan="2" style="padding: 15px; text-align: right;">TOTAL AMOUNT:</td>
                                <td style="padding: 15px; text-align: right; color: #D4AF37;">₹${total.toLocaleString('en-IN')}</td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <p style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #D4AF37; color: #856404;">
                        <strong>Action Required:</strong> Please contact ${customer?.name || 'the customer'} at ${customer?.phone || 'their phone'} or ${customer?.email || 'their email'} within 24 hours to confirm the booking and discuss details.
                    </p>
                </div>
            `,
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

// Routes to serve HTML pages
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Index.html"));
});

app.get("/services", (req, res) => {
    res.sendFile(path.join(__dirname, "services.html"));
});

app.get("/checkout", (req, res) => {
    res.sendFile(path.join(__dirname, "checkout.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view your website`);
});
