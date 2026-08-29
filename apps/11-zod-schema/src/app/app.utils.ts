import { DETAIL_MIN_LENGTH } from './app.data';
import type { ReplyChannel, Severity, Ticket } from './app.model';

const SAMPLE_CONTACT: Record<ReplyChannel, string> = {
  email: 'kristy@example.com',
  phone: '+639171234567',
};

const SAMPLE_SUBJECT = 'Card was charged twice';

const SAMPLE_DETAIL =
  'I paid once on the billing page but my statement shows two identical charges made ten seconds apart.';

export function createSampleTicket(
  channel: ReplyChannel,
  severity: Severity,
): Pick<Ticket, 'contact' | 'subject' | 'detail'> {
  const minimum = DETAIL_MIN_LENGTH[severity];
  const detail =
    SAMPLE_DETAIL.length >= minimum
      ? SAMPLE_DETAIL
      : SAMPLE_DETAIL.padEnd(minimum, ' .');

  return {
    contact: SAMPLE_CONTACT[channel],
    subject: SAMPLE_SUBJECT,
    detail,
  };
}
