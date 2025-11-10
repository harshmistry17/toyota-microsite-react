import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { uid, name, email, city } = await req.json()

    if (!uid || !name || !email || !city) {
      return NextResponse.json(
        { success: false, message: "Missing required fields (uid, name, email, or city)." },
        { status: 400 }
      )
    }

    // Get city config to fetch event details
    const { data: cityConfig, error: cityError } = await supabaseAdmin
      .from("toyota_microsite_city_config")
      .select("*")
      .eq("city_name", city)
      .single()

    if (cityError || !cityConfig) {
      return NextResponse.json(
        { success: false, message: `City configuration not found for ${city}.` },
        { status: 404 }
      )
    }

    // Format event date
   const eventDate = cityConfig.event_date
  ? (() => {
      const date = new Date(cityConfig.event_date)
      const day = date.getDate()
      const month = date.toLocaleString('en-US', { month: 'long' })

      // Helper to add ordinal suffix
      const getOrdinal = (n) => {
        if (n > 3 && n < 21) return 'th'
        switch (n % 10) {
          case 1: return 'st'
          case 2: return 'nd'
          case 3: return 'rd'
          default: return 'th'
        }
      }

      return `${day}${getOrdinal(day)} ${month}`
    })()
  : "TBA"

    // Create RSVP URLs with base URL from environment
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000" || "https://toyotadrumtao.com/"
    const rsvpYesUrl = `${baseUrl}/api/rsvp-confirm?uid=${uid}&response=yes`
    const rsvpNoUrl = `${baseUrl}/api/rsvp-confirm?uid=${uid}&response=no`

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
    })

    const mailOptions = {
      from: `"Toyota DrumTao" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Please Confirm Your Attendance - TOYOTA PRESENTS DRUM TAO",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; color: #333;">

          <p style="font-size: 16px; line-height: 1.6;">
            Hi <strong>${name}</strong>,
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            We're excited to have you join us for <strong>TOYOTA PRESENTS DRUM TAO</strong> on
            <strong>${eventDate}</strong> at <strong>${cityConfig.venue || "TBA"}</strong>.
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            Kindly confirm your attendance by clicking one of the buttons below:
          </p>

          <div style="text-align: left; margin: 30px 0;">
            <a href="${rsvpYesUrl}"
               style="display: inline-block; background-color: #28a745; color: white; padding: 15px 50px;
                      text-decoration: none; font-size: 16px; font-weight: bold;
                      margin: 10px;">
              YES
            </a>

            <a href="${rsvpNoUrl}"
               style="display: inline-block; background-color: #dc3545; color: white; padding: 15px 40px;
                      text-decoration: none; font-size: 16px; font-weight: bold;
                      margin: 10px;">
              NO
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.6; color: #666; margin-top: 30px;">
            We look forward to seeing you at the event!
          </p>

          <p style="font-size: 14px; margin-top: 20px;">
            Warm regards,<br/>
            <strong>Toyota Event Team</strong>
          </p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: "RSVP email sent successfully!"
    })
  } catch (error) {
    console.error("Error in /api/send-rsvp:", error)
    return NextResponse.json(
      { success: false, message: "Failed to send RSVP email." },
      { status: 500 }
    )
  }
}
