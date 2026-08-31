import { SIGNAL_EXAMPLES } from './app.data';

describe('SIGNAL_EXAMPLES', () => {
  it('defines all 12 recipes', () => {
    expect(SIGNAL_EXAMPLES).toHaveLength(12);
  });

  it('every recipe has the required fields', () => {
    for (const recipe of SIGNAL_EXAMPLES) {
      expect(recipe.title).toBeTruthy();
      expect(recipe.link).toMatch(
        /^https:\/\/github\.com\/KShewengger\/angular-signal-forms-cookbook\/tree\/main\/apps\/\d{2}-[a-z-]+$/,
      );
      expect(recipe.preview).toBeTruthy();
    }
  });

  it('derives each preview path from the recipe folder in its link', () => {
    for (const recipe of SIGNAL_EXAMPLES) {
      const slug = recipe.link.split('/').pop();

      expect(recipe.preview).toBe(`previews/${slug}.png`);
    }
  });

  it('has a unique link per recipe', () => {
    const links = SIGNAL_EXAMPLES.map((r) => r.link);

    expect(new Set(links).size).toBe(links.length);
  });
});
