/**
 * src/pages/customer-stories.page.ts
 *
 * POM for the /why-abstrakt/customer-stories/ listing page
 * and individual customer story / case-study pages.
 */

import { BasePage } from '@pages/base.page';

export interface StoryCard {
  title: string;
  href: string;
}

export class CustomerStoriesPage extends BasePage {
  // ── Navigation ──────────────────────────────────────────────────────────────

  async navigate(): Promise<void> {
    await this.page.goto('/why-abstrakt/customer-stories/', { waitUntil: 'domcontentloaded' });
  }

  async navigateToStory(href: string): Promise<void> {
    await this.page.goto(href, { waitUntil: 'domcontentloaded' });
  }

  // ── Listing page ────────────────────────────────────────────────────────────

  async getH1(): Promise<string> {
    return (await this.page.locator('h1').first().textContent())?.trim() ?? '';
  }

  /**
   * Collect all unique story card links found on the listing page.
   *
   * Strategy: locate every <a> whose href points into the customer-stories/
   * directory, excluding the listing index itself and duplicate hrefs.
   */
  async getStoryCards(): Promise<StoryCard[]> {
    const links = this.page.locator('a[href*="/why-abstrakt/customer-stories/"]')
      .filter({ hasText: /\S/ });

    const count = await links.count();
    const seen = new Set<string>();
    const cards: StoryCard[] = [];

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const rawHref = (await link.getAttribute('href') ?? '').replace(/\/$/, '');
      const text = (await link.textContent())?.trim() ?? '';

      const isIndexPage = rawHref.endsWith('/why-abstrakt/customer-stories');
      if (!isIndexPage && !seen.has(rawHref) && text.length > 5) {
        seen.add(rawHref);
        cards.push({ title: text, href: await link.getAttribute('href') ?? '' });
      }
    }

    return cards;
  }

  async getStoryCount(): Promise<number> {
    return (await this.getStoryCards()).length;
  }

  // ── Individual story page ───────────────────────────────────────────────────

  async getStoryPageH1(): Promise<string> {
    return (await this.page.locator('h1').first().textContent())?.trim() ?? '';
  }

  async hasDemoCTA(): Promise<boolean> {
    return (await this.page.locator('a[href*="request-demo"]').count()) > 0;
  }
}
