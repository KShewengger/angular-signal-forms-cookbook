import { SchemaPathTree, validateStandardSchema } from '@angular/forms/signals';
import * as z from 'zod';
import { DETAIL_MIN_LENGTH, SUBJECT_MIN_LENGTH } from './app.data';
import type { ReplyChannel, Severity, Ticket } from './app.model';

export function contactSchema(channel: ReplyChannel): z.ZodType<string> {
  return channel === 'email'
    ? z.email('We need a valid email to reply.')
    : z
        .string()
        .regex(
          /^\+[1-9]\d{7,14}$/,
          'Use international format, e.g. +639171234567.',
        );
}

export function detailsSchema(severity: Severity) {
  const detailMin = DETAIL_MIN_LENGTH[severity];

  return z.object({
    subject: z
      .string()
      .min(
        SUBJECT_MIN_LENGTH,
        `Give the ticket a subject of at least ${SUBJECT_MIN_LENGTH} characters.`,
      ),
    detail: z
      .string()
      .min(
        detailMin,
        `Tell us at least ${detailMin} characters so we can route this.`,
      ),
  });
}

export function ticketSchema(path: SchemaPathTree<Ticket>): void {
  validateStandardSchema(path.contact, ({ valueOf }) =>
    contactSchema(valueOf(path.channel)),
  );

  validateStandardSchema(path, ({ value }) => detailsSchema(value().severity));
}
