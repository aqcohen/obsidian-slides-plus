import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    'getting-started',
    'guide',
    'features',
    'themes',
    'layouts',
    'frontmatter',
    'frontmatter-reference',
    'integrations',
    'export',
    'roadmap',
  ],

  developer: [
    {
      type: 'category',
      label: 'Developer Guide',
      collapsed: false,
      items: [
        'developer/intro',
        'developer/setup',
        'developer/architecture',
        'developer/extending',
        'developer/testing',
        'developer/contributing',
      ],
    },
  ],

  api: [
    {
      type: 'category',
      label: 'API Reference',
      collapsed: true,
      items: [
        'api/types',
        'api/parser',
        'api/render-engine',
      ],
    },
  ],
};

export default sidebars;
