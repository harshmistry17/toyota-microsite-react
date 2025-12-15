# WATI WhatsApp Integration Guide

## Overview
This guide explains how to integrate WATI WhatsApp API to send automated messages after user registration using the "bengaluru" template.

## Integration Complete ✅

The following components have been implemented:

### 1. Environment Configuration
**File**: `.env`

Add your WATI credentials:
```env
WATI_API_ENDPOINT=https://live-mt-server.wati.io/445322
WATI_API_TOKEN=Bearer your_actual_jwt_token_here
```

**How to get these credentials:**
- Log into your WATI account
- Navigate to **Settings** → **API Docs**
- Copy your full instance URL (e.g., `https://live-mt-server.wati.io/445322`)
- Copy your Bearer token (include "Bearer " prefix or just the token)

**Note**: The code automatically handles both formats:
- Full URL or just domain: Both work
- Token with or without "Bearer " prefix: Both work

### 2. WATI Service Utility
**File**: `lib/wati.ts`

This utility provides two main functions:

#### `sendWatiTemplateMessage(params)`
Generic function to send any WATI template message.

**Parameters:**
```typescript
{
  whatsappNumber: string      // User's phone number
  templateName: string         // WATI template name (e.g., "bengaluru")
  parameters?: Array<{         // Template parameters
    name: string
    value: string
  }>
  broadcastName?: string       // Optional broadcast name
}
```

#### `sendRegistrationWhatsApp(name, mobile, ticketImageUrl)`
Helper function specifically for registration confirmation.

**Parameters:**
- `name`: User's name
- `mobile`: User's mobile number (10 digits or with country code)
- `ticketImageUrl`: Public URL of the generated ticket image with QR code

**Phone Number Format:**
- Accepts 10-digit Indian numbers (e.g., `9876543210`)
- Automatically adds country code `91` if missing
- Final format: `919876543210` (no + sign)

### 3. API Integration
**File**: `app/api/generate-ticket/route.ts`

The WhatsApp message is sent automatically when:
1. User completes registration
2. Ticket is generated
3. Email is sent

**Flow:**
```
User Registration → Generate Ticket → Send Email + WhatsApp (Parallel)
```

The integration sends:
- Email with ticket
- WhatsApp message using "bengaluru" template
- Updates `whatsapp_status` in database

### 4. Main Application Flow
**File**: `app/page.tsx`

The mobile number is now passed to the `/api/generate-ticket` endpoint along with other user details.

## WATI Template Configuration

### Bengaluru Template
Your "bengaluru" template structure:

**Template Components:**
1. **Campaign Title (Media)**: Image - Contains `{{image}}` parameter
2. **Body Text**: Contains `{{name}}` parameter

**Current Template Message:**
```
Hi {{name}},

Congratulations on winning your buddy pass.

We will be sharing an RSVP mail on 19th December, to confirm your attendance.

Warm regards,
Team Toyota

*Conditions apply
*Admission will be granted on a first-come, first-served basis, subject to capacity.*
```

**Template Image**: The `{{image}}` parameter displays the generated ticket with QR code

### Template Parameters
The code sends these parameters:
```javascript
[
  { name: "name", value: userName },
  { name: "image", value: ticketImageUrl }  // Public URL of generated ticket
]
```

**To customize**: Edit the `sendRegistrationWhatsApp` function in `lib/wati.ts`

## Testing

### Prerequisites
1. WATI account with API access
2. Approved WhatsApp Business Account
3. "bengaluru" template approved by WhatsApp
4. Valid test phone number

### Test Steps

1. **Update Environment Variables**
   ```bash
   # Edit .env file with your actual WATI credentials
   WATI_API_ENDPOINT=yourcompany.wati.io
   WATI_API_TOKEN=your_actual_bearer_token
   ```

2. **Restart Development Server**
   ```bash
   npm run dev
   ```

3. **Test Registration**
   - Navigate to your registration page
   - Fill in all details including mobile number
   - Submit the form
   - Check server logs for WhatsApp status

4. **Check Logs**
   Look for these console messages:
   ```
   Sending WATI WhatsApp message: { url, phone, template }
   WhatsApp message sent successfully to: [number]
   ```

5. **Verify in WATI Dashboard**
   - Log into WATI
   - Check **Conversations** for the sent message
   - Verify delivery status

### Common Issues

#### Issue 1: "WATI API credentials not configured"
**Solution**: Ensure `.env` has both `WATI_API_ENDPOINT` and `WATI_API_TOKEN` set

