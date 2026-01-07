import { google } from "googleapis";

export const handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    try {
        const { name, email, phone, message } = JSON.parse(event.body);

        // Validate required fields
        if (!name || !email || !message) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    error: "Missing required fields"
                }),
            };
        }

        // Configure OAuth2 client
        const oAuth2Client = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
        );

        oAuth2Client.setCredentials({
            refresh_token: process.env.GMAIL_REFRESH_TOKEN,
        });

        const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

        // Create email message
        const rawMessage = [
            `From: "Iconic Events" <${process.env.GMAIL_USER}>`,
            `To: ${process.env.RECEIVER_EMAIL}`,
            "Subject: New Event Inquiry - Contact Form Submission",
            "Content-Type: text/html; charset=utf-8",
            "",
            `<h2>New Contact Form Submission</h2>`,
            `<p><strong>Name:</strong> ${name}</p>`,
            `<p><strong>Email:</strong> ${email}</p>`,
            `<p><strong>Phone:</strong> ${phone || 'N/A'}</p>`,
            `<p><strong>Message:</strong><br/>${message}</p>`,
            "",
            `<hr>`,
            `<p style="color: #666; font-size: 12px;">This email was sent from the Iconic Events contact form.</p>`,
        ].join("\n");

        // Encode message in base64url format
        const encodedMessage = Buffer
            .from(rawMessage)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        // Send email via Gmail API
        await gmail.users.messages.send({
            userId: "me",
            requestBody: { raw: encodedMessage },
        });

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ success: true }),
        };
    } catch (err) {
        console.error("Error sending email:", err);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                success: false,
                error: "Failed to send email"
            }),
        };
    }
};
