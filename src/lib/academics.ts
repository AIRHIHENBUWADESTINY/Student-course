import type {
  AcademicLevel,
  CourseType,
  RegistrationStatus,
  Semester,
} from "@/types";

export interface Faculty {
  name: string;
  departments: string[];
}

/** Name of the faculty that groups every major area of technology. */
export const TECHNOLOGY_FACULTY = "Faculty of Technology";

/** A single course offered within a major technology area. */
export interface TechnologySubunit {
  /** Course title, e.g. "Frontend Development". */
  title: string;
  /** Catalogue description shown to students. */
  description: string;
}

/** A major technology area (department) with its introductory note and courses. */
export interface TechnologyArea {
  department: string;
  /** Short introductory note describing the area as a whole. */
  note: string;
  subunits: TechnologySubunit[];
}

/**
 * Major areas of technology and their courses. Each area is offered as a
 * department under the Faculty of Technology; the `note` introduces the area
 * and every subunit becomes a course offered by that department.
 */
export const TECHNOLOGY_AREAS: TechnologyArea[] = [
  {
    department: "Software Development",
    note: "Software Development focuses on designing, building, testing, deploying, and maintaining software applications. Students learn programming, application architecture, problem-solving, user interface development, and software quality practices used to create reliable solutions for individuals and organizations.",
    subunits: [
      {
        title: "Frontend Development",
        description:
          "Frontend Development teaches students how to build the visible parts of websites and web applications. Students learn HTML for structure, CSS for styling, JavaScript for interactivity, responsive design, accessibility, and component-based frameworks. The course emphasizes creating usable interfaces that work across desktop computers, tablets, and mobile devices.",
      },
      {
        title: "Backend Development",
        description:
          "Backend Development introduces the server-side technologies that power applications. Students learn how to process requests, implement business logic, authenticate users, manage databases, and protect sensitive information. Topics include server frameworks, application architecture, error handling, validation, and deployment. Practical exercises help students build reliable services that support frontend applications.",
      },
      {
        title: "Full-Stack Development",
        description:
          "Full-Stack Development combines frontend and backend programming to create complete applications. Students learn how interfaces communicate with servers, how databases store information, and how authentication protects accounts. Practical projects cover application architecture, API integration, validation, testing, and deployment, enabling learners to develop applications from the user interface through to the database.",
      },
      {
        title: "Mobile App Development",
        description:
          "Mobile App Development focuses on creating applications for smartphones and tablets. Students explore mobile interface design, navigation, device capabilities, data storage, networking, and application performance. They may use native technologies or cross-platform frameworks. Practical projects teach students to develop, test, debug, and prepare mobile applications for distribution.",
      },
      {
        title: "Desktop Application Development",
        description:
          "Desktop Application Development teaches students to create software that runs on personal computers. Topics include graphical user interfaces, file management, local databases, operating-system integration, application security, and packaging. Students learn to design applications for Windows, macOS, or Linux, while developing practical skills in debugging, usability, performance, and software maintenance.",
      },
      {
        title: "Game Development",
        description:
          "Game Development introduces the programming, design, and production techniques used to create digital games. Students explore game mechanics, player interaction, physics, animation, sound, level design, and game engines. Practical assignments encourage learners to build playable prototypes, test gameplay, optimize performance, and understand the collaboration required in game production.",
      },
      {
        title: "API Development",
        description:
          "API Development teaches students how to create interfaces that allow software systems to communicate. Topics include REST APIs, HTTP methods, request and response formats, authentication, authorization, validation, documentation, and error handling. Students build services that exchange data securely between applications and learn how to test, version, maintain, and integrate APIs.",
      },
      {
        title: "Software Testing and Quality Assurance",
        description:
          "Software Testing and Quality Assurance teaches students how to verify that applications behave as expected. Learners explore test planning, manual testing, automated testing, unit tests, integration tests, regression testing, and defect reporting. Practical exercises develop skills in identifying bugs, evaluating requirements, improving reliability, and maintaining software quality throughout development.",
      },
    ],
  },
  {
    department: "Computer Science",
    note: "Computer Science studies the fundamental principles behind computing systems, algorithms, programming, and information processing. Students learn how computers solve problems, represent data, execute instructions, and support intelligent applications, while developing analytical thinking and computational problem-solving skills.",
    subunits: [
      {
        title: "Algorithms and Data Structures",
        description:
          "This course explores methods for organizing data and solving computational problems efficiently. Students study arrays, linked lists, stacks, queues, trees, graphs, sorting, searching, and algorithm analysis. Practical programming exercises compare different approaches using time and memory complexity, helping learners choose suitable data structures and algorithms for real-world software applications.",
      },
      {
        title: "Programming Languages",
        description:
          "Programming Languages introduces the principles and characteristics of languages used to develop software. Students examine syntax, data types, variables, control structures, functions, object-oriented programming, and language paradigms. They also explore how interpreters and compilers work, compare programming languages, and learn how language selection affects application development, maintainability, and performance.",
      },
      {
        title: "Operating Systems",
        description:
          "Operating Systems examines the software that manages computer hardware and application resources. Students learn about processes, threads, memory management, file systems, scheduling, device management, and access permissions. Practical exercises introduce command-line tools and system monitoring, helping learners understand how operating systems coordinate resources and support multiple applications securely.",
      },
      {
        title: "Theory of Computation",
        description:
          "Theory of Computation explores the mathematical foundations of computing. Students study formal languages, finite automata, regular expressions, grammars, computability, and computational complexity. The course explains which problems computers can solve and how resource requirements affect solutions. Exercises develop logical reasoning and help learners understand the theoretical limits of algorithms.",
      },
      {
        title: "Artificial Intelligence",
        description:
          "This course introduces computer systems designed to perform tasks associated with intelligent behaviour. Students explore search algorithms, knowledge representation, reasoning, planning, decision-making, and introductory machine learning. Practical activities demonstrate how intelligent systems solve problems, interpret information, and support decisions, while discussions address limitations, reliability, fairness, and responsible AI development.",
      },
      {
        title: "Computer Architecture",
        description:
          "Computer Architecture explains how computer hardware components work together to execute programs. Students study processors, registers, memory hierarchies, instruction sets, input/output systems, and data representation. The course examines how hardware design influences performance and energy consumption. Practical exercises may include assembly-language examples, processor simulations, and performance comparisons.",
      },
      {
        title: "Human-Computer Interaction",
        description:
          "Human-Computer Interaction studies how people interact with computers and digital systems. Students explore usability, interface design, human behaviour, accessibility, user research, prototyping, and evaluation methods. Projects involve analysing user needs and testing interface designs, helping learners create technology that is understandable, efficient, inclusive, and appropriate for different users and environments.",
      },
      {
        title: "Computational Mathematics",
        description:
          "Computational Mathematics applies mathematical methods and computer-based techniques to solve complex problems. Students study numerical methods, linear algebra, mathematical modelling, optimization, and computational approximation. Practical exercises use programming tools to analyse data and calculate solutions that may be difficult to obtain manually, while considering accuracy, efficiency, and numerical error.",
      },
    ],
  },
  {
    department: "Cybersecurity",
    note: "Cybersecurity focuses on protecting computers, networks, applications, and information from unauthorized access, misuse, and digital threats. Students learn security principles, risk assessment, defensive technologies, incident response, and ethical practices for maintaining confidentiality, integrity, and availability of digital systems.",
    subunits: [
      {
        title: "Network Security",
        description:
          "Network Security teaches students how to protect communication networks from attacks and unauthorized access. Topics include firewalls, secure network configurations, intrusion detection, encryption, access controls, and traffic monitoring. Practical exercises focus on identifying weaknesses, understanding common network threats, and applying defensive measures to improve the security and reliability of network infrastructure.",
      },
      {
        title: "Application Security",
        description:
          "Application Security focuses on identifying and preventing vulnerabilities in software. Students learn secure coding, input validation, authentication, authorization, session management, dependency security, and security testing. They examine common application weaknesses and practise defensive development techniques. The course encourages integrating security checks throughout the software development lifecycle rather than treating security as a final step.",
      },
      {
        title: "Cloud Security",
        description:
          "Cloud Security examines methods for protecting applications, data, and infrastructure hosted by cloud providers. Students learn identity management, encryption, access policies, secure configurations, logging, and incident response. The course also introduces shared responsibility models and cloud security monitoring, helping learners understand how organizations reduce risks when using cloud-based computing resources.",
      },
      {
        title: "Ethical Hacking",
        description:
          "Ethical Hacking introduces authorized security assessment techniques used to identify system vulnerabilities. Students study reconnaissance concepts, vulnerability assessment, security testing methodologies, and responsible reporting. Practical work must take place in authorized laboratories or controlled environments. The course emphasizes permission, legal boundaries, documentation, and remediation rather than unauthorized access to real systems.",
      },
      {
        title: "Digital Forensics",
        description:
          "Digital Forensics teaches students how digital evidence is identified, preserved, examined, and documented during investigations. Topics include evidence integrity, forensic imaging, file-system analysis, metadata, event logs, and investigation procedures. Students learn why accurate documentation and chain of custody matter, while considering privacy, legal requirements, and the limitations of forensic conclusions.",
      },
      {
        title: "Identity and Access Management",
        description:
          "Identity and Access Management examines how organizations control who can access systems and information. Students study authentication, authorization, multifactor authentication, role-based access control, single sign-on, and account lifecycle management. Practical activities involve designing access policies, applying least-privilege principles, and reviewing permissions to reduce unauthorized access and improve accountability.",
      },
      {
        title: "Security Operations",
        description:
          "Security Operations focuses on monitoring systems and responding to cybersecurity incidents. Students learn about security information and event management, log analysis, alert investigation, incident classification, and response procedures. Practical exercises use simulated events to identify suspicious activity, document findings, and recommend defensive actions that support an organization's ability to detect and manage threats.",
      },
      {
        title: "Risk Management and Compliance",
        description:
          "This course introduces methods for identifying, assessing, and managing information security risks. Students examine risk registers, security policies, control assessments, privacy requirements, and compliance frameworks. They learn to evaluate potential business impacts, recommend appropriate safeguards, and document decisions. The course connects technical security measures with organizational responsibilities and governance.",
      },
    ],
  },
  {
    department: "Cloud Computing",
    note: "Cloud Computing teaches students how computing resources such as servers, databases, storage, and networking can be delivered over the internet. Students explore cloud service models, infrastructure management, deployment, security, scalability, and cost control using modern cloud platforms and architectures.",
    subunits: [
      {
        title: "Cloud Infrastructure",
        description:
          "Cloud Infrastructure introduces the computing resources used to run applications in cloud environments. Students learn about virtual machines, compute instances, storage, networking, availability, and resource provisioning. Practical exercises involve creating and configuring basic cloud resources, monitoring their usage, and understanding how organizations scale infrastructure to meet changing application requirements.",
      },
      {
        title: "Cloud Architecture",
        description:
          "Cloud Architecture teaches students how to design reliable, secure, and scalable systems using cloud services. Topics include architectural patterns, high availability, fault tolerance, load balancing, disaster recovery, and service selection. Students develop simple architecture diagrams and evaluate design trade-offs, learning how to match cloud resources to application needs and operational requirements.",
      },
      {
        title: "Cloud Networking",
        description:
          "Cloud Networking examines how networks are designed and configured within cloud platforms. Students study virtual networks, subnets, routing, gateways, firewalls, private connectivity, and network access controls. Practical activities involve connecting cloud resources securely and troubleshooting connectivity issues, helping learners understand how cloud networking supports communication between applications, users, and external systems.",
      },
      {
        title: "Cloud Security",
        description:
          "Cloud Security focuses on protecting cloud-hosted resources, workloads, and information. Students study identity permissions, encryption, security groups, network controls, secrets management, monitoring, and incident response. The course explores secure configuration and shared responsibility between cloud providers and customers, helping learners identify common risks and apply appropriate safeguards to cloud environments.",
      },
      {
        title: "Cloud Storage",
        description:
          "Cloud Storage teaches students how to store, retrieve, protect, and manage data using cloud services. Topics include object storage, block storage, file storage, backups, replication, lifecycle policies, and access permissions. Practical exercises compare storage options for different workloads, emphasizing durability, availability, performance, security, and cost when selecting suitable storage solutions.",
      },
      {
        title: "Serverless Computing",
        description:
          "Serverless Computing introduces application development using managed cloud services that reduce the need to administer servers directly. Students explore event-driven functions, managed databases, triggers, permissions, and service integration. Practical projects demonstrate how applications respond to events and scale with demand, while covering execution limits, observability, reliability, and cost considerations.",
      },
      {
        title: "Cloud Databases",
        description:
          "Cloud Databases examines database services hosted and managed through cloud platforms. Students learn about relational and non-relational databases, provisioning, backups, replication, scaling, access control, and performance monitoring. Practical exercises involve creating a database, connecting an application, and applying basic security measures while comparing managed services with self-managed database deployments.",
      },
      {
        title: "Cloud Cost Management",
        description:
          "Cloud Cost Management teaches students how to monitor and control spending on cloud resources. Topics include pricing models, budgets, cost allocation tags, usage reports, resource optimization, and billing alerts. Learners examine example cloud bills and identify unnecessary expenditure, developing practical strategies for balancing cost, performance, availability, and organizational requirements.",
      },
    ],
  },
  {
    department: "DevOps and Site Reliability Engineering",
    note: "DevOps and Site Reliability Engineering combine software development and IT operations to deliver applications reliably and efficiently. Students learn automation, continuous delivery, infrastructure management, monitoring, incident response, and collaborative practices that help teams deploy changes safely and maintain dependable services.",
    subunits: [
      {
        title: "Continuous Integration and Delivery (CI/CD)",
        description:
          "This course teaches students how to automate software building, testing, and deployment. Learners explore source control, automated test pipelines, build processes, deployment stages, and release management. Practical projects connect a code repository to a pipeline that validates changes before deployment, improving consistency, reducing manual work, and helping teams deliver software more frequently.",
      },
      {
        title: "Infrastructure as Code",
        description:
          "Infrastructure as Code teaches students to manage computing infrastructure through version-controlled configuration files instead of manual setup. Topics include declarative definitions, reusable modules, state management, environment consistency, and change review. Practical exercises provision sample infrastructure and demonstrate how automation improves repeatability, auditability, collaboration, and recovery from configuration errors.",
      },
      {
        title: "Containerization",
        description:
          "Containerization introduces the packaging of applications and their dependencies into portable execution environments. Students learn container images, registries, container runtimes, networking, volumes, and configuration. Practical exercises package an application into a container and run it consistently across environments, while covering image maintenance, resource management, and basic container security.",
      },
      {
        title: "Container Orchestration",
        description:
          "Container Orchestration teaches students how to manage containerized applications across multiple machines. Topics include deployments, services, scheduling, scaling, health checks, configuration, and workload recovery. Students explore orchestration platforms such as Kubernetes and practise deploying a sample application, helping them understand how automated systems maintain application availability and manage changing workloads.",
      },
      {
        title: "Configuration Management",
        description:
          "Configuration Management focuses on keeping systems consistently configured across development, testing, and production environments. Students learn configuration files, automated provisioning, reusable playbooks, version control, and configuration drift detection. Practical exercises automate common administration tasks and standardize system settings, reducing manual errors and improving reliability, security, and operational efficiency.",
      },
      {
        title: "Monitoring and Logging",
        description:
          "Monitoring and Logging teaches students how to understand application and infrastructure behaviour through collected metrics, logs, and traces. Topics include dashboards, alert rules, log aggregation, service health, and troubleshooting. Practical activities investigate simulated failures and identify performance problems, helping learners use operational evidence to maintain availability and improve the user experience.",
      },
      {
        title: "Automation and Scripting",
        description:
          "Automation and Scripting introduces the use of programming and command-line tools to automate repetitive technical tasks. Students learn variables, conditions, loops, functions, file operations, error handling, and scheduled execution using suitable scripting languages. Projects automate backups, report generation, system checks, and deployment tasks, improving productivity and reducing avoidable manual mistakes.",
      },
      {
        title: "Site Reliability Engineering (SRE)",
        description:
          "Site Reliability Engineering applies software engineering practices to operating reliable services. Students study service-level indicators, service-level objectives, error budgets, incident management, capacity planning, and post-incident reviews. Practical exercises assess service reliability and investigate simulated outages, helping learners balance system stability with development speed while using measurable objectives to guide improvements.",
      },
    ],
  },
  {
    department: "Data Science and Analytics",
    note: "Data Science and Analytics focuses on collecting, preparing, analysing, and interpreting data to support decisions. Students learn statistical reasoning, programming, data visualization, data management, and analytical methods for discovering patterns, evaluating performance, and communicating useful findings to different audiences.",
    subunits: [
      {
        title: "Data Analysis",
        description:
          "Data Analysis teaches students to transform raw data into meaningful information. Learners study data cleaning, filtering, grouping, descriptive statistics, exploratory analysis, and interpretation. Practical exercises use spreadsheets, SQL, or programming tools to answer questions from datasets, identify trends, and communicate findings clearly while recognizing missing information, bias, and data-quality problems.",
      },
      {
        title: "Data Engineering",
        description:
          "Data Engineering focuses on building systems that collect, transform, store, and deliver data for analysis. Students explore data pipelines, extraction and transformation, batch processing, streaming, data quality, and workflow scheduling. Projects demonstrate how to combine data from different sources into reliable datasets, while emphasizing scalability, documentation, monitoring, and maintainability.",
      },
      {
        title: "Business Intelligence",
        description:
          "Business Intelligence teaches students to turn organizational data into reports and decision-support tools. Topics include key performance indicators, dashboard design, reporting, data modelling, and business metrics. Practical activities create reports that help organizations track sales, costs, operations, and customer activity, emphasizing accurate interpretation and clear presentation for decision-makers.",
      },
      {
        title: "Statistical Analysis",
        description:
          "Statistical Analysis introduces mathematical methods for understanding data and drawing evidence-based conclusions. Students study probability, distributions, sampling, estimation, hypothesis testing, correlation, and regression. Practical exercises analyse real or simulated datasets and interpret results carefully, helping learners distinguish meaningful relationships from coincidence and understand uncertainty when making decisions.",
      },
      {
        title: "Data Visualization",
        description:
          "Data Visualization teaches students how to communicate information through charts, graphs, maps, and interactive dashboards. Learners explore visual encoding, chart selection, colour accessibility, layout, and storytelling with data. Practical assignments transform datasets into clear visual explanations, helping audiences recognize patterns, compare values, and understand findings without misleading representations.",
      },
      {
        title: "Big Data",
        description:
          "Big Data introduces technologies and methods for processing datasets too large, fast, or complex for conventional approaches. Students explore distributed storage, parallel processing, data pipelines, batch workloads, and streaming systems. Practical activities examine how distributed platforms process large datasets, while considering data quality, scalability, privacy, reliability, and processing costs.",
      },
      {
        title: "Data Warehousing",
        description:
          "Data Warehousing teaches students how to organize integrated data for reporting and analysis. Topics include warehouse architecture, fact and dimension tables, star schemas, data transformation, and refresh strategies. Students design simple analytical data models and load information from operational sources, learning how consistent structures support reporting, historical comparisons, and business intelligence.",
      },
      {
        title: "Data Governance",
        description:
          "Data Governance examines the policies and responsibilities required to manage data properly throughout its lifecycle. Students study data ownership, quality standards, classification, access permissions, privacy, metadata, and retention. Practical exercises create governance rules for sample datasets, helping learners improve consistency, accountability, security, and appropriate use of organizational information.",
      },
    ],
  },
  {
    department: "Artificial Intelligence and Machine Learning",
    note: "Artificial Intelligence and Machine Learning explore techniques that enable computers to identify patterns, make predictions, understand information, and generate outputs. Students learn data preparation, model development, evaluation, responsible use, and the limitations of intelligent systems in practical applications.",
    subunits: [
      {
        title: "Machine Learning",
        description:
          "Machine Learning teaches students how computer systems learn patterns from data to make predictions or decisions. Topics include supervised and unsupervised learning, classification, regression, clustering, feature engineering, and model evaluation. Practical exercises train and test introductory models, helping learners understand data splitting, overfitting, accuracy measures, and responsible interpretation of predictions.",
      },
      {
        title: "Deep Learning",
        description:
          "Deep Learning introduces neural networks with multiple processing layers for learning complex patterns. Students explore network structure, activation functions, loss functions, optimization, training data, and model evaluation. Practical exercises use suitable machine-learning libraries to build introductory models, while discussing computing requirements, overfitting, interpretability, and the importance of representative training datasets.",
      },
      {
        title: "Natural Language Processing",
        description:
          "Natural Language Processing focuses on enabling computers to process and interpret human language. Students explore text preprocessing, tokenization, language classification, sentiment analysis, information extraction, and language modelling. Practical projects analyse text datasets or build simple language tools, while considering ambiguity, language diversity, privacy, and the risk of biased or inaccurate outputs.",
      },
      {
        title: "Computer Vision",
        description:
          "Computer Vision teaches students how computers analyse images and video to identify useful information. Topics include image processing, feature extraction, image classification, object detection, and evaluation methods. Practical activities use sample images to build or test vision models, while discussing image quality, privacy, fairness, and the limitations of automated visual recognition.",
      },
      {
        title: "Generative AI",
        description:
          "Generative AI introduces systems that create text, images, audio, code, and other forms of content. Students explore language models, image generation, prompts, retrieval-supported generation, output evaluation, and practical applications. The course also examines hallucinations, intellectual property, privacy, bias, and responsible use, emphasizing human review when generated content affects important decisions.",
      },
      {
        title: "Robotics and Intelligent Systems",
        description:
          "This course explores machines and software that sense their environments, make decisions, and perform actions. Students study sensors, control algorithms, navigation, perception, planning, and basic autonomous behaviour. Practical projects may use simulations or simple robotic platforms, helping learners understand how software, hardware, and intelligent decision-making combine to perform tasks.",
      },
      {
        title: "Speech Recognition",
        description:
          "Speech Recognition teaches students how computers convert spoken language into machine-readable text or commands. Topics include audio signals, feature extraction, acoustic modelling, speech-to-text systems, and evaluation. Practical exercises examine recorded speech or existing recognition tools, while considering accents, background noise, accessibility, language coverage, and privacy in voice-enabled applications.",
      },
      {
        title: "AI Ethics and Governance",
        description:
          "AI Ethics and Governance examines the social, legal, and organizational responsibilities associated with intelligent systems. Students explore fairness, transparency, accountability, privacy, explainability, human oversight, and risk assessment. Case studies help learners identify potential harms and develop safeguards, ensuring AI applications are evaluated not only for performance but also for their effects on people.",
      },
    ],
  },
  {
    department: "Computer Networking",
    note: "Computer Networking studies how computers, servers, and other devices communicate and share resources. Students learn network architecture, protocols, addressing, routing, wireless communication, troubleshooting, and network protection, developing skills needed to build and maintain dependable digital communication systems.",
    subunits: [
      {
        title: "Network Administration",
        description:
          "Network Administration teaches students how to configure, operate, and maintain computer networks. Topics include device management, IP addressing, user access, network services, backups, and troubleshooting. Practical exercises involve monitoring network health and resolving common connectivity issues, helping learners maintain reliable services, document configurations, and support users within an organization.",
      },
      {
        title: "Routing and Switching",
        description:
          "Routing and Switching introduces the technologies that move data between devices and networks. Students study Ethernet, switching tables, IP routing, VLANs, routing protocols, and network segmentation. Practical laboratory activities configure sample network devices and test connectivity, helping learners understand how packets travel through networks and how segmentation supports performance and security.",
      },
      {
        title: "Wireless Networking",
        description:
          "Wireless Networking focuses on communication technologies that connect devices without physical network cables. Students study Wi-Fi standards, access points, radio frequency concepts, wireless authentication, coverage, interference, and encryption. Practical activities design and troubleshoot sample wireless networks, emphasizing signal quality, secure configuration, user capacity, and reliable connectivity in different environments.",
      },
      {
        title: "Network Design",
        description:
          "Network Design teaches students how to plan network infrastructure around organizational requirements. Topics include topology, addressing schemes, segmentation, redundancy, capacity planning, security, and equipment selection. Students create network diagrams and design solutions for sample homes, campuses, or businesses, balancing reliability, performance, growth, and budget constraints while documenting their design decisions.",
      },
      {
        title: "Network Protocols",
        description:
          "Network Protocols examines the rules that enable devices and applications to exchange information. Students explore TCP/IP, DNS, DHCP, HTTP, HTTPS, and other common protocols. Practical exercises inspect sample network communications and troubleshoot protocol-related problems, helping learners understand addressing, connection establishment, name resolution, and the interactions between network layers.",
      },
      {
        title: "Network Monitoring",
        description:
          "Network Monitoring teaches students how to observe network performance, availability, and traffic patterns. Topics include latency, packet loss, bandwidth utilization, device health, alerts, and diagnostic tools. Practical activities interpret monitoring dashboards and investigate simulated faults, helping learners identify emerging problems, establish performance baselines, and improve the reliability of network services.",
      },
      {
        title: "Network Virtualization",
        description:
          "Network Virtualization introduces software-based methods for creating and managing logical networks. Students study virtual switches, virtual networks, overlays, segmentation, and software-defined networking concepts. Practical exercises explore isolated network environments and virtual network configurations, demonstrating how virtualization improves flexibility, resource utilization, testing, and the management of complex infrastructure.",
      },
      {
        title: "Telecommunications",
        description:
          "Telecommunications examines the technologies used to transmit voice, video, and data over communication systems. Students explore transmission media, cellular networks, fibre optics, wireless communication, modulation, and signal quality. The course introduces how communication infrastructure connects users and services, while examining bandwidth, latency, coverage, reliability, and emerging communication technologies.",
      },
    ],
  },
  {
    department: "Database Technology",
    note: "Database Technology focuses on designing, storing, organizing, retrieving, and protecting digital information. Students learn data modelling, querying, database administration, performance optimization, recovery, and security to support applications that depend on accurate and accessible information.",
    subunits: [
      {
        title: "Relational Databases",
        description:
          "Relational Databases teaches students how to organize information into related tables. Topics include tables, rows, columns, primary keys, foreign keys, constraints, normalization, and SQL queries. Practical projects design databases and retrieve information using joins, filtering, and aggregation, helping learners maintain data consistency and support applications with structured storage requirements.",
      },
      {
        title: "NoSQL Databases",
        description:
          "NoSQL Databases introduces non-relational approaches for storing data that may not fit traditional table structures. Students explore document, key-value, wide-column, and graph databases. Practical exercises model sample application data and perform basic queries, while comparing consistency, scalability, flexibility, and access patterns to determine when different database types are appropriate.",
      },
      {
        title: "Database Administration",
        description:
          "Database Administration teaches students how to maintain database systems and ensure they operate reliably. Topics include user permissions, configuration, monitoring, backup scheduling, updates, performance checks, and troubleshooting. Practical activities administer a sample database and review its health, helping learners protect information, maintain availability, and document routine operational procedures.",
      },
      {
        title: "Database Design",
        description:
          "Database Design focuses on translating application requirements into well-structured data models. Students learn entity-relationship diagrams, entities, attributes, relationships, keys, normalization, and constraints. Practical projects design schemas for systems such as school registration or inventory management, reducing duplication and improving data integrity while preparing structures that can support changing requirements.",
      },
      {
        title: "Database Security",
        description:
          "Database Security teaches students how to protect stored information against unauthorized access, disclosure, and alteration. Topics include authentication, permissions, encryption, secure queries, auditing, backups, and data privacy. Practical exercises configure appropriate access controls and review common weaknesses, helping learners apply least-privilege principles and protect sensitive information throughout its lifecycle.",
      },
      {
        title: "Data Backup and Recovery",
        description:
          "Data Backup and Recovery examines techniques for protecting information against accidental deletion, hardware failure, and service disruptions. Students study full and incremental backups, recovery objectives, replication, restoration testing, and disaster recovery planning. Practical exercises restore sample databases from backups, emphasizing verification, documentation, backup protection, and preparation for unexpected incidents.",
      },
      {
        title: "Database Performance Optimization",
        description:
          "Database Performance Optimization teaches students how to improve the speed and efficiency of database operations. Topics include query analysis, indexing, execution plans, schema design, caching, and workload monitoring. Practical exercises identify slow queries and compare optimization strategies, helping learners reduce unnecessary processing and improve response times without compromising data correctness or security.",
      },
      {
        title: "Distributed Databases",
        description:
          "Distributed Databases explores systems that store and process data across multiple servers or locations. Students study replication, partitioning, consistency, availability, fault tolerance, and distributed transactions. Practical examples illustrate how distributed systems handle growth and failures, while helping learners understand trade-offs involved in keeping information accessible and consistent across multiple locations.",
      },
    ],
  },
  {
    department: "UI/UX and Digital Product Design",
    note: "UI/UX and Digital Product Design focuses on creating digital products that are visually clear, accessible, and easy to use. Students learn user research, interface design, prototyping, usability evaluation, interaction principles, and design systems to improve how people interact with software.",
    subunits: [
      {
        title: "User Interface (UI) Design",
        description:
          "UI Design teaches students how to design the visual elements of digital products, including buttons, menus, forms, layouts, and navigation. Topics include typography, spacing, colour, visual hierarchy, consistency, and responsive layouts. Practical assignments create interface mockups and reusable components, helping learners communicate information clearly and support effective user interaction.",
      },
      {
        title: "User Experience (UX) Design",
        description:
          "UX Design examines the overall experience people have when using a product or service. Students learn user needs analysis, journey mapping, information architecture, usability principles, and experience evaluation. Projects investigate user problems and develop design solutions, helping learners reduce confusion, improve task completion, and create products that better match user expectations.",
      },
      {
        title: "Interaction Design",
        description:
          "Interaction Design focuses on how users and digital systems respond to one another. Students explore navigation patterns, feedback, transitions, states, error prevention, and interactive behaviours. Practical exercises design common workflows and prototype interactions, helping learners make interfaces predictable, understandable, and efficient across different devices and user contexts.",
      },
      {
        title: "Wireframing and Prototyping",
        description:
          "Wireframing and Prototyping teaches students how to represent and test product ideas before full development. Learners create low-fidelity layouts, interactive prototypes, navigation flows, and design specifications. Practical exercises use design tools to communicate requirements and gather feedback, reducing misunderstandings and allowing teams to identify usability problems early in the product lifecycle.",
      },
      {
        title: "User Research",
        description:
          "User Research introduces methods for understanding the people who will use a digital product. Students study interviews, surveys, observation, usability sessions, and research synthesis. Practical projects gather and interpret feedback to identify user needs and barriers, while emphasizing informed participation, privacy, inclusive research practices, and evidence-based design decisions.",
      },
      {
        title: "Usability Testing",
        description:
          "Usability Testing teaches students how to evaluate whether people can use a product to complete important tasks. Topics include test objectives, task design, participant selection, observation, issue severity, and findings reports. Practical exercises test prototypes or sample applications, helping learners identify confusion, measure task success, and recommend improvements based on evidence.",
      },
      {
        title: "Design Systems",
        description:
          "Design Systems examines reusable visual rules and components that help teams maintain consistent interfaces. Students explore component libraries, design tokens, typography, colour standards, documentation, and accessibility guidelines. Practical projects create a small design system and apply it across multiple screens, improving collaboration, consistency, efficiency, and the maintainability of digital product interfaces.",
      },
      {
        title: "Accessibility Design",
        description:
          "Accessibility Design teaches students how to make digital products usable by people with diverse abilities and needs. Topics include keyboard navigation, colour contrast, readable content, semantic structure, captions, and assistive technologies. Practical evaluations identify barriers and recommend improvements, helping learners create more inclusive experiences and understand accessibility standards and user diversity.",
      },
    ],
  },
  {
    department: "Robotics and Embedded Systems",
    note: "Robotics and Embedded Systems combines computing, electronics, sensing, and control to create devices that interact with the physical world. Students learn microcontrollers, embedded software, automation, sensors, and intelligent control for applications in industry, healthcare, transport, and consumer technology.",
    subunits: [
      {
        title: "Robotics Engineering",
        description:
          "Robotics Engineering introduces the design, programming, and operation of robots that perform physical tasks. Students explore mechanical structures, sensors, actuators, control systems, navigation, and robot programming. Practical projects may use simulated or educational robots, helping learners integrate hardware and software while considering precision, safety, reliability, and task requirements.",
      },
      {
        title: "Embedded Programming",
        description:
          "Embedded Programming teaches students to develop software for dedicated computing devices inside larger products. Topics include resource constraints, input/output operations, interrupts, timing, memory management, and hardware interfaces. Practical exercises program microcontrollers to control simple devices, helping learners understand the relationship between software, electronic components, and real-time system behaviour.",
      },
      {
        title: "Microcontrollers",
        description:
          "Microcontrollers examines compact integrated circuits used to control electronic devices. Students learn processor basics, memory, digital and analogue inputs, timers, communication interfaces, and peripheral control. Practical laboratory work connects microcontrollers to sensors and output devices, teaching learners to build simple control systems and troubleshoot interactions between code and hardware.",
      },
      {
        title: "Internet of Things (IoT)",
        description:
          "Internet of Things introduces connected devices that collect and exchange data over networks. Students explore sensors, embedded devices, connectivity, messaging protocols, cloud integration, and device management. Practical projects build a simple connected monitoring system, while addressing authentication, privacy, reliability, power consumption, and the security risks associated with internet-connected devices.",
      },
      {
        title: "Sensors and Actuators",
        description:
          "Sensors and Actuators teaches students how electronic systems detect physical conditions and produce actions. Topics include temperature, pressure, light, motion, and distance sensors, along with motors and other actuators. Practical activities connect components to controllers and interpret their signals, helping learners calibrate devices and build systems that respond to environmental changes.",
      },
      {
        title: "Control Systems",
        description:
          "Control Systems examines how systems are regulated to achieve desired behaviour. Students study feedback, open-loop and closed-loop control, system response, stability, and introductory mathematical models. Practical exercises simulate or build simple control applications, helping learners understand how measurements guide corrective actions in machines, industrial processes, and automated devices.",
      },
      {
        title: "Industrial Automation",
        description:
          "Industrial Automation focuses on technologies that automate manufacturing and operational processes. Topics include programmable logic controllers, sensors, actuators, industrial networks, and robotic systems used in production environments. The course examines efficiency, safety, quality, and integration challenges in automated industrial settings.",
      },
      {
        title: "Autonomous Systems",
        description:
          "Autonomous Systems examines how machines operate with limited human intervention. Students explore sensing, perception, decision-making, path planning, and navigation. Practical examples consider drones, self-driving vehicles, and autonomous robots, helping learners understand reliability, safety, and the challenges of operating in unpredictable environments.",
      },
    ],
  },
  {
    department: "Information Technology (IT) Support",
    note: "Information Technology (IT) Support prepares students to maintain, troubleshoot, and support computer systems, networks, and users. Students learn hardware and software support, system administration, service management, asset management, and backup practices that keep organizational technology running reliably.",
    subunits: [
      {
        title: "Computer Hardware",
        description:
          "Computer Hardware introduces the physical components of computers and how they work together. Students study processors, memory, storage devices, motherboards, power supplies, peripherals, and assembly. Practical exercises involve identifying components, diagnosing faults, and performing basic upgrades and maintenance, helping learners understand compatibility, performance, and safe handling of hardware.",
      },
      {
        title: "Operating System Support",
        description:
          "Operating System Support teaches students how to install, configure, update, and troubleshoot operating systems. Topics include user accounts, drivers, permissions, software installation, system settings, and recovery tools. Practical activities resolve common operating-system problems, helping learners support users, maintain security, and keep systems stable and productive.",
      },
      {
        title: "IT Help Desk",
        description:
          "IT Help Desk introduces the practices used to receive, prioritise, document, and resolve user support requests. Students learn ticketing, communication, troubleshooting steps, escalation, and knowledge documentation. Practical scenarios develop professional support skills, helping learners diagnose issues efficiently and maintain positive relationships with the people they assist.",
      },
      {
        title: "System Administration",
        description:
          "System Administration teaches students how to manage and maintain computer systems and servers. Topics include user accounts, permissions, updates, monitoring, storage, backups, and service configuration. Practical exercises administer sample systems and apply security and maintenance procedures, helping learners keep organizational systems available, secure, and well documented.",
      },
      {
        title: "IT Asset Management",
        description:
          "IT Asset Management focuses on tracking and managing an organization's technology assets throughout their lifecycle. Students study inventory records, procurement, licensing, assignment, maintenance, and disposal. Practical exercises maintain asset registers and review usage, helping learners control costs, support audits, plan replacements, and improve accountability for hardware and software.",
      },
      {
        title: "Technical Troubleshooting",
        description:
          "Technical Troubleshooting teaches students a structured approach to diagnosing and resolving technical problems. Topics include problem identification, information gathering, hypothesis testing, solution implementation, and verification. Practical exercises cover hardware, software, and network issues, helping learners work methodically, document solutions, and reduce repeat incidents.",
      },
      {
        title: "IT Service Management",
        description:
          "IT Service Management introduces frameworks and processes for delivering reliable technology services. Students study service levels, incident and problem management, change control, service requests, and continual improvement. Practical activities apply service-management practices to sample scenarios, helping learners align technology support with organizational needs and expectations.",
      },
      {
        title: "Backup and Recovery",
        description:
          "Backup and Recovery teaches students how to protect data and restore systems after loss or failure. Topics include backup types, schedules, storage locations, retention, restoration procedures, and recovery testing. Practical exercises create backups and practise restores, helping learners reduce downtime, verify recoverability, and prepare for accidental deletion, corruption, or disasters.",
      },
    ],
  },
  {
    department: "Blockchain Technology",
    note: "Blockchain Technology explores distributed systems that maintain shared records across participating computers. Students learn blockchain architecture, transaction validation, consensus, smart contracts, and decentralized applications, while examining security, transparency, scalability, privacy, and practical limitations of blockchain-based solutions.",
    subunits: [
      {
        title: "Distributed Ledger Systems",
        description:
          "Distributed Ledger Systems introduces shared digital records maintained across multiple network participants. Students explore ledger structure, transactions, cryptographic hashes, replication, validation, and differences between centralized and distributed databases. Practical exercises examine simplified ledger models, helping learners understand how shared records are updated, verified, and maintained across systems with multiple participants.",
      },
      {
        title: "Smart Contract Development",
        description:
          "Smart Contract Development teaches students how to write programs that execute according to predefined rules on compatible blockchain platforms. Topics include contract structure, state, transactions, testing, deployment, and security considerations. Practical projects build simple demonstration contracts, emphasizing clear requirements, testing, permission design, and the importance of reviewing vulnerabilities before real-world use.",
      },
      {
        title: "Decentralized Applications",
        description:
          "Decentralized Applications examines software that interacts with blockchain networks and smart contracts. Students explore user interfaces, wallet connections, transaction signing, contract integration, and decentralized data storage. Practical exercises build a simple demonstration application, helping learners understand how frontend components communicate with blockchain services and how usability, privacy, security, and transaction costs affect design.",
      },
      {
        title: "Cryptocurrency Systems",
        description:
          "Cryptocurrency Systems introduces the technical principles behind digital currencies that use cryptographic and distributed network mechanisms. Students study wallets, transactions, public and private keys, consensus, and blockchain records. The course focuses on system design and security rather than investment advice, while examining transaction verification, user responsibility, volatility, and common risks in digital financial systems.",
      },
      {
        title: "Blockchain Security",
        description:
          "Blockchain Security examines threats and safeguards associated with blockchain networks, smart contracts, and digital assets. Students study key management, access controls, contract vulnerabilities, transaction validation, and network-level risks. Practical exercises review simulated security scenarios and defensive design principles, emphasizing independent testing, secure development, responsible disclosure, and the limitations of relying on blockchain alone for protection.",
      },
      {
        title: "Tokenization",
        description:
          "Tokenization explores how digital tokens can represent assets, rights, or units of value within software systems. Students examine token standards, ownership records, transfer rules, and smart contract integration. Case studies consider possible applications in digital identity, supply chains, and record management, while addressing legal obligations, privacy, governance, and technical limitations.",
      },
      {
        title: "Consensus Mechanisms",
        description:
          "Consensus Mechanisms teaches students how distributed systems agree on valid records or transactions. Topics include proof-based approaches, validator roles, fault tolerance, transaction ordering, and security assumptions. Students compare consensus designs and examine their effects on performance, decentralization, energy use, and resilience, developing a foundational understanding of how blockchain networks coordinate participants.",
      },
    ],
  },
  {
    department: "Digital Media and Creative Technology",
    note: "Digital Media and Creative Technology combines artistic communication with digital tools used to create visual, animated, interactive, and audio content. Students learn design principles, media production, modelling, editing, and immersive technologies for education, entertainment, marketing, and digital communication.",
    subunits: [
      {
        title: "Graphic Design",
        description:
          "Graphic Design teaches students how to communicate ideas through visual compositions. Topics include typography, colour theory, layout, branding, image editing, visual hierarchy, and design principles. Practical projects produce posters, logos, social media graphics, and other communication materials, helping learners develop creative problem-solving skills and create clear, audience-appropriate visual messages.",
      },
      {
        title: "2D and 3D Animation",
        description:
          "2D and 3D Animation introduces techniques for creating movement in digital media. Students explore keyframes, timing, character movement, rigging, modelling, lighting, and rendering. Practical assignments produce short animated sequences using suitable software, helping learners understand storytelling, motion principles, production workflows, and the technical considerations involved in creating polished animations.",
      },
      {
        title: "Video Editing",
        description:
          "Video Editing teaches students how to assemble recorded footage into coherent visual stories. Topics include timeline editing, trimming, transitions, audio synchronization, colour correction, titles, and export settings. Practical projects produce short edited pieces, helping learners understand pacing, story flow, shot selection, and the technical requirements of delivering polished video content.",
      },
      {
        title: "Motion Graphics",
        description:
          "Motion Graphics focuses on animated text, shapes, diagrams, and visual elements used to communicate information. Students study composition, timing, typography, transitions, keyframes, and visual storytelling. Practical exercises create animated titles, explainers, or promotional sequences, helping learners combine graphic design and movement to make complex information more engaging and understandable.",
      },
      {
        title: "3D Modelling",
        description:
          "3D Modelling teaches students how to create three-dimensional digital objects and environments. Topics include geometry, meshes, materials, textures, lighting, camera positioning, and rendering. Practical assignments build models for visualization, animation, or product concepts, helping learners understand object structure, modelling workflows, visual accuracy, and the technical requirements of digital production.",
      },
      {
        title: "Virtual Reality (VR)",
        description:
          "Virtual Reality introduces computer-generated environments designed to provide immersive experiences. Students explore spatial interaction, scene design, tracking, navigation, interface placement, and performance requirements. Practical projects create simple virtual environments or demonstrations, while considering accessibility, comfort, privacy, hardware limitations, and appropriate applications in education, training, simulation, and entertainment.",
      },
      {
        title: "Augmented Reality (AR)",
        description:
          "Augmented Reality teaches students how digital content can be placed within views of the physical world. Topics include tracking, spatial mapping, interactive overlays, mobile AR frameworks, and user experience. Practical activities develop simple AR demonstrations, helping learners connect digital objects with real environments while addressing usability, device compatibility, privacy, and safe interaction.",
      },
      {
        title: "Digital Audio Production",
        description:
          "Digital Audio Production teaches students how to record, edit, arrange, and mix audio using digital tools. Topics include sound capture, waveforms, audio tracks, effects, mixing, mastering, and export formats. Practical projects produce podcasts, voice recordings, or short audio pieces, emphasizing sound clarity, balanced levels, file organization, and responsible use of recorded material.",
      },
    ],
  },
];

