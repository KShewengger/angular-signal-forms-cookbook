export type ReplyChannel = 'email' | 'phone';

export type Severity = 'low' | 'normal' | 'urgent';

export type Ticket = {
  channel: ReplyChannel;
  contact: string;
  severity: Severity;
  subject: string;
  detail: string;
};

export type ChannelOption = {
  id: ReplyChannel;
  icon: string;
  label: string;
  contactLabel: string;
  placeholder: string;
  requirement: string;
};

export type SeverityOption = {
  id: Severity;
  label: string;
};

export const INITIAL_TICKET: Ticket = {
  channel: 'email',
  contact: '',
  severity: 'normal',
  subject: '',
  detail: '',
};
