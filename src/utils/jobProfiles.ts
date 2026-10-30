/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface JobProfileOption {
  title: string;
  category: string;
  domain: string;
  description: string;
  keySkills: string[];
  popular?: boolean;
}

export interface JobProfileCategory {
  name: string;
  icon: string;
  domain: string;
  profiles: JobProfileOption[];
}

export const JOB_PROFILE_CATEGORIES: JobProfileCategory[] = [
  {
    name: 'Software & Full Stack Engineering',
    icon: 'code',
    domain: 'Full Stack & Web Development',
    profiles: [
      {
        title: 'Full Stack Developer',
        category: 'Software & Full Stack Engineering',
        domain: 'Full Stack & Web Development',
        description: 'Builds end-to-end web applications with React, Node.js, Express, and MongoDB/SQL.',
        keySkills: ['React', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'TypeScript', 'Tailwind CSS'],
        popular: true,
      },
      {
        title: 'Software Development Engineer (SDE)',
        category: 'Software & Full Stack Engineering',
        domain: 'Full Stack & Web Development',
        description: 'Focuses on scalable architecture, data structures, algorithms, and high-throughput systems.',
        keySkills: ['Java', 'C++', 'Data Structures', 'Algorithms', 'System Design', 'Microservices'],
        popular: true,
      },
      {
        title: 'Frontend Engineer',
        category: 'Software & Full Stack Engineering',
        domain: 'Full Stack & Web Development',
        description: 'Specializes in high-performance web user interfaces, responsive design, and state management.',
        keySkills: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux', 'Vite', 'HTML5/CSS3'],
        popular: true,
      },
      {
        title: 'Backend Engineer',
        category: 'Software & Full Stack Engineering',
        domain: 'Backend & Systems Development',
        description: 'Designs reliable REST & GraphQL APIs, distributed database systems, and service logic.',
        keySkills: ['Node.js', 'Express', 'Python', 'Go', 'PostgreSQL', 'Redis', 'Docker'],
        popular: true,
      },
      {
        title: 'Java Full Stack Developer',
        category: 'Software & Full Stack Engineering',
        domain: 'Enterprise Systems & Java',
        description: 'Enterprise full stack development using Java Spring Boot and modern frontend frameworks.',
        keySkills: ['Java', 'Spring Boot', 'Hibernate', 'Microservices', 'Angular/React', 'Oracle/MySQL'],
      },
      {
        title: 'Python / Django Developer',
        category: 'Software & Full Stack Engineering',
        domain: 'Backend & Systems Development',
        description: 'Develops backend applications, scrapers, and data services with Django and FastAPI.',
        keySkills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Celery', 'Docker'],
      },
      {
        title: 'Mobile App Developer (React Native / Flutter)',
        category: 'Software & Full Stack Engineering',
        domain: 'Mobile Application Development',
        description: 'Builds cross-platform iOS and Android apps with native-grade UX and API integration.',
        keySkills: ['React Native', 'Flutter', 'Dart', 'TypeScript', 'iOS/Android APIs', 'Mobile UI'],
        popular: true,
      },
      {
        title: 'iOS Developer (Swift)',
        category: 'Software & Full Stack Engineering',
        domain: 'Mobile Application Development',
        description: 'Crafts native iOS applications using Swift, SwiftUI, UIKit, and Apple ecosystem APIs.',
        keySkills: ['Swift', 'SwiftUI', 'UIKit', 'Xcode', 'CoreData', 'Combine'],
      },
      {
        title: 'Android Developer (Kotlin)',
        category: 'Software & Full Stack Engineering',
        domain: 'Mobile Application Development',
        description: 'Creates native Android applications with Kotlin, Jetpack Compose, and Coroutines.',
        keySkills: ['Kotlin', 'Jetpack Compose', 'Android SDK', 'Room DB', 'Coroutines'],
      },
      {
        title: 'C++ / Systems Software Engineer',
        category: 'Software & Full Stack Engineering',
        domain: 'Systems & High-Performance Computing',
        description: 'Develops low-latency, memory-efficient systems, network daemons, and OS-level software.',
        keySkills: ['C++', 'Modern C++ (17/20)', 'Multithreading', 'Memory Optimization', 'Linux Internals'],
      },
    ],
  },
  {
    name: 'AI, Machine Learning & Data Science',
    icon: 'psychology',
    domain: 'AI, Machine Learning & Data Science',
    profiles: [
      {
        title: 'Machine Learning Engineer',
        category: 'AI, Machine Learning & Data Science',
        domain: 'AI, Machine Learning & Data Science',
        description: 'Designs, trains, and deploys predictive ML models and pipelines into production environments.',
        keySkills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'MLOps', 'Model Deployment'],
        popular: true,
      },
      {
        title: 'Generative AI & LLM Engineer',
        category: 'AI, Machine Learning & Data Science',
        domain: 'AI, Machine Learning & Data Science',
        description: 'Builds autonomous agents, RAG systems, and fine-tunes LLMs using Gemini, OpenAI, and LangChain.',
        keySkills: ['LLMs', 'RAG', 'LangChain', 'Vector DBs (Pinecone/Chroma)', 'Prompt Engineering', 'Python'],
        popular: true,
      },
      {
        title: 'Data Scientist',
        category: 'AI, Machine Learning & Data Science',
        domain: 'AI, Machine Learning & Data Science',
        description: 'Extracts actionable business insights and builds statistical models from complex data sets.',
        keySkills: ['Python', 'R', 'Statistical Analysis', 'Pandas', 'NumPy', 'Data Visualization', 'Hypothesis Testing'],
        popular: true,
      },
      {
        title: 'Data Analyst & BI Developer',
        category: 'AI, Machine Learning & Data Science',
        domain: 'Business Intelligence & Analytics',
        description: 'Analyzes organizational metrics, builds executive dashboards in Power BI/Tableau, and writes SQL.',
        keySkills: ['SQL', 'Power BI', 'Tableau', 'Excel Analytics', 'Data Warehousing', 'ETL Reporting'],
        popular: true,
      },
      {
        title: 'Data Platform / Big Data Engineer',
        category: 'AI, Machine Learning & Data Science',
        domain: 'Data Engineering & Big Data',
        description: 'Architects large-scale streaming pipelines and data warehouses using Spark, Kafka, and Snowflake.',
        keySkills: ['Apache Spark', 'Kafka', 'Airflow', 'Snowflake', 'Python', 'AWS Glue/Redshift'],
      },
      {
        title: 'Computer Vision & NLP Specialist',
        category: 'AI, Machine Learning & Data Science',
        domain: 'AI, Machine Learning & Data Science',
        description: 'Focuses on image/video processing, OCR, audio transcription, and natural language modeling.',
        keySkills: ['OpenCV', 'HuggingFace', 'Transformers', 'BERT', 'YOLO', 'PyTorch'],
      },
    ],
  },
  {
    name: 'Cloud, DevOps & Cyber Security',
    icon: 'cloud',
    domain: 'Cloud Infrastructure & DevOps',
    profiles: [
      {
        title: 'DevOps & CI/CD Engineer',
        category: 'Cloud, DevOps & Cyber Security',
        domain: 'Cloud Infrastructure & DevOps',
        description: 'Automates deployment pipelines, containerization, and infrastructure as code.',
        keySkills: ['Docker', 'Kubernetes', 'GitHub Actions', 'Terraform', 'CI/CD Pipelines', 'Linux', 'AWS'],
        popular: true,
      },
      {
        title: 'Cloud Solutions Architect',
        category: 'Cloud, DevOps & Cyber Security',
        domain: 'Cloud Infrastructure & DevOps',
        description: 'Architects resilient, cost-effective, and secure enterprise infrastructure in AWS, GCP, or Azure.',
        keySkills: ['AWS', 'Google Cloud (GCP)', 'Microsoft Azure', 'Terraform', 'Security Compliance', 'FinOps'],
        popular: true,
      },
      {
        title: 'Site Reliability Engineer (SRE)',
        category: 'Cloud, DevOps & Cyber Security',
        domain: 'Cloud Infrastructure & DevOps',
        description: 'Maintains system uptime, monitoring, SLOs, incident response, and automated self-healing.',
        keySkills: ['Prometheus', 'Grafana', 'Kubernetes', 'SLOs/SLAs', 'Incident Management', 'Go/Python'],
      },
      {
        title: 'Cyber Security Analyst / SOC Specialist',
        category: 'Cloud, DevOps & Cyber Security',
        domain: 'Cyber Security & Information Security',
        description: 'Defends networks against intrusions, analyzes vulnerabilities, and conducts threat hunting.',
        keySkills: ['SIEM', 'Network Security', 'Vulnerability Assessment', 'Threat Hunting', 'Firewalls', 'Wireshark'],
        popular: true,
      },
      {
        title: 'Ethical Hacker & Penetration Tester',
        category: 'Cloud, DevOps & Cyber Security',
        domain: 'Cyber Security & Information Security',
        description: 'Simulates attacks to uncover security loopholes in web apps, networks, and cloud environments.',
        keySkills: ['Burp Suite', 'Metasploit', 'OWASP Top 10', 'Penetration Testing', 'Kali Linux', 'CEH/OSCP'],
      },
      {
        title: 'Database Administrator (PostgreSQL / MongoDB / MySQL)',
        category: 'Cloud, DevOps & Cyber Security',
        domain: 'Database Administration',
        description: 'Manages database scaling, indexing, backups, high availability, and query performance tuning.',
        keySkills: ['PostgreSQL', 'MongoDB', 'MySQL', 'Query Optimization', 'Replication', 'Disaster Recovery'],
      },
    ],
  },
  {
    name: 'Government, Defense & Research Organizations',
    icon: 'shield',
    domain: 'Government & Defense Research',
    profiles: [
      {
        title: "DRDO Scientist / Technical Officer (Scientist 'B' / 'C')",
        category: 'Government, Defense & Research Organizations',
        domain: 'Government & Defense Research',
        description: 'Defense R&D focusing on avionics, radar systems, secure communications, and autonomous defense.',
        keySkills: ['Embedded C/C++', 'Signal Processing', 'Defense Tech', 'Robotics', 'RTOS', 'System Security'],
        popular: true,
      },
      {
        title: 'ISRO Space Research Scientist / Engineer',
        category: 'Government, Defense & Research Organizations',
        domain: 'Aerospace & Space Technology',
        description: 'Satellite communication systems, telemetry processing, space navigation, and orbital flight software.',
        keySkills: ['Flight Software', 'Telemetry', 'Satellite Systems', 'DSP', 'MATLAB/Simulink', 'C/C++'],
      },
      {
        title: 'National Informatics Center (NIC) Scientific Officer',
        category: 'Government, Defense & Research Organizations',
        domain: 'Government & Defense Research',
        description: 'Develops national public digital infrastructure, e-Governance portals, and citizen platforms.',
        keySkills: ['Java Enterprise', 'Python', 'e-Governance Architecture', 'PostgreSQL', 'Cyber Security'],
        popular: true,
      },
      {
        title: 'PSU IT / Systems Officer (IOCL / ONGC / NTPC / BEL / BHEL)',
        category: 'Government, Defense & Research Organizations',
        domain: 'Public Sector Enterprise IT',
        description: 'Oversees industrial SCADA automation, ERP systems, and enterprise network infrastructure.',
        keySkills: ['SCADA/PLC', 'Enterprise Networking', 'SAP/ERP', 'Database Admin', 'Industrial IoT'],
      },
      {
        title: 'Defense Cryptography & Secure Communications Specialist',
        category: 'Government, Defense & Research Organizations',
        domain: 'Government & Defense Research',
        description: 'Implements quantum-resistant cryptographic algorithms, hardware security modules, and cipher protocols.',
        keySkills: ['Cryptography', 'PKI', 'Hardware Security Modules (HSM)', 'Network Ciphers', 'C/Assembly'],
      },
    ],
  },
  {
    name: 'Product, Design & Quality Assurance',
    icon: 'design_services',
    domain: 'Product & Design',
    profiles: [
      {
        title: 'UI / UX & Product Designer',
        category: 'Product, Design & Quality Assurance',
        domain: 'Product & Design',
        description: 'Designs intuitive digital interfaces, interactive wireframes, prototypes, and user journeys.',
        keySkills: ['Figma', 'Design Systems', 'User Research', 'Wireframing', 'Prototyping', 'Accessibility (WCAG)'],
        popular: true,
      },
      {
        title: 'SDET / QA Automation Engineer',
        category: 'Product, Design & Quality Assurance',
        domain: 'Quality Assurance & SDET',
        description: 'Constructs automated end-to-end testing frameworks across web, mobile, and API layers.',
        keySkills: ['Selenium', 'Cypress', 'Playwright', 'Jest', 'Postman API Testing', 'Java/JavaScript CI/CD'],
        popular: true,
      },
      {
        title: 'Technical Product Manager (TPM)',
        category: 'Product, Design & Quality Assurance',
        domain: 'Product & Project Management',
        description: 'Bridges technical teams with customer requirements, sprint roadmaps, and feature architectures.',
        keySkills: ['Product Roadmapping', 'User Stories', 'Agile/Scrum', 'Data-driven Decisions', 'PRDs', 'Jira'],
      },
      {
        title: 'Scrum Master & Agile Project Manager',
        category: 'Product, Design & Quality Assurance',
        domain: 'Product & Project Management',
        description: 'Facilitates sprint ceremonies, unblocks engineering bottlenecks, and drives agile delivery metrics.',
        keySkills: ['Scrum Framework', 'Sprint Planning', 'Kanban', 'Jira/Confluence', 'Cross-team Alignment'],
      },
      {
        title: 'Manual & Performance Test Engineer',
        category: 'Product, Design & Quality Assurance',
        domain: 'Quality Assurance & SDET',
        description: 'Executes exploratory testing, security validation, stress testing, and JMeter load benchmarks.',
        keySkills: ['JMeter', 'LoadRunner', 'Test Case Design', 'Exploratory Testing', 'Bug Tracking'],
      },
    ],
  },
  {
    name: 'Embedded, Hardware & Emerging Tech',
    icon: 'memory',
    domain: 'Embedded Systems & Hardware',
    profiles: [
      {
        title: 'Embedded Systems & Firmware Engineer',
        category: 'Embedded, Hardware & Emerging Tech',
        domain: 'Embedded Systems & Hardware',
        description: 'Programs microcontrollers (ARM, ESP32, STM32), RTOS kernel tasks, and hardware peripheral drivers.',
        keySkills: ['Embedded C', 'FreeRTOS', 'ARM Cortex', 'UART/SPI/I2C', 'PCB Debugging', 'Oscilloscopes'],
      },
      {
        title: 'IoT & Robotics Systems Engineer',
        category: 'Embedded, Hardware & Emerging Tech',
        domain: 'Embedded Systems & Hardware',
        description: 'Designs connected smart sensor networks, MQTT protocols, kinematics, and ROS robotics nodes.',
        keySkills: ['ROS (Robot Operating System)', 'MQTT', 'Raspberry Pi / Arduino', 'C++', 'Python Sensors'],
      },
      {
        title: 'Blockchain & Web3 Smart Contract Engineer',
        category: 'Embedded, Hardware & Emerging Tech',
        domain: 'Web3 & Blockchain Technology',
        description: 'Develops secure Ethereum/Solana smart contracts, decentralized finance protocols, and dApps.',
        keySkills: ['Solidity', 'Rust', 'Ethers.js / Web3.js', 'Smart Contract Auditing', 'Hardhat/Foundry'],
      },
    ],
  },
];