export const FACULTIES: Faculty[] = [
  {
    name: TECHNOLOGY_FACULTY,
    departments: TECHNOLOGY_AREAS.map((area) => area.department),
  },
];

/**
 * Short introductory note for each technology area, keyed by department name.
 */
export const CATEGORY_NOTES: Record<string, string> = Object.fromEntries(
  TECHNOLOGY_AREAS.map((area): [string, string] => [area.department, area.note])
);

export const ACADEMIC_LEVELS: AcademicLevel[] = ["100L", "200L", "300L", "400L"];

export const SEMESTERS: Semester[] = ["First Semester", "Second Semester"];

export const COURSE_TYPES: CourseType[] = ["Core", "Elective"];

export const REGISTRATION_STATUSES: RegistrationStatus[] = [
  "Available",
  "Closed",
];

/** Academic sessions offered by the portal (editable starter data). */
export const ACADEMIC_SESSIONS: string[] = ["2026/2027", "2027/2028"];

export const DEFAULT_SESSION = ACADEMIC_SESSIONS[0];

export const DEFAULT_SEMESTER: Semester = "First Semester";

export const DEFAULT_COURSE_TYPE: CourseType = "Core";

export const DEFAULT_CREDIT_UNITS = 3;

/** Selectable credit-unit values for a single course. */
export const COURSE_CREDIT_UNITS: number[] = [1, 2, 3, 4, 5, 6];

