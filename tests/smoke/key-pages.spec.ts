/**
 * tests/smoke/key-pages.spec.ts
 *
 * Verifies that every major page on abstrakt.ai is accessible and returns
 * a non-error HTTP response.  Catches regressions where pages are removed,
 * re-routed, or broken by CMS or deploy changes.
 *
 * Tag: @smoke
 */

import { type Page } from '@playwright/test';
import { test, expect } from '@fixtures/site.fixture';

// ── Page inventories ─────────────────────────────────────────────────────────

const PRODUCT_PAGES = [
  { name: 'Real-Time Agent Assist',   path: '/solutions/real-time-agent-assist/' },
  { name: 'Automated QA',             path: '/product/automated-qa-call-scorecard/' },
  { name: 'Voice Analytics',          path: '/solutions/conversational-intelligence-software/' },
  { name: 'Automated Sentiment & Summary', path: '/product/automated-sentiment-summary/' },
  { name: 'Integrations',             path: '/product/integrations/' },
];

const SOLUTION_PAGES = [
  { name: 'Compliance & QA',          path: '/solutions/compliance-qa/' },
  { name: 'Customer Service',         path: '/solutions/customer-service/' },
  { name: 'Revenue Generation',       path: '/solutions/sales/' },
  { name: 'Onboarding & Training',    path: '/solutions/coaching-training-onboarding/' },
  { name: 'Receivables Management',   path: '/solutions/receivables-management/' },
  { name: 'Healthcare',               path: '/solutions/healthcare/' },
  { name: 'Insurance',                path: '/solutions/insurance/' },
  { name: 'Legal',                    path: '/solutions/legal/' },
];

const COMPANY_PAGES = [
  { name: 'About',                    path: '/why-abstrakt/about/' },
  { name: 'Customer Stories',         path: '/why-abstrakt/customer-stories/' },
  { name: 'Careers',                  path: '/why-abstrakt/careers/' },
  { name: 'FAQs',                     path: '/faqs/' },
  { name: 'Contact Us',               path: '/why-abstrakt/contact-us/' },
  { name: 'Request Demo',             path: '/request-demo/' },
  { name: 'Privacy Policy',           path: '/privacy-policy/' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

async function assertPageOk(
  page: Page,
  path: string,
  label: string
): Promise<void> {
  const response = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  expect(
    response?.status() ?? 0,
    `${label} (${path}) returned an error HTTP status`
  ).toBeLessThan(400);
  const headings = await page.locator('h1, h2').count();
  expect(headings, `${label} page appears to be an error page (no headings found)`).toBeGreaterThan(0);
}

// ── Suites ───────────────────────────────────────────────────────────────────

test.describe('Product Pages Availability @smoke', () => {
  for (const { name, path } of PRODUCT_PAGES) {
    test(`${name} is accessible @smoke`, async ({ page }) => {
      await assertPageOk(page, path, name);
    });
  }
});

test.describe('Solution Pages Availability @smoke', () => {
  for (const { name, path } of SOLUTION_PAGES) {
    test(`${name} is accessible @smoke`, async ({ page }) => {
      await assertPageOk(page, path, name);
    });
  }
});

test.describe('Company Pages Availability @smoke', () => {
  for (const { name, path } of COMPANY_PAGES) {
    test(`${name} is accessible @smoke`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      expect(
        response?.status() ?? 0,
        `${name} (${path}) returned an error HTTP status`
      ).toBeLessThan(400);
    });
  }
});
