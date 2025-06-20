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
import type { Context } from '../context.js';

// Simple global control state
let controlMode: 'ai' | 'human' = 'ai';

export const requestHumanControlTool = defineTool({
  capability: 'core',
  schema: {
    name: 'request_human_control',
    title: 'Request Human Control',
    description: 'Request human intervention for complex tasks like login, captcha, or other scenarios requiring human input',
    inputSchema: z.object({
      reason: z.string().describe('Why human help is needed')
    }),
    type: 'readOnly'
  },
  handle: async (_context: Context, params) => {
    controlMode = 'human';

    return {
      code: [`// Control transferred to human: ${params.reason}`],
      captureSnapshot: true,
      waitForNetwork: false,
      action: async () => ({
        content: [{
          type: 'text',
          text: `Control transferred to human. Reason: ${params.reason}\n\nThe human can now interact with the browser directly.`
        }]
      })
    };
  }
});

export const releaseControlTool = defineTool({
  capability: 'core',
  schema: {
    name: 'release_control',
    title: 'Release Control to AI',
    description: 'Release control back to AI after human intervention is complete',
    inputSchema: z.object({
      summary: z.string().optional().describe('Summary of what was accomplished')
    }),
    type: 'readOnly'
  },
  handle: async (_context: Context, params) => {
    controlMode = 'ai';

    return {
      code: [`// Control returned to AI`],
      captureSnapshot: true,
      waitForNetwork: false,
      action: async () => ({
        content: [{
          type: 'text',
          text: `Control returned to AI. ${params.summary || ''}`
        }]
      })
    };
  }
});

export const getControlStateTool = defineTool({
  capability: 'core',
  schema: {
    name: 'get_control_state',
    title: 'Get Control State',
    description: 'Check the current control state (AI or human control)',
    inputSchema: z.object({}),
    type: 'readOnly'
  },
  handle: async () => {
    return {
      code: [`// Current control state: ${controlMode}`],
      captureSnapshot: false,
      waitForNetwork: false,
      action: async () => ({
        content: [{
          type: 'text',
          text: `Current control mode: ${controlMode}`
        }]
      })
    };
  }
});

// Export control state for other modules
export function getControlMode(): 'ai' | 'human' {
  return controlMode;
}

export function setControlMode(mode: 'ai' | 'human'): void {
  controlMode = mode;
}

// Export all control transfer tools
export const controlTransferTools = [
  requestHumanControlTool,
  releaseControlTool,
  getControlStateTool
];
