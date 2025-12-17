import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroBadge}>Robotics + Drone Development</div>
        <Heading as="h1" className="hero__title">
          TensorFleet Developer Hub
        </Heading>
        <p className={clsx('hero__subtitle', styles.heroSubtitle)}>
          {siteConfig.tagline}
        </p>
        <div className={styles.buttons}>
          <Link
            className={clsx('button button--primary button--lg', styles.cta)}
            to="/docs/vscode-extension">
            Launch the VS Code cockpit
          </Link>
          <Link
            className={clsx('button button--outline button--lg', styles.ctaGhost)}
            to="/docs/easy-drone-library">
            Explore the Easy Drone SDK
          </Link>
        </div>
        <div className={styles.heroMeta}>
          PX4 · ROS 2 · Gazebo · Mission tooling · MCP for AI assistants
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
