import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, type FieldTree } from '@angular/forms/signals';
import { App } from './app';
import { DETAIL_MIN_LENGTH } from './app.data';
import { INITIAL_TICKET, Severity, Ticket } from './app.model';
import { ticketSchema } from './app.schema';

const SUBMIT_DELAY_MS = 500;

const VALID_EMAIL = 'kristy@example.com';
const VALID_PHONE = '+639171234567';
const VALID_SUBJECT = 'Card was charged twice';
const VALID_DETAIL =
  'The billing page charged my card twice ten seconds apart.';

const VALID_TICKET: Partial<Ticket> = {
  contact: VALID_EMAIL,
  subject: VALID_SUBJECT,
  detail: VALID_DETAIL,
};

type ErrorReader = () => {
  errors(): ReadonlyArray<{ kind: string; message?: string }>;
};

const messagesOf = (field: ErrorReader): ReadonlyArray<string | undefined> =>
  field()
    .errors()
    .map((error) => error.message);

const kindsOf = (field: ErrorReader): ReadonlyArray<string> =>
  field()
    .errors()
    .map((error) => error.kind);

const buildTicketForm = (initial: Partial<Ticket> = {}): FieldTree<Ticket> => {
  const model = signal<Ticket>({ ...INITIAL_TICKET, ...initial });

  return form(model, ticketSchema, { injector: TestBed.inject(Injector) });
};

