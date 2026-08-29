import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, type FieldTree } from '@angular/forms/signals';
import { INITIAL_TICKET, Ticket } from '../app.model';
import { ticketSchema } from '../app.schema';
import { ValidationErrors } from './validation-errors';

const VALID_EMAIL = 'kristy@example.com';

describe('ValidationErrors (11 · Zod Schema Validation)', () => {
  let fixture: ComponentFixture<ValidationErrors>;
  let host: HTMLElement;

  const buildTicketForm = (
    initial: Partial<Ticket> = {},
  ): FieldTree<Ticket> => {
    const model = signal<Ticket>({ ...INITIAL_TICKET, ...initial });

    return form(model, ticketSchema, { injector: TestBed.inject(Injector) });
  };

  const showErrorsFor = async (field: FieldTree<unknown>): Promise<void> => {
    fixture.componentRef.setInput('field', field);

    await fixture.whenStable();
  };

  const errorList = (): HTMLUListElement | null => host.querySelector('ul');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ValidationErrors] });
    fixture = TestBed.createComponent(ValidationErrors);
    host = fixture.nativeElement as HTMLElement;
  });

  describe('visibility', () => {
    it('renders nothing while the field is pristine and untouched', async () => {
      await showErrorsFor(buildTicketForm().contact);

      expect(errorList()).toBeNull();
    });

    it('renders nothing for a valid field, even after it is touched', async () => {
      const contactField = buildTicketForm({ contact: VALID_EMAIL }).contact;

      contactField().markAsTouched();
      await showErrorsFor(contactField);

      expect(errorList()).toBeNull();
    });

    it('shows the errors once an invalid field is touched', async () => {
      const contactField = buildTicketForm().contact;

      contactField().markAsTouched();
      await showErrorsFor(contactField);

      expect(errorList()).not.toBeNull();
    });

    it('shows the errors once an invalid field is dirty', async () => {
      const contactField = buildTicketForm().contact;

      contactField().markAsDirty();
      await showErrorsFor(contactField);

      expect(errorList()).not.toBeNull();
    });

    it('hides the errors once the field becomes valid', async () => {
      const contactField = buildTicketForm().contact;

      contactField().markAsTouched();
      await showErrorsFor(contactField);

      expect(errorList()).not.toBeNull();

      contactField().value.set(VALID_EMAIL);
      await fixture.whenStable();

      expect(errorList()).toBeNull();
    });
  });

  describe('rendering the real recipe errors', () => {
    it('surfaces the email message while the channel is email', async () => {
      const contactField = buildTicketForm().contact;

      contactField().markAsTouched();
      await showErrorsFor(contactField);

      expect(host.textContent).toContain('We need a valid email to reply.');
    });

    it('surfaces the phone message once the channel is phone', async () => {
      const contactField = buildTicketForm({
        channel: 'phone',
        contact: VALID_EMAIL,
      }).contact;

      contactField().markAsTouched();
      await showErrorsFor(contactField);

      expect(host.textContent).toContain(
        'Use international format, e.g. +639171234567.',
      );
    });

    it('surfaces the subject minimum message', async () => {
      const subjectField = buildTicketForm({ subject: 'Oops' }).subject;

      subjectField().markAsTouched();
      await showErrorsFor(subjectField);

      expect(host.textContent).toContain(
        'Give the ticket a subject of at least 8 characters.',
      );
    });

    it('surfaces the detail minimum for the selected severity', async () => {
      const detailField = buildTicketForm({ severity: 'urgent' }).detail;

      detailField().markAsTouched();
      await showErrorsFor(detailField);

      expect(host.textContent).toContain(
        'Tell us at least 20 characters so we can route this.',
      );
    });

    it('renders a flat list for a single error', async () => {
      const contactField = buildTicketForm().contact;

      contactField().markAsTouched();
      await showErrorsFor(contactField);

      const list = errorList();

      expect(list?.classList.contains('list-disc')).toBe(false);
      expect(host.querySelectorAll('li').length).toBe(1);
    });
  });

  describe('accessibility', () => {
    it('exposes the errors to assistive technology', async () => {
      const contactField = buildTicketForm().contact;

      contactField().markAsTouched();
      await showErrorsFor(contactField);

      const list = errorList();

      expect(list?.getAttribute('role')).toBe('alert');
      expect(list?.getAttribute('aria-live')).toBe('polite');
    });

    it('puts messageId on the alert list for aria-describedby', async () => {
      const contactField = buildTicketForm().contact;

      contactField().markAsTouched();
      fixture.componentRef.setInput('messageId', 'ticket-contact-errors');
      await showErrorsFor(contactField);

      expect(errorList()?.getAttribute('id')).toBe('ticket-contact-errors');
    });
  });
});
