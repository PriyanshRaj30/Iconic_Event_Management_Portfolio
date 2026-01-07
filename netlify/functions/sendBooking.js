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
        const { customer, services, total } = JSON.parse(event.body);

        // Validate required fields
        if (!customer || !services || !total) {
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

        // Create service list HTML
        const servicesList = services.map(service => `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 12px;">${service.category}</td>
        <td style="padding: 12px;">${service.name}</td>
        <td style="padding: 12px; text-align: right;">₹${service.price.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

        // Create formatted HTML email
        const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D4AF37; border-bottom: 3px solid #D4AF37; padding-bottom: 10px;">
          🎉 New Service Booking Request
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
    `;

        // Create email message
        const rawMessage = [
            `From: "Iconic Events" <${process.env.GMAIL_USER}>`,
            `To: ${process.env.RECEIVER_EMAIL}`,
            "Subject: 🎉 New Service Booking Request",
            "Content-Type: text/html; charset=utf-8",
            "",
            emailHtml,
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
        console.error("Error sending booking email:", err);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                success: false,
                error: "Failed to send booking email"
            }),
        };
    }
};