#### Issue 2: "Template not found"
**Solution**:
- Verify template name is exactly "bengaluru" (case-sensitive)
- Check template is approved in WATI dashboard
- Wait for WhatsApp approval if template is pending

#### Issue 3: "Invalid phone number"
**Solution**:
- Ensure phone number is valid Indian number
- Check number is registered on WhatsApp
- For international numbers, include country code

#### Issue 4: "Failed to send WhatsApp message"
**Solution**:
- Check WATI API token is valid and not expired
- Verify WATI account is active and has credits
- Check network connectivity to WATI servers

## API Endpoint Details

### WATI Send Template Message API

**Endpoint**: `POST https://{WATI_ENDPOINT}/api/v1/sendTemplateMessage?whatsappNumber={PHONE}`

**Headers**:
```
Authorization: Bearer {WATI_TOKEN}
Content-Type: application/json
```

**Request Body**:
```json
{
  "template_name": "bengaluru",
  "broadcast_name": "Toyota Bengaluru Registration",
  "parameters": [
    { "name": "name", "value": "John Doe" },
    { "name": "image", "value": "https://ozkbnimjuhaweigscdby.supabase.co/storage/v1/object/public/toyota-user-tickets/abc123.png" }
  ]
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

**Response** (Error):
```json
{
  "success": false,
  "message": "Error description"
}
```

## Database Updates

The integration automatically updates the `toyota_microsite_users` table:

- `whatsapp_status`: Set to `true` when message is sent successfully
- This allows tracking which users received WhatsApp notifications

## Customization

### Send Different Templates for Different Cities

Edit `lib/wati.ts` to use city-specific templates:

```typescript
export async function sendRegistrationWhatsApp(
  name: string,
  mobile: string,
  city: string
): Promise<WatiResponse> {
  // Determine template based on city
  let templateName = "default_template"

  if (city.toLowerCase() === "bengaluru") {
    templateName = "bengaluru"
  } else if (city.toLowerCase() === "chennai") {
    templateName = "chennai"
  } else if (city.toLowerCase() === "vijayawada") {
    templateName = "vijayawada"
  }

  const parameters: WatiTemplateParameter[] = [
    { name: "name", value: name },
    { name: "city", value: city }
  ]

  return sendWatiTemplateMessage({
    whatsappNumber: mobile,
    templateName,
    parameters,
    broadcastName: `Toyota ${city} Registration`
  })
}
```

### Add More Template Parameters

Update the parameters array in `sendRegistrationWhatsApp`:

```typescript
const parameters: WatiTemplateParameter[] = [
  { name: "name", value: name },
  { name: "city", value: city },
  { name: "event_date", value: "19th December 2025" },
  { name: "venue", value: "Bangalore Palace" }
]
```

**Important**: Template parameters must match what's configured in your WATI template!

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Rotate API tokens regularly** in WATI dashboard
3. **Use environment-specific tokens** (dev, staging, production)
4. **Monitor API usage** in WATI dashboard to detect anomalies
5. **Validate phone numbers** before sending (already implemented)

## Monitoring & Logs

The integration logs all activities:

**Success Logs**:
```
Sending WATI WhatsApp message: {...}
WATI WhatsApp message sent successfully: {...}
WhatsApp message sent successfully to: 919876543210
```

**Error Logs**:
```
WATI API credentials not configured
WATI API error: {...}
WhatsApp send failed: {...}
Failed to update whatsapp_status: {...}
```

Monitor these logs in production to ensure messages are being delivered.

## Support & Resources

- **WATI API Documentation**: https://docs.wati.io/reference/introduction
- **WATI Support**: Available in your WATI dashboard
- **WhatsApp Business Policy**: https://business.whatsapp.com/policy

## Summary

✅ **What's Implemented:**
- WATI WhatsApp API integration
- Automatic message sending after registration
- Phone number formatting and validation
- Database status tracking
- Error handling and logging
- Environment configuration

🔧 **What You Need to Do:**
1. Add WATI credentials to `.env` file
2. Configure "bengaluru" template in WATI dashboard
3. Get template approved by WhatsApp
4. Test with real registration
5. Monitor logs and delivery status

📝 **Files Modified:**
- `.env` - Added WATI configuration
- `lib/wati.ts` - Created WATI service utility
- `app/api/generate-ticket/route.ts` - Integrated WhatsApp sending
- `app/page.tsx` - Pass mobile number to API

The integration is complete and ready for testing once you configure your WATI credentials!
