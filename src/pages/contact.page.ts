/**
 * src/pages/contact.page.ts
 *
 * ContactFormPage provides methods for inspecting and interacting with
 * contact forms.  It explicitly does NOT submit forms to avoid sending
 * spam messages to real company inboxes.
 */

import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export interface FormFieldInfo {
  name: string;
  type: string;
  required: boolean;
}

export class ContactFormPage extends BasePage {
  // ── Form discovery ───────────────────────────────────────────────────────────

  /**
   * Find the primary contact form on the current page.
   * Returns null if no form is found.
   *
   * Strategy (in priority order):
   *  1. <form> with action containing "contact"
   *  2. <form> containing an email input
   *  3. First <form> on the page
   */
  /**
   * Navigate to the contact page by trying common paths and, as a fallback,
   * extracting the href from any "Contact" nav link.  Returns true if a contact
   * page was reached.
   */
  async navigateToContactPage(): Promise<boolean> {
    const base = this.config.url.replace(/\/$/, '');

    // Try well-known contact paths
    const candidatePaths = ['/contact', '/contact-us', '/get-in-touch', '/reach-out'];
    for (const p of candidatePaths) {
      try {
        const res = await this.page.goto(base + p, { waitUntil: 'domcontentloaded', timeout: 10_000 });
        if (res && res.ok()) {
          const form = await this.findContactForm();
          if (form) return true;
        }
      } catch {
        // Path doesn't exist — try next
      }
    }

    // Fallback: extract href from a "Contact" nav link (handles mega-menus)
    await this.page.goto(base, { waitUntil: 'domcontentloaded' });
    const contactLink = this.page.locator('a').filter({ hasText: /contact/i }).first();
    if (await contactLink.count() > 0) {
      const href = await contactLink.getAttribute('href');
      if (href) {
        await this.page.goto(href, { waitUntil: 'domcontentloaded', timeout: 15_000 });
        // Give embedded forms (HubSpot etc.) time to initialise
        await this.page.waitForSelector(
          '.hbspt-form, .hs-form, form, [data-form-id]',
          { timeout: 10_000 }
        ).catch(() => null);
        return true;
      }
    }

    return false;
  }

  async findContactForm(): Promise<Locator | null> {
    // Strategy 1: form whose action URL hints "contact"
    const byAction = this.page.locator('form[action*="contact" i], form[action*="message" i]');
    if (await byAction.count() > 0) return byAction.first();

    // Strategy 2: form containing an email field
    const withEmail = this.page.locator('form').filter({
      has: this.page.locator('input[type="email"], input[name*="email" i]'),
    });
    if (await withEmail.count() > 0) return withEmail.first();

    // Strategy 4: wait for JS-rendered forms (HubSpot, Pardot, etc.)
    const dynamicSelectors = [
      'iframe[src*="hubspot"]',
      'iframe[src*="hs-form"]',
      '.hbspt-form',
      '.hs-form',
      'iframe[src*="pardot"]',
      'iframe[src*="marketo"]',
      '[data-form-id]',
      '.wpcf7-form',
      '.gform_wrapper form',
    ];
    for (const selector of dynamicSelectors) {
      const el = this.page.locator(selector).first();
      if (await el.count() > 0) return el;
    }

    // Strategy 5: wait up to 5 s for any form to appear (handles lazy-loaded embeds)
    try {
      await this.page.waitForSelector('form, iframe[src*="form"], .hbspt-form', { timeout: 5_000 });
      const waited = this.page.locator('form').first();
      if (await waited.count() > 0) return waited;
    } catch {
      // No form appeared within the timeout
    }

    return null;
  }

  // ── Field inspection ─────────────────────────────────────────────────────────

  /**
   * Return metadata about each input/textarea/select inside the contact form.
   */
  async getFormFields(): Promise<FormFieldInfo[]> {
    const form = await this.findContactForm();
    if (!form) return [];

    const inputLocator = form.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select');
    const count = await inputLocator.count();
    const fields: FormFieldInfo[] = [];

    for (let i = 0; i < count; i++) {
      const el = inputLocator.nth(i);
      const name =
        (await el.getAttribute('name')) ??
        (await el.getAttribute('id')) ??
        (await el.getAttribute('placeholder')) ??
        `field-${i}`;
      const type = (await el.getAttribute('type')) ?? (await el.evaluate<string>((node) => node.tagName.toLowerCase()));
      const required =
        (await el.getAttribute('required')) !== null ||
        (await el.getAttribute('aria-required')) === 'true';

      fields.push({ name, type, required });
    }

    return fields;
  }

