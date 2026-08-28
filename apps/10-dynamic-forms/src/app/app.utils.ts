import { ROLES_BY_ID } from './app.data';
import type {
  Application,
  Engagement,
  EngagementKind,
  RoleId,
} from './app.model';

export function skillsForRole(role: RoleId): string[] {
  return [...ROLES_BY_ID[role].skills];
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
  switch (role) {
    case 'designer':
      return {
        role,
        name: '',
        years: null,
        engagement: createEngagement('fulltime'),
        skills: skillsForRole(role),
        portfolio: '',
      };
    case 'frontend':
      return {
        role,
        name: '',
        years: null,
        engagement: createEngagement('fulltime'),
        skills: skillsForRole(role),
      };
  }
}
