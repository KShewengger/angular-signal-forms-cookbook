import { Component, computed, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import {
  NbButton,
  NbButtonTrailingIcon,
  NbCallout,
  NbChip,
  NbChipGroup,
  NbCluster,
  NbDisplay,
  NbInput,
  NbLabel,
  NbMediaItem,
  NbMediaItemDescription,
  NbMediaItemIcon,
  NbMediaItemTitle,
  NbProgress,
  NbSeparator,
  NbSplit,
  NbStack,
  NbSticker,
  NbText,
  NbTextarea,
  type NbToneToken,
} from '@ng-brutalism/ui';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  tablerBolt,
  tablerCheck,
  tablerCopyright,
  tablerMail,
  tablerPencil,
  tablerPhone,
  tablerRefresh,
  tablerTicket,
  tablerWand,
} from '@ng-icons/tabler-icons';
import {
  tablerCircleArrowLeftFill,
  tablerCircleArrowRightFill,
} from '@ng-icons/tabler-icons/fill';
import {
  CHANNELS,
  CHANNELS_BY_ID,
  DETAIL_MIN_LENGTH,
  LESSON_TOPICS,
  SEVERITIES,
  SEVERITIES_BY_ID,
  SUBJECT_MIN_LENGTH,
} from './app.data';
import { INITIAL_TICKET, ReplyChannel, Severity, Ticket } from './app.model';
import { ticketSchema } from './app.schema';
import { createSampleTicket } from './app.utils';
import { ValidationErrors } from './validation-errors';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    FormField,
    FormRoot,
    NbButton,
    NbButtonTrailingIcon,
    NbCallout,
    NbChip,
    NbChipGroup,
    NbCluster,
    NbDisplay,
    NbInput,
    NbLabel,
    NbMediaItem,
    NbMediaItemDescription,
    NbMediaItemIcon,
    NbMediaItemTitle,
    NbProgress,
    NbSeparator,
    NbSplit,
    NbStack,
    NbSticker,
    NbText,
    NbTextarea,
    NgIcon,
    ValidationErrors,
  ],
  viewProviders: [
    provideIcons({
      tablerBolt,
      tablerCheck,
      tablerCircleArrowLeftFill,
      tablerCircleArrowRightFill,
      tablerCopyright,
      tablerMail,
      tablerPencil,
      tablerPhone,
      tablerRefresh,
      tablerTicket,
      tablerWand,
    }),
  ],
  host: {
    class: 'relative mx-auto flex w-full max-w-5xl shrink-0 flex-col gap-4',
  },
})
export class App {
  protected readonly lessonTopics = LESSON_TOPICS;

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

  protected readonly activeSeverity = computed(
    () => SEVERITIES_BY_ID[this.selectedSeverity()],
  );

  protected readonly channelTabs = computed(() => {
    const selected = this.selectedChannel();

    return CHANNELS.map((channel) => {
      const active = channel.id === selected;
      const tone: NbToneToken = active ? 'yellow' : 'background';

      return { ...channel, selected: active, tone };
    });
  });

  protected readonly severityTabs = computed(() => {
    const selected = this.selectedSeverity();

    return SEVERITIES.map((severity) => {
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

  protected readonly detailRemaining = computed(() =>
    Math.max(this.detailMinLength() - this.detailLength(), 0),
  );

  protected readonly detailSettled = computed(() =>
    this.ticketForm.detail().valid(),
  );

  protected readonly readyToFile = computed(() => this.ticketForm().valid());

  protected readonly checks = computed(() => [
    {
      id: 'contact',
      label: $localize`:@@checkContactLabel:Reply address`,
      requirement: this.activeChannel().requirement,
      done: this.ticketForm.contact().valid(),
    },
    {
      id: 'subject',
      label: $localize`:@@checkSubjectLabel:Subject`,
      requirement: $localize`:@@checkCharactersRequirement:${SUBJECT_MIN_LENGTH}:COUNT: characters or more`,
      done: this.ticketForm.subject().valid(),
    },
    {
      id: 'detail',
      label: $localize`:@@checkDetailLabel:What happened`,
      requirement: $localize`:@@checkCharactersRequirement:${this.detailMinLength()}:COUNT: characters or more`,
      done: this.detailSettled(),
    },
  ]);

  protected selectChannel(channel: ReplyChannel): void {
    if (this.submitting() || this.selectedChannel() === channel) return;

    this.ticketForm().reset({
      ...INITIAL_TICKET,
      channel,
    });
  }

  protected selectSeverity(severity: Severity): void {
    if (this.submitting() || this.selectedSeverity() === severity) return;

    this.ticketForm.severity().value.set(severity);
  }

  protected prefill(): void {
    if (this.submitting()) return;

    const sample = createSampleTicket(
      this.selectedChannel(),
      this.selectedSeverity(),
    );

    this.ticketForm.contact().value.set(sample.contact);
    this.ticketForm.subject().value.set(sample.subject);
    this.ticketForm.detail().value.set(sample.detail);
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
