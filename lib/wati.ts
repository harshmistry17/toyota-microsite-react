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
