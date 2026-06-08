/**
 * tests/regression/cta-links.spec.ts
 *
 * Regression tests for CTA link destinations.
 * Verifies that primary conversion links have not been accidentally rerouted
 * after a CMS update, navigation restructuring, or deployment.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

test.describe('CTA Link Destination Regression @functional', () => {
  test('all homepage "Request Demo" links point to /request-demo/ @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const links = await page.locator('a[href*="request-demo"]').all();
    expect(links.length, 'Homepage must have at least one link to /request-demo/').toBeGreaterThan(0);
    for (const link of links) {
      const href = await link.getAttribute('href') ?? '';
      expect(href, `Demo CTA href "${href}" should contain "request-demo"`).toContain('request-demo');
    }
  });

  test('"Login" link points to app.abstrakt.ai @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loginLink = page.locator('a').filter({ hasText: /^login$/i }).first();
    if (await loginLink.count() > 0) {
      const href = await loginLink.getAttribute('href') ?? '';
      expect(href, 'Login link should point to app.abstrakt.ai').toContain('app.abstrakt.ai');
    } else {
      const appLink = page.locator('a[href*="app.abstrakt.ai"]').first();
      expect(await appLink.count(), 'No link to app.abstrakt.ai found on homepage').toBeGreaterThan(0);
    }
  });

  test('Real-Time Agent Assist demo CTA links to /request-demo/ @functional', async ({ productPage }) => {
    await productPage.navigateTo('/solutions/real-time-agent-assist/');
    const links = await productPage.getDemoCTALinks();
    expect(links.length, 'Real-Time Agent Assist page must have a demo CTA').toBeGreaterThan(0);
    const href = await links[0].getAttribute('href');
    expect(href, 'Demo CTA on Real-Time Agent Assist page is mis-routed').toContain('request-demo');
  });

  test('Automated QA demo CTA links to /request-demo/ @functional', async ({ productPage }) => {
    await productPage.navigateTo('/product/automated-qa-call-scorecard/');
    const links = await productPage.getDemoCTALinks();
    expect(links.length, 'Automated QA page must have a demo CTA').toBeGreaterThan(0);
    const href = await links[0].getAttribute('href');
    expect(href, 'Demo CTA on Automated QA page is mis-routed').toContain('request-demo');
  });

  test('"Customer Stories" nav link points to /why-abstrakt/customer-stories/ @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const link = page.locator('a').filter({ hasText: /customer stories/i }).first();
    expect(await link.count(), 'No "Customer Stories" link found in navigation').toBeGreaterThan(0);
    const href = await link.getAttribute('href') ?? '';
    expect(href, '"Customer Stories" link href is incorrect').toContain('customer-stories');
  });

  test('"Contact Us" nav link points to the contact page @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const link = page.locator('a').filter({ hasText: /contact us/i }).first();
    expect(await link.count(), 'No "Contact Us" link found in navigation').toBeGreaterThan(0);
    const href = await link.getAttribute('href') ?? '';
    expect(href, '"Contact Us" link href is incorrect').toContain('contact');
  });

  test('footer "Privacy Policy" link points to /privacy-policy/ @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const link = page.locator('footer a, [role="contentinfo"] a')
      .filter({ hasText: /privacy/i })
      .first();
    expect(await link.count(), 'Footer must have a Privacy Policy link').toBeGreaterThan(0);
    const href = await link.getAttribute('href') ?? '';
    expect(href, 'Footer Privacy Policy link is mis-routed').toContain('privacy');
  });

  test('footer "Blog" link is present @functional', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const link = page.locator('footer a, [role="contentinfo"] a')
      .filter({ hasText: /\bblog\b/i })
      .first();
    expect(await link.count(), 'Footer must have a Blog link').toBeGreaterThan(0);
  });
});
