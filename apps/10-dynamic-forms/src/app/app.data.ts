import type { Application, EngagementOption, RoleOption } from './app.model';

export const ROLES: RoleOption[] = [
  {
    id: 'frontend',
    emoji: '💻',
    label: $localize`:@@roleFrontendLabel:Frontend`,
    skills: ['Angular', 'TypeScript', 'RxJS'],
    placeholder: $localize`:@@skillPlaceholderFrontend:e.g. Signals`,
  },
  {
    id: 'designer',
    emoji: '🎨',
    label: $localize`:@@roleDesignerLabel:Designer`,
    skills: ['Angular', 'Figma', 'Sass'],
    placeholder: $localize`:@@skillPlaceholderDesigner:e.g. CDK`,
  },
];

export const ENGAGEMENTS: EngagementOption[] = [
  {
    kind: 'fulltime',
    label: $localize`:@@engagementFullTimeLabel:Full-time`,
  },
  {
    kind: 'contract',
    label: $localize`:@@engagementContractLabel:Contract`,
  },
];

export const INITIAL_APPLICATION: Application = {
  role: 'frontend',
  name: '',
  years: null,
  engagement: { kind: 'fulltime' },
  skills: [...(ROLES.find((role) => role.id === 'frontend')?.skills ?? [])],
};
