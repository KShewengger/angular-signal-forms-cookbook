import type {
  Application,
  EngagementOption,
  RoleId,
  RoleOption,
} from './app.model';

const FRONTEND_ROLE: RoleOption = {
  id: 'frontend',
  emoji: '💻',
  label: $localize`:@@roleFrontendLabel:Frontend`,
  skills: ['Angular', 'TypeScript', 'RxJS'],
  placeholder: $localize`:@@skillPlaceholderFrontend:e.g. Signals`,
  selectedTone: 'success',
};

const DESIGNER_ROLE: RoleOption = {
  id: 'designer',
  emoji: '🎨',
  label: $localize`:@@roleDesignerLabel:Designer`,
  skills: ['Angular', 'Figma', 'Sass'],
  placeholder: $localize`:@@skillPlaceholderDesigner:e.g. CDK`,
  selectedTone: 'pink',
};

export const SKILL_PATTERN = /^[A-Za-z]+$/;

export const SKILL_DRAFT_DEBOUNCE_MS = 500;

export const ROLES: RoleOption[] = [FRONTEND_ROLE, DESIGNER_ROLE];

export const ROLES_BY_ID: Record<RoleId, RoleOption> = {
  frontend: FRONTEND_ROLE,
  designer: DESIGNER_ROLE,
};

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

export const INITIAL_APPLICATION: Application = {
  role: 'frontend',
  name: '',
  years: null,
  engagement: { kind: 'fulltime' },
  skills: [...FRONTEND_ROLE.skills],
};
