export interface TimelineEntry {
  year: string
  title: string
  description: string
  isCurrent?: boolean
}

export const journeyTimeline: TimelineEntry[] = [
  {
    year: "2009",
    title: "First Step into IT",
    description: "Started my professional journey with an IT internship at WOW Istanbul Hotels & Convention Center."
  },
  {
    year: "2012",
    title: "IT Operations",
    description: "Worked part-time in IT at Istanbul Cerrahi Hospital while continuing my education."
  },
  {
    year: "2014",
    title: "Software Support Engineer · TV8",
    description: "Gained hands-on experience with enterprise applications, databases, and Java-based technologies."
  },
  {
    year: "2015",
    title: "E-commerce & Software Support · ÇiçekSepeti",
    description: "Joined ÇiçekSepeti and moved deeper into the e-commerce technology world."
  },
  {
    year: "2016",
    title: "Software Developer · ÇiçekSepeti",
    description: "Transitioned into software development, working mainly on backend systems and APIs."
  },
  {
    year: "2017",
    title: "Master's Degree",
    description: "Completed my Master's in Computer Engineering at Beykent University."
  },
  {
    year: "2018",
    title: "Software Engineer · Migros",
    description: "Joined Migros Ticaret and worked on large-scale e-commerce systems, microservices, and cloud transformation."
  },
  {
    year: "2021",
    title: "Software Consultant · ING Turkey",
    description: "Contributed to consumer lending platforms, Java modernization, and microservice architecture."
  },
  {
    year: "2022",
    title: "Backend Engineer · LeoVegas Group",
    description: "Relocated to the Netherlands. Joined LeoVegas Group, working on large-scale backend and distributed systems."
  },
  {
    year: "2024",
    title: "Senior Backend Engineer · LeoVegas Group",
    description: "Moved into a senior role within Core Experience / UYC — backend platforms for document verification, KYC, AML, and customer journeys."
  },
  {
    year: "2026",
    title: "Today",
    description: "Continuing to build scalable backend systems with Java, Spring Boot, Kafka, Kubernetes, and cloud-native technologies.",
    isCurrent: true
  }
]
