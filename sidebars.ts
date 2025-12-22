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
      label: 'Drone Tutorials',
      link: { type: 'doc', id: 'tutorial' },
      items: [
        'tutorials/overview',
        'tutorials/00_preparation',
        'tutorials/01_connection',
        'tutorials/02_telemetry',
        'tutorials/03_arm',
        'tutorials/04_takeoff_land',
        'tutorials/05_offboard_hover',
        'tutorials/06_move_forward',
        'tutorials/07_goto_waypoint',
      ],
    },
    {
      type: 'category',
      label: 'Robotics Tutorials',
      link: { type: 'doc', id: 'robotics/00_overview' },
      items: [
        'robotics/00_overview',
        'robotics/01_robot_mover',
        'robotics/02_obstacle_avoider',
        'robotics/03_vision_yolo',
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
