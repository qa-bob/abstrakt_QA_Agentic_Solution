/**
 * src/pages/product.page.ts
 *
 * Generic POM for product and solution pages.
 * Provides heading inspection, CTA discovery, feature-list extraction,
 * and stats-section detection — all without hardcoding per-page selectors.
 */

import { type Locator } from '@playwright/test';
import { BasePage } from '@pages/base.page';

export class ProductPage extends BasePage {
  // ── Navigation ──────────────────────────────────────────────────────────────

  /** Navigate to any site-relative path (e.g. '/solutions/real-time-agent-assist/'). */
  async navigateTo(path: string): Promise<void> {
    const relative = path.startsWith('/') ? path : '/' + path;
    await this.page.goto(relative, { waitUntil: 'domcontentloaded' });
  }

  // ── Headings ────────────────────────────────────────────────────────────────

  async getH1(): Promise<string> {
    return (await this.page.locator('h1').first().textContent())?.trim() ?? '';
  }

  async getH2s(): Promise<string[]> {
    const h2s = await this.page.locator('h2').all();
    const texts: string[] = [];
    for (const h2 of h2s) {
      const text = (await h2.textContent())?.trim() ?? '';
      if (text) texts.push(text);
    }
    return texts;
  }

  // ── CTAs ────────────────────────────────────────────────────────────────────

  /** Returns all <a> locators whose href includes /request-demo/. */
  async getDemoCTALinks(): Promise<Locator[]> {
    return this.page.locator('a[href*="request-demo"]').all();
  }

  /** Returns true when at least one link to /request-demo/ exists on the page. */
  async hasDemoCTA(): Promise<boolean> {
    return (await this.page.locator('a[href*="request-demo"]').count()) > 0;
  }

  // ── Content checks ──────────────────────────────────────────────────────────

  /**
   * Returns true when the page body contains percentage or directional
   * language (e.g. "25%", "increase", "decrease") indicating a stats section.
   */
  async hasStatsSection(): Promise<boolean> {
    const bodyText = await this.page.evaluate<string>(() => document.body.innerText);
    return /\d+%|\d+x|\bincreas|\bdecreas/i.test(bodyText);
  }

  /**
   * Returns the visible text content of all <li> elements that look like
   * feature bullets (non-trivial length, not navigation items).
   */
  async getFeatureListItems(): Promise<string[]> {
    const items = await this.page.locator('ul li').all();
    const texts: string[] = [];
    for (const item of items) {
      const text = (await item.textContent())?.trim() ?? '';
      if (text.length > 5 && text.length < 200) texts.push(text);
    }
    return texts;
  }

  // ── Load state ──────────────────────────────────────────────────────────────

  /** Returns true when the page has an H1 and a navigation element. */
  async isLoaded(): Promise<boolean> {
    const h1Count = await this.page.locator('h1').count();
    const navCount = await this.page.locator('nav, [role="navigation"]').count();
    return h1Count > 0 && navCount > 0;
  }
}
