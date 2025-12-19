/**
 * WATI WhatsApp API Service
 * This service handles sending WhatsApp template messages via WATI API
 */

interface WatiTemplateParameter {
  name: string
  value: string
}

interface SendTemplateMessageParams {
  whatsappNumber: string
  templateName: string
  parameters?: WatiTemplateParameter[]
  broadcastName?: string
}

interface WatiResponse {
  success: boolean
  message?: string
  error?: string
}

/**
 * Send a WhatsApp template message using WATI API
 *
 * @param params - Template message parameters
 * @returns Promise with success status and message
 */
export async function sendWatiTemplateMessage(
  params: SendTemplateMessageParams
): Promise<WatiResponse> {
  const { whatsappNumber, templateName, parameters = [], broadcastName } = params

  // Validate environment variables
  const watiEndpoint = process.env.WATI_API_ENDPOINT
  const watiToken = process.env.WATI_API_TOKEN

  if (!watiEndpoint || !watiToken) {
    console.error("WATI API credentials not configured")
    return {
      success: false,
      error: "WATI API credentials not configured in environment variables"
    }
  }

  // Format phone number (remove any non-digit characters and ensure it has country code)
  const formattedPhone = formatPhoneNumber(whatsappNumber)

  try {
    // Construct the API URL with whatsappNumber as query parameter
    // Handle both full URLs and domain-only endpoints
    const baseUrl = watiEndpoint.startsWith('http') ? watiEndpoint : `https://${watiEndpoint}`
    const url = `${baseUrl}/api/v1/sendTemplateMessage?whatsappNumber=${formattedPhone}`

    // Prepare request body
    const requestBody: {
      template_name: string
      broadcast_name: string
      parameters?: WatiTemplateParameter[]
    } = {
      template_name: templateName,
      broadcast_name: broadcastName || "Toyota Registration Notification"
    }

    // Add parameters only if they exist
    if (parameters.length > 0) {
      requestBody.parameters = parameters
    }

    console.log("Sending WATI WhatsApp message:", {
      url,
      phone: formattedPhone,
      template: templateName
    })

    // Check if token already includes "Bearer" prefix
    const authHeader = watiToken.startsWith('Bearer ') ? watiToken : `Bearer ${watiToken}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("WATI API error:", responseData)
      return {
        success: false,
        error: responseData.message || `HTTP ${response.status}: ${response.statusText}`
      }
    }

    console.log("WATI WhatsApp message sent successfully:", responseData)
    return {
      success: true,
      message: "WhatsApp message sent successfully"
    }

  } catch (error) {
    console.error("Error sending WATI WhatsApp message:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }
  }
}

/**
 * Format phone number for WATI API
 * WATI expects phone numbers in international format without + sign
 * Example: 919876543210 for Indian number
 *
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "")

  // If number doesn't start with country code, assume India (+91)
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned
  }

  return cleaned
}

/**
 * Send registration confirmation WhatsApp message
 * This is a helper function specifically for registration flow
 *
 * @param name - User's name
 * @param mobile - User's mobile number
 * @param ticketImageUrl - URL of the generated ticket image
 * @returns Promise with success status
 */
export async function sendRegistrationWhatsApp(
  name: string,
  mobile: string,
  ticketImageUrl: string
): Promise<WatiResponse> {
  // Parameters for the bengaluru template
  // Template uses {{name}} in body text and {{image}} for the ticket
  const parameters: WatiTemplateParameter[] = [
    { name: "name", value: name },
    { name: "image", value: ticketImageUrl }
  ]

  return sendWatiTemplateMessage({
    whatsappNumber: mobile,
    templateName: "bengaluru",
    parameters,
    broadcastName: "Toyota Bengaluru Registration"
  })
}

/**
 * Send RSVP WhatsApp message with Yes/No buttons
 * Template: bengaluru_rsvp
 *
 * Button URLs format:
 * - Button 1 (Yes): https://toyotadrumtao.com/{{1}} -> api/rsvp-confirm?uid=xxx&response=yes
 * - Button 2 (No):  https://toyotadrumtao.com/{{2}} -> api/rsvp-confirm?uid=xxx&response=no
 *
 * @param mobile - User's mobile number
 * @param uid - User's unique ID for RSVP tracking
 * @returns Promise with success status
 */
export async function sendRsvpWhatsApp(
  mobile: string,
  uid: string
): Promise<WatiResponse> {
  // Parameters for the bengaluru_rsvp template
  // {{1}} = Yes button URL path (after base domain)
  // {{2}} = No button URL path (after base domain)
  const parameters: WatiTemplateParameter[] = [
    { name: "1", value: `api/rsvp-confirm?uid=${uid}&response=yes` },
    { name: "2", value: `api/rsvp-confirm?uid=${uid}&response=no` }
  ]

  return sendWatiTemplateMessage({
    whatsappNumber: mobile,
    templateName: "bengaluru_rsvp",
    parameters,
    broadcastName: "Toyota Bengaluru RSVP"
  })
}

/**
 * Bulk RSVP recipient interface
 */
interface BulkRsvpRecipient {
  mobile: string
  uid: string
}

/**
 * Bulk RSVP response interface
 */
interface BulkRsvpResponse {
  success: boolean
  totalSent: number
  totalFailed: number
  message?: string
  error?: string
}

/**
 * Send bulk RSVP WhatsApp messages using WATI's bulk API
 * Template: bengaluru_rsvp
 *
 * @param recipients - Array of {mobile, uid} objects
 * @returns Promise with bulk send results
 */
export async function sendBulkRsvpWhatsApp(
  recipients: BulkRsvpRecipient[]
): Promise<BulkRsvpResponse> {
  const watiEndpoint = process.env.WATI_API_ENDPOINT
  const watiToken = process.env.WATI_API_TOKEN

  if (!watiEndpoint || !watiToken) {
    return {
      success: false,
      totalSent: 0,
      totalFailed: recipients.length,
      error: "WATI API credentials not configured"
    }
  }

  if (recipients.length === 0) {
    return {
      success: false,
      totalSent: 0,
      totalFailed: 0,
      error: "No recipients provided"
    }
  }

  try {
    const baseUrl = watiEndpoint.startsWith('http') ? watiEndpoint : `https://${watiEndpoint}`
    const url = `${baseUrl}/api/v1/sendTemplateMessages`

    // Build receivers array with personalized RSVP links for each user
    const receivers = recipients.map(recipient => ({
      whatsappNumber: formatPhoneNumber(recipient.mobile),
      customParams: [
        { name: "1", value: `api/rsvp-confirm?uid=${recipient.uid}&response=yes` },
        { name: "2", value: `api/rsvp-confirm?uid=${recipient.uid}&response=no` }
      ]
    }))

    const requestBody = {
      template_name: "bengaluru_rsvp",
      broadcast_name: `Toyota RSVP Bulk ${new Date().toISOString().split('T')[0]}`,
      receivers
    }

    console.log(`Sending bulk RSVP WhatsApp to ${recipients.length} recipients...`)

    const authHeader = watiToken.startsWith('Bearer ') ? watiToken : `Bearer ${watiToken}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("WATI Bulk API error:", responseData)
      return {
        success: false,
        totalSent: 0,
        totalFailed: recipients.length,
        error: responseData.message || `HTTP ${response.status}: ${response.statusText}`
      }
    }

    console.log("WATI Bulk RSVP sent successfully:", responseData)
    return {
      success: true,
      totalSent: recipients.length,
      totalFailed: 0,
      message: `Successfully queued ${recipients.length} RSVP WhatsApp messages`
    }

  } catch (error) {
    console.error("Error sending bulk RSVP WhatsApp:", error)
    return {
      success: false,
      totalSent: 0,
      totalFailed: recipients.length,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }
  }
}
