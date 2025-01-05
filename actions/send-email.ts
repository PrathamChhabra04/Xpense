import { Resend } from "resend";

interface EmailParams {
  to: string;
  subject: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  react: any;
}

export async function sendEmail({ to, subject, react }: EmailParams) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");
  try {
    const data = await resend.emails.send({
      from: "Xpense <onboarding@resend.dev>",
      to,
      subject,
      react,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email: ", error);
    return { success: false, error };
  }
}