describe('App (11 · Zod Schema Validation)', () => {
  describe('validation schema (isolated)', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    describe('contact, validated by the channel the customer picked', () => {
      it('accepts an email while the channel is email', () => {
        const ticket = buildTicketForm({ contact: VALID_EMAIL });

        expect(ticket.contact().valid()).toBe(true);
      });

      it('rejects a non-email while the channel is email', () => {
        const ticket = buildTicketForm({ contact: 'kristy@example' });

        expect(ticket.contact().valid()).toBe(false);
        expect(messagesOf(ticket.contact)).toContain(
          'We need a valid email to reply.',
        );
      });

      it('accepts an E.164 number while the channel is phone', () => {
        const ticket = buildTicketForm({
          channel: 'phone',
          contact: VALID_PHONE,
        });

        expect(ticket.contact().valid()).toBe(true);
      });

      it('rejects a local number while the channel is phone', () => {
        const ticket = buildTicketForm({
          channel: 'phone',
          contact: '09171234567',
        });

        expect(ticket.contact().valid()).toBe(false);
        expect(messagesOf(ticket.contact)).toContain(
          'Use international format, e.g. +639171234567.',
        );
      });

      it('swaps the zod schema when the channel changes', () => {
        const ticket = buildTicketForm({ contact: VALID_EMAIL });

        expect(ticket.contact().valid()).toBe(true);

        ticket.channel().value.set('phone');

        expect(ticket.contact().valid()).toBe(false);
        expect(messagesOf(ticket.contact)).toContain(
          'Use international format, e.g. +639171234567.',
        );
      });

      it('reports zod issues under the standardSchema kind', () => {
        const ticket = buildTicketForm();

        expect(kindsOf(ticket.contact)).toEqual(['standardSchema']);
      });
    });

    describe('subject', () => {
      it('rejects a subject below the minimum', () => {
        const ticket = buildTicketForm({ subject: 'Oops' });

        expect(ticket.subject().valid()).toBe(false);
        expect(messagesOf(ticket.subject)).toContain(
          'Give the ticket a subject of at least 8 characters.',
        );
      });

      it('accepts a subject at or above the minimum', () => {
        const ticket = buildTicketForm({ subject: VALID_SUBJECT });

        expect(ticket.subject().valid()).toBe(true);
      });
    });

    describe('detail, with a minimum derived from the severity', () => {
      const severities: Severity[] = ['low', 'normal', 'urgent'];

      severities.forEach((severity) => {
        const minimum = DETAIL_MIN_LENGTH[severity];

        it(`requires ${minimum} characters when the severity is ${severity}`, () => {
          const ticket = buildTicketForm({
            severity,
            detail: 'a'.repeat(minimum - 1),
          });

          expect(ticket.detail().valid()).toBe(false);
          expect(messagesOf(ticket.detail)).toContain(
            `Tell us at least ${minimum} characters so we can route this.`,
          );
        });

        it(`accepts ${minimum} characters when the severity is ${severity}`, () => {
          const ticket = buildTicketForm({
            severity,
            detail: 'a'.repeat(minimum),
          });

          expect(ticket.detail().valid()).toBe(true);
        });
      });

      it('raises the minimum when the severity is escalated', () => {
        const ticket = buildTicketForm({
          severity: 'low',
          detail: 'a'.repeat(DETAIL_MIN_LENGTH.low),
        });

        expect(ticket.detail().valid()).toBe(true);

        ticket.severity().value.set('urgent');

        expect(ticket.detail().valid()).toBe(false);
        expect(messagesOf(ticket.detail)).toContain(
          `Tell us at least ${DETAIL_MIN_LENGTH.urgent} characters so we can route this.`,
        );
      });
    });

    describe('form as a whole', () => {
      it('is invalid while empty', () => {
        const ticket = buildTicketForm();

        expect(ticket().valid()).toBe(false);
        expect(ticket().invalid()).toBe(true);
      });

      it('becomes valid once every field satisfies the active schema', () => {
        const ticket = buildTicketForm(VALID_TICKET);

        expect(ticket().valid()).toBe(true);
      });
    });
  });

  describe('component (DOM)', () => {
    let fixture: ComponentFixture<App>;
    let host: HTMLElement;

    const appForm = (): FieldTree<Ticket> =>
      (
        fixture.componentInstance as unknown as {
          ticketForm: FieldTree<Ticket>;
        }
      ).ticketForm;

    const groupButton = (group: string, label: string): HTMLButtonElement =>
      Array.from(
        host
          .querySelector(`[aria-labelledby="${group}"]`)
          ?.querySelectorAll('button') ?? [],
      ).find((button) =>
        button.textContent?.toUpperCase().includes(label.toUpperCase()),
      ) as HTMLButtonElement;

    const prefillButton = (): HTMLButtonElement =>
      host.querySelector(
        '[aria-label="Fill the ticket with sample data"]',
      ) as HTMLButtonElement;

    const submitForm = (): void => {
      const formEl = host.querySelector<HTMLFormElement>('form');

      if (!formEl) throw new Error('no form rendered');
      formEl.requestSubmit();
    };

    const settleSubmit = async (): Promise<void> => {
      await vi.advanceTimersByTimeAsync(SUBMIT_DELAY_MS);

      await fixture.whenStable();
      await Promise.resolve();
      await fixture.whenStable();
    };

    const fillValidTicket = async (): Promise<void> => {
      appForm().contact().value.set(VALID_EMAIL);
      appForm().subject().value.set(VALID_SUBJECT);
      appForm().detail().value.set(VALID_DETAIL);

      await fixture.whenStable();
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [App],
      }).compileComponents();
      fixture = TestBed.createComponent(App);
      host = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    });

    afterEach(() => vi.useRealTimers());

    it('renders the ticket controls and defaults to email at normal severity', () => {
      expect(host.querySelector('#ticket-contact')).toBeTruthy();
      expect(host.querySelector('#ticket-subject')).toBeTruthy();
      expect(host.querySelector('#ticket-detail')).toBeTruthy();
      expect(host.textContent).toContain('Email address');
      expect(host.textContent).toContain(`${DETAIL_MIN_LENGTH.normal} chars`);
    });

    it('shows the email message once the contact field is touched', async () => {
      appForm().contact().markAsTouched();
      await fixture.whenStable();

      expect(host.textContent).toContain('We need a valid email to reply.');
    });

    it('swaps the contact label and the rule when the phone channel is picked', async () => {
      groupButton('channel-label', 'Phone').click();
      await fixture.whenStable();

      expect(host.textContent).toContain('Phone number');
      expect(appForm().channel().value()).toBe('phone');

      appForm().contact().markAsTouched();
      await fixture.whenStable();

      expect(host.textContent).toContain(
        'Use international format, e.g. +639171234567.',
      );
    });

    it('resets the ticket when the channel switches', async () => {
      await fillValidTicket();

      expect(appForm()().valid()).toBe(true);

      groupButton('channel-label', 'Phone').click();
      await fixture.whenStable();

      expect(appForm().subject().value()).toBe('');
      expect(appForm().detail().value()).toBe('');
    });

    it('moves the minimum shown on the stub when the severity is escalated', async () => {
      groupButton('severity-label', 'Urgent').click();
      await fixture.whenStable();

      expect(host.textContent).toContain(`${DETAIL_MIN_LENGTH.urgent} chars`);
    });

    it('fills a valid ticket from the sample button', async () => {
      prefillButton().click();
      await fixture.whenStable();

      expect(appForm()().valid()).toBe(true);
      expect(host.textContent).toContain('Ready to file');
    });

    it('blocks submit and reports the errors when empty (onInvalid)', async () => {
      submitForm();
      await fixture.whenStable();

      expect(host.textContent).toContain('We need a valid email to reply.');
      expect(host.textContent).not.toContain('Ticket filed.');
    });

    it('shows the filed stub after a valid submit settles', async () => {
      await fillValidTicket();

      submitForm();
      await settleSubmit();

      expect(host.textContent).toContain(
        'Ticket filed. We will reply on the channel you picked.',
      );
    });

    it('clears the filed stub and the ticket on retry', async () => {
      await fillValidTicket();

      submitForm();
      await settleSubmit();

      const retry = Array.from(host.querySelectorAll('button')).find((button) =>
        button.textContent?.includes('File another'),
      ) as HTMLButtonElement;

      retry.click();
      await fixture.whenStable();

      expect(host.textContent).not.toContain('Ticket filed.');
      expect(appForm().subject().value()).toBe('');
    });
  });
});
