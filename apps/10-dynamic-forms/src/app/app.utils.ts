import { ROLES } from './app.data';
import type {
  Application,
  Engagement,
  EngagementKind,
  RoleId,
} from './app.model';

export function skillsForRole(role: RoleId): string[] {
  return [...(ROLES.find((option) => option.id === role)?.skills ?? [])];
}

export function createEngagement(kind: EngagementKind): Engagement {
  switch (kind) {
    case 'contract':
      return { kind, dayRate: null };
    case 'fulltime':
      return { kind };
  }
}

export function createApplication(role: RoleId): Application {
  const engagement = createEngagement('fulltime');

  switch (role) {
    case 'designer':
      return {
        role,
        name: '',
        years: null,
        engagement,
        skills: [],
        portfolio: '',
      };
    case 'frontend':
      return { role, name: '', years: null, engagement, skills: [] };
  }
}

export function switchApplicationRole(
  from: Application,
  role: RoleId,
  skills: readonly string[],
): Application {
  if (from.role === role) return from;

  const { name, years, engagement } = from;

  switch (role) {
    case 'designer':
      return {
        role,
        name,
        years,
        engagement,
        skills: [...skills],
        portfolio: '',
      };
    case 'frontend':
      return { role, name, years, engagement, skills: [...skills] };
  }
}
