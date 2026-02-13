import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/obsidian-slides-plus/__docusaurus/debug',
    component: ComponentCreator('/obsidian-slides-plus/__docusaurus/debug', 'e1d'),
    exact: true
  },
  {
    path: '/obsidian-slides-plus/__docusaurus/debug/config',
    component: ComponentCreator('/obsidian-slides-plus/__docusaurus/debug/config', '581'),
    exact: true
  },
  {
    path: '/obsidian-slides-plus/__docusaurus/debug/content',
    component: ComponentCreator('/obsidian-slides-plus/__docusaurus/debug/content', 'e23'),
    exact: true
  },
  {
    path: '/obsidian-slides-plus/__docusaurus/debug/globalData',
    component: ComponentCreator('/obsidian-slides-plus/__docusaurus/debug/globalData', 'ea0'),
    exact: true
  },
  {
    path: '/obsidian-slides-plus/__docusaurus/debug/metadata',
    component: ComponentCreator('/obsidian-slides-plus/__docusaurus/debug/metadata', 'cee'),
    exact: true
  },
  {
    path: '/obsidian-slides-plus/__docusaurus/debug/registry',
    component: ComponentCreator('/obsidian-slides-plus/__docusaurus/debug/registry', '80c'),
    exact: true
  },
  {
    path: '/obsidian-slides-plus/__docusaurus/debug/routes',
    component: ComponentCreator('/obsidian-slides-plus/__docusaurus/debug/routes', '240'),
    exact: true
  },
  {
    path: '/obsidian-slides-plus/search',
    component: ComponentCreator('/obsidian-slides-plus/search', '5e4'),
    exact: true
  },
  {
    path: '/obsidian-slides-plus/',
    component: ComponentCreator('/obsidian-slides-plus/', 'bf4'),
    routes: [
      {
        path: '/obsidian-slides-plus/',
        component: ComponentCreator('/obsidian-slides-plus/', '0ba'),
        routes: [
          {
            path: '/obsidian-slides-plus/',
            component: ComponentCreator('/obsidian-slides-plus/', '523'),
            routes: [
              {
                path: '/obsidian-slides-plus/api/parser',
                component: ComponentCreator('/obsidian-slides-plus/api/parser', '4d9'),
                exact: true,
                sidebar: "api"
              },
              {
                path: '/obsidian-slides-plus/api/render-engine',
                component: ComponentCreator('/obsidian-slides-plus/api/render-engine', '52d'),
                exact: true,
                sidebar: "api"
              },
              {
                path: '/obsidian-slides-plus/api/types',
                component: ComponentCreator('/obsidian-slides-plus/api/types', 'f0b'),
                exact: true,
                sidebar: "api"
              },
              {
                path: '/obsidian-slides-plus/developer/architecture',
                component: ComponentCreator('/obsidian-slides-plus/developer/architecture', '854'),
                exact: true,
                sidebar: "developer"
              },
              {
                path: '/obsidian-slides-plus/developer/contributing',
                component: ComponentCreator('/obsidian-slides-plus/developer/contributing', '69d'),
                exact: true,
                sidebar: "developer"
              },
              {
                path: '/obsidian-slides-plus/developer/extending',
                component: ComponentCreator('/obsidian-slides-plus/developer/extending', '59e'),
                exact: true,
                sidebar: "developer"
              },
              {
                path: '/obsidian-slides-plus/developer/intro',
                component: ComponentCreator('/obsidian-slides-plus/developer/intro', 'b73'),
                exact: true,
                sidebar: "developer"
              },
              {
                path: '/obsidian-slides-plus/developer/setup',
                component: ComponentCreator('/obsidian-slides-plus/developer/setup', '29e'),
                exact: true,
                sidebar: "developer"
              },
              {
                path: '/obsidian-slides-plus/developer/testing',
                component: ComponentCreator('/obsidian-slides-plus/developer/testing', 'bcc'),
                exact: true,
                sidebar: "developer"
              },
              {
                path: '/obsidian-slides-plus/export',
                component: ComponentCreator('/obsidian-slides-plus/export', 'f0b'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/obsidian-slides-plus/features',
                component: ComponentCreator('/obsidian-slides-plus/features', '48a'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/obsidian-slides-plus/frontmatter',
                component: ComponentCreator('/obsidian-slides-plus/frontmatter', '0f2'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/obsidian-slides-plus/getting-started',
                component: ComponentCreator('/obsidian-slides-plus/getting-started', 'd0c'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/obsidian-slides-plus/integrations',
                component: ComponentCreator('/obsidian-slides-plus/integrations', '530'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/obsidian-slides-plus/intro',
                component: ComponentCreator('/obsidian-slides-plus/intro', '34e'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/obsidian-slides-plus/layouts',
                component: ComponentCreator('/obsidian-slides-plus/layouts', '10d'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/obsidian-slides-plus/roadmap',
                component: ComponentCreator('/obsidian-slides-plus/roadmap', '32e'),
                exact: true
              },
              {
                path: '/obsidian-slides-plus/themes',
                component: ComponentCreator('/obsidian-slides-plus/themes', 'ab9'),
                exact: true,
                sidebar: "docs"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
