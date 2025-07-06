export interface Webring {
  name: string;
  description: string;
  color: string;
  links: {
    previous: string;
    base: string;
    next: string;
  };
}
