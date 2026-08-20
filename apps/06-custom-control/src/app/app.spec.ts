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

describe('App (06 · Custom Control)', () => {
  describe('validation schema (isolated)', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    describe('per-item rules', () => {
      it('accepts a count within the topping max', () => {
        const item = itemOf(buildPizzaForm({ pepperoni: 3 }), 'pepperoni');
        expect(item.count().valid()).toBe(true);
      });

      it('rejects a negative count', () => {
        const item = itemOf(buildPizzaForm({ pepperoni: -1 }), 'pepperoni');
        expect(item.count().valid()).toBe(false);
        expect(messagesOf(item.count)).toContain('No negative');
        expect(kindsOf(item.count)).toContain('min');
      });

      it('suppresses validation while a topping is disabled', () => {
        // `disabled` fires at count >= max, so a count *above* max is always
        // disabled and a disabled field runs no validators: the `toppingMax`
        // rule is shadowed and never reported.
        const item = itemOf(buildPizzaForm({ pepperoni: 6 }), 'pepperoni');
        expect(item.count().disabled()).toBe(true);
        expect(item.count().errors().length).toBe(0);
      });
    });

    describe('disabled at the topping max', () => {
      const cases: { id: PizzaToppingId; max: number }[] = [
        { id: 'mozzarella', max: 1 },
        { id: 'tomato', max: 4 },
        { id: 'basil', max: 3 },
        { id: 'pepperoni', max: 5 },
      ];

      cases.forEach(({ id, max }) => {
        it(`disables ${id} once it reaches ${max}`, () => {
          expect(
            itemOf(buildPizzaForm({ [id]: max }), id)
              .count()
              .disabled(),
          ).toBe(true);
          expect(
            itemOf(buildPizzaForm({ [id]: max - 1 }), id)
              .count()
              .disabled(),
          ).toBe(false);
        });
      });
    });

    describe('conditional hidden (the cross-field rule)', () => {
      it('hides pepperoni once there is more than one tomato', () => {
        const pizzaForm = buildPizzaForm({ tomato: 2 });
        expect(itemOf(pizzaForm, 'pepperoni').count().hidden()).toBe(true);
      });

      it('keeps pepperoni visible when tomato is one or fewer', () => {
        expect(
          itemOf(buildPizzaForm({ tomato: 1 }), 'pepperoni')
            .count()
            .hidden(),
        ).toBe(false);
      });

      it('never hides the other toppings', () => {
        const pizzaForm = buildPizzaForm({ tomato: 2 });
        expect(itemOf(pizzaForm, 'mozzarella').count().hidden()).toBe(false);
        expect(itemOf(pizzaForm, 'basil').count().hidden()).toBe(false);
      });
    });

    describe('form as a whole', () => {
      it('is valid when every topping is within range', () => {
        expect(buildPizzaForm({ pepperoni: 5, basil: 3 })().valid()).toBe(true);
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

    const toppingEls = (): HTMLElement[] =>
      Array.from(host.querySelectorAll('app-topping'));

    const stepper = (id: PizzaToppingId): HTMLElement => {
      const index = PIZZA_TOPPINGS.findIndex((topping) => topping.id === id);
      return toppingEls()[index];
    };

    const upButton = (id: PizzaToppingId): HTMLButtonElement =>
      stepper(id).querySelectorAll('button')[0] as HTMLButtonElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [App],
      }).compileComponents();
      fixture = TestBed.createComponent(App);
      host = fixture.nativeElement as HTMLElement;
      await fixture.whenStable();
    });

    it('renders a custom control for every topping', () => {
      expect(toppingEls().length).toBe(PIZZA_TOPPINGS.length);
    });

    it('flows the control value into the form when incremented', async () => {
      upButton('mozzarella').click();
      await fixture.whenStable();

      expect(itemOf(pizzaForm(), 'mozzarella').count().value()).toBe(1);
    });

    it('reveals toppings on the board as the count increases', async () => {
      expect(host.querySelectorAll('.topping--visible').length).toBe(0);

      itemOf(pizzaForm(), 'pepperoni').count().value.set(3);
      await fixture.whenStable();

      expect(host.querySelectorAll('.topping--visible').length).toBe(3);
    });

    it('disables the increment button once a topping hits its max', async () => {
      itemOf(pizzaForm(), 'mozzarella').count().value.set(1); // max is 1
      await fixture.whenStable();

      expect(upButton('mozzarella').disabled).toBe(true);
    });

    it('hides the pepperoni control while there is more than one tomato', async () => {
      itemOf(pizzaForm(), 'tomato').count().value.set(2);
      await fixture.whenStable();

      expect(stepper('pepperoni').classList.contains('hidden')).toBe(true);
    });
  });
});
