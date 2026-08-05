type Tone =
  | 'yellow'
  | 'pink'
  | 'mint'
  | 'lavender'
  | 'blue'
  | 'warning'
  | 'danger';
type Level = 'Core' | 'Pro';

export const SIGNAL_EXAMPLES: {
  title: string;
  category: string;
  app: string;
  description: string;
  api: string;
  level: Level;
  tags: string[];
  link: string;
  tone: Tone;
}[] = [
  {
    title: $localize`:@@recipe.01.title:Basic Form`,
    category: 'Form',
    app: $localize`:@@app.registrationForm:Registration Form`,
    description: $localize`:@@recipe.01.desc:Foundation form() with [formField] binding and live form state: touched, dirty, valid, and invalid.`,
    api: 'form()',
    level: 'Core',
    tags: ['form()', '[formField]', 'form state'],
    link: '01-basic-form/',
    tone: 'yellow',
  },
  {
    title: $localize`:@@recipe.02.title:Built-in Validations`,
    category: 'Validation',
    app: $localize`:@@app.registrationForm:Registration Form`,
    description: $localize`:@@recipe.02.desc:Built-in validators (required, email, minLength, pattern, min) with inline error messages and touched / dirty gating.`,
    api: 'required()',
    level: 'Core',
    tags: ['required', 'email', 'pattern'],
    link: '02-built-in-validations/',
    tone: 'pink',
  },
  {
    title: $localize`:@@recipe.03.title:Cross-field Validation`,
    category: 'Validation',
    app: $localize`:@@app.confirmEmail:Confirm Email`,
    description: $localize`:@@recipe.03.desc:Validate one field against another across the form tree.`,
    api: 'validate()',
    level: 'Core',
    tags: ['validate()', 'apply()', 'valueOf'],
    link: '03-cross-field-validation/',
    tone: 'blue',
  },
  {
    title: $localize`:@@recipe.04.title:Async Validation`,
    category: 'Async',
    app: $localize`:@@app.manageBooking:Manage Booking`,
    description: $localize`:@@recipe.04.desc:Debounced server checks with a pending state.`,
    api: 'validateHttp()',
    level: 'Pro',
    tags: ['validateHttp', 'debounce', 'pending'],
    link: '04-async-validation/',
    tone: 'warning',
  },
  {
    title: $localize`:@@recipe.05.title:Array Validation`,
    category: 'Arrays',
    app: $localize`:@@app.pizzaMaker:Pizza Maker`,
    description: $localize`:@@recipe.05.desc:Validate every item in an array with applyEach and per-item rules.`,
    api: 'applyEach()',
    level: 'Pro',
    tags: ['applyEach', 'arrays', 'per-item'],
    link: '05-array-validation/',
    tone: 'mint',
  },
  {
    title: $localize`:@@recipe.06.title:Custom Control`,
    category: 'Control',
    app: $localize`:@@app.pizzaBuilder:Pizza Builder`,
    description: $localize`:@@recipe.06.desc:Implement FormValueControl with its own validation.`,
    api: 'FormValueControl',
    level: 'Pro',
    tags: ['FormValueControl'],
    link: '06-custom-control/',
    tone: 'danger',
  },
  {
    title: $localize`:@@recipe.07.title:Debounced Input`,
    category: 'Async',
    app: $localize`:@@app.liveSearch:Live Search`,
    description: $localize`:@@recipe.07.desc:Delay model updates until the user pauses typing.`,
    api: 'debounce()',
    level: 'Pro',
    tags: ['debounce', 'blur'],
    link: '07-debounce/',
    tone: 'lavender',
  },
  {
    title: $localize`:@@recipe.08.title:Conditional Validation`,
    category: 'Logic',
    app: $localize`:@@app.bookingForm:Booking Form`,
    description: $localize`:@@recipe.08.desc:Rules that switch on based on other field values.`,
    api: 'when',
    level: 'Core',
    tags: ['when', 'required()'],
    link: '08-conditional-validation/',
    tone: 'yellow',
  },
  {
    title: $localize`:@@recipe.09.title:Zod Schema Validation`,
    category: 'Schema',
    app: $localize`:@@app.profileForm:Profile Form`,
    description: $localize`:@@recipe.09.desc:Drive validation straight from a Zod schema.`,
    api: 'zod()',
    level: 'Pro',
    tags: ['zod', 'standardSchema'],
    link: '09-zod/',
    tone: 'warning',
  },
  {
    title: $localize`:@@recipe.10.title:Dynamic Forms`,
    category: 'Dynamic',
    app: $localize`:@@app.dynamicForm:Dynamic Form`,
    description: $localize`:@@recipe.10.desc:Build the model, schema, and fields at runtime from a JSON config.`,
    api: 'schema()',
    level: 'Pro',
    tags: ['json', 'runtime', 'dynamic'],
    link: '10-dynamic-forms/',
    tone: 'blue',
  },
];

export const TONE_RAIL: Record<Tone, string> = {
  yellow: 'bg-nb-yellow',
  pink: 'bg-nb-pink',
  mint: 'bg-nb-mint',
  lavender: 'bg-nb-lavender',
  blue: 'bg-nb-blue',
  warning: 'bg-nb-warning',
  danger: 'bg-nb-danger',
};

export const TONE_TINT: Record<Tone, string> = {
  yellow: 'bg-nb-yellow/30',
  pink: 'bg-nb-pink/30',
  mint: 'bg-nb-mint/30',
  lavender: 'bg-nb-lavender/30',
  blue: 'bg-nb-blue/30',
  warning: 'bg-nb-warning/30',
  danger: 'bg-nb-danger/30',
};

export const TONE_WAVE: Record<Tone, string> = {
  yellow: '[--nb-title-wave-color:var(--nb-yellow)]',
  pink: '[--nb-title-wave-color:var(--nb-pink)]',
  mint: '[--nb-title-wave-color:var(--nb-mint)]',
  lavender: '[--nb-title-wave-color:var(--nb-lavender)]',
  blue: '[--nb-title-wave-color:var(--nb-blue)]',
  warning: '[--nb-title-wave-color:var(--nb-warning)]',
  danger: '[--nb-title-wave-color:var(--nb-danger)]',
};
