import { Component, computed, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import type { NbToneToken } from '@ng-brutalism/ui';
import {
  CHANNELS,
  CHANNELS_BY_ID,
  DETAIL_MIN_LENGTH,
  LESSON_TOPICS,
  SEVERITIES,
  SUBJECT_MIN_LENGTH,
} from './app.data';
import { INITIAL_TICKET, ReplyChannel, Severity, Ticket } from './app.model';
import { ticketSchema } from './app.schema';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  host: {
    class: 'relative mx-auto flex w-full max-w-5xl shrink-0 flex-col gap-4',
  },
})
export class App {
  protected readonly lessonTopics = LESSON_TOPICS;
  protected readonly channels = CHANNELS;
  protected readonly severities = SEVERITIES;
  protected readonly subjectMinLength = SUBJECT_MIN_LENGTH;

  protected readonly ticketModel = signal<Ticket>({ ...INITIAL_TICKET });

  protected readonly filed = signal(false);

  protected readonly ticketForm = form(this.ticketModel, ticketSchema, {
    submission: {
      action: async () => {
        const sent = await this.sendTicket();
        this.filed.set(sent);
      },
      onInvalid: (field) =>
        field().errorSummary()[0]?.fieldTree().focusBoundControl(),
      ignoreValidators: 'none',
    },
  });

  protected readonly submitting = computed(() =>
    this.ticketForm().submitting(),
  );

  protected readonly selectedChannel = computed(() =>
    this.ticketForm.channel().value(),
  );

  protected readonly selectedSeverity = computed(() =>
    this.ticketForm.severity().value(),
  );

  protected readonly activeChannel = computed(
    () => CHANNELS_BY_ID[this.selectedChannel()],
  );

  protected readonly channelTabs = computed(() => {
    const selected = this.selectedChannel();

    return this.channels.map((channel) => {
      const active = channel.id === selected;
      const tone: NbToneToken = active ? 'yellow' : 'background';

      return { ...channel, selected: active, tone };
    });
  });

  protected readonly severityTabs = computed(() => {
    const selected = this.selectedSeverity();

    return this.severities.map((severity) => {
      const active = severity.id === selected;
      const tone: NbToneToken = active ? 'success' : 'background';

      return { ...severity, selected: active, tone };
    });
  });

  protected readonly detailMinLength = computed(
    () => DETAIL_MIN_LENGTH[this.selectedSeverity()],
  );

  protected readonly detailLength = computed(
    () => this.ticketForm.detail().value().trim().length,
  );

  protected readonly contactSettled = computed(() =>
    this.ticketForm.contact().valid(),
  );

  protected readonly subjectSettled = computed(() =>
    this.ticketForm.subject().valid(),
  );

  protected readonly detailSettled = computed(() =>
    this.ticketForm.detail().valid(),
  );

  protected readonly readyToFile = computed(() => this.ticketForm().valid());

  protected selectChannel(channel: ReplyChannel): void {
    if (this.submitting() || this.selectedChannel() === channel) return;

    this.ticketForm.channel().value.set(channel);
  }

  protected selectSeverity(severity: Severity): void {
    if (this.submitting() || this.selectedSeverity() === severity) return;

    this.ticketForm.severity().value.set(severity);
  }

  protected retry(): void {
    if (this.submitting()) return;

    this.filed.set(false);
    this.ticketForm().reset({ ...INITIAL_TICKET });
  }

  private sendTicket(): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 500));
  }
}
