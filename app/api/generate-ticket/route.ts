import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import qrcode from "qrcode";
import sharp from "sharp";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase";

// --- 1️⃣ Load the ticket template ---
async function getTemplateBuffer() {
  const templatePath = path.join(process.cwd(), "public", "placeholder", "email-placeholder.png");
  try {
    return await sharp(templatePath).toBuffer();
  } catch (error) {
    console.error("Failed to load email template image:", error);
    throw new Error("Failed to load email template image at: " + templatePath);
  }
}

// --- 2️⃣ Create SVG text (no fonts / no TTF required) ---
function createTextSvg(text: string) {
  return Buffer.from(`
    <svg width="1080" height="300">
      <style>
        .name {
          fill: #ffffff;
          font-size: 64px;
          font-weight: 700;
          font-family: sans-serif;
          text-anchor: middle;
          dominant-baseline: middle;
          text-transform: uppercase;
        }
      </style>
      <text x="540" y="150" class="name">${text}</text>
    </svg>
  `);
}

export async function POST(req: Request) {
  try {
    const { uid, name, email, city } = await req.json();
    console.log("Received request:", { uid, name, email, city });

    if (!uid || !name || !email || !city) {
      return NextResponse.json(
        { success: false, message: "Missing required fields (uid, name, email, or city)." },
        { status: 400 }
      );
    }

    let publicImageUrl = "";

    // 🟢 CASE 1: Vijayawada → Use pre-made image
    if (city.toLowerCase().trim() === "vijayawada") {
      publicImageUrl =
        "https://ozkbnimjuhaweigscdby.supabase.co/storage/v1/object/public/toyota-user-tickets/default/vijayawada-email.png";
    }

    // 🟡 CASE 2: Generate new ticket (SVG text + QR)
    else {
      console.log("Generating ticket for:", name);

      const qrCodeBuffer = await qrcode.toBuffer(uid, {
        type: "png",
        width: 170,
        margin: 1,
      });
      const templateBuffer = await getTemplateBuffer();

      // SVG text overlay (no font dependency)
      const textSvgBuffer = createTextSvg(name);
      console.log("SVG text created successfully");

      const finalImageBuffer = await sharp(templateBuffer)
        .composite([
          // name text
          { input: textSvgBuffer, top: 350, left: 0 },
          // QR code
          {
            input: await sharp(qrCodeBuffer)
              .resize({ width: 200, height: 200 })
              .toBuffer(),
            top: 517,
            left: 247,
          },
        ])
        .png()
        .toBuffer();

      console.log("Final ticket composed successfully");

      const imagePath = `/${uid}-${Date.now()}.png`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("toyota-user-tickets")
        .upload(imagePath, finalImageBuffer, {
          contentType: "image/png",
          cacheControl: "3600",
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw new Error(`Supabase upload error: ${uploadError.message}`);
      }

      const { data: urlData } = supabaseAdmin.storage
        .from("toyota-user-tickets")
        .getPublicUrl(uploadData.path);

      publicImageUrl = urlData.publicUrl;
      console.log("Ticket uploaded successfully:", publicImageUrl);
    }

    // --- 5️⃣ Send Email ---
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const normalizedCity = city.toLowerCase().trim();
    let emailBody = "";

    if (normalizedCity === "chennai") {
      emailBody = `
        <div style="font-family:sans-serif;padding:20px;text-align:left;color:#333;">
          <h1 style="color:#000;">Hi ${name},</h1>
          <p style="font-size:16px;line-height:1.5;">
            Congratulations on winning your buddy pass.<br><br>
            We will be sharing an RSVP mail on 18th November to confirm your attendance.
          </p>
          <div style="margin:20px 0;">
            <img src="${publicImageUrl}" alt="Your Event Ticket"
                 style="max-width:100%;height:auto;border-radius:8px;"/>
          </div>
          <p style="font-size:16px;margin-top:20px;">Warm regards</p>
        </div>`;
    } else if (normalizedCity === "vijayawada") {
      emailBody = `
        <div style="font-family:sans-serif;padding:20px;text-align:left;color:#333;">
          <h1 style="color:#000;">Hi ${name},</h1>
          <p style="font-size:16px;line-height:1.5;">
            Your registration has been successfully completed.<br><br>
            We will be sharing an RSVP mail on 16th November to confirm your attendance.
          </p>
          <div style="margin:20px 0;">
            <img src="${publicImageUrl}" alt="Your Event Ticket"
                 style="max-width:100%;height:auto;border-radius:8px;"/>
          </div>
          <p style="font-size:16px;margin-top:20px;">Warm Regards,</p>
        </div>`;
    } else {
      emailBody = `
        <div style="font-family:sans-serif;padding:20px;text-align:left;color:#333;">
          <h1 style="color:#000;">Hi ${name},</h1>
          <p style="font-size:16px;line-height:1.5;">
            Your registration has been successfully completed.<br><br>
            Keep an eye on your inbox and WhatsApp for further updates about admission status and event details.<br><br>
            We'll be sharing an RSVP email prior to the event to confirm your attendance.
          </p>
          <div style="margin:20px 0;">
            <img src="${publicImageUrl}" alt="Your Event Ticket"
                 style="max-width:100%;height:auto;border-radius:8px;"/>
          </div>
          <p style="font-size:16px;margin-top:20px;">Warm regards,<br/><strong>Toyota Event Team</strong></p>
        </div>`;
    }

    await transporter.sendMail({
      from: `"Toyota DrumTao" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Registration Confirmation 🎉",
      html: emailBody,
    });

    console.log("Email sent successfully to:", email);

    // --- 6️⃣ Update database ---
    const { error: dbError } = await supabaseAdmin
      .from("toyota_microsite_users")
      .update({ image_link: publicImageUrl, email_status: true })
      .eq("uid", uid);

    if (dbError) console.error("Supabase DB update error:", dbError);

    return NextResponse.json({ success: true, message: "Ticket generated and email sent!" });
  } catch (error) {
    console.error("Full error in /api/generate-ticket:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate ticket or send email.", error: String(error) },
      { status: 500 }
    );
  }
}
