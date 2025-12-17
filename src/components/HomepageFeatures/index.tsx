import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  image: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'VS Code mission control',
    image: require('@site/static/img/undraw_docusaurus_mountain.png').default,
    description: (
      <>
        Open Gazebo, PX4 telemetry, ROS 2, AI ops, and mission dashboards
        without leaving the editor. Project scaffolding and tool installers are
        built in.
      </>
    ),
  },
  {
    title: 'Easy Drone SDK',
    image: require('@site/static/img/undraw_docusaurus_tree.png').default,
    description: (
      <>
        Pure-Python Gazebo transport with discovery, bundled protobuf messages,
        and interchangeable ZeroMQ or Zenoh backends for reliable pub/sub.
      </>
    ),
  },
  {
    title: 'Ready-to-fly examples',
    image: require('@site/static/img/undraw_docusaurus_react.png').default,
    description: (
      <>
        Run <code>example-easy-drone-python</code> to test networking, connect
        to Gazebo, and validate topics before wiring your own autonomy stack.
      </>
    ),
  },
];

function Feature({ title, image, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={image} className={styles.featureSvg} role="img" alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
