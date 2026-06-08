/**
 * tests/functional/customer-stories.spec.ts
 *
 * Tests the customer stories listing page and two specific story pages.
 * Verifies card count, expected company presence, link integrity,
 * and that individual story pages load correctly.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

const EXPECTED_COMPANIES = [
  'MJR',
  'Johnson',         // Johnson & Johnson
  'CRF',
  'Customer Acquisition',
  'Notable',
  'Blue Signal',
  'Plate',           // Plate IQ
  'Jeffcoat',
];

test.describe('Customer Stories @functional', () => {
  test('listing page loads with a heading @functional', async ({ customerStoriesPage }) => {
    await customerStoriesPage.navigate();
    const h1 = await customerStoriesPage.getH1();
    expect(h1.length, 'Customer Stories listing page must have an H1').toBeGreaterThan(0);
    expect(h1, 'H1 should reference customer stories or case studies').toMatch(
      /customer.*stor|case.*stud/i
    );
  });

  test('at least 6 story cards are present @functional', async ({ customerStoriesPage }) => {
    await customerStoriesPage.navigate();
    const count = await customerStoriesPage.getStoryCount();
    expect(count, `Expected ≥6 story cards, found ${count}`).toBeGreaterThanOrEqual(6);
  });

  test('expected customer company names appear on the listing page @functional', async ({
    customerStoriesPage, page,
  }) => {
    await customerStoriesPage.navigate();
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    const found = EXPECTED_COMPANIES.filter(name => bodyText.includes(name));
    expect(
      found.length,
      `Only found ${found.length}/${EXPECTED_COMPANIES.length} expected customers: ${found.join(', ')}`
    ).toBeGreaterThanOrEqual(5);
  });

  test('story cards have non-empty titles and valid hrefs @functional', async ({ customerStoriesPage }) => {
    await customerStoriesPage.navigate();
    const cards = await customerStoriesPage.getStoryCards();
    expect(cards.length, 'Must find at least one parseable story card').toBeGreaterThan(0);
    for (const card of cards) {
      expect(card.title.length, `Story card has empty title — href: ${card.href}`).toBeGreaterThan(0);
      expect(
        /^https?:\/\/|^\//.test(card.href),
        `Story card href "${card.href}" is not a valid absolute or relative URL`
      ).toBeTruthy();
    }
  });

  test('MJR Capital story page loads with a heading @functional', async ({ customerStoriesPage }) => {
    await customerStoriesPage.navigateToStory(
      '/why-abstrakt/customer-stories/mjr-capital-services-customer-story/'
    );
    const h1 = await customerStoriesPage.getStoryPageH1();
    expect(h1.length, 'MJR Capital story page should have an H1').toBeGreaterThan(0);
  });

  test('Johnson & Johnson story page loads with a heading @functional', async ({ customerStoriesPage }) => {
    await customerStoriesPage.navigateToStory(
      '/why-abstrakt/customer-stories/johnson-johnson-customer-story/'
    );
    const h1 = await customerStoriesPage.getStoryPageH1();
    expect(h1.length, 'Johnson & Johnson story page should have an H1').toBeGreaterThan(0);
  });
});
