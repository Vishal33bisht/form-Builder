import { env } from "../env";
import nodemailer from "nodemailer";

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface SendResponseNotificationInput {
  formTitle: string;
  formSlug: string;
  creatorEmail?: string | null;
  respondentEmail?: string | null;
}

class EmailService {
  private readonly from =
    env.SMTP_FROM || env.EMAIL_FROM || "FormCraft <onboarding@resend.dev>";

  public async sendEmail(input: SendEmailInput): Promise<void> {
    if (this.isSmtpConfigured()) {
      await this.sendWithSmtp(input);
      return;
    }

    if (!env.RESEND_API_KEY) {
      return;
    }

    await this.sendWithResend(input);
  }

  private async sendWithSmtp(input: SendEmailInput): Promise<void> {
    const port = Number(env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: this.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
  }

  private async sendWithResend(input: SendEmailInput): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Failed to send email: ${message}`);
    }
  }

  private isSmtpConfigured(): boolean {
    return !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
  }

  public async sendResponseNotifications(
    input: SendResponseNotificationInput
  ): Promise<void> {
    const formUrl = env.BASE_URL
      ? `${env.BASE_URL.replace(/\/$/, "")}/f/${input.formSlug}`
      : undefined;

    const emails: Promise<void>[] = [];

    if (input.creatorEmail) {
      emails.push(
        this.sendEmail({
          to: input.creatorEmail,
          subject: `New response for ${input.formTitle}`,
          text: `Your form "${input.formTitle}" received a new response.${
            formUrl ? `\n\nView form: ${formUrl}` : ""
          }`,
        })
      );
    }

    if (input.respondentEmail) {
      emails.push(
        this.sendEmail({
          to: input.respondentEmail,
          subject: `Response received: ${input.formTitle}`,
          text: `Thanks for submitting your response to "${input.formTitle}".`,
        })
      );
    }

    const results = await Promise.allSettled(emails);
    const failed = results.find((result) => result.status === "rejected");

    if (failed && failed.status === "rejected") {
      throw failed.reason;
    }
  }
}

export default EmailService;
