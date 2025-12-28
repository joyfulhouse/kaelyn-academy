/**
 * Career Positions Data
 *
 * Centralized data for job listings. In production, this would
 * come from a database or CMS.
 */

export interface CareerPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  postedAt: Date;
}

export const openPositions: CareerPosition[] = [
  {
    id: "senior-fullstack-engineer",
    title: "Senior Full-Stack Engineer",
    department: "Engineering",
    location: "Remote (US)",
    type: "Full-time",
    description:
      "Build the next generation of interactive learning experiences using React, Next.js, and Three.js. You'll work on everything from 3D visualizations to AI-powered tutoring systems.",
    responsibilities: [
      "Design and implement new features across the full stack (React, Next.js, Node.js, PostgreSQL)",
      "Build interactive 3D educational visualizations using Three.js and React Three Fiber",
      "Collaborate with curriculum designers to bring educational concepts to life",
      "Contribute to AI/ML features for adaptive learning and personalization",
      "Write clean, maintainable code with comprehensive tests",
      "Participate in code reviews and help mentor junior engineers",
      "Work directly with users (teachers, students, parents) to understand needs",
    ],
    requirements: [
      "5+ years of professional software engineering experience",
      "Strong proficiency in TypeScript, React, and Node.js",
      "Experience with Next.js or similar full-stack frameworks",
      "Comfortable working across the stack (frontend, backend, database)",
      "Experience with PostgreSQL or similar relational databases",
      "Track record of shipping high-quality products",
      "Strong communication skills and ability to work autonomously",
    ],
    niceToHave: [
      "Experience with Three.js, WebGL, or 3D graphics",
      "Background in education technology (EdTech)",
      "Experience with AI/ML, particularly LLMs",
      "Experience with Drizzle ORM or similar TypeScript ORMs",
      "Contributions to open-source projects",
    ],
    salary: {
      min: 160000,
      max: 220000,
      currency: "USD",
    },
    postedAt: new Date("2024-12-15"),
  },
  {
    id: "curriculum-designer-math",
    title: "Curriculum Designer - Mathematics",
    department: "Curriculum",
    location: "Remote (US)",
    type: "Full-time",
    description:
      "Design engaging, standards-aligned math curriculum for K-12 students with interactive visualizations. You'll work closely with engineers to create immersive learning experiences that make abstract concepts concrete.",
    responsibilities: [
      "Design comprehensive K-12 mathematics curriculum aligned with Common Core standards",
      "Create lesson plans, assessments, and learning objectives for each unit",
      "Collaborate with engineers to design interactive 3D visualizations",
      "Develop AI tutoring prompts and adaptive learning pathways",
      "Conduct user research with teachers and students to validate curriculum",
      "Iterate on content based on learning analytics and feedback",
      "Stay current with best practices in mathematics education",
    ],
    requirements: [
      "Bachelor's degree in Mathematics, Education, or related field",
      "3+ years of experience teaching K-12 mathematics or designing curriculum",
      "Deep understanding of Common Core mathematics standards",
      "Experience creating engaging, interactive educational content",
      "Strong writing and communication skills",
      "Ability to translate complex concepts into accessible lessons",
      "Passion for making math accessible and enjoyable for all students",
    ],
    niceToHave: [
      "Master's degree in Mathematics Education or related field",
      "Experience with adaptive learning or personalized education",
      "Familiarity with learning management systems (LMS)",
      "Experience with 3D visualization or interactive media",
      "Published curriculum or educational materials",
    ],
    salary: {
      min: 90000,
      max: 130000,
      currency: "USD",
    },
    postedAt: new Date("2024-12-10"),
  },
  {
    id: "product-designer",
    title: "Product Designer",
    department: "Design",
    location: "Remote (US)",
    type: "Full-time",
    description:
      "Create delightful, accessible user experiences for students, teachers, and parents. You'll design interfaces that work for 5-year-olds and 50-year-olds alike, with a focus on clarity, accessibility, and engagement.",
    responsibilities: [
      "Design intuitive, accessible interfaces for web and mobile platforms",
      "Create age-adaptive UI patterns that work for K-12 students",
      "Develop and maintain design system components",
      "Conduct user research and usability testing with diverse audiences",
      "Collaborate closely with engineers to ship high-quality experiences",
      "Create prototypes to validate ideas before implementation",
      "Ensure designs meet WCAG 2.1 AA accessibility standards",
    ],
    requirements: [
      "4+ years of product design experience",
      "Strong portfolio demonstrating end-to-end product design",
      "Proficiency in Figma and modern design tools",
      "Experience designing for diverse user groups and age ranges",
      "Strong understanding of accessibility principles (WCAG)",
      "Experience with design systems and component libraries",
      "Ability to work collaboratively with engineers and product managers",
    ],
    niceToHave: [
      "Experience designing for education or children's products",
      "Experience with 3D or interactive design",
      "Background in front-end development",
      "Experience with motion design and micro-interactions",
      "Experience conducting user research",
    ],
    salary: {
      min: 130000,
      max: 180000,
      currency: "USD",
    },
    postedAt: new Date("2024-12-12"),
  },
  {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    department: "Engineering",
    location: "Remote (US)",
    type: "Full-time",
    description:
      "Build adaptive learning systems and AI-powered tutoring features that personalize education for every student. You'll work on everything from recommendation systems to conversational AI tutors.",
    responsibilities: [
      "Design and implement ML models for adaptive learning and personalization",
      "Build AI tutoring systems using LLMs (Claude, GPT) with RAG",
      "Develop recommendation systems for learning content and pathways",
      "Create systems to detect student misconceptions and learning gaps",
      "Work with curriculum team to integrate AI into learning experiences",
      "Monitor and improve model performance using learning analytics",
      "Ensure AI systems are fair, safe, and appropriate for K-12 students",
    ],
    requirements: [
      "4+ years of machine learning engineering experience",
      "Strong proficiency in Python and ML frameworks (PyTorch, TensorFlow)",
      "Experience with LLMs, prompt engineering, and RAG systems",
      "Experience deploying and monitoring ML models in production",
      "Strong understanding of ML fundamentals and evaluation metrics",
      "Experience with TypeScript/JavaScript for integration work",
      "Ability to work collaboratively across engineering and curriculum teams",
    ],
    niceToHave: [
      "Experience with educational AI or intelligent tutoring systems",
      "Background in cognitive science or learning science",
      "Experience with reinforcement learning for adaptive systems",
      "Experience with knowledge graphs or educational ontologies",
      "Published research in educational AI or related fields",
    ],
    salary: {
      min: 170000,
      max: 240000,
      currency: "USD",
    },
    postedAt: new Date("2024-12-14"),
  },
  {
    id: "customer-success-manager",
    title: "Customer Success Manager - Schools",
    department: "Customer Success",
    location: "Remote (US)",
    type: "Full-time",
    description:
      "Help schools successfully implement Kaelyn's Academy and achieve their learning goals. You'll be the primary point of contact for our school partners, ensuring they get maximum value from our platform.",
    responsibilities: [
      "Onboard new school partners and ensure successful implementation",
      "Build strong relationships with administrators, teachers, and IT staff",
      "Conduct training sessions for teachers and school staff",
      "Monitor usage and engagement metrics to identify at-risk accounts",
      "Work with product team to communicate customer feedback",
      "Develop best practices and success playbooks for implementation",
      "Drive renewals and expansion within your account portfolio",
    ],
    requirements: [
      "3+ years of customer success or account management experience",
      "Experience working with K-12 schools or educational institutions",
      "Strong presentation and training skills",
      "Ability to build relationships with diverse stakeholders",
      "Data-driven approach to customer health monitoring",
      "Excellent written and verbal communication skills",
      "Self-motivated and able to work independently",
    ],
    niceToHave: [
      "Previous teaching or school administration experience",
      "Experience with EdTech SaaS products",
      "Experience with CRM systems (Salesforce, HubSpot)",
      "Background in educational technology implementation",
      "Multilingual capabilities (Spanish preferred)",
    ],
    salary: {
      min: 80000,
      max: 120000,
      currency: "USD",
    },
    postedAt: new Date("2024-12-08"),
  },
];

/**
 * Get a position by ID
 */
export function getPositionById(id: string): CareerPosition | undefined {
  return openPositions.find((p) => p.id === id);
}

/**
 * Get all positions in a department
 */
export function getPositionsByDepartment(department: string): CareerPosition[] {
  return openPositions.filter((p) => p.department === department);
}

/**
 * Get all unique departments
 */
export function getDepartments(): string[] {
  return [...new Set(openPositions.map((p) => p.department))];
}

/**
 * Format salary range for display
 */
export function formatSalaryRange(salary: CareerPosition["salary"]): string {
  if (!salary) return "Competitive";

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: salary.currency,
    maximumFractionDigits: 0,
  });

  return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
}
