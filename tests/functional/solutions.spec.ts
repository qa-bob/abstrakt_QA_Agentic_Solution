/**
 * tests/functional/solutions.spec.ts
 *
 * Tests that each industry-vertical / solution page loads correctly,
 * contains topic-relevant copy, and surfaces a demo CTA.
 *
 * Tag: @functional
 */

import { test, expect } from '@fixtures/site.fixture';

interface SolutionSpec {
  name: string;
  path: string;
  contentPattern: RegExp;
}

const SOLUTIONS: SolutionSpec[] = [
  {
    name: 'Compliance & QA',
    path: '/solutions/compliance-qa/',
    contentPattern: /compliance|QA|quality|audit/i,
  },
  {
    name: 'Customer Service',
    path: '/solutions/customer-service/',
    contentPattern: /customer service|CSAT|support|resolution/i,
  },
  {
    name: 'Revenue Generation',
    path: '/solutions/sales/',
    contentPattern: /revenue|sales|opportunit/i,
  },
  {
    name: 'Onboarding & Training',
    path: '/solutions/coaching-training-onboarding/',
    contentPattern: /onboard|training|coaching|ramp/i,
  },
  {
    name: 'Receivables Management',
    path: '/solutions/receivables-management/',
    contentPattern: /receivable|collection|debt/i,
  },
  {
    name: 'Healthcare',
    path: '/solutions/healthcare/',
    contentPattern: /healthcare|HIPAA|patient|medical|health/i,
  },
  {
    name: 'Insurance',
    path: '/solutions/insurance/',
    contentPattern: /insurance|coverage|policy|claim/i,
  },
  {
    name: 'Legal',
    path: '/solutions/legal/',
    contentPattern: /legal|attorney|law|compliance/i,
  },
];

test.describe('Solution Pages @functional', () => {
  for (const { name, path, contentPattern } of SOLUTIONS) {
    test.describe(name, () => {
      test(`${name}: page loads with heading and navigation @functional`, async ({ productPage }) => {
        await productPage.navigateTo(path);
        expect(
          await productPage.isLoaded(),
          `${name}: Page should load with an H1 and navigation`
        ).toBeTruthy();
      });

      test(`${name}: body contains topic-relevant copy @functional`, async ({ productPage, page }) => {
        await productPage.navigateTo(path);
        const bodyText = await page.evaluate<string>(() => document.body.innerText);
        expect(
          contentPattern.test(bodyText),
          `${name}: Page body should mention relevant terms`
        ).toBeTruthy();
      });

      test(`${name}: has a demo CTA @functional`, async ({ productPage }) => {
        await productPage.navigateTo(path);
        expect(
          await productPage.hasDemoCTA(),
          `${name}: Page should have at least one link to /request-demo/`
        ).toBeTruthy();
      });
    });
  }
});
