import type {
  ChannelOption,
  ReplyChannel,
  Severity,
  SeverityOption,
} from './app.model';

export const SUBJECT_MIN_LENGTH = 8;

export const DETAIL_MIN_LENGTH: Record<Severity, number> = {
  low: 20,
  normal: 40,
  urgent: 80,
};

const EMAIL_CHANNEL: ChannelOption = {
  id: 'email',
  icon: 'tablerMail',
  label: $localize`:@@channelEmailLabel:Email`,
  contactLabel: $localize`:@@channelEmailContactLabel:Email address`,
  placeholder: $localize`:@@channelEmailPlaceholder:you@example.com`,
};

const PHONE_CHANNEL: ChannelOption = {
  id: 'phone',
  icon: 'tablerPhone',
  label: $localize`:@@channelPhoneLabel:Phone`,
  contactLabel: $localize`:@@channelPhoneContactLabel:Phone number`,
  placeholder: $localize`:@@channelPhonePlaceholder:+639171234567`,
};

export const CHANNELS: ChannelOption[] = [EMAIL_CHANNEL, PHONE_CHANNEL];

export const CHANNELS_BY_ID: Record<ReplyChannel, ChannelOption> = {
  email: EMAIL_CHANNEL,
  phone: PHONE_CHANNEL,
};

export const SEVERITIES: SeverityOption[] = [
  { id: 'low', label: $localize`:@@severityLowLabel:Low` },
  { id: 'normal', label: $localize`:@@severityNormalLabel:Normal` },
  { id: 'urgent', label: $localize`:@@severityUrgentLabel:Urgent` },
];

export const LESSON_TOPICS = [
  {
    id: 'angular',
    tone: 'danger' as const,
    label: $localize`:@@angular22Label:Angular 22`,
  },
  {
    id: 'signal-forms',
    tone: 'accent' as const,
    label: $localize`:@@signalFormsLabel:Signal Forms`,
  },
  {
    id: 'ng-brutalism',
    tone: 'black' as const,
    label: $localize`:@@basicLabel:Ng-Brutalism`,
  },
];
