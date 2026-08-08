import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidationErrors } from './validation-errors';

describe('ValidationErrors (06 · Custom Control)', () => {
  let fixture: ComponentFixture<ValidationErrors>;
  let host: HTMLElement;

  const errorsOf = (
    ...messages: string[]
  ): { kind: string; message: string }[] =>
    messages.map((message, index) => ({ kind: `error-${index}`, message }));

  const render = async (
    errors: { kind: string; message: string }[],
    visible: boolean,
  ): Promise<void> => {
    fixture.componentRef.setInput('errors', errors);
    fixture.componentRef.setInput('visible', visible);
    await fixture.whenStable();
  };

  const errorList = (): HTMLUListElement | null => host.querySelector('ul');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ValidationErrors] });
    fixture = TestBed.createComponent(ValidationErrors);
    host = fixture.nativeElement as HTMLElement;
  });

  describe('visibility', () => {
    it('renders nothing when not visible, even with errors', async () => {
      await render(errorsOf('Max 5'), false);

      expect(errorList()).toBeNull();
    });

    it('renders nothing when visible but there are no errors', async () => {
      await render([], true);

      expect(errorList()).toBeNull();
    });

    it('renders the errors when visible and present', async () => {
      await render(errorsOf('Max 5'), true);

      expect(errorList()).not.toBeNull();
    });
  });

  describe('rendering', () => {
    it('renders a flat list for a single error', async () => {
      await render(errorsOf('Max 5'), true);

      const list = errorList();
      expect(list?.classList.contains('list-disc')).toBe(false);
      expect(host.querySelectorAll('li').length).toBe(1);
      expect(host.textContent).toContain('Max 5');
    });

    it('renders a bullet list with every message for multiple errors', async () => {
      await render(errorsOf('No negative', 'Max 5'), true);

      const list = errorList();
      expect(list?.classList.contains('list-disc')).toBe(true);
      expect(list?.classList.contains('pl-5')).toBe(true);
      expect(host.querySelectorAll('li').length).toBe(2);
      expect(host.textContent).toContain('No negative');
      expect(host.textContent).toContain('Max 5');
    });
  });

  describe('accessibility', () => {
    it('exposes the errors to assistive technology', async () => {
      await render(errorsOf('Max 5'), true);

      const list = errorList();
      expect(list?.getAttribute('role')).toBe('alert');
      expect(list?.getAttribute('aria-live')).toBe('polite');
    });
  });
});