/**
 * Approximate department code prefixes used to pre-fill course codes. These are
 * illustrative; students and administrators can always edit the code manually.
 */
const DEPARTMENT_CODE_PREFIX: Record<string, string> = {
  "Software Development": "SFD",
  "Computer Science": "CSC",
  Cybersecurity: "CYB",
  "Cloud Computing": "CLD",
  "DevOps and Site Reliability Engineering": "DVO",
  "Data Science and Analytics": "DSA",
  "Artificial Intelligence and Machine Learning": "AIM",
  "Computer Networking": "CNW",
  "Database Technology": "DBT",
  "UI/UX and Digital Product Design": "UXD",
  "Robotics and Embedded Systems": "RES",
  "Information Technology (IT) Support": "ITS",
  "Blockchain Technology": "BCT",
  "Digital Media and Creative Technology": "DMT",
};

/** Derives a short department prefix, falling back to the first letters. */
export function getDepartmentCode(department: string): string {
  const known = DEPARTMENT_CODE_PREFIX[department];
  if (known) return known;
  const letters = department
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .join("");
  return (letters || department.slice(0, 3)).toUpperCase().slice(0, 3);
}

/**
 * Suggests a course code for a department and level, e.g. "CSC 201". The
 * numbering starts at the level number and increments per level.
 */
