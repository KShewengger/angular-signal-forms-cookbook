import type {
  ChannelOption,
  ReplyChannel,
  Severity,
  SeverityOption,
} from './app.model';

export const SUBJECT_MIN_LENGTH = 8;

export const DETAIL_MIN_LENGTH: Record<Severity, number> = {
  low: 10,
  normal: 15,
  urgent: 20,
};

const EMAIL_CHANNEL: ChannelOption = {
  id: 'email',
  icon: 'tablerMail',
  label: $localize`:@@channelEmailLabel:Email`,
  contactLabel: $localize`:@@channelEmailContactLabel:Email address`,
  placeholder: $localize`:@@channelEmailPlaceholder:you@example.com`,
  requirement: $localize`:@@channelEmailRequirement:A valid email`,
};

const PHONE_CHANNEL: ChannelOption = {
  id: 'phone',
  icon: 'tablerPhone',
  label: $localize`:@@channelPhoneLabel:Phone`,
  contactLabel: $localize`:@@channelPhoneContactLabel:Phone number`,
  placeholder: $localize`:@@channelPhonePlaceholder:+639171234567`,
  requirement: $localize`:@@channelPhoneRequirement:International format`,
};

export const CHANNELS: ChannelOption[] = [EMAIL_CHANNEL, PHONE_CHANNEL];

export const CHANNELS_BY_ID: Record<ReplyChannel, ChannelOption> = {
  email: EMAIL_CHANNEL,
  phone: PHONE_CHANNEL,
};

const LOW_SEVERITY: SeverityOption = {
  id: 'low',
  label: $localize`:@@severityLowLabel:Low`,
};

const NORMAL_SEVERITY: SeverityOption = {
  id: 'normal',
  label: $localize`:@@severityNormalLabel:Normal`,
};

const URGENT_SEVERITY: SeverityOption = {
  id: 'urgent',
  label: $localize`:@@severityUrgentLabel:Urgent`,
};

export const SEVERITIES: SeverityOption[] = [
  LOW_SEVERITY,
  NORMAL_SEVERITY,
  URGENT_SEVERITY,
];

export const SEVERITIES_BY_ID: Record<Severity, SeverityOption> = {
  low: LOW_SEVERITY,
  normal: NORMAL_SEVERITY,
  urgent: URGENT_SEVERITY,
};

export const SAMPLE_CONTACT: Record<ReplyChannel, string> = {
  email: $localize`:@@sampleContactEmail:kristy@example.com`,
  phone: $localize`:@@sampleContactPhone:+639171234567`,
};

export const SAMPLE_SUBJECT = $localize`:@@sampleSubject:Card was charged twice`;

export const SAMPLE_DETAIL = $localize`:@@sampleDetail:I paid once on the billing page but my statement shows two identical charges made ten seconds apart.`;

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
