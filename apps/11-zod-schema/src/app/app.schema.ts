import { SchemaPathTree, validateStandardSchema } from '@angular/forms/signals';
import * as z from 'zod';
import { DETAIL_MIN_LENGTH, SUBJECT_MIN_LENGTH } from './app.data';
import type { ReplyChannel, Severity, Ticket } from './app.model';

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export const subjectSchema = z
  .string()
  .min(
    SUBJECT_MIN_LENGTH,
    `Give the ticket a subject of at least ${SUBJECT_MIN_LENGTH} characters.`,
  );

export function contactSchema(channel: ReplyChannel): z.ZodType<string> {
  return channel === 'email'
    ? z.email('We need a valid email to reply.')
    : z
        .string()
        .regex(E164_PATTERN, 'Use international format, e.g. +639171234567.');
}

export function detailSchema(severity: Severity): z.ZodType<string> {
  const minimum = DETAIL_MIN_LENGTH[severity];

  return z
    .string()
    .min(
      minimum,
      `Tell us at least ${minimum} characters so we can route this.`,
    );
}

export function ticketSchema(path: SchemaPathTree<Ticket>): void {
  validateStandardSchema(path.contact, ({ valueOf }) =>
    contactSchema(valueOf(path.channel)),
  );

  validateStandardSchema(path.subject, subjectSchema);

  validateStandardSchema(path.detail, ({ valueOf }) =>
    detailSchema(valueOf(path.severity)),
  );
}