export function suggestCourseCode(department: string, level: string): string {
  const prefix = getDepartmentCode(department);
  const levelNumber = Number.parseInt(level, 10);
  if (Number.isNaN(levelNumber)) return prefix;
  return `${prefix} ${levelNumber + 1}`;
}

/** Sample start dates per level for the 2026/2027 academic session (demo data). */
export const LEVEL_START_DATES: Record<AcademicLevel, string> = {
  "100L": "2026-11-02",
  "200L": "2026-11-09",
  "300L": "2026-11-16",
  "400L": "2026-11-23",
};

export interface CourseSuggestion {
  faculty: string;
  department: string;
  level: AcademicLevel;
  title: string;
  description: string;
  category: string;
  /** Short introductory note for the course's category. */
  note: string;
  /** Course fee in naira. */
  price: number;
}

/** level, title, description, category, price (naira) */
type CatalogueCourse = [AcademicLevel, string, string, string, number];

interface CatalogueProgramme {
  faculty: string;
  department: string;
  note: string;
  courses: CatalogueCourse[];
}

/** The academic level at which every technology subunit is offered. */
const SUBUNIT_LEVEL: AcademicLevel = "100L";

/** Starting list price (naira) of the first course in the catalogue. */
const CATALOGUE_PRICE_BASE = 15_000;

