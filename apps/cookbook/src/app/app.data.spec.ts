import { SIGNAL_EXAMPLES } from './app.data';

describe('SIGNAL_EXAMPLES', () => {
  it('defines all 12 recipes', () => {
    expect(SIGNAL_EXAMPLES).toHaveLength(12);
  });

  it('every recipe has the required fields', () => {
    for (const recipe of SIGNAL_EXAMPLES) {
      expect(recipe.title).toBeTruthy();
      expect(recipe.description).toBeTruthy();
      expect(recipe.api).toBeTruthy();
      expect(recipe.tags.length).toBeGreaterThan(0);
      expect(recipe.link).toMatch(/^\d{2}-[a-z-]+\/$/);
    }
  });

  it('derives each preview path from its recipe link', () => {
    for (const recipe of SIGNAL_EXAMPLES) {
      expect(recipe.preview).toBe(
        `previews/${recipe.link.replace(/\/$/, '')}.png`,
      );
    }
  });

  it('has a unique link per recipe', () => {
    const links = SIGNAL_EXAMPLES.map((r) => r.link);

    expect(new Set(links).size).toBe(links.length);
  });
});
