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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://toyotadrumtao.com"
    const rsvpYesUrl = `${baseUrl}/api/rsvp-confirm?uid=${uid}&response=yes`
    const rsvpNoUrl = `${baseUrl}/api/rsvp-confirm?uid=${uid}&response=no`

    // Send Email
    const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
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
            We're thrilled to have you join us for <strong>TOYOTA Presents DRUM TAO</strong> on
            <strong>${eventDate}</strong> at <strong>${cityConfig.venue || "TBA"}</strong>.
          </p>

          <p style="font-size: 16px; line-height: 1.6;">
            Please confirm your attendance by clicking the RSVP link below: 👉
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

          <p style="font-size: 14px; line-height: 1.6; color: #dc3545; font-weight: bold; margin-top: 20px;">
            *Please note: Admission will be granted on a first-come, first-served basis, subject to capacity.
          </p>

          <div style="margin-top: 25px;">
            <p style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Important Information:</p>
            <ul style="font-size: 14px; line-height: 1.8; padding-left: 20px;">
              <li>Each QR code grants entry for 2 people.</li>
              <li>Visit the Box Office to collect your wristbands.</li>
            </ul>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
            <p style="font-size: 14px; line-height: 1.6; margin: 0;">
              ⚠️ <strong>Do not share your QR code.</strong> Once scanned, it becomes invalid, and entry will be granted only to the first person who uses it.
              We are not responsible for any misuse or theft of QR codes.
            </p>
            <p style="font-size: 14px; line-height: 1.6; margin: 10px 0 0 0;">
              A valid photo ID must be presented when collecting your wristbands.
            </p>
          </div>

          <p style="font-size: 14px; line-height: 1.6; margin-top: 25px;">
            We look forward to seeing you soon!
          </p>

          <p style="font-size: 14px; margin-top: 20px;">
            Warm regards,<br/>
            <strong>Toyota Event Team</strong>
          </p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from("toyota_microsite_users")
      .select("rsvp_status")
      .eq("uid", uid)
      .single()

    if (existingUserError) {
      throw existingUserError
    }

    const alreadyConfirmed =
      existingUser?.rsvp_status === "confirmed" || existingUser?.rsvp_status === true

    if (!alreadyConfirmed) {
      const { error: statusUpdateError } = await supabaseAdmin
        .from("toyota_microsite_users")
        .update({ rsvp_status: "sent" })
        .eq("uid", uid)

      if (statusUpdateError) {
        throw statusUpdateError
      }
    }

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
