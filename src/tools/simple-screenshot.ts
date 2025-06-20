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

const screenshotSchema = z.object({
  raw: z.boolean().optional().describe('Whether to return without compression (in PNG format). Default is false, which returns a JPEG image.')
});

const screenshot = defineTool({
  capability: 'core',
  schema: {
    name: 'browser_take_screenshot',
    title: 'Take a screenshot',
    description: 'Take a screenshot of the current browser page',
    inputSchema: screenshotSchema,
    type: 'readOnly',
  },

  handle: async (_context: Context, params) => {
    const base64 = await simpleBrowser.takeScreenshot();
    const fileType = params.raw ? 'png' : 'jpeg';

    return {
      code: [`// Screenshot taken`],
      action: async () => ({
        content: [{
          type: 'image' as 'image',
          data: base64,
          mimeType: fileType === 'png' ? 'image/png' : 'image/jpeg',
        }]
      }),
      captureSnapshot: false,
      waitForNetwork: false,
    };
  }
});

export default [screenshot];
