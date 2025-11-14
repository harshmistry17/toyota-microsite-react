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

    console.log("Received request:", { uid, name, email, city })

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
    }

    // 🟡 CASE 2: Other cities → Generate ticket
    else {
      console.log("Generating ticket for user:", uid)
      
      const qrCodeBuffer = await qrcode.toBuffer(uid, { type: "png", width: 170, margin: 1 })
      const templateBuffer = await getTemplateBuffer()
      
      // Get template metadata to ensure proper sizing
      const templateMetadata = await sharp(templateBuffer).metadata()
      const templateWidth = templateMetadata.width || 694
      const templateHeight = templateMetadata.height || 800
      
      console.log("Template dimensions:", templateWidth, "x", templateHeight)
      
      // Resize and prepare QR code
      const resizedQrBuffer = await sharp(qrCodeBuffer)
        .resize({ width: 200, height: 200 })
        .toBuffer()
      
      const qrMetadata = await sharp(resizedQrBuffer).metadata()
      console.log("QR code dimensions:", qrMetadata.width, "x", qrMetadata.height)

      // Validate positioning
      const qrTop = 517
      const qrLeft = 247

      console.log("QR will be placed at:", { top: qrTop, left: qrLeft })
      console.log("QR bounds:", { 
        right: qrLeft + (qrMetadata.width || 0), 
        bottom: qrTop + (qrMetadata.height || 0) 
      })

      // Check if QR code will fit
      if (qrLeft + (qrMetadata.width || 0) > templateWidth) {
        throw new Error(`QR code position exceeds template width`)
      }
      if (qrTop + (qrMetadata.height || 0) > templateHeight) {
        throw new Error(`QR code position exceeds template height`)
      }

      const finalImageBuffer = await sharp(templateBuffer)
        .composite([
          {
            input: resizedQrBuffer,
            top: qrTop,
            left: qrLeft,
          },
        ])
        .png()
        .toBuffer()

      console.log("Final image buffer created")

      const imagePath = `/${uid}-${Date.now()}.png`

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("toyota-user-tickets")
        .upload(imagePath, finalImageBuffer, { contentType: "image/png", cacheControl: "3600" })

      if (uploadError) {
        console.error("Supabase upload error:", uploadError)
        throw new Error(`Supabase upload error: ${uploadError.message}`)
      }

      const { data: urlData } = supabaseAdmin.storage
        .from("toyota-user-tickets")
        .getPublicUrl(uploadData.path)

      publicImageUrl = urlData.publicUrl
      console.log("Image uploaded successfully:", publicImageUrl)
    }

    // --- 5. Send Email with city-specific message ---
    const transporter = nodemailer.createTransport({
       host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
    })

    // Define city-specific email bodies
    let emailBody = ""
    const normalizedCity = city.toLowerCase().trim()

    if (normalizedCity === "chennai") {
      emailBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: left; color: #333;">
          <h1 style="color: #000;">Hi ${name},</h1>
          <p style="font-size: 16px; line-height: 1.5;">
            Congratulations on winning your buddy pass.<br><br>
            We will be sharing an RSVP mail on 18th November, to confirm your attendance.
          </p>
          <div style="margin: 20px 0;">
            <img
              src="${publicImageUrl}"
              alt="Your Event Ticket"
              style="max-width: 100%; height: auto; border-radius: 8px;"
            />
          </div>
          <p style="font-size: 16px; margin-top: 20px;">
            Warm regards
          </p>
        </div>
      `
    } else if (normalizedCity === "vijayawada") {
      emailBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: left; color: #333;">
          <h1 style="color: #000;">Hi ${name},</h1>
          <p style="font-size: 16px; line-height: 1.5;">
            Your registration has been successfully completed.<br><br>
            We will be sharing an RSVP mail on 16th November, to confirm your attendance.
          </p>
          <div style="margin: 20px 0;">
            <img
              src="${publicImageUrl}"
              alt="Your Event Ticket"
              style="max-width: 100%; height: auto; border-radius: 8px;"
            />
          </div>
          <p style="font-size: 16px; margin-top: 20px;">
            Warm Regards,
          </p>
        </div>
      `
    } else {
      // Default body for other cities
      emailBody = `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: left; color: #333;">
          <h1 style="color: #000;">Hi ${name},</h1>
          <p style="font-size: 16px; line-height: 1.5;">
            Your registration has been successfully completed.<br><br>
            In the meantime, keep an eye on your inbox and WhatsApp for further updates on your admission status and event details.
            <br><br>
            We'll be sharing an RSVP email prior the event to confirm your attendance.
          </p>
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
      `
    }

    const mailOptions = {
      from: `"Toyota DrumTao" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Registration Confirmation 🎉",
      html: emailBody,
    }

    await transporter.sendMail(mailOptions)
    console.log("Email sent successfully to:", email)

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
      { success: false, message: "Failed to generate ticket or send email.", error: String(error) },
      { status: 500 }
    )
  }
}