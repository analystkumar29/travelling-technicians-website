/**
 * Inline HTML email templates for booking confirmations.
 * Replaces SendGrid dynamic templates for full control over email rendering.
 */

export interface BookingEmailData {
  name: string;
  bookingReference: string;
  deviceType: string;
  brand?: string;
  model?: string;
  service: string;
  bookingDate: string;
  bookingTime: string;
  address?: string;
  quotedPrice?: number | null;
  pricingTier?: string;
  verificationUrl: string;
  rescheduleUrl: string;
}

export interface RescheduleEmailData extends BookingEmailData {
  oldDate: string;
  oldTime: string;
}

const LOGO_URL = 'https://www.travelling-technicians.ca/images/logo/logo-orange.png';
const PHONE = '(604) 849-5329';
const DOMAIN = 'www.travelling-technicians.ca';
const YEAR = new Date().getFullYear();

// Brand colors
const NAVY = '#102a43';
const NAVY_LIGHT = '#243b53';
const AMBER = '#f59e0b';
const AMBER_DARK = '#d97706';
const BG = '#f1f5f9';
const CARD_BG = '#f0f4f8';
const TEXT = '#334155';
const TEXT_LIGHT = '#64748b';

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>The Travelling Technicians</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG};">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
${content}
</table>
<!-- Footer -->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="padding:24px 32px;text-align:center;">
<p style="margin:0 0 8px;font-size:14px;color:${TEXT_LIGHT};">The Travelling Technicians</p>
<p style="margin:0 0 8px;font-size:13px;color:${TEXT_LIGHT};">Phone: ${PHONE} | ${DOMAIN}</p>
<p style="margin:0;font-size:12px;color:${TEXT_LIGHT};">&copy; ${YEAR} The Travelling Technicians. All rights reserved.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function headerBanner(): string {
  return `<tr><td style="background-color:${NAVY};padding:28px 32px;text-align:center;">
<img src="${LOGO_URL}" alt="The Travelling Technicians" width="180" style="display:inline-block;max-width:180px;height:auto;">
</td></tr>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
<td style="padding:8px 16px;font-size:13px;color:${TEXT_LIGHT};font-weight:600;width:120px;vertical-align:top;">${label}</td>
<td style="padding:8px 16px;font-size:14px;color:${TEXT};">${value}</td>
</tr>`;
}

function formatDevice(deviceType: string, brand?: string, model?: string): string {
  const displayType = deviceType === 'mobile' ? 'Mobile Phone' :
                      deviceType === 'laptop' ? 'Laptop' : 'Tablet';
  if ((brand && brand !== 'other') || model) {
    const displayBrand = (brand && brand !== 'other') ? brand : '';
    const displayModel = model || '';
    const sep = (displayBrand && displayModel) ? ' ' : '';
    const full = `${displayType} - ${displayBrand}${sep}${displayModel}`;
    return full.replace(/\s+-\s*$/, '').trim();
  }
  return displayType;
}

