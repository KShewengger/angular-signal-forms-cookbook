import {
  apply,
  applyEach,
  applyWhenValue,
  debounce,
  max,
  min,
  pattern,
  required,
  schema,
  validate,
} from '@angular/forms/signals';
import { SKILL_DRAFT_DEBOUNCE_MS, SKILL_PATTERN } from './app.data';
import {
  Application,
  ContractEngagement,
  DesignerApplication,
} from './app.model';

export const skillItemSchema = schema<string>((path) => {
  pattern(path, SKILL_PATTERN, {
    message: 'Letters only. No numbers or special characters.',
  });
});

export const skillDraftSchema = schema<string>((path) => {
  required(path, { message: 'A skill is required.' });
  apply(path, skillItemSchema);
  debounce(path, SKILL_DRAFT_DEBOUNCE_MS);
});

export const applicationSchema = schema<Application>((path) => {
  required(path.name, { message: 'Name is required.' });

  required(path.years, {
    message: 'Years of experience is required.',
  });
  min(path.years, 0, { message: 'Keep years between 0 and 10.' });
  max(path.years, 10, { message: 'Keep years between 0 and 10.' });

  applyEach(path.skills, skillItemSchema);

  applyWhenValue(
    path.engagement,
    (engagement): engagement is ContractEngagement =>
      engagement.kind === 'contract',
    (contract) => {
      required(contract.dayRate, { message: 'Enter a day rate.' });
      min(contract.dayRate, 1, { message: 'Enter a day rate.' });
    },
  );

  applyWhenValue(
    path,
    (application): application is DesignerApplication =>
      application.role === 'designer',
    (designer) => {
      required(designer.portfolio, {
        message: 'Portfolio URL is required.',
      });
      validate(designer.portfolio, ({ value }) => {
        const url = value().trim();

        if (!url) return null;

        try {
          new URL(url);
          return null;
        } catch {
          return { kind: 'invalidUrl', message: 'Enter a valid URL.' };
        }
      });
    },
  );
});
