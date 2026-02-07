/**
 * Slack Block Kit message builder for admin notifications.
 * Pure functions — no dependencies, no side effects.
 */

export interface SlackBookingNotificationData {
  bookingReference: string;
  customerName: string;
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

function formatDeviceSlack(deviceType: string, brand?: string, model?: string): string {
  const displayType = deviceType === 'mobile' ? 'Mobile Phone' :
                      deviceType === 'laptop' ? 'Laptop' : 'Tablet';
  if ((brand && brand !== 'other') || model) {
    const displayBrand = (brand && brand !== 'other') ? brand : '';
    const displayModel = model || '';
    const sep = (displayBrand && displayModel) ? ' ' : '';
    const full = `${displayType} — ${displayBrand}${sep}${displayModel}`;
    return full.replace(/\s+—\s*$/, '').trim();
  }
  return displayType;
}

function formatAddressSlack(address?: string, city?: string, province?: string, postalCode?: string): string {
  const parts = [address, city, province, postalCode].filter(Boolean);
  if (parts.length === 0) return 'Not provided';
  const result = [];
  if (address) result.push(address);
  if (city) result.push(city);
  const regionParts = [province, postalCode].filter(Boolean).join(' ');
  if (regionParts) result.push(regionParts);
  return result.join(', ');
}

export function buildSlackBookingNotification(data: SlackBookingNotificationData) {
  const device = formatDeviceSlack(data.deviceType, data.deviceBrand, data.deviceModel);
  const fullAddress = formatAddressSlack(data.address, data.city, data.province, data.postalCode);
  const priceDisplay = data.quotedPrice != null ? `$${data.quotedPrice.toFixed(2)}` : 'TBD';
  const tierDisplay = data.pricingTier === 'premium' ? 'Premium' : 'Standard';

  const blocks: any[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: 'New Booking Received', emoji: true },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Reference:*\n${data.bookingReference}` },
        { type: 'mrkdwn', text: `*Customer:*\n${data.customerName}` },
      ],
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Device:*\n${device}` },
        { type: 'mrkdwn', text: `*Service:*\n${data.serviceName}` },
      ],
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Date:*\n${data.bookingDate}` },
        { type: 'mrkdwn', text: `*Time:*\n${data.bookingTime}` },
      ],
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Address:*\n${fullAddress}` },
        { type: 'mrkdwn', text: `*Phone:*\n${data.customerPhone}` },
      ],
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Quoted Price:*\n${priceDisplay}` },
        { type: 'mrkdwn', text: `*Pricing Tier:*\n${tierDisplay}` },
      ],
    },
  ];

  if (data.issueDescription) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*Issue Description:*\n${data.issueDescription}` },
    });
  }

  blocks.push(
    { type: 'divider' },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'View in Admin Panel', emoji: true },
          url: data.adminPanelUrl,
          style: 'primary',
        },
      ],
    }
  );

  return {
    text: `New booking ${data.bookingReference} from ${data.customerName}`,
    blocks,
  };
}
