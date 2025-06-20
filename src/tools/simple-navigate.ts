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

import { z } from 'zod';
import { defineTool } from './tool.js';
import * as simpleBrowser from '../simple-browser.js';
import type { Context } from '../context.js';

const navigateSchema = z.object({
  url: z.string().describe('The URL to navigate to')
});

const navigate = defineTool({
  capability: 'core',
  schema: {
    name: 'browser_navigate',
    title: 'Navigate to URL',
    description: 'Navigate the browser to a specified URL',
    inputSchema: navigateSchema,
    type: 'destructive',
  },

  handle: async (_context: Context, params) => {
    // Will throw if AI doesn't have control
    await simpleBrowser.navigate(params.url);

    return {
      code: [`// Navigate to ${params.url}`],
      action: async () => ({
        content: [{
          type: 'text',
          text: `Navigated to ${params.url}`
        }]
      }),
      captureSnapshot: false,
      waitForNetwork: true,
    };
  }
});

export default [navigate];
