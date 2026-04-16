import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export interface SendDonationThankYouEmailParams {
  to: string;
  amount: number;
  currency: string;
  donorName?: string;
  projectFunded?: string;
}

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

export async function sendDonationThankYouEmail(params: SendDonationThankYouEmailParams): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('[mailer] SMTP env vars not configured; skipping email send');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const currencySymbol = params.currency === 'PHP' ? '₱' : params.currency === 'USD' ? '$' : '€';
  const formattedAmount = `${currencySymbol}${params.amount.toLocaleString()}`;
  const donorName = params.donorName?.trim() || 'Valued Donor';
  const projectFunded = params.projectFunded?.trim() || 'General Funds';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://papayaacademy.org';

  // For testing: use CID references for local images, URL for production
  const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
  const useInlineAttachments = isLocalhost;

  // Build attachments array for inline images
  const attachments: any[] = [];
  if (useInlineAttachments) {
    const emailImagesPath = path.join(process.cwd(), 'public', 'images', 'email');
    
    // Banner
    const bannerPath = path.join(emailImagesPath, 'email-banner.png');
    if (fs.existsSync(bannerPath)) {
      attachments.push({
        filename: 'email-banner.png',
        path: bannerPath,
        cid: 'banner',
      });
    }
    
    // Icons
    const iconsPath = path.join(emailImagesPath, 'email-icons.png');
    if (fs.existsSync(iconsPath)) {
      attachments.push({
        filename: 'email-icons.png',
        path: iconsPath,
        cid: 'icons',
      });
    }
  }

  // Use CID for local, URL for production
  const bannerSrc = useInlineAttachments ? 'cid:banner' : `${baseUrl}/images/email/email-banner.png`;
  const iconsSrc = useInlineAttachments ? 'cid:icons' : `${baseUrl}/images/email/email-icons.png`;

  await transporter.sendMail({
    attachments,
    from: process.env.SMTP_FROM,
    to: params.to,
    subject: 'Thank You for Your Generous Donation!',
    text: `Dear ${donorName},\n\nThank you for your generous donation of ${formattedAmount} to PapayaAcademy. Your contribution directly benefits crucial needs in curriculum production and recognized individualized needs.\n\nYour Impact: ${formattedAmount} - ${projectFunded}\n\nSincerely,\nThe PapayaAcademy Team`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Your Donation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; background-color: #f5f5f0;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Banner -->
          <tr>
            <td>
              <img src="${bannerSrc}" alt="PapayaAcademy" style="width: 100%; height: auto; display: block;" />
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: bold; color: #2d5016; text-align: center; text-transform: uppercase; letter-spacing: 1px;">
                THANK YOU FOR YOUR<br/>GENEROUS DONATION!
              </h1>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                Dear ${donorName},
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 15px; color: #444444; line-height: 1.7;">
                Your recent donation to PapayaAcademy makes a profound difference in the lives of the children we serve. Because of supporters like you, we can continue providing quality education, learning resources, and a nurturing environment for our students.
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 15px; color: #444444; line-height: 1.7;">
                Our curriculum keeps directly benefiting crucial needs to curriculum production and recognized for individual needs.
              </p>
            </td>
          </tr>
          
          <!-- Impact Box -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #f8f6f0 0%, #ede8d8 100%); border-radius: 12px; border: 2px solid #d4c4a8;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 1px;">Your Impact</p>
                    <p style="margin: 0; font-size: 22px; font-weight: bold; color: #2d5016;">
                      ${formattedAmount} - ${projectFunded}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Impact Icons -->
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <img src="${iconsSrc}" alt="Your Impact: Providing Books & Supplies, Supporting Teachers, Expanding Programs" style="max-width: 100%; height: auto; display: inline-block;" />
            </td>
          </tr>
          
          <!-- Thank You Message -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; color: #444444; line-height: 1.7; text-align: center;">
                Thank you for your warm support of papaya-companying you now, contribute to so much.
              </p>
            </td>
          </tr>
          
          <!-- Signature -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <p style="margin: 0 0 5px 0; font-size: 15px; color: #444444;">Sincerely,</p>
              <p style="margin: 0 0 15px 0; font-size: 16px; color: #2d5016; font-weight: bold; font-style: italic;">The PapayaAcademy Team</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f6f0; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; font-size: 11px; color: #888888; text-align: center; line-height: 1.5;">
                This email is part of our mission to bring quality education to underserved communities.
              </p>
              <p style="margin: 0; font-size: 11px; color: #888888; text-align: center; line-height: 1.5;">
                To support us or for more information, visit <a href="${baseUrl}" style="color: #2d5016; text-decoration: underline;">papayaacademy.org</a> or contact us at info@papayaacademy.org
              </p>
              <p style="margin: 10px 0 0 0; font-size: 10px; color: #aaaaaa; text-align: center;">
                &copy; ${new Date().getFullYear()} PapayaAcademy. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });
}
