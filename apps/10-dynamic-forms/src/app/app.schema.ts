import {
  applyEach,
  applyWhenValue,
  max,
  min,
  pattern,
  required,
  schema,
  SchemaPathTree,
} from '@angular/forms/signals';
import {
  Application,
  ContractEngagement,
  DesignerApplication,
} from './app.model';

export const skillItemSchema = schema<string>((path) => {
  pattern(path, /^[A-Za-z]+$/, {
    message: 'Letters only. No numbers or special characters.',
  });
});

export function applicationSchema(path: SchemaPathTree<Application>): void {
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
      pattern(designer.portfolio, /^https?:\/\/.+\..+/i, {
        message: 'Enter a valid URL.',
      });
    },
  );
}
