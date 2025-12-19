import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { sendBulkRsvpWhatsApp } from "@/lib/wati"

export async function POST(req: Request) {
  try {
    const { recipients } = await req.json()

    // recipients should be array of { uid, mobile }
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, message: "No recipients provided" },
        { status: 400 }
      )
    }

    // Filter out recipients without mobile numbers
    const validRecipients = recipients.filter(
      (r: { uid: string; mobile: string | null }) => r.mobile && r.uid
    )

    if (validRecipients.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid recipients with mobile numbers" },
        { status: 400 }
      )
    }

    console.log(`Sending bulk RSVP WhatsApp to ${validRecipients.length} recipients...`)

    // Send bulk WhatsApp via WATI
    const result = await sendBulkRsvpWhatsApp(validRecipients)

    if (result.success) {
      // Update rsvp_whatsapp status for all successfully sent recipients
      const uids = validRecipients.map((r: { uid: string }) => r.uid)

      console.log(`Updating rsvp_whatsapp for UIDs:`, uids)

      const { data: updateData, error: updateError } = await supabaseAdmin
        .from("toyota_microsite_users")
        .update({ rsvp_whatsapp: true })
        .in("uid", uids)
        .select("uid")

      if (updateError) {
        console.error("Failed to update rsvp_whatsapp status:", updateError)
        return NextResponse.json({
          success: true,
          message: `${result.message}, but failed to update database status`,
          totalSent: result.totalSent,
          totalFailed: result.totalFailed
        })
      }

      console.log(`Updated rsvp_whatsapp for ${updateData?.length || 0} users`)

      return NextResponse.json({
        success: true,
        message: result.message,
        totalSent: result.totalSent,
        totalFailed: result.totalFailed,
        dbUpdated: updateData?.length || 0
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.error,
        totalSent: result.totalSent,
        totalFailed: result.totalFailed
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Error in bulk RSVP WhatsApp:", error)
    return NextResponse.json(
      { success: false, message: "Failed to send bulk RSVP WhatsApp" },
      { status: 500 }
    )
  }
}
