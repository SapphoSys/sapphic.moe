export interface Technology {
  name: string;
  icon: string;
  link: string;
}

export interface Project {
  name: string;
  description: string;
  color: string;
  image: string;
  stack: Technology[];
  link: string;
}
