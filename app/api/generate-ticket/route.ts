


import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import qrcode from "qrcode"
import sharp from "sharp"
import path from "path"
import { supabaseAdmin } from "@/lib/supabase"

async function getTemplateBuffer() {
  const templatePath = path.join(process.cwd(), "public", "placeholder", "email-placeholder.png")
  try {
    return await sharp(templatePath).toBuffer()
  } catch (error) {
    console.error("Failed to load email template image:", error)
    throw new Error("Failed to load email template image at: " + templatePath)
  }
}

export async function POST(req: Request) {
  try {
    const { uid, name, email, city } = await req.json()

    if (!uid || !name || !email || !city) {
      return NextResponse.json(
        { success: false, message: "Missing required fields (uid, name, email, or city)." },
        { status: 400 }
      )
    }

    let publicImageUrl = ""

    // 🟢 CASE 1: Vijayawada → Use Supabase hosted image
    if (city.toLowerCase().trim() === "vijayawada") {
      publicImageUrl = "https://ozkbnimjuhaweigscdby.supabase.co/storage/v1/object/public/toyota-user-tickets/default/vijayawada-email.png"
      // publicImageUrl = "https://ozkbnimjuhaweigscdby.supabase.co/storage/v1/object/public/toyota-user-tickets/default/Emailer.png" // landscape
    }

    // 🟡 CASE 2: Other cities → Generate ticket
    else {
      const qrCodeBuffer = await qrcode.toBuffer(uid, { type: "png", width: 170, margin: 1 })
      const templateBuffer = await getTemplateBuffer()

      const finalImageBuffer = await sharp(templateBuffer)
        .composite([
          {
            input: Buffer.from(`
              <svg width="694" height="80">
                <text x="50%" y="50%"
                  dominant-baseline="middle"
                  text-anchor="middle"
                  style="font-size: 70px; font-weight: bold; fill: #fff; font-family: sans-serif; text-transform: uppercase;">
                  ${name.toUpperCase()}
                </text>
              </svg>
            `),
            top: 350,
            left: 0,
          },
          {
            input: await sharp(qrCodeBuffer).resize({ width: 200, height: 200 }).toBuffer(),
            top: 517,
            left: 247,
          },
        ])
        .png()
        .toBuffer()

      const imagePath = `/${uid}-${Date.now()}.png`

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("toyota-user-tickets")
        .upload(imagePath, finalImageBuffer, { contentType: "image/png", cacheControl: "3600" })

      if (uploadError) throw new Error(`Supabase upload error: ${uploadError.message}`)

      const { data: urlData } = supabaseAdmin.storage
        .from("toyota-user-tickets")
        .getPublicUrl(uploadData.path)

      publicImageUrl = urlData.publicUrl
    }

    // --- 5. Send Email with unified message ---
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    })

    const mailOptions = {
      from: `"Toyota DrumTao" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Registration Confirmation 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: left; color: #333;">
          <h1 style="color: #000;">Hi ${name},</h1>
          <p style="font-size: 16px; line-height: 1.5;">
            Your registration has been successfully completed.<br><br>
            In the meantime, keep an eye on your inbox and WhatsApp for further updates on your admission status and event details.
<br><br>
We’ll be sharing an RSVP email prior the event to confirm your 
attendance.          </p>
          <div style="margin: 20px 0;">
            <img 
              src="${publicImageUrl}" 
              alt="Your Event Ticket" 
              style="max-width: 100%; height: auto; border-radius: 8px;" 
            />
          </div>
          <p style="font-size: 16px; margin-top: 20px;">
            Warm regards,<br/>
            <strong>Toyota Event Team</strong>
          </p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)

    // --- 6. Update database ---
    const { error: dbError } = await supabaseAdmin
      .from("toyota_microsite_users")
      .update({ image_link: publicImageUrl, email_status: true })
      .eq("uid", uid)

    if (dbError) console.error("Supabase DB update error:", dbError)

    return NextResponse.json({ success: true, message: "Ticket generated and email sent!" })
  } catch (error) {
    console.error("Full error in /api/generate-ticket:", error)
    return NextResponse.json(
      { success: false, message: "Failed to generate ticket or send email." },
      { status: 500 }
    )
  }
}