export function buildBookingConfirmationEmail(data: BookingEmailData): string {
  const device = formatDevice(data.deviceType, data.brand, data.model);

  const content = `
${headerBanner()}
<!-- Body -->
<tr><td style="padding:32px 32px 0;">
<p style="margin:0 0 16px;font-size:16px;color:${TEXT};">Hi ${data.name},</p>
<p style="margin:0 0 8px;font-size:16px;color:${TEXT};">Your repair booking has been confirmed!</p>
<p style="margin:0 0 24px;font-size:14px;color:${TEXT_LIGHT};">Your booking reference:</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
<tr><td style="background-color:${AMBER};color:${NAVY};font-size:18px;font-weight:700;padding:10px 24px;border-radius:6px;letter-spacing:1px;">
${data.bookingReference}
</td></tr>
</table>
</td></tr>
<!-- Booking Details Card -->
<tr><td style="padding:0 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:8px;margin-bottom:28px;">
<tr><td style="padding:16px 16px 4px;font-size:15px;font-weight:700;color:${NAVY};" colspan="2">Booking Details</td></tr>
${detailRow('Device', device)}
${detailRow('Service', data.service)}
${detailRow('Date', data.bookingDate)}
${detailRow('Time', data.bookingTime)}
${data.address ? detailRow('Address', data.address) : ''}
${data.quotedPrice != null ? detailRow('Estimated Price', `$${data.quotedPrice.toFixed(2)}${data.pricingTier === 'premium' ? ' (Premium)' : ''}`) : ''}
<tr><td colspan="2" style="padding:0 0 12px;"></td></tr>
</table>
</td></tr>
<!-- Buttons -->
<tr><td style="padding:0 32px 12px;text-align:center;">
<a href="${data.verificationUrl}" style="display:inline-block;background-color:${AMBER};color:${NAVY};font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:6px;">View Booking</a>
</td></tr>
<tr><td style="padding:0 32px 28px;text-align:center;">
<a href="${data.rescheduleUrl}" style="display:inline-block;background-color:${NAVY_LIGHT};color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;padding:10px 24px;border-radius:6px;">Need to Reschedule?</a>
</td></tr>
<!-- What to Expect -->
<tr><td style="padding:0 32px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;padding-top:20px;">
<tr><td style="padding-top:20px;">
<p style="margin:0 0 12px;font-size:15px;font-weight:700;color:${NAVY};">What to Expect</p>
<p style="margin:0 0 6px;font-size:14px;color:${TEXT};">&#8226; Our technician will arrive at the scheduled time</p>
<p style="margin:0 0 6px;font-size:14px;color:${TEXT};">&#8226; Please have your device ready and backed up if possible</p>
<p style="margin:0 0 6px;font-size:14px;color:${TEXT};">&#8226; Ensure the repair area is accessible</p>
<p style="margin:0;font-size:14px;color:${TEXT};">&#8226; Payment is collected after the repair is complete</p>
</td></tr>
</table>
</td></tr>`;

  return emailWrapper(content);
}

export interface WarrantyEmailData {
  name: string;
  warrantyNumber: string;
  bookingReference: string;
  deviceName: string;
  serviceName: string;
  technicianName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  checkWarrantyUrl: string;
  reviewUrl?: string;
}

export function buildWarrantyNotificationEmail(data: WarrantyEmailData): string {
  const content = `
${headerBanner()}
<!-- Body -->
<tr><td style="padding:32px 32px 0;">
<p style="margin:0 0 16px;font-size:16px;color:${TEXT};">Hi ${data.name},</p>
<p style="margin:0 0 8px;font-size:16px;color:${TEXT};">Great news — your repair is complete!</p>
<p style="margin:0 0 24px;font-size:14px;color:${TEXT_LIGHT};">Your warranty has been activated:</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
<tr><td style="background-color:${AMBER};color:${NAVY};font-size:18px;font-weight:700;padding:10px 24px;border-radius:6px;letter-spacing:1px;">
WARRANTY: ${data.warrantyNumber}
</td></tr>
</table>
</td></tr>
<!-- Warranty Details Card -->
<tr><td style="padding:0 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:8px;margin-bottom:28px;">
<tr><td style="padding:16px 16px 4px;font-size:15px;font-weight:700;color:${NAVY};" colspan="2">Warranty Details</td></tr>
${detailRow('Duration', `${data.durationDays} days`)}
${detailRow('Valid From', data.startDate)}
${detailRow('Valid Until', data.endDate)}
${detailRow('Device', data.deviceName)}
${detailRow('Service', data.serviceName)}
${detailRow('Technician', data.technicianName)}
${detailRow('Booking Ref', data.bookingReference)}
<tr><td colspan="2" style="padding:0 0 12px;"></td></tr>
</table>
</td></tr>
<!-- CTA Button -->
<tr><td style="padding:0 32px 12px;text-align:center;">
<a href="${data.checkWarrantyUrl}" style="display:inline-block;background-color:${AMBER};color:${NAVY};font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:6px;">Check Warranty Status</a>
</td></tr>
<!-- What's Covered -->
<tr><td style="padding:12px 32px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;padding-top:20px;">
<tr><td style="padding-top:20px;">
<p style="margin:0 0 12px;font-size:15px;font-weight:700;color:${NAVY};">What&rsquo;s Covered</p>
<p style="margin:0 0 6px;font-size:14px;color:${TEXT};">&#8226; Defects in parts used during the repair</p>
<p style="margin:0 0 6px;font-size:14px;color:${TEXT};">&#8226; Workmanship issues related to the repair performed</p>
<p style="margin:0 0 6px;font-size:14px;color:${TEXT};">&#8226; Same issue recurring within the warranty period</p>
<p style="margin:0 0 12px;font-size:14px;color:${TEXT};">&#8226; Free re-repair or replacement of the repaired component</p>
<p style="margin:0;font-size:13px;color:${TEXT_LIGHT};">To file a warranty claim, call us at ${PHONE} or visit ${DOMAIN}</p>
</td></tr>
</table>
</td></tr>${data.reviewUrl ? `
<!-- Review CTA -->
<tr><td style="padding:0 32px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;padding-top:20px;">
<tr><td style="padding-top:20px;text-align:center;">
<p style="margin:0 0 8px;font-size:15px;font-weight:700;color:${NAVY};">How was your experience?</p>
<p style="margin:0 0 16px;font-size:14px;color:${TEXT_LIGHT};">We&rsquo;d love to hear your feedback. It only takes a minute.</p>
<a href="${data.reviewUrl}" style="display:inline-block;background-color:${NAVY_LIGHT};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:6px;">Leave a Review</a>
</td></tr>
</table>
</td></tr>` : ''}`;

  return emailWrapper(content);
}

