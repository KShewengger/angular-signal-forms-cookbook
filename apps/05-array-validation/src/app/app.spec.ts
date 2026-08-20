import { Injector, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, type FieldTree } from '@angular/forms/signals';
import { App } from './app';
import {
  PizzaFormModel,
  PizzaFormModelItem,
  PizzaToppingId,
} from './app.model';
import { pizzaMakerSchema } from './app.schema';
import { PIZZA_TOPPINGS } from './app.data';

type ErrorReader = () => {
  errors(): ReadonlyArray<{ kind: string; message?: string }>;
};

const messagesOf = (field: ErrorReader): ReadonlyArray<string | undefined> =>
  field()
    .errors()
    .map((error) => error.message);

const kindsOf = (field: ErrorReader): ReadonlyArray<string> =>
  field()
    .errors()
    .map((error) => error.kind);

const buildPizzaForm = (
  counts: Partial<Record<PizzaToppingId, number>> = {},
): FieldTree<PizzaFormModel> => {
  const model = signal<PizzaFormModel>({
    toppings: PIZZA_TOPPINGS.map((topping) => ({
      id: topping.id,
      count: counts[topping.id] ?? 0,
    })),
  });
  return form(model, pizzaMakerSchema, { injector: TestBed.inject(Injector) });
};

const itemOf = (
  pizzaForm: FieldTree<PizzaFormModel>,
  id: PizzaToppingId,
): FieldTree<PizzaFormModelItem> => {
  const index = PIZZA_TOPPINGS.findIndex((topping) => topping.id === id);
  return pizzaForm.toppings[index];
};

describe('App (05 · Array Validation)', () => {
  describe('validation schema (isolated)', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    describe('per-item rules (applyEach)', () => {
      it('accepts a count within the topping max', () => {
        const item = itemOf(buildPizzaForm({ pepperoni: 3 }), 'pepperoni');
        expect(item.count().valid()).toBe(true);
      });

      it('accepts a zero count', () => {
        const item = itemOf(buildPizzaForm(), 'pepperoni');
        expect(item.count().valid()).toBe(true);
      });

      it('rejects a negative count with the min rule', () => {
        const item = itemOf(buildPizzaForm({ pepperoni: -1 }), 'pepperoni');
        expect(item.count().valid()).toBe(false);
        expect(messagesOf(item.count)).toContain('Count cannot be negative');
      });

      it('rejects a count above the topping max with toppingMax', () => {
        const item = itemOf(buildPizzaForm({ pepperoni: 6 }), 'pepperoni');
        expect(kindsOf(item.count)).toContain('toppingMax');
        expect(messagesOf(item.count)).toContain('Max 5');
        expect(item.count().valid()).toBe(false);
      });
    });

    describe('max derived from the topping id', () => {
      const cases: { id: PizzaToppingId; over: number; message: string }[] = [
        { id: 'mozzarella', over: 2, message: 'Max 1' },
        { id: 'tomato', over: 5, message: 'Max 4' },
        { id: 'basil', over: 4, message: 'Max 3' },
        { id: 'pepperoni', over: 6, message: 'Max 5' },
      ];

      cases.forEach(({ id, over, message }) => {
        it(`enforces the ${id} maximum (${message})`, () => {
          const counts = { [id]: over } as Partial<
            Record<PizzaToppingId, number>
          >;
          const item = itemOf(buildPizzaForm(counts), id);
          expect(kindsOf(item.count)).toContain('toppingMax');
          expect(messagesOf(item.count)).toContain(message);
        });
      });
    });

    describe('items validate independently', () => {
      it('keeps a valid item valid while a sibling is invalid', () => {
        const pizzaForm = buildPizzaForm({ pepperoni: 3, mozzarella: 2 });
        expect(itemOf(pizzaForm, 'pepperoni').count().valid()).toBe(true);
        expect(itemOf(pizzaForm, 'mozzarella').count().valid()).toBe(false);
      });
    });

    describe('form as a whole', () => {
      it('is valid when every topping is within range', () => {
        const pizzaForm = buildPizzaForm({ pepperoni: 5, tomato: 4 });
        expect(pizzaForm().valid()).toBe(true);
      });

      it('is invalid when any topping exceeds its max', () => {
        const pizzaForm = buildPizzaForm({ mozzarella: 2 });
        expect(pizzaForm().valid()).toBe(false);
        expect(pizzaForm().invalid()).toBe(true);
      });
    });
  });

  describe('component (DOM)', () => {
    let fixture: ComponentFixture<App>;
    let host: HTMLElement;

    const pizzaForm = (): FieldTree<PizzaFormModel> =>
      (
        fixture.componentInstance as unknown as {
          pizzaMakerForm: FieldTree<PizzaFormModel>;
        }
      ).pizzaMakerForm;

    const numberInputs = (): NodeListOf<HTMLInputElement> =>
      host.querySelectorAll<HTMLInputElement>('input[type="number"]');

    const visibleToppings = (): NodeListOf<Element> =>
      host.querySelectorAll('.topping--visible');

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [App],
      }).compileComponents();
      fixture = TestBed.createComponent(App);
      host = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
    });

    it('renders a number input and error slot for every topping', () => {
      expect(numberInputs().length).toBe(PIZZA_TOPPINGS.length);
      expect(host.querySelectorAll('app-validation-errors').length).toBe(
        PIZZA_TOPPINGS.length,
      );
    });

    it('shows the max message when a topping exceeds its limit', async () => {
      const item = itemOf(pizzaForm(), 'pepperoni');
      item.count().value.set(6);
      item.count().markAsTouched();
      await fixture.whenStable();

      expect(host.textContent).toContain('Max 5');
    });

    it('reveals toppings on the board as the count increases', async () => {
      expect(visibleToppings().length).toBe(0);

      itemOf(pizzaForm(), 'pepperoni').count().value.set(3);
      await fixture.whenStable();

      expect(visibleToppings().length).toBe(3);
    });
  });
});
