/**
 * tests/functional/demo.spec.ts
 *
 * Tests the /request-demo/ page — Abstrakt's primary conversion page.
 * Verifies heading, embedded form presence, social proof, and load state.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Request Demo Page @functional', () => {
  test('page loads with a demo-related heading @functional', async ({ productPage }) => {
    await productPage.navigateTo('/request-demo/');
    const h1 = await productPage.getH1();
    expect(h1.length, 'Demo page must have an H1').toBeGreaterThan(0);
    expect(h1, 'H1 should reference "action", "demo", or "Abstrakt"').toMatch(
      /action|demo|abstrakt/i
    );
  });

  test('page has an embedded form provider (HubSpot) @functional', async ({ contactPage, page }) => {
    await page.goto('/request-demo/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector(
      '.hbspt-form, .hs-form, form, [data-form-id]',
      { timeout: 10_000 }
    ).catch(() => null);
    const hasForm = await contactPage.hasEmbeddedProvider();
    expect(hasForm, 'Demo page should have an embedded form provider (HubSpot)').toBeTruthy();
  });

  test('page shows customer social proof logos @functional', async ({ productPage, page }) => {
    await productPage.navigateTo('/request-demo/');
    // Logos are images — search full HTML (includes alt text) case-insensitively
    const html = (await page.content()).toLowerCase();
    const logos = ['johnson', 'conserve', 'unleashed', 'american'];
    const found = logos.filter(l => html.includes(l));
    expect(
      found.length,
      `Demo page should show ≥2 customer logos — found: ${found.join(', ')}`
    ).toBeGreaterThanOrEqual(2);
  });

  test('page includes outcome metrics @functional', async ({ page }) => {
    await page.goto('/request-demo/', { waitUntil: 'domcontentloaded' });
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      /\d+%|increase|decrease|ramp|CSAT/i.test(bodyText),
      'Demo page should reference measurable outcomes to reinforce conversion'
    ).toBeTruthy();
  });

  test('page loads with navigation present @functional', async ({ productPage }) => {
    await productPage.navigateTo('/request-demo/');
    expect(await productPage.isLoaded(), 'Demo page should load with H1 and navigation').toBeTruthy();
  });
});
