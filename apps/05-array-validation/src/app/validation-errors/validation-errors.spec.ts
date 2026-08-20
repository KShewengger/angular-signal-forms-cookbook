import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, type FieldTree } from '@angular/forms/signals';
import {
  PizzaFormModel,
  PizzaFormModelItem,
  PizzaToppingId,
} from '../app.model';
import { pizzaMakerSchema } from '../app.schema';
import { PIZZA_TOPPINGS } from '../app.data';
import { ValidationErrors } from './validation-errors';

describe('ValidationErrors (05 · Array Validation)', () => {
  let fixture: ComponentFixture<ValidationErrors>;
  let host: HTMLElement;

  const buildPizzaForm = (
    counts: Partial<Record<PizzaToppingId, number>> = {},
  ): FieldTree<PizzaFormModel> => {
    const model = signal<PizzaFormModel>({
      toppings: PIZZA_TOPPINGS.map((topping) => ({
        id: topping.id,
        count: counts[topping.id] ?? 0,
      })),
    });
    return form(model, pizzaMakerSchema, {
      injector: TestBed.inject(Injector),
    });
  };

  const itemOf = (
    pizzaForm: FieldTree<PizzaFormModel>,
    id: PizzaToppingId,
  ): FieldTree<PizzaFormModelItem> => {
    const index = PIZZA_TOPPINGS.findIndex((topping) => topping.id === id);
    return pizzaForm.toppings[index];
  };

  const showErrorsFor = async (
    field: FieldTree<PizzaFormModelItem>,
  ): Promise<void> => {
    fixture.componentRef.setInput('field', field);
    await fixture.whenStable();
  };

  const errorList = (): HTMLUListElement | null => host.querySelector('ul');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ValidationErrors] });
    fixture = TestBed.createComponent(ValidationErrors);
    host = fixture.nativeElement as HTMLElement;
  });

  describe('visibility', () => {
    it('renders nothing while the item is pristine and untouched', async () => {
      await showErrorsFor(itemOf(buildPizzaForm(), 'pepperoni'));

      expect(errorList()).toBeNull();
    });

    it('renders nothing for a valid item, even after it is touched', async () => {
      const item = itemOf(buildPizzaForm({ pepperoni: 3 }), 'pepperoni');
      item.count().markAsTouched();
      await showErrorsFor(item);

      expect(errorList()).toBeNull();
    });

    it('shows the errors once an invalid item is touched', async () => {
      const item = itemOf(buildPizzaForm({ pepperoni: 6 }), 'pepperoni');
      item.count().markAsTouched();
      await showErrorsFor(item);

      expect(errorList()).not.toBeNull();
    });

    it('shows the errors once an invalid item is dirty', async () => {
      const item = itemOf(buildPizzaForm({ pepperoni: 6 }), 'pepperoni');
      item.count().markAsDirty();
      await showErrorsFor(item);

      expect(errorList()).not.toBeNull();
    });
  });

  describe('rendering the real recipe errors', () => {
    it('surfaces the per-topping max message (aggregated via errorSummary)', async () => {
      const item = itemOf(buildPizzaForm({ pepperoni: 6 }), 'pepperoni');
      item.count().markAsTouched();
      await showErrorsFor(item);

      expect(host.textContent).toContain('Max 5');
    });

    it('surfaces the negative-count message', async () => {
      const item = itemOf(buildPizzaForm({ pepperoni: -1 }), 'pepperoni');
      item.count().markAsTouched();
      await showErrorsFor(item);

      expect(host.textContent).toContain('Count cannot be negative');
    });

    it('renders a flat list for a single error', async () => {
      const item = itemOf(buildPizzaForm({ mozzarella: 2 }), 'mozzarella');
      item.count().markAsTouched();
      await showErrorsFor(item);

      const list = errorList();
      expect(list?.classList.contains('list-disc')).toBe(false);
      expect(host.querySelectorAll('li').length).toBe(1);
    });
  });

  describe('accessibility', () => {
    it('exposes the errors to assistive technology', async () => {
      const item = itemOf(buildPizzaForm({ pepperoni: 6 }), 'pepperoni');
      item.count().markAsTouched();
      await showErrorsFor(item);

      const list = errorList();
      expect(list?.getAttribute('role')).toBe('alert');
      expect(list?.getAttribute('aria-live')).toBe('polite');
    });
  });
});
