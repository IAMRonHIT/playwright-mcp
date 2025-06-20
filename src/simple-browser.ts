/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { chromium, Browser, Page } from 'playwright';
import { getControlMode, setControlMode } from './tools/control-transfer.js';

// Single browser instance
let browser: Browser | null = null;
let page: Page | null = null;

export async function initBrowser(): Promise<void> {

  if (browser)


  if (!browser) {
    browser = await chromium.launch({
      headless: false,
      args: ['--window-size=1920,1080']
    });
    console.log('Browser launched');
  }

  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  page = await context.newPage();
  await page.goto('https://www.google.com');
}

export async function getPage(): Promise<Page> {

  if (!page) {
    await initBrowser();
  }

  return page!;
}

export async function takeScreenshot(): Promise<string> {
  const p = await getPage();
  const buffer = await p.screenshot({ type: 'jpeg', quality: 80 });
  return buffer.toString('base64');
}

export async function navigate(url: string): Promise<void> {
  if (getControlMode() !== 'ai')
    throw new Error('AI does not have control');

  const p = await getPage();
  await p.goto(url);
}

export async function handleHumanInput(input: {
  type: 'mouse' | 'keyboard';
  action: string;
  x?: number;
  y?: number;
  key?: string;
}): Promise<void> {
  if (getControlMode() !== 'human')
    throw new Error('Human does not have control');

  const p = await getPage();

  if (input.type === 'mouse' && input.x !== undefined && input.y !== undefined) {
    switch (input.action) {
      case 'click':
        await p.mouse.click(input.x, input.y);
        break;
      case 'move':
        await p.mouse.move(input.x, input.y);
        break;
    }
  } else if (input.type === 'keyboard' && input.key) {
    switch (input.action) {
      case 'keydown':
        await p.keyboard.down(input.key);
        break;
      case 'keyup':
        await p.keyboard.up(input.key);
        break;
      case 'press':
        await p.keyboard.press(input.key);
        break;
    }
  }
}

export function getControlState(): 'ai' | 'human' {
  return getControlMode();
}

export function setControlState(mode: 'ai' | 'human'): void {
  setControlMode(mode);
}

// Cleanup on exit
process.on('beforeExit', async () => {
  if (browser)
    await browser.close();
});
