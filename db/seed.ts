import { db, Guestbook } from 'astro:db';

// https://astro.build/db/seed
export default async () => {
  await db.insert(Guestbook).values([
    {
      name: 'John Doe',
      message: 'This is a sample message.',
      color: 'red',
    },
    {
      name: 'Jane Doe',
      message: 'This is a sample message with a link.',
      url: 'https://example.com',
      color: 'blue',
    },
    {
      name: 'Alice Smith',
      message: 'Hello, world! This is a test message.',
      color: 'mauve',
    },
    {
      name: 'Bob Johnson',
      message: 'This is another test message.',
      color: 'green',
    },
    {
      name: 'Charlie Brown',
      message: 'Testing the guestbook functionality.',
      color: 'peach',
    },
    {
      name: 'Diana Prince',
      message: 'This is a message with a link to Astro.',
      url: 'https://astro.build',
      color: 'sapphire',
    },
    {
      name: 'Ethan Hunt',
      message: 'Mission accomplished! This is a test message.',
      color: 'sky',
    },
    {
      name: 'Fiona Gallagher',
      message: 'This is a sample message with a link to GitHub.',
      url: 'https://github.com',
      color: 'lavender',
    },
    {
      name: 'George Costanza',
      message: 'This is a test message for the guestbook.',
      color: 'blue',
    },
    {
      name: 'Hannah Montana',
      message: 'This is a sample message with a link to YouTube.',
      url: 'https://youtube.com',
      color: 'pink',
    },
    {
      name: 'Ian Malcolm',
      message: 'Life finds a way. This is a test message.',
      color: 'teal',
    },
  ]);
};
