/**
 * tests/regression/homepage-content.spec.ts
 *
 * Content regression tests — verify that specific, known homepage content
 * has not changed unexpectedly after a CMS update or redeployment.
 *
 * These tests are intentionally strict: a failure here means the site's
 * copy, stats, or trust section has changed and the product team should
 * be notified before the change is accepted.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('Homepage Content Regression @functional', () => {
  test('H1 contains "Empower Agents" and "Ensure Compliance" @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const h1 = (await page.locator('h1').first().textContent())?.trim() ?? '';
    expect(
      /Empower Agents/i.test(h1) && /Ensure Compliance/i.test(h1),
      `Homepage H1 has changed — current value: "${h1}". Review with product team.`
    ).toBeTruthy();
  });

  test('all product sections are present on homepage @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    const sections = [
      { label: 'Real-time agent assist',     pattern: /real.?time agent assist/i },
      { label: 'Automated QA / compliance',  pattern: /\bQA\b.*compliance|automated.*qa|quality.*assur/i },
      { label: 'Call sentiment & summary',   pattern: /sentiment|call.*summar|post.?call/i },
      { label: 'Voice analytics',            pattern: /voice analytics/i },
    ];
    for (const { label, pattern } of sections) {
      expect(pattern.test(bodyText), `Homepage is missing product section: "${label}"`).toBeTruthy();
    }
  });

  test('"Just look at the results" section heading is present @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    expect(
      /just look at the results/i.test(bodyText),
      '"Just look at the results" section heading is missing from homepage'
    ).toBeTruthy();
  });

  test('statistics block section heading and stat labels are present @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const bodyText = await page.evaluate<string>(() => document.body.innerText);
    // The stats section heading and outcome labels are static text in the DOM
    // Note: numeric values (25%, 40%, 18%) are JS-rendered counters — not testable via innerText
    const hasStatsSection = /just look at the results/i.test(bodyText);
    const hasStatLabels = /increase in|decrease in|accuracy.*score|ramp time/i.test(bodyText);
    expect(
      hasStatsSection,
      '"Just look at the results" section heading is missing — stats section may have been removed'
    ).toBeTruthy();
    expect(
      hasStatLabels,
      'Stats section outcome labels ("Increase in", "Decrease in") are missing from homepage'
    ).toBeTruthy();
  });

  test('all four trust badge images are present (SOC 2, HIPAA, GDPR, PCI) @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Trust badges are images with no alt text — detected by img src filename patterns
    const html = await page.content();
    const badgeChecks = [
      { label: 'GDPR',  pattern: /gdpr/i },
      { label: 'HIPAA', pattern: /hipaa/i },
      { label: 'PCI',   pattern: /pci/i },
      { label: 'SOC 2', pattern: /soc-2|soc2/i },
    ];
    for (const { label, pattern } of badgeChecks) {
      expect(
        pattern.test(html),
        `Trust badge "${label}" image not found in homepage HTML — confirm with security team`
      ).toBeTruthy();
    }
  });

  test('at least 3 known customer testimonials are present @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Carousel slides are in the HTML even when not visible — search full HTML
    const html = await page.content();
    const companies = [
      'Johnson',            // Johnson & Johnson
      'Customer Acquisition',
      'Plate',              // Plate IQ
      'Jeffcoat',
      'CRF',
      'Notable',
      'Blue Signal',
      'MJR',
    ];
    const found = companies.filter(c => html.includes(c));
    expect(
      found.length,
      `Expected ≥3 testimonial companies in HTML, found ${found.length}: ${found.join(', ')}`
    ).toBeGreaterThanOrEqual(3);
  });

  test('footer contains Privacy Policy and Contact links @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const footer = page.locator('footer, [role="contentinfo"]').first();
    const footerText = (await footer.textContent()) ?? '';
    const required = ['Privacy Policy', 'Contact'];
    for (const text of required) {
      expect(footerText, `Footer is missing "${text}" link`).toContain(text);
    }
  });
});
