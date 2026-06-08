/**
 * tests/functional/product-pages.spec.ts
 *
 * Tests that each product page loads with a correct H1, relevant body copy,
 * a demo CTA, and a stats/results section.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

interface ProductSpec {
  name: string;
  path: string;
  h1Pattern: RegExp;
  contentPattern: RegExp;
}

const PRODUCTS: ProductSpec[] = [
  {
    name: 'Real-Time Agent Assist',
    path: '/solutions/real-time-agent-assist/',
    h1Pattern: /real.?time agent assist/i,
    contentPattern: /script|recommend|coach|playbook|prompt/i,
  },
  {
    name: 'Automated QA',
    path: '/product/automated-qa-call-scorecard/',
    h1Pattern: /automated qa|quality|compliance/i,
    contentPattern: /score|PCI|PII|PHI|compliance/i,
  },
  {
    name: 'Voice Analytics',
    path: '/solutions/conversational-intelligence-software/',
    h1Pattern: /voice|analytics|conversation|intelligence/i,
    contentPattern: /analytic|insight|trend|reporting/i,
  },
  {
    name: 'Automated Sentiment & Summary',
    path: '/product/automated-sentiment-summary/',
    h1Pattern: /sentiment|summary/i,
    contentPattern: /sentiment|post.?call|summar/i,
  },
];

test.describe('Product Pages @functional', () => {
  for (const { name, path, h1Pattern, contentPattern } of PRODUCTS) {
    test.describe(name, () => {
      test(`${name}: H1 is present and relevant @functional`, async ({ productPage }) => {
        await productPage.navigateTo(path);
        const h1 = await productPage.getH1();
        expect(h1.length, `${name}: H1 must not be empty`).toBeGreaterThan(0);
        expect(h1, `${name}: H1 should be relevant to the product`).toMatch(h1Pattern);
      });

      test(`${name}: has a "Request Demo" CTA @functional`, async ({ productPage }) => {
        await productPage.navigateTo(path);
        expect(
          await productPage.hasDemoCTA(),
          `${name}: Page must have at least one link to /request-demo/`
        ).toBeTruthy();
      });

      test(`${name}: all demo CTAs link to /request-demo/ @functional`, async ({ productPage }) => {
        await productPage.navigateTo(path);
        const links = await productPage.getDemoCTALinks();
        expect(links.length, `${name}: Expected at least one demo CTA`).toBeGreaterThan(0);
        for (const link of links) {
          const href = await link.getAttribute('href') ?? '';
          expect(href, `${name}: Demo CTA href should contain "request-demo"`).toContain('request-demo');
        }
      });

      test(`${name}: body contains expected product copy @functional`, async ({ productPage, page }) => {
        await productPage.navigateTo(path);
        const bodyText = await page.evaluate<string>(() => document.body.innerText);
        expect(
          contentPattern.test(bodyText),
          `${name}: Page body should contain product-relevant copy`
        ).toBeTruthy();
      });

      test(`${name}: has a stats or results section @functional`, async ({ productPage }) => {
        await productPage.navigateTo(path);
        expect(
          await productPage.hasStatsSection(),
          `${name}: Should have a measurable results section (e.g. "25%")`
        ).toBeTruthy();
      });
    });
  }
});
