import type { TransitionAnimationPair } from 'astro';

const layoutForwards: TransitionAnimationPair = {
  old: {
    name: 'fadeOutUp',
    duration: '0.2s',
    easing: 'ease-in',
    fillMode: 'forwards',
  },
  new: {
    name: 'fadeInUp',
    duration: '0.3s',
    delay: '0.2s',
    easing: 'ease-out',
    fillMode: 'backwards',
  },
};

const layoutBackwards: TransitionAnimationPair = {
  old: {
    name: 'fadeOutDown',
    duration: '0.2s',
    easing: 'ease-in',
    fillMode: 'forwards',
  },
  new: {
    name: 'fadeInDown',
    duration: '0.3s',
    delay: '0.2s',
    easing: 'ease-out',
    fillMode: 'backwards',
  },
};

const articleForwards: TransitionAnimationPair = {
  old: {
    name: 'fadeOutUp',
    duration: '0.2s',
    easing: 'ease-in',
    fillMode: 'forwards',
  },
  new: {
    name: 'fadeInUp',
    duration: '0.3s',
    delay: '0.35s',
    easing: 'ease-out',
    fillMode: 'backwards',
  },
};

const articleBackwards: TransitionAnimationPair = {
  old: {
    name: 'fadeOutDown',
    duration: '0.2s',
    easing: 'ease-in',
    fillMode: 'forwards',
  },
  new: {
    name: 'fadeInDown',
    duration: '0.3s',
    delay: '0.4s',
    easing: 'ease-out',
    fillMode: 'backwards',
  },
};

export const articleTransition = {
  forwards: articleForwards,
  backwards: articleBackwards,
};

export const layoutTransition = {
  forwards: layoutForwards,
  backwards: layoutBackwards,
};
