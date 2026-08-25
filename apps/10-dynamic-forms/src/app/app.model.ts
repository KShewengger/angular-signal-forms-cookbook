export type FullTimeEngagement = { kind: 'fulltime' };

export type ContractEngagement = {
  kind: 'contract';
  dayRate: number | null;
};

export type Engagement = FullTimeEngagement | ContractEngagement;

export type Applicant = {
  name: string;
  role: 'frontend' | 'designer';
  years: number | null;
  engagement: Engagement;
  skills: string[];
};

export type FrontendApplication = Applicant & { role: 'frontend' };

export type DesignerApplication = Applicant & {
  role: 'designer';
  portfolio: string;
};

export type Application = FrontendApplication | DesignerApplication;

export type RoleId = Application['role'];
export type EngagementKind = Engagement['kind'];

export type RoleOption = {
  id: RoleId;
  emoji: string;
  label: string;
  skills: string[];
  placeholder: string;
};

export type EngagementOption = {
  kind: EngagementKind;
  label: string;
};
