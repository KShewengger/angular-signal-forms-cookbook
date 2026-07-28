type SignalExample = {
  title: string;
  description: string;
  tags: string[];
  link: string;
};

export const SIGNAL_EXAMPLES: SignalExample[] = [
  {
    title: 'Basic Form',
    description: 'Foundation form(), Field, and two-way value flow.',
    tags: ['form()', 'Field', 'basic'],
    link: '01-basic-form/',
  },
  {
    title: 'Validation Basics',
    description:
      'Built-in validators with error display and touched / dirty state.',
    tags: ['required', 'email', 'errors()', 'validation'],
    link: '02-validation/',
  },
  {
    title: 'Cross-field Validation',
    description: 'Validate one field against another across the form tree.',
    tags: ['schema', 'path', 'compare'],
    link: '03-cross-field/',
  },
  {
    title: 'Async Validation',
    description: 'Debounced server checks with a pending state.',
    tags: ['validateAsync', 'pending'],
    link: '04-async-validation/',
  },
  {
    title: 'Array Validation',
    description: 'Per-item rules, add / remove, and array-level errors.',
    tags: ['applyEach', 'arrays'],
    link: '05-array-validation/',
  },
  {
    title: 'Conditional Validation',
    description: 'Rules that switch on based on other field values.',
    tags: ['when', 'disabled'],
    link: '06-conditional-validation/',
  },
  {
    title: 'Custom Validation',
    description:
      'Write your own validators; validate a subtree with validateTree.',
    tags: ['validate', 'validateTree'],
    link: '07-custom-validation/',
  },
  {
    title: 'Zod Schema Validation',
    description: 'Drive validation straight from a Zod schema.',
    tags: ['zod', 'standardSchema'],
    link: '08-zod/',
  },
  {
    title: 'Custom Control',
    description: 'Implement FormValueControl with its own validation.',
    tags: ['FormValueControl'],
    link: '09-custom-control/',
  },
  {
    title: 'Form Submission',
    description: 'Submit lifecycle via form root with server error mapping.',
    tags: ['submit()', 'server errors'],
    link: '10-submission/',
  },
];
