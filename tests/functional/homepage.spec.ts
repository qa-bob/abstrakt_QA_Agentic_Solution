/**
 * tests/functional/homepage.spec.ts
 *
 * Tests that all core homepage features are present and functional.
 * Covers hero, product sections, CTAs, social proof, testimonials,
 * stats, trust badges, and footer.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Homepage Features @functional', () => {
  test('has a hero heading @functional', async ({ homePage }) => {
    const heading = await homePage.getMainHeading();
    expect(heading.length, 'Homepage must have an H1 or H2 hero heading').toBeGreaterThan(0);
  });

  test('hero section has at least one CTA button @functional', async ({ homePage }) => {
    const ctaButtons = await homePage.getCTAButtons();
    expect(ctaButtons.length, 'Homepage hero should have at least one CTA').toBeGreaterThan(0);
  });

  test('primary CTA links to /request-demo/ @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const demoCTA = page.locator('a').filter({ hasText: /see abstrakt|request demo|book.*demo/i }).first();
    if (await demoCTA.count() > 0) {
      const href = await demoCTA.getAttribute('href');
      expect(href, 'Primary hero CTA must link to /request-demo/').toContain('request-demo');
    } else {
      const fallback = page.locator('a[href*="request-demo"]').first();
      expect(await fallback.count(), 'No link to /request-demo/ found on homepage').toBeGreaterThan(0);
    }
  });

  test('all four product sections are referenced on homepage @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    const sections = [
      { label: 'Real-time agent assist',   pattern: /real.?time agent assist/i },
      { label: 'QA & compliance',          pattern: /\bQA\b|quality.*assur|automated.*qa/i },
      { label: 'Sentiment & summary',      pattern: /sentiment|post.?call.*summar/i },
      { label: 'Voice analytics',          pattern: /voice analytics|analytics.*insight/i },
    ];
    for (const { label, pattern } of sections) {
      expect(pattern.test(bodyText), `Homepage is missing product section: "${label}"`).toBeTruthy();
    }
  });

  test('customer logo / social proof section is present @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Logos are often images — search full HTML (includes alt text) case-insensitively
    const html = (await page.content()).toLowerCase();
    const logos = ['johnson', 'conserve', 'unleashed', 'american'];
    const found = logos.filter(l => html.includes(l));
    expect(
      found.length,
      `Expected ≥2 customer logos on homepage, found: ${found.join(', ')}`
    ).toBeGreaterThanOrEqual(2);
  });

  test('testimonials section is present @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const testimonialEl = page.locator(
      'blockquote, [class*="testimonial"], [class*="review"], [class*="quote"]'
    );
    if (await testimonialEl.count() > 0) {
      expect(await testimonialEl.count()).toBeGreaterThan(0);
    } else {
      const bodyText = await page.evaluate<string>(() => document.body.innerText);
      const hasTestimonialAuthor = /Johnson.*Johnson|Customer Acquisition|Plate|Jeffcoat/i.test(bodyText);
      expect(hasTestimonialAuthor, 'No testimonials section detected on homepage').toBeTruthy();
    }
  });

  test('stats section shows measurable results @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      /\d+%|increase|decrease/i.test(bodyText),
      'Homepage should have a measurable-results / stats section'
    ).toBeTruthy();
  });

  test('trust and compliance badges are present (GDPR, HIPAA, PCI) @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Badges may be images — search full HTML so alt/aria-label text is included
    const html = await page.content();
    const badges = ['GDPR', 'HIPAA', 'PCI'];
    const found = badges.filter(b => html.toUpperCase().includes(b));
    expect(
      found.length,
      `Expected GDPR/HIPAA/PCI trust badges — found: ${found.join(', ')}`
    ).toBeGreaterThanOrEqual(2);
  });

  test('footer is present and references the Abstrakt domain @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const footer = page.locator('footer, [role="contentinfo"]').first();
    expect(await footer.count(), 'Page should have a footer').toBeGreaterThan(0);
    const footerText = (await footer.textContent()) ?? '';
    expect(
      /abstrakt/i.test(footerText),
      'Footer should reference the Abstrakt brand or domain'
    ).toBeTruthy();
  });

  test('homepage domcontentloaded in under 10 seconds @functional', async ({ page }) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    expect(elapsed, `Homepage took ${elapsed} ms — limit is 10 000 ms`).toBeLessThanOrEqual(10_000);
  });
});