export interface AdminBookingNotificationData {
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deviceType: string;
  deviceBrand?: string;
  deviceModel?: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  address?: string;
  city: string;
  province?: string;
  postalCode?: string;
  quotedPrice?: number | null;
  pricingTier: string;
  issueDescription?: string;
  adminPanelUrl: string;
}

function formatAddress(address?: string, city?: string, province?: string, postalCode?: string): string {
  const parts = [address, city, province, postalCode].filter(Boolean);
  if (parts.length === 0) return 'Not provided';
  // Format as "123 Main St, Vancouver, BC V6B 1A1"
  const result = [];
  if (address) result.push(address);
  if (city) result.push(city);
  const regionParts = [province, postalCode].filter(Boolean).join(' ');
  if (regionParts) result.push(regionParts);
  return result.join(', ');
}

export function buildAdminBookingNotificationEmail(data: AdminBookingNotificationData): string {
  const device = formatDevice(data.deviceType, data.deviceBrand, data.deviceModel);
  const fullAddress = formatAddress(data.address, data.city, data.province, data.postalCode);
  const priceDisplay = data.quotedPrice != null ? `$${data.quotedPrice.toFixed(2)}` : 'TBD';
  const tierDisplay = data.pricingTier === 'premium' ? 'Premium' : 'Standard';

  const content = `
${headerBanner()}
<!-- Body -->
<tr><td style="padding:32px 32px 0;">
<p style="margin:0 0 16px;font-size:16px;color:${TEXT};">A new booking has been received.</p>
<p style="margin:0 0 24px;font-size:14px;color:${TEXT_LIGHT};">Booking reference:</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
<tr><td style="background-color:${AMBER};color:${NAVY};font-size:18px;font-weight:700;padding:10px 24px;border-radius:6px;letter-spacing:1px;">
${data.bookingReference}
</td></tr>
</table>
</td></tr>
<!-- Customer Details Card -->
<tr><td style="padding:0 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:8px;margin-bottom:16px;">
<tr><td style="padding:16px 16px 4px;font-size:15px;font-weight:700;color:${NAVY};" colspan="2">Customer Details</td></tr>
${detailRow('Name', data.customerName)}
${detailRow('Email', data.customerEmail)}
${detailRow('Phone', data.customerPhone)}
<tr><td colspan="2" style="padding:0 0 12px;"></td></tr>
</table>
</td></tr>
<!-- Booking Details Card -->
<tr><td style="padding:0 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:8px;margin-bottom:28px;">
<tr><td style="padding:16px 16px 4px;font-size:15px;font-weight:700;color:${NAVY};" colspan="2">Booking Details</td></tr>
${detailRow('Device', device)}
${detailRow('Service', data.serviceName)}
${detailRow('Date', data.bookingDate)}
${detailRow('Time', data.bookingTime)}
${detailRow('Address', fullAddress)}
${detailRow('Quoted Price', priceDisplay)}
${detailRow('Pricing Tier', tierDisplay)}
${data.issueDescription ? detailRow('Issue', data.issueDescription) : ''}
<tr><td colspan="2" style="padding:0 0 12px;"></td></tr>
</table>
</td></tr>
<!-- CTA Button -->
<tr><td style="padding:0 32px 32px;text-align:center;">
<a href="${data.adminPanelUrl}" style="display:inline-block;background-color:${AMBER};color:${NAVY};font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:6px;">View in Admin Panel</a>
</td></tr>`;

  return emailWrapper(content);
}

