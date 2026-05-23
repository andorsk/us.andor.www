import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend lazily to avoid build-time errors when env vars are missing
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company_name, phone, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Send email using Resend
    const emailContent = `
New contact form submission:

Name: ${name}
Email: ${email}
Company: ${company_name || "N/A"}
Phone: ${phone || "N/A"}

Message:
${message || "No message provided"}
    `.trim();

    const { data, error } = await getResendClient().emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: ["andor@agentoverlay.com"], // Using your verified Resend email
      subject: `New Contact Form Submission from ${name}`,
      text: emailContent,
      replyTo: email,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Email sent successfully", id: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