/** Price added for each following course so no two courses share a price. */
const CATALOGUE_PRICE_STEP = 500;

/**
 * Illustrative starter catalogue of technology courses. Every course of a major
 * technology area is offered at the 100L level by that area's department under
 * the Faculty of Technology. Each course carries the introductory note of its
 * category.
 *
 * This is demo data, not a verified curriculum. Titles, course codes, credit
 * units, semesters and levels are editable and should be checked against the
 * relevant programme handbook.
 */
const CATALOGUE: CatalogueProgramme[] = (() => {
  let index = 0;
  return TECHNOLOGY_AREAS.map((area) => ({
    faculty: TECHNOLOGY_FACULTY,
    department: area.department,
    note: area.note,
    courses: area.subunits.map((subunit): CatalogueCourse => {
      const price = CATALOGUE_PRICE_BASE + index * CATALOGUE_PRICE_STEP;
      index += 1;
      return [
        SUBUNIT_LEVEL,
        subunit.title,
        subunit.description,
        area.department,
        price,
      ];
    }),
  }));
})();

export const COURSE_SUGGESTIONS: CourseSuggestion[] = CATALOGUE.flatMap(
  (programme) =>
    programme.courses.map(
      ([level, title, description, category, price]) => ({
        faculty: programme.faculty,
        department: programme.department,
        level,
        title,
        description,
        category,
        note: programme.note,
        price,
      })
    )
);