export function buildRescheduleConfirmationEmail(data: RescheduleEmailData): string {
  const device = formatDevice(data.deviceType, data.brand, data.model);

  const content = `
${headerBanner()}
<!-- Body -->
<tr><td style="padding:32px 32px 0;">
<p style="margin:0 0 16px;font-size:16px;color:${TEXT};">Hi ${data.name},</p>
<p style="margin:0 0 8px;font-size:16px;color:${TEXT};">Your booking has been successfully rescheduled.</p>
<p style="margin:0 0 24px;font-size:14px;color:${TEXT_LIGHT};">Booking reference: <strong style="color:${NAVY};">${data.bookingReference}</strong></p>
</td></tr>
<!-- Schedule Change -->
<tr><td style="padding:0 32px 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td width="48%" style="vertical-align:top;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border-radius:8px;">
<tr><td style="padding:16px;text-align:center;">
<p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:1px;">Previous</p>
<p style="margin:0 0 2px;font-size:15px;font-weight:600;color:${TEXT};text-decoration:line-through;">${data.oldDate}</p>
<p style="margin:0;font-size:14px;color:${TEXT_LIGHT};text-decoration:line-through;">${data.oldTime}</p>
</td></tr>
</table>
</td>
<td width="4%" style="text-align:center;vertical-align:middle;font-size:20px;color:${TEXT_LIGHT};">&#8594;</td>
<td width="48%" style="vertical-align:top;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:8px;">
<tr><td style="padding:16px;text-align:center;">
<p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:1px;">New</p>
<p style="margin:0 0 2px;font-size:15px;font-weight:600;color:${TEXT};">${data.bookingDate}</p>
<p style="margin:0;font-size:14px;color:${TEXT_LIGHT};">${data.bookingTime}</p>
</td></tr>
</table>
</td>
</tr>
</table>
</td></tr>
<!-- Booking Details Card -->
<tr><td style="padding:0 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:8px;margin-bottom:28px;">
<tr><td style="padding:16px 16px 4px;font-size:15px;font-weight:700;color:${NAVY};" colspan="2">Booking Details</td></tr>
${detailRow('Device', device)}
${detailRow('Service', data.service)}
${data.address ? detailRow('Address', data.address) : ''}
<tr><td colspan="2" style="padding:0 0 12px;"></td></tr>
</table>
</td></tr>
<!-- Buttons -->
<tr><td style="padding:0 32px 12px;text-align:center;">
<a href="${data.verificationUrl}" style="display:inline-block;background-color:${AMBER};color:${NAVY};font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:6px;">View Updated Booking</a>
</td></tr>
<tr><td style="padding:0 32px 32px;text-align:center;">
<a href="${data.rescheduleUrl}" style="display:inline-block;background-color:${NAVY_LIGHT};color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;padding:10px 24px;border-radius:6px;">Need to Reschedule Again?</a>
</td></tr>`;

  return emailWrapper(content);
}
