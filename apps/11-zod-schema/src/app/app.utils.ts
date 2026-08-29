import {
  DETAIL_MIN_LENGTH,
  SAMPLE_CONTACT,
  SAMPLE_DETAIL,
  SAMPLE_SUBJECT,
} from './app.data';
import type { ReplyChannel, Severity, Ticket } from './app.model';

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
