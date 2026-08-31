const REPO =
  'https://github.com/KShewengger/angular-signal-forms-cookbook/tree/main/apps';

export const SIGNAL_EXAMPLES: {
  title: string;
  link: string;
  preview: string;
  wide?: boolean;
}[] = [
  {
    title: $localize`:@@recipe.01.title:Basic Form`,
    link: `${REPO}/01-basic-form`,
    preview: 'previews/01-basic-form.png',
  },
  {
    title: $localize`:@@recipe.02.title:Built-in Validations`,
    link: `${REPO}/02-built-in-validations`,
    preview: 'previews/02-built-in-validations.png',
  },
  {
    title: $localize`:@@recipe.03.title:Cross-field Validation`,
    link: `${REPO}/03-cross-field-validation`,
    preview: 'previews/03-cross-field-validation.png',
  },
  {
    title: $localize`:@@recipe.04.title:Async Validation`,
    link: `${REPO}/04-async-validation`,
    preview: 'previews/04-async-validation.png',
  },
  {
    title: $localize`:@@recipe.05.title:Array Validation`,
    link: `${REPO}/05-array-validation`,
    preview: 'previews/05-array-validation.png',
  },
  {
    title: $localize`:@@recipe.06.title:Custom Control`,
    link: `${REPO}/06-custom-control`,
    preview: 'previews/06-custom-control.png',
  },
  {
    title: $localize`:@@recipe.07.title:Debounced Input`,
    link: `${REPO}/07-debounce-input`,
    preview: 'previews/07-debounce-input.png',
  },
  {
    title: $localize`:@@recipe.08.title:Conditional Validation`,
    link: `${REPO}/08-conditional-validation`,
    preview: 'previews/08-conditional-validation.png',
  },
  {
    title: $localize`:@@recipe.09.title:Form Submission`,
    link: `${REPO}/09-form-submission`,
    preview: 'previews/09-form-submission.png',
  },
  {
    title: $localize`:@@recipe.10.title:Dynamic Forms`,
    link: `${REPO}/10-dynamic-forms`,
    preview: 'previews/10-dynamic-forms.png',
  },
  {
    title: $localize`:@@recipe.11.title:Zod Schema Validation`,
    link: `${REPO}/11-zod-schema`,
    preview: 'previews/11-zod-schema.png',
    wide: true,
  },
  {
    title: $localize`:@@recipe.12.title:Field Metadata`,
    link: `${REPO}/12-field-metadata`,
    preview: 'previews/12-field-metadata.png',
  },
];
