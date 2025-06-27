import { Icon } from '@iconify/react';
import type { MarkdownHeading } from 'astro';
import { useEffect, useRef, useState } from 'react';

type ProcessedHeading = MarkdownHeading & { children: ProcessedHeading[] };

interface Props {
  headings: MarkdownHeading[];
  initialOpen?: boolean;
}

const processHeadings = (headings: MarkdownHeading[]): ProcessedHeading[] => {
  const processed: ProcessedHeading[] = [];

  for (const heading of headings) {
    let currentLevel = processed;

    for (let i = 1; i < heading.depth; i++) {
      if (currentLevel.length === 0)
        currentLevel.push({ depth: i, slug: '', text: '', children: [] });
      currentLevel = currentLevel[currentLevel.length - 1].children;
    }

    currentLevel.push({ ...heading, children: [] });
  }

  return processed;
};

const TableOfContents = ({ headings, initialOpen = false }: Props) => {
  const [currentHeading, setCurrentHeading] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isVisible, setIsVisible] = useState(false);
  const processedHeadings = processHeadings(headings);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 20);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      requestAnimationFrame(() => {
        contentRef.current!.style.maxHeight = isOpen
          ? `${contentRef.current!.scrollHeight}px`
          : '0px';
      });
    }
  }, [isOpen, headings]);

  useEffect(() => {
    const wrappingElement =
      document.querySelector('.article-content') || document.querySelector('.prose');
    if (!wrappingElement) return;

    const allHeaderTags = wrappingElement.querySelectorAll('h1, h2, h3');
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.intersectionRatio > 0);

        if (visibleEntries.length > 0) {
          const mostVisible = visibleEntries.reduce((prev, current) => {
            return prev.intersectionRatio > current.intersectionRatio ? prev : current;
          });

          setCurrentHeading(mostVisible.target.id);
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -20% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    for (const tag of allHeaderTags) {
      tag.classList.add('scroll-mt-24');
      observer.observe(tag);
    }

    return () => observer.disconnect();
  }, []);

  const renderHeading = (heading: ProcessedHeading) => (
    <li className="py-1" key={heading.slug}>
      <a
        href={`#${heading.slug}`}
        className={`text-ctp-text hover:text-ctp-mauve hover:dark:text-ctp-pink ${
          currentHeading === heading.slug ? 'font-medium !text-ctp-mauve dark:!text-ctp-pink' : ''
        }`}
      >
        {heading.text.replace('#', '')}
      </a>
      {heading.children.length > 0 && (
        <ul className="mx-4">{heading.children.map(renderHeading)}</ul>
      )}
    </li>
  );

  return (
    <nav
      ref={navRef}
      className={`overflow-hidden rounded-md border-2 border-ctp-mauve bg-ctp-mantle motion-safe:transition-opacity motion-safe:duration-200 dark:border-ctp-pink ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-none bg-ctp-mauve p-3 text-ctp-base hover:no-underline hover:opacity-100 dark:bg-ctp-pink"
      >
        <Icon
          icon="mdi:table-of-contents"
          fontSize={25}
          className="!text-ctp-base"
          aria-hidden={true}
        />
        <h2 className="font-semibold">Table of Contents</h2>
        <Icon
          icon="mdi:chevron-down"
          fontSize={20}
          className={`ml-auto !text-ctp-base motion-safe:transition-transform motion-safe:duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden={true}
        />
      </button>

      <div
        ref={contentRef}
        className="overflow-hidden motion-safe:transition-[max-height] motion-safe:duration-200 motion-safe:ease-out"
      >
        <div className="my-1">
          <ul>{processedHeadings.map(renderHeading)}</ul>
        </div>
      </div>
    </nav>
  );
};

export default TableOfContents;
