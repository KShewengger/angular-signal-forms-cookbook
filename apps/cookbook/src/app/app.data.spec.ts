import { SIGNAL_EXAMPLES, TONE_RAIL, TONE_TINT, TONE_WAVE } from './app.data';

describe('SIGNAL_EXAMPLES', () => {
  it('defines all 10 recipes', () => {
    expect(SIGNAL_EXAMPLES).toHaveLength(10);
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

  it('has a unique link per recipe', () => {
    const links = SIGNAL_EXAMPLES.map((r) => r.link);
    expect(new Set(links).size).toBe(links.length);
  });

  it('every recipe tone resolves to a class in each tone map', () => {
    for (const recipe of SIGNAL_EXAMPLES) {
      expect(TONE_RAIL[recipe.tone]).toBeTruthy();
      expect(TONE_TINT[recipe.tone]).toBeTruthy();
      expect(TONE_WAVE[recipe.tone]).toBeTruthy();
    }
  });
});
