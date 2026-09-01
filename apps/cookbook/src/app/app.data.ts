const PAGES = 'https://kshewengger.github.io/angular-signal-forms-cookbook';

export const SIGNAL_EXAMPLES: {
  title: string;
  link: string;
  preview: string;
  wide?: boolean;
}[] = [
  {
    title: $localize`:@@recipe.01.title:Basic Form`,
    link: `${PAGES}/01-basic-form/`,
    preview: 'previews/01-basic-form.png',
  },
  {
    title: $localize`:@@recipe.02.title:Built-in Validations`,
    link: `${PAGES}/02-built-in-validations/`,
    preview: 'previews/02-built-in-validations.png',
  },
  {
    title: $localize`:@@recipe.03.title:Cross-field Validation`,
    link: `${PAGES}/03-cross-field-validation/`,
    preview: 'previews/03-cross-field-validation.png',
  },
  {
    title: $localize`:@@recipe.04.title:Async Validation`,
    link: `${PAGES}/04-async-validation/`,
    preview: 'previews/04-async-validation.png',
  },
  {
    title: $localize`:@@recipe.05.title:Array Validation`,
    link: `${PAGES}/05-array-validation/`,
    preview: 'previews/05-array-validation.png',
  },
  {
    title: $localize`:@@recipe.06.title:Custom Control`,
    link: `${PAGES}/06-custom-control/`,
    preview: 'previews/06-custom-control.png',
  },
  {
    title: $localize`:@@recipe.07.title:Debounced Input`,
    link: `${PAGES}/07-debounce-input/`,
    preview: 'previews/07-debounce-input.png',
  },
  {
    title: $localize`:@@recipe.08.title:Conditional Validation`,
    link: `${PAGES}/08-conditional-validation/`,
    preview: 'previews/08-conditional-validation.png',
  },
  {
    title: $localize`:@@recipe.09.title:Form Submission`,
    link: `${PAGES}/09-form-submission/`,
    preview: 'previews/09-form-submission.png',
  },
  {
    title: $localize`:@@recipe.10.title:Dynamic Forms`,
    link: `${PAGES}/10-dynamic-forms/`,
    preview: 'previews/10-dynamic-forms.png',
  },
  {
    title: $localize`:@@recipe.11.title:Zod Schema Validation`,
    link: `${PAGES}/11-zod-schema/`,
    preview: 'previews/11-zod-schema.png',
    wide: true,
  },
  {
    title: $localize`:@@recipe.12.title:Field Metadata`,
    link: `${PAGES}/12-field-metadata/`,
    preview: 'previews/12-field-metadata.png',
  },
];