export const COURSE_CATEGORIES = Array.from(
  new Set(COURSE_SUGGESTIONS.map((item) => item.category))
);

const FACULTY_DEFAULT_CATEGORY: Record<string, string> = {
  [TECHNOLOGY_FACULTY]: TECHNOLOGY_AREAS[0].department,
};

export const SUGGESTED_TITLES = COURSE_SUGGESTIONS.map((item) => item.title);

export const SUGGESTED_CATEGORIES = Array.from(
  new Set([
    ...COURSE_CATEGORIES,
    ...COURSE_SUGGESTIONS.map((item) => item.category),
  ])
);

export function getCategoryNote(category: string): string {
  return CATEGORY_NOTES[category] ?? "";
}

export function getDepartments(faculty: string): string[] {
  return FACULTIES.find((item) => item.name === faculty)?.departments ?? [];
}

export function getSuggestions(
  faculty: string,
  department: string,
  level?: string
): CourseSuggestion[] {
  return COURSE_SUGGESTIONS.filter(
    (item) =>
      item.faculty === faculty &&
      item.department === department &&
      (!level || item.level === level)
  );
}

/**
 * Produces a course specification for the selected faculty, department and
 * level. Uses a curated catalogue entry when one exists, otherwise generates a
 * sensible default from the names provided.
 */
export function generateCourseSpec(
  faculty: string,
  department: string,
  level?: string
): CourseSuggestion | null {
  if (!faculty || !department) return null;

  const pool = getSuggestions(faculty, department);
  const exact = level ? pool.find((item) => item.level === level) : undefined;
  const match = exact ?? pool[0];
  if (match) {
    return { ...match, level: (level as AcademicLevel) ?? match.level };
  }

  const fallbackLevel = (level as AcademicLevel) ?? "100L";
  const fallbackCategory =
    CATEGORY_NOTES[department] !== undefined
      ? department
      : FACULTY_DEFAULT_CATEGORY[faculty] ?? COURSE_CATEGORIES[0];
  return {
    faculty,
    department,
    level: fallbackLevel,
    title: `${department} ${fallbackLevel}`,
    description: `An introduction to the core concepts, principles and practices of ${department} at the ${fallbackLevel} level within the ${faculty}.`,
    category: fallbackCategory,
    note: getCategoryNote(fallbackCategory),
    price: CATALOGUE_PRICE_BASE,
  };
}

/** Applies the demo start date for a level, if one is defined. */
export function getLevelStartDate(level: string): string {
  return LEVEL_START_DATES[level as AcademicLevel] ?? "";
}
