import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const uid = searchParams.get("uid")
    const response = searchParams.get("response")

    if (!uid || !response) {
      return new NextResponse(
        `
        <html>
          <head>
            <title>Invalid Request</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
              }
              .container {
                text-align: center;
                padding: 40px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              h1 { color: #dc3545; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Invalid Request</h1>
              <p>Missing required parameters.</p>
            </div>
          </body>
        </html>
        `,
        { status: 400, headers: { "Content-Type": "text/html" } }
      )
    }

    // Only update rsvp_status to true if response is "yes"
    if (response === "yes") {
      const { error } = await supabaseAdmin
        .from("toyota_microsite_users")
        .update({ rsvp_status: true })
        .eq("uid", uid)

      if (error) {
        console.error("Database update error:", error)
        return new NextResponse(
          `
          <html>
            <head>
              <title>Error</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  margin: 0;
                  background-color: #f5f5f5;
                }
                .container {
                  text-align: center;
                  padding: 40px;
                  background: white;
                  border-radius: 10px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                h1 { color: #dc3545; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Error</h1>
                <p>Failed to update your RSVP status. Please try again later.</p>
              </div>
            </body>
          </html>
          `,
          { status: 500, headers: { "Content-Type": "text/html" } }
        )
      }

      return new NextResponse(
        `
        <html>
          <head>
            <title>RSVP Confirmed</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
              }
              .container {
                text-align: center;
                padding: 60px 40px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 8px 16px rgba(0,0,0,0.2);
                max-width: 500px;
              }
              h1 {
                color: #28a745;
                font-size: 2.5em;
                margin-bottom: 20px;
              }
              .checkmark {
                font-size: 4em;
                color: #28a745;
                margin-bottom: 20px;
              }
              p {
                color: #333;
                font-size: 1.2em;
                line-height: 1.6;
              }
              .logo {
                margin-top: 30px;
                font-weight: bold;
                color: #eb0a1e;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Thank You!</h1>
              <p>Your attendance has been confirmed.</p>
              <p>We look forward to seeing you at <strong>TOYOTA PRESENTS DRUM TAO</strong>!</p>
              <div class="logo">Toyota Event Team</div>
            </div>
          </body>
        </html>
        `,
        { status: 200, headers: { "Content-Type": "text/html" } }
      )
    } else if (response === "no") {
      // User declined - we don't update rsvp_status
      return new NextResponse(
        `
        <html>
          <head>
            <title>RSVP Response Received</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
              }
              .container {
                text-align: center;
                padding: 60px 40px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 8px 16px rgba(0,0,0,0.2);
                max-width: 500px;
              }
              h1 {
                color: #6c757d;
                font-size: 2.5em;
                margin-bottom: 20px;
              }
              .icon {
                font-size: 4em;
                color: #6c757d;
                margin-bottom: 20px;
              }
              p {
                color: #333;
                font-size: 1.2em;
                line-height: 1.6;
              }
              .logo {
                margin-top: 30px;
                font-weight: bold;
                color: #eb0a1e;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">📋</div>
              <h1>We Understand</h1>
              <p>Thank you for letting us know you won't be able to attend.</p>
              <p>We hope to see you at future events!</p>
              <div class="logo">Toyota Event Team</div>
            </div>
          </body>
        </html>
        `,
        { status: 200, headers: { "Content-Type": "text/html" } }
      )
    }

    // Invalid response parameter
    return new NextResponse(
      `
      <html>
        <head>
          <title>Invalid Response</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 40px;
              background: white;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            h1 { color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Invalid Response</h1>
            <p>The response parameter must be either "yes" or "no".</p>
          </div>
        </body>
      </html>
      `,
      { status: 400, headers: { "Content-Type": "text/html" } }
    )
  } catch (error) {
    console.error("Error in /api/rsvp-confirm:", error)
    return new NextResponse(
      `
      <html>
        <head>
          <title>Error</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 40px;
              background: white;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            h1 { color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Error</h1>
            <p>An unexpected error occurred. Please try again later.</p>
          </div>
        </body>
      </html>
      `,
      { status: 500, headers: { "Content-Type": "text/html" } }
    )
  }
}
