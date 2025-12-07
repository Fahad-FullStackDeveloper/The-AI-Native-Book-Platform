import React, { useMemo } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function FloatingShapes() {
  const shapes = useMemo(() => {
    const shapeArray = [];
    const count = 10; // Number of shapes
    for (let i = 0; i < count; i++) {
      shapeArray.push({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 80 + 20}px`,
        delay: `${Math.random() * 10}s`,
        duration: `${Math.random() * 15 + 10}s`,
      });
    }
    return shapeArray;
  }, []);

  return (
    <ul className={styles.shapeContainer}>
      {shapes.map((s) => (
        <li
          key={s.id}
          className={styles.shape}
          style={{
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}
    </ul>
  );
}


function HomepageHeader() {
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <FloatingShapes />
      <div className="container">
        <Heading as="h1" className="hero__title">
          The Physical AI & Humanoid Robotics Book
        </Heading>
        <p className="hero__subtitle">
          Building the Future of Embodied Intelligence.
          <br />
          A hands-on guide to Physical AI and Humanoid Robotics.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="http://localhost:3000/docs/physical-ai-humanoid-robotics/">
            Start Learning →
          </Link>
        </div>
      </div>
    </header>
  );
}

function KeyTechnologies() {
  const technologies = [
    {
      name: 'ROS 2',
      imageUrl: 'https://static.cdnlogo.com/logos/r/30/ros.svg',
      description: 'The standard open-source framework for robotics middleware.',
      link: '/docs/physical-ai-humanoid-robotics/module-1',
    },
    {
      name: 'Gazebo',
      imageUrl: '', // No reliable SVG found, using placeholder
      description: 'A powerful 3D robotics simulator for physics and sensors.',
      link: '/docs/physical-ai-humanoid-robotics/module-2',
    },
    {
      name: 'Unity',
      imageUrl: 'https://static.cdnlogo.com/logos/u/92/unity.svg',
      description: 'The engine for high-fidelity rendering and interactive experiences.',
      link: '/docs/physical-ai-humanoid-robotics/module-2',
    },
    {
      name: 'NVIDIA Isaac',
      imageUrl: 'https://static.cdnlogo.com/logos/n/22/nvidia-graphicsn.svg',
      description: 'The platform for AI-powered simulation and hardware acceleration.',
      link: '/docs/physical-ai-humanoid-robotics/module-3',
    },
  ];

  return (
    <section className={styles.technologiesSection}>
      <div className="container">
        <Heading as="h2" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Key Technologies You'll Master
        </Heading>
        <div className="row">
          {technologies.map((tech) => (
            <div key={tech.name} className="col col--3" style={{ marginBottom: '2rem' }}>
              <Link to={tech.link} className={styles.cardLink}>
                <div className={styles.techCard}>
                  {tech.imageUrl ? (
                    <img src={tech.imageUrl} alt={`${tech.name} Logo`} className={styles.techCardLogo} />
                  ) : (
                    <div className={styles.logoPlaceholder}>
                      <span>{tech.name}</span>
                    </div>
                  )}
                  <Heading as="h3">{tech.name}</Heading>
                  <p>{tech.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatYoullBuild() {
  const projects = [
    {
      title: 'Autonomous Humanoid Navigation',
      imageUrl: '/img/undraw_docusaurus_mountain.svg', // Using an existing Docusaurus image
      description: 'Develop an AI agent that enables humanoid robots to autonomously navigate complex environments, avoiding obstacles and reaching specified targets.',
      link: '/docs/physical-ai-humanoid-robotics/module-4', // Link to a relevant module
    },
    {
      title: 'AI-Powered Robotic Gripper',
      imageUrl: '/img/undraw_docusaurus_tree.svg', // Using an existing Docusaurus image
      description: 'Build a robotic gripper controlled by AI, capable of identifying and manipulating various objects with precision and adaptability.',
      link: '/docs/physical-ai-humanoid-robotics/module-3',
    },
    {
      title: 'Digital Twin for Humanoid Control',
      imageUrl: '/img/undraw_docusaurus_react.svg', // Using an existing Docusaurus image
      description: 'Create a high-fidelity digital twin of a humanoid robot, allowing for real-time simulation, testing, and control algorithm development.',
      link: '/docs/physical-ai-humanoid-robotics/module-2',
    },
  ];

  return (
    <section className={styles.buildSection}>
      <div className="container">
        <Heading as="h2" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          What You'll Build
        </Heading>
        <p className="hero__subtitle" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Gain practical skills by building these cutting-edge projects.
        </p>
        <div className="row">
          {projects.map((project) => (
            <div key={project.title} className="col col--4" style={{ marginBottom: '2rem' }}>
              <Link to={project.link} className={styles.cardLink}>
                <div className={styles.projectCard}>
                  <img src={project.imageUrl} alt={project.title} className={styles.projectCardImage} />
                  <div className={styles.projectCardContent}>
                    <Heading as="h3">{project.title}</Heading>
                    <p>{project.description}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description="An Open Source textbook on Physical AI & Humanoid Robotics">
      <HomepageHeader />
      <main>
        <KeyTechnologies />
        <WhatYoullBuild />
        <MeetTheAuthor />
      </main>
    </Layout>
  );
}

function MeetTheAuthor() {
  return (
    <section className={styles.authorSection}>
      <div className="container">
        <Heading as="h2" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Meet the Author
        </Heading>
        <div className={styles.authorCard}>
          <div className={styles.authorImageContainer}>
            <img 
              src="/img/docusaurus.png" 
              alt="Fahad Khakwani" 
              className={styles.authorImage} 
            />
          </div>
          <div className={styles.authorInfo}>
            <Heading as="h3">Fahad Khakwani</Heading>
            <p className={styles.authorTitle}>Developer</p>
            <p>
              Fahad is a passionate developer with a deep interest in AI, robotics, and open-source technologies. He is the primary author and developer of "The AI Native Book", a project born from his desire to make complex topics in Physical AI accessible to everyone.
            </p>
            <div className={styles.authorSocials}>
              <Link to="https://github.com/Fahad-FullStackDeveloper" className="button button--secondary button--outline">GitHub</Link>
              <Link to="https://www.linkedin.com/in/fahad-khakwani/" className="button button--secondary button--outline">LinkedIn</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
