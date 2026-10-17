import type { AccentKey, Course, CourseLevel, Lesson } from "@/types";

interface LessonSeed {
  title: string;
  duration: number;
  summary: string;
}

interface CourseSeed {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  level: CourseLevel;
  accent: AccentKey;
  icon: string;
  price: number;
  lessons: LessonSeed[];
}

function buildContent(
  courseTitle: string,
  lessonTitle: string,
  summary: string
): string[] {
  return [
    `${summary} In this lesson you will work through the core ideas of "${lessonTitle}" step by step, with short examples you can follow along with directly in your own project.`,
    `We start with the fundamental concepts and quickly move into practical application. Each concept includes a visual walkthrough and a hands-on exercise so you can see how it fits inside the wider ${courseTitle} syllabus.`,
    `By the end of this lesson you should feel comfortable applying "${lessonTitle}" on your own. Take a moment to complete the practice task before moving on to the next lesson.`,
  ];
}

const courseSeeds: CourseSeed[] = [
  {
    id: "web-development",
    title: "Web Development",
    description:
      "Build modern, responsive websites from the ground up using HTML, CSS and JavaScript.",
    instructor: "Sarah Mitchell",
    category: "Development",
    level: "Beginner",
    accent: "blue",
    icon: "code",
    price: 45000,
    lessons: [
      { title: "HTML Fundamentals", duration: 25, summary: "Discover how the structure of a web page is built with HTML elements." },
      { title: "Semantic HTML & Accessibility", duration: 30, summary: "Write markup that is meaningful for screen readers and search engines." },
      { title: "CSS Basics & Selectors", duration: 35, summary: "Style your pages with colors, typography and layout rules." },
      { title: "Flexbox & Grid Layouts", duration: 40, summary: "Create flexible, modern layouts with Flexbox and CSS Grid." },
      { title: "Responsive Design Principles", duration: 30, summary: "Make your layouts adapt beautifully to every screen size." },
      { title: "JavaScript Essentials", duration: 45, summary: "Learn variables, functions and logic that power interactive pages." },
      { title: "DOM Manipulation", duration: 40, summary: "Select, update and respond to elements directly in the browser." },
      { title: "Building Your First Website", duration: 50, summary: "Bring everything together into a complete, polished project." },
    ],
  },
  {
    id: "python-programming",
    title: "Python Programming",
    description:
      "Learn to program in Python, from your very first script to object-oriented projects.",
    instructor: "David Chen",
    category: "Development",
    level: "Beginner",
    accent: "emerald",
    icon: "terminal",
    price: 50000,
    lessons: [
      { title: "Setting Up Python", duration: 20, summary: "Install Python and run your first script from the terminal." },
      { title: "Variables & Data Types", duration: 30, summary: "Store and work with numbers, text and booleans." },
      { title: "Control Flow & Loops", duration: 35, summary: "Make decisions and repeat work with if statements and loops." },
      { title: "Functions & Modules", duration: 40, summary: "Organize your code into reusable, testable pieces." },
      { title: "Lists, Tuples & Dictionaries", duration: 35, summary: "Master Python's core collection types." },
      { title: "Object-Oriented Python", duration: 45, summary: "Model real-world concepts with classes and objects." },
      { title: "File Handling & Exceptions", duration: 40, summary: "Read, write and protect your programs from errors." },
      { title: "Your First Python Project", duration: 50, summary: "Plan and build a small application end to end." },
    ],
  },
  {
    id: "ui-ux-design",
    title: "UI/UX Design",
    description:
      "Design delightful, user-centered interfaces with research, wireframes and modern tools.",
    instructor: "Emily Carter",
    category: "Design",
    level: "Beginner",
    accent: "fuchsia",
    icon: "palette",
    price: 40000,
    lessons: [
      { title: "Principles of Design", duration: 25, summary: "Understand balance, contrast, alignment and hierarchy." },
      { title: "Color Theory & Typography", duration: 30, summary: "Choose palettes and type that communicate clearly." },
      { title: "User Research Basics", duration: 35, summary: "Learn what your users actually need before you design." },
      { title: "Wireframing & Prototyping", duration: 40, summary: "Sketch and iterate on ideas quickly." },
      { title: "Design Systems", duration: 35, summary: "Create consistent, scalable component libraries." },
      { title: "Figma Essentials", duration: 45, summary: "Get productive in the industry-standard design tool." },
      { title: "Usability Testing", duration: 30, summary: "Validate your designs with real people." },
      { title: "Building a Portfolio Case Study", duration: 50, summary: "Present your process and results like a pro." },
    ],
  },
  {
    id: "cloud-computing",
    title: "Cloud Computing",
    description:
      "Understand the cloud and deploy real applications using modern infrastructure services.",
    instructor: "Michael Torres",
    category: "Infrastructure",
    level: "Beginner",
    accent: "sky",
    icon: "cloud",
    price: 55000,
    lessons: [
      { title: "Introduction to Cloud", duration: 25, summary: "Learn what the cloud is and why it matters." },
      { title: "Compute & Storage Services", duration: 35, summary: "Run servers and store data in the cloud." },
      { title: "Networking in the Cloud", duration: 40, summary: "Connect services securely with virtual networks." },
      { title: "Identity & Access Management", duration: 35, summary: "Control who can do what in your accounts." },
      { title: "Containers Overview", duration: 40, summary: "Package and ship applications with containers." },
      { title: "Serverless Fundamentals", duration: 35, summary: "Run code without managing servers." },
      { title: "Monitoring & Cost Management", duration: 30, summary: "Keep services healthy and costs predictable." },
      { title: "Deploying a Cloud App", duration: 50, summary: "Put a real application live in the cloud." },
    ],
  },
  {
    id: "database-fundamentals",
    title: "Database Fundamentals",
    description:
      "Learn how data is stored, queried and designed in modern relational databases.",
    instructor: "Priya Nair",
    category: "Data",
    level: "Beginner",
    accent: "amber",
    icon: "database",
    price: 48000,
    lessons: [
      { title: "What is a Database?", duration: 20, summary: "Understand why structured storage matters." },
      { title: "Relational Model Basics", duration: 30, summary: "Tables, rows, keys and relationships explained." },
      { title: "SQL SELECT Queries", duration: 35, summary: "Retrieve exactly the data you need." },
      { title: "Joins & Relationships", duration: 40, summary: "Combine data across multiple tables." },
      { title: "Indexes & Performance", duration: 35, summary: "Speed up your queries the right way." },
      { title: "Normalization", duration: 30, summary: "Design schemas that avoid duplication." },
      { title: "Transactions & ACID", duration: 35, summary: "Keep your data reliable and consistent." },
      { title: "Designing a Schema", duration: 45, summary: "Plan a database for a real application." },
    ],
  },
  {
    id: "introduction-to-devops",
    title: "Introduction to DevOps",
    description:
      "Bridge development and operations with automation, CI/CD and reliable practices.",
    instructor: "James Okafor",
    category: "Infrastructure",
    level: "Beginner",
    accent: "violet",
    icon: "infinity",
    price: 60000,
    lessons: [
      { title: "DevOps Culture & Principles", duration: 25, summary: "Why collaboration and automation win." },
      { title: "Version Control with Git", duration: 30, summary: "Track changes and collaborate safely." },
      { title: "CI/CD Pipelines", duration: 40, summary: "Automate building, testing and releasing code." },
      { title: "Infrastructure as Code", duration: 40, summary: "Define infrastructure in versioned files." },
      { title: "Configuration Management", duration: 35, summary: "Keep environments consistent and repeatable." },
      { title: "Monitoring & Logging", duration: 35, summary: "See what your systems are doing in production." },
      { title: "Security in DevOps", duration: 30, summary: "Shift security left into your pipeline." },
      { title: "Automating a Deployment", duration: 50, summary: "Ship an application with a full pipeline." },
    ],
  },
];

export const courses: Course[] = courseSeeds.map((seed) => ({
  id: seed.id,
  title: seed.title,
  description: seed.description,
  instructor: seed.instructor,
  category: seed.category,
  level: seed.level,
  accent: seed.accent,
  icon: seed.icon,
  price: seed.price,
  lessons: seed.lessons.map<Lesson>((lesson, index) => ({
    id: `${seed.id}-${index + 1}`,
    courseId: seed.id,
    order: index + 1,
    title: lesson.title,
    summary: lesson.summary,
    duration: lesson.duration,
    content: buildContent(seed.title, lesson.title, lesson.summary),
  })),
}));

export const allLessons: Lesson[] = courses.flatMap((course) => course.lessons);

export const categories: string[] = Array.from(
  new Set(courses.map((course) => course.category))
).sort();

export function getCourse(courseId: string): Course | undefined {
  return courses.find((course) => course.id === courseId);
}

export function getLesson(lessonId: string): Lesson | undefined {
  return allLessons.find((lesson) => lesson.id === lessonId);
}

export const totalCourseCount = courses.length;
export const totalLessonCount = allLessons.length;
