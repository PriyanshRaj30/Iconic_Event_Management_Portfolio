# Gmail API Setup Guide

This guide will walk you through setting up Gmail API credentials for the Netlify serverless functions.

## Prerequisites

- A Gmail account
- Google Cloud Console access

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a Project** → **New Project**
3. Enter project name (e.g., "Iconic Events Email")
4. Click **Create**

## Step 2: Enable Gmail API

1. In your project dashboard, navigate to **APIs & Services** → **Library**
2. Search for "Gmail API"
3. Click on **Gmail API**
4. Click **Enable**

## Step 3: Create OAuth2 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: "Iconic Events"
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Skip scopes (click **Save and Continue**)
   - Add yourself as a test user
   - Click **Save and Continue**
4. Back on the credentials page:
   - Application type: **Web application**
   - Name: "Iconic Events Gmail Client"
   - Authorized redirect URIs: Add `https://developers.google.com/oauthplayground`
   - Click **Create**
5. **Important**: Copy and save:
   - **Client ID**
   - **Client Secret**

## Step 4: Generate Refresh Token

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click the **Settings** icon (⚙️) in the top right
3. Check **"Use your own OAuth credentials"**
4. Enter:
   - **OAuth Client ID**: Your Client ID from Step 3
   - **OAuth Client secret**: Your Client Secret from Step 3
5. In the left panel under **Step 1**, scroll to **Gmail API v1**
6. Select: `https://www.googleapis.com/auth/gmail.send`
7. Click **Authorize APIs**
8. Sign in with your Gmail account
9. Click **Allow** to grant permissions
10. In **Step 2**, click **Exchange authorization code for tokens**
11. **Important**: Copy and save the **Refresh token**

## Step 5: Configure Netlify Environment Variables

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add the following variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `GMAIL_CLIENT_ID` | Your Client ID | From Step 3 |
| `GMAIL_CLIENT_SECRET` | Your Client Secret | From Step 3 |
| `GMAIL_REFRESH_TOKEN` | Your Refresh Token | From Step 4 |
| `GMAIL_USER` | your-email@gmail.com | The Gmail address you used |
| `RECEIVER_EMAIL` | recipient@example.com | Where contact forms are sent |

5. Click **Save**

## Step 6: Local Development (Optional)

For local testing with Netlify CLI:

1. Create a `.env` file in your project root (already gitignored)
2. Add the same environment variables:

```bash
GMAIL_CLIENT_ID=your_client_id_here
GMAIL_CLIENT_SECRET=your_client_secret_here
GMAIL_REFRESH_TOKEN=your_refresh_token_here
GMAIL_USER=your-email@gmail.com
RECEIVER_EMAIL=recipient@example.com
```

3. Run `netlify dev` to test locally

## Troubleshooting

### "Invalid Credentials" Error
- Double-check all environment variables are correctly set in Netlify
- Ensure there are no extra spaces or quotes in the values
- Verify the refresh token hasn't expired (regenerate if needed)

### "Access Denied" Error
- Make sure Gmail API is enabled in Google Cloud Console
- Verify the OAuth consent screen is properly configured
- Check that the Gmail account has granted permissions

### Emails Not Sending
- Check Netlify function logs for error messages
- Verify `GMAIL_USER` matches the account used for OAuth
- Ensure `RECEIVER_EMAIL` is a valid email address

## Security Notes

- **Never commit `.env` files** to version control
- Keep your Client Secret and Refresh Token private
- Rotate credentials periodically for security
- Use Netlify's environment variables for production (never hardcode)

## Need Help?

If you encounter issues:
1. Check Netlify function logs for detailed error messages
2. Verify all steps were completed correctly
3. Ensure the Gmail account being used has no 2FA blocking API access
4. Try regenerating the refresh token if issues persist
