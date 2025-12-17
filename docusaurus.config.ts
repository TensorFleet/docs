import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Tensorfleet Docs',
  tagline: 'Documentation for TensorFleet fleet APIs, mission graphs, and ROS/PX4 adapters to go from single drone to production fleets.',
  favicon: 'img/favico.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.tensorfleet.net',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'TensorFleet', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-QCZ1J8QSLK',
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/og.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '',
      logo: {
        alt: 'TensorFleet Logo',
        src: 'img/logoblack.png',
        srcDark: 'img/logowhite.png',
        height: '24px',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          label: 'Docs',
          position: 'left',
        },
        {
          type: 'doc',
          docId: 'vscode-extension',
          label: 'VS Code',
          position: 'left',
        },
        {
          href: 'https://tensorfleet.net',
          label: 'tensorfleet.net',
          position: 'right',
        },
        {
          href: 'https://github.com/TensorFleet',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
          position: 'right',
        },
      ],
    },
    footer: {
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Overview',
              to: '/docs/intro',
            },
            {
              label: 'VS Code Extension',
              to: '/docs/vscode-extension',
            },
            {
              label: 'easy-drone SDK',
              to: '/docs/easy-drone-library',
            },
            {
              label: 'Example Project',
              to: '/docs/example-easy-drone-python',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'TensorFleet',
              href: 'https://tensorfleet.net',
            },
            {
              label: 'VS Code Extension',
              href: 'https://github.com/TensorFleet/vscode-tensorfleet',
            },
            {
              label: 'easy-drone Library',
              href: 'https://github.com/TensorFleet/easy-drone-python',
            },
            {
              label: 'example-easy-drone-python',
              href: 'https://github.com/TensorFleet/example-easy-drone-python',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/TensorFleet',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} TensorFleet. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
