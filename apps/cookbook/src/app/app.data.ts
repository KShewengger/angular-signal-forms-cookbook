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
    tags: ['validate()', 'apply()', 'schema()'],
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
    app: $localize`:@@app.pizzaMaker:Pizza Maker`,
    description: $localize`:@@recipe.06.desc:Build a custom FormValueControl the framework binds value and state to.`,
    api: 'FormValueControl',
    level: 'Pro',
    tags: ['FormValueControl', 'stepper'],
    link: '06-custom-control/',
    tone: 'danger',
  },
  {
    title: $localize`:@@recipe.07.title:Debounced Input`,
    category: 'Async',
    app: $localize`:@@app.liveSearch:Live Search`,
    description: $localize`:@@recipe.07.desc:Delay model updates until the user pauses typing, then run a live fruit search.`,
    api: 'debounce()',
    level: 'Pro',
    tags: ['debounce', 'rxResource', 'live search'],
    link: '07-debounce-input/',
    tone: 'lavender',
  },
  {
    title: $localize`:@@recipe.08.title:Conditional Validation`,
    category: 'Logic',
    app: $localize`:@@app.starlightCinema:Starlight Cinema`,
    description: $localize`:@@recipe.08.desc:Rules that switch on based on other field values.`,
    api: 'applyWhen()',
    level: 'Core',
    tags: ['applyWhen', 'applyWhenValue', 'when'],
    link: '08-conditional-validation/',
    tone: 'yellow',
  },
  {
    title: $localize`:@@recipe.09.title:Form Submission`,
    category: 'Submit',
    app: $localize`:@@app.signalsPopQuiz:Signals Pop Quiz`,
    description: $localize`:@@recipe.09.desc:Submit to a server, then route its errors back onto the fields.`,
    api: '[formRoot]',
    level: 'Core',
    tags: ['[formRoot]', 'submitting()', 'server errors'],
    link: '09-form-submission/',
    tone: 'mint',
  },
  {
    title: $localize`:@@recipe.10.title:Dynamic Forms`,
    category: 'Dynamic',
    app: $localize`:@@app.roleBuilder:Role Builder`,
    description: $localize`:@@recipe.10.desc:Swap the form shape with the role: applyWhenValue narrows designer vs frontend, and contract vs fulltime.`,
    api: 'applyWhenValue()',
    level: 'Pro',
    tags: ['applyWhenValue', 'discriminated union', '[formRoot]'],
    link: '10-dynamic-forms/',
    tone: 'blue',
  },
  {
    title: $localize`:@@recipe.11.title:Zod Schema Validation`,
    category: 'Schema',
    app: $localize`:@@app.profileForm:Profile Form`,
    description: $localize`:@@recipe.11.desc:Drive validation straight from a Zod schema.`,
    api: 'zod()',
    level: 'Pro',
    tags: ['zod', 'standardSchema'],
    link: '11-zod/',
    tone: 'warning',
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
