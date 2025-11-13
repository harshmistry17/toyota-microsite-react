import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import qrcode from "qrcode"
import sharp from "sharp"
import path from "path"
import fs from "fs"
import puppeteer from "puppeteer"
import puppeteerCore from "puppeteer-core"
import chromium from "@sparticuz/chromium"
import { supabaseAdmin } from "@/lib/supabase"

async function generateTicketImage(name: string, uid: string): Promise<Buffer> {
  // Generate QR code
  const qrCodeDataUrl = await qrcode.toDataURL(uid, { width: 200, margin: 1 })
  
  // Load template image as base64
  const templatePath = path.join(process.cwd(), "public", "placeholder", "email-placeholder.png")
  const templateBuffer = fs.readFileSync(templatePath)
  const templateBase64 = `data:image/png;base64,${templateBuffer.toString('base64')}`
  
  // Load font as base64
  const fontPath = path.join(process.cwd(), "public", "fonts", "ToyotaType-Bold.ttf")
  const fontBuffer = fs.readFileSync(fontPath)
  const fontBase64 = fontBuffer.toString('base64')
  
  // Create HTML with the ticket
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @font-face {
          font-family: 'ToyotaType';
          src: url(data:font/truetype;base64,${fontBase64}) format('truetype');
          font-weight: bold;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          width: 694px;
          height: 1234px;
          position: relative;
          overflow: hidden;
        }
        
        .template {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
        }
        
        .name {
          position: absolute;
          top: 350px;
          left: 0;
          width: 100%;
          text-align: center;
          font-family: 'ToyotaType', Arial, sans-serif;
          font-size: 32px;
          font-weight: bold;
          color: #ffffff;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        
        .qr-code {
          position: absolute;
          top: 517px;
          left: 247px;
          width: 200px;
          height: 200px;
        }
      </style>
    </head>
    <body>
      <img src="${templateBase64}" class="template" />
      <div class="name">${name.toUpperCase()}</div>
      <img src="${qrCodeDataUrl}" class="qr-code" />
    </body>
    </html>
  `
  
  // Launch browser - use different config for local vs Vercel
  const isProduction = process.env.VERCEL === '1'
  
  let browser
  try {
    if (isProduction) {
      console.log("Launching Chromium on Vercel...")
      browser = await puppeteerCore.launch({
        args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      })
    } else {
      console.log("Launching Puppeteer locally...")
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    }
    
    console.log("Browser launched, creating page...")
    const page = await browser.newPage()
    await page.setViewport({ width: 694, height: 1234 })
    
    console.log("Setting page content...")
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 })
    
    // Wait a bit for fonts to load
    await page.waitForTimeout(1000)
    
    console.log("Taking screenshot...")
    const screenshot = await page.screenshot({ type: 'png' })
    
    console.log("Screenshot taken, closing browser...")
    await browser.close()
    
    return Buffer.from(screenshot)
  } catch (error) {
    console.error("Puppeteer error:", error)
    if (browser) {
      await browser.close().catch(() => {})
    }
    throw error
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
      console.log("Generating ticket for:", name)
      
      const finalImageBuffer = await generateTicketImage(name, uid)
      
      console.log("Ticket image generated successfully")

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

    // --- Send Email ---
    console.log("Setting up email transporter...")
    console.log("EMAIL_USER:", process.env.EMAIL_USER ? "Set" : "Missing")
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Set" : "Missing")
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    })

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

    console.log("Attempting to send email to:", email)
    try {
      const info = await transporter.sendMail(mailOptions)
      console.log("Email sent successfully to:", email)
      console.log("Message ID:", info.messageId)
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      throw new Error(`Failed to send email: ${emailError}`)
    }

    // --- Update database ---
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