// Flat list of all available job profile titles
export const ALL_JOB_PROFILES: string[] = JOB_PROFILE_CATEGORIES.flatMap((c) =>
  c.profiles.map((p) => p.title)
);

// High-demand popular job profiles for quick 1-click select chips
export const POPULAR_JOB_PROFILES: string[] = [
  'Full Stack Developer',
  'Software Development Engineer (SDE)',
  'Frontend Engineer',
  'Backend Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps & CI/CD Engineer',
  'DRDO Scientist / Technical Officer',
  'Cyber Security Analyst',
  'UI / UX & Product Designer',
  'SDET / QA Automation Engineer',
  'Mobile App Developer (React Native / Flutter)',
];

/**
 * Finds the corresponding category and domain for any given job role string
 */
export function getCategoryAndDomainForRole(roleTitle: string): {
  category: string;
  domain: string;
} {
  const clean = roleTitle.toLowerCase().trim();

  for (const cat of JOB_PROFILE_CATEGORIES) {
    for (const prof of cat.profiles) {
      if (
        prof.title.toLowerCase() === clean ||
        clean.includes(prof.title.toLowerCase()) ||
        prof.title.toLowerCase().includes(clean)
      ) {
        return { category: cat.name, domain: prof.domain };
      }
    }
  }

  // Keyword heuristic matching
  if (clean.includes('full stack') || clean.includes('frontend') || clean.includes('web') || clean.includes('react')) {
    return { category: 'Software & Full Stack Engineering', domain: 'Full Stack & Web Development' };
  }
  if (clean.includes('ai') || clean.includes('machine learning') || clean.includes('data') || clean.includes('llm')) {
    return { category: 'AI, Machine Learning & Data Science', domain: 'AI, Machine Learning & Data Science' };
  }
  if (clean.includes('devops') || clean.includes('cloud') || clean.includes('security') || clean.includes('sre')) {
    return { category: 'Cloud, DevOps & Cyber Security', domain: 'Cloud Infrastructure & DevOps' };
  }
  if (clean.includes('drdo') || clean.includes('isro') || clean.includes('nic') || clean.includes('govt') || clean.includes('defense')) {
    return { category: 'Government, Defense & Research Organizations', domain: 'Government & Defense Research' };
  }
  if (clean.includes('design') || clean.includes('ui') || clean.includes('ux') || clean.includes('product manager')) {
    return { category: 'Product, Design & Quality Assurance', domain: 'Product & Design' };
  }
  if (clean.includes('embedded') || clean.includes('iot') || clean.includes('hardware') || clean.includes('robotics')) {
    return { category: 'Embedded, Hardware & Emerging Tech', domain: 'Embedded Systems & Hardware' };
  }

  return { category: 'Software & Full Stack Engineering', domain: 'Full Stack & Web Development' };
}
