import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Tutorials',
      link: { type: 'doc', id: 'tutorial' },
      items: [
        'tutorials/overview',
        'tutorials/preparation',
        'tutorials/connection',
        'tutorials/telemetry',
        'tutorials/arm',
      ],
    },
    {
      type: 'category',
      label: 'Developer Tools',
      items: ['vscode-extension'],
    },
    {
      type: 'category',
      label: 'SDKs & Examples',
      items: ['easy-drone-library', 'example-easy-drone-python'],
    },
  ],
};

export default sidebars;
