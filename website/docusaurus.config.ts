import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Slides Plus',
  tagline: 'Slidev-inspired presentations inside Obsidian',
  url: 'https://aqcohen.github.io',
  baseUrl: '/obsidian-slides-plus/',
  onBrokenLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'aqcohen',
  projectName: 'obsidian-slides-plus',

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/og-image.png',
    announcementBar: {
      id: 'announcement',
      content: '🎉 Slides Plus v0.2.0 coming soon - Custom themes support!',
      backgroundColor: '#7c3aed',
      textColor: '#ffffff',
      isCloseable: true,
    },
    navbar: {
      title: 'Slides Plus',
      logo: {
        alt: 'Slides Plus Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Documentation',
        },
        {
          type: 'docSidebar',
          sidebarId: 'developer',
          position: 'left',
          label: 'Developer',
        },
        {
          type: 'docSidebar',
          sidebarId: 'api',
          position: 'left',
          label: 'API Reference',
        },
        {
          href: 'https://github.com/aqcohen/obsidian-slides-plus',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Aquiles Cohen. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'yaml', 'markdown'],
    },
    algolia: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'obsidian-slides-plus',
    },
  },
};

export default config;