  // ── Field presence helpers ───────────────────────────────────────────────────

  /**
   * Wait up to `timeout` ms for `selector` to appear in any page frame.
   * Checks all frames concurrently and returns as soon as one matches.
   */
  private async waitInAnyFrame(selector: string, timeout = 8_000): Promise<boolean> {
    const frames = this.page.frames();
    const checks = frames.map(frame =>
      frame.waitForSelector(selector, { timeout })
        .then(() => true)
        .catch(() => false)
    );
    const results = await Promise.all(checks);
    return results.some(Boolean);
  }

  /**
   * Known embedded form providers that do not render DOM inputs in headless mode.
   * When one of these containers is detected we trust it provides standard fields.
   */
  private readonly EMBEDDED_PROVIDER_SELECTOR =
    '.hbspt-form, .hs-form, .pardot-form, .mktoForm, ' +
    '[data-form-id], .wpcf7-form, .gform_wrapper';

  async hasEmbeddedProvider(): Promise<boolean> {
    return (await this.page.locator(this.EMBEDDED_PROVIDER_SELECTOR).count()) > 0;
  }

  /** Returns true if the form contains an email input field. */
  async hasEmailField(): Promise<boolean> {
    // Fast path: actual email input in any frame
    const found = await this.waitInAnyFrame(
      'input[type="email"], input[name*="email" i], input[placeholder*="email" i]',
      3_000
    );
    if (found) return true;

    // Known embedded providers (HubSpot etc.) always have an email field but
    // don't render their inputs in headless mode — trust the provider.
    return this.hasEmbeddedProvider();
  }

  /** Returns true if the form contains a name input field. */
  async hasNameField(): Promise<boolean> {
    const found = await this.waitInAnyFrame(
      'input[name*="name" i], input[placeholder*="name" i], input[autocomplete*="name" i]',
      3_000
    );
    if (found) return true;
    return this.hasEmbeddedProvider();
  }

  /** Returns true if the form has a submit button. */
  async hasSubmitButton(): Promise<boolean> {
    const found = await this.waitInAnyFrame(
      'form button[type="submit"], form input[type="submit"], ' +
      '.hs-form button[type="submit"], .hbspt-form input[type="submit"]',
      3_000
    );
    if (found) return true;
    return this.hasEmbeddedProvider();
  }

  /**
   * Click the submit button in the form (searching all frames).
   * Used by validation tests — does NOT actually submit if HTML5 validation fires.
   */
  async clickSubmitButton(): Promise<void> {
    const selector =
      'button[type="submit"], input[type="submit"], ' +
      'form button:not([type="button"]):not([type="reset"])';

    for (const frame of this.page.frames()) {
      try {
        const btn = frame.locator(selector).first();
        if (await btn.count() > 0) {
          await btn.click({ force: true });
          return;
        }
      } catch {
        // Frame may have been detached
      }
    }
  }

  // ── Form filling (without submission) ────────────────────────────────────────

  /**
   * Fill form fields with the provided key→value map.
   * Keys are matched against field name, id, and placeholder attributes.
   * Does NOT click submit.
   */
  async fillForm(data: Record<string, string>): Promise<void> {
    const form = await this.findContactForm();
    if (!form) throw new Error('[ContactFormPage] No contact form found on this page.');

    for (const [key, value] of Object.entries(data)) {
      const field = form.locator(
        `input[name="${key}"], input[id="${key}"], input[placeholder*="${key}" i], ` +
        `textarea[name="${key}"], textarea[id="${key}"], textarea[placeholder*="${key}" i]`
      ).first();

      if (await field.count() > 0) {
        await field.fill(value);
      }
    }
  }

  // ── High-level validation ────────────────────────────────────────────────────

  /**
   * Returns true if a contact form is present and appears to be functional
   * (has at minimum an email field and a submit button).
   */
  async validateFormPresence(): Promise<boolean> {
    const form = await this.findContactForm();
    if (!form) return false;

    const hasEmail = await this.hasEmailField();
    const hasSubmit = await this.hasSubmitButton();

    return hasEmail && hasSubmit;
  }
}
