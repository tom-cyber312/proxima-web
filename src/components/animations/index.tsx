import { forwardRef, type ReactNode, type HTMLAttributes, type ForwardRefExoticComponent } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../utils/helpers';

const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

const tabVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const fadeInUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const slideInVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

const scaleInVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const animatedButtonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export const animatedTabVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const animatedCardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const animatedListVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

export const animatedModalVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

export type AnimatedButtonProps = HTMLMotionProps<'button'> & {
  variants?: typeof buttonVariants;
};

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, children, variants = buttonVariants, ...props }, ref) => (
    <motion.button
      ref={ref}
      className={cn('animated-button', className)}
      variants={variants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      transition={{ duration: 0.15, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.button>
  )
);
AnimatedButton.displayName = 'AnimatedButton';

export type AnimatedTabProps = HTMLMotionProps<'div'> & {
  variants?: typeof tabVariants;
};

export const AnimatedTab = forwardRef<HTMLDivElement, AnimatedTabProps>(
  ({ className, children, variants = tabVariants, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('animated-tab', className)}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
AnimatedTab.displayName = 'AnimatedTab';

export type AnimatedCardProps = HTMLMotionProps<'div'> & {
  variants?: typeof fadeInUpVariants;
};

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, children, variants = fadeInUpVariants, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('animated-card', className)}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
AnimatedCard.displayName = 'AnimatedCard';

export type AnimatedListProps = HTMLMotionProps<'ul'> & {
  variants?: typeof fadeInUpVariants;
};

export const AnimatedList = forwardRef<HTMLUListElement, AnimatedListProps>(
  ({ className, children, variants = fadeInUpVariants, ...props }, ref) => (
    <motion.ul
      ref={ref}
      className={cn('animated-list', className)}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut', staggerChildren: 0.05 }}
      {...props}
    >
      {children}
    </motion.ul>
  )
);
AnimatedList.displayName = 'AnimatedList';

export type AnimatedListItemProps = HTMLMotionProps<'li'> & {
  variants?: typeof fadeInUpVariants;
};

export const AnimatedListItem = forwardRef<HTMLLIElement, AnimatedListItemProps>(
  ({ className, children, variants = fadeInUpVariants, ...props }, ref) => (
    <motion.li
      ref={ref}
      className={cn('animated-list-item', className)}
      variants={variants}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.li>
  )
);
AnimatedListItem.displayName = 'AnimatedListItem';

export type AnimatedModalProps = HTMLMotionProps<'div'> & {
  variants?: typeof animatedModalVariants;
};

export const AnimatedModal = forwardRef<HTMLDivElement, AnimatedModalProps>(
  ({ className, children, variants = animatedModalVariants, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('animated-modal', className)}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
AnimatedModal.displayName = 'AnimatedModal';

export type AnimatedSlideInProps = HTMLMotionProps<'div'> & {
  direction?: 'left' | 'right';
  variants?: typeof slideInVariants;
};

export const AnimatedSlideIn = forwardRef<HTMLDivElement, AnimatedSlideInProps>(
  ({ className, children, direction = 'left', variants = slideInVariants, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('animated-slide-in', className)}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
AnimatedSlideIn.displayName = 'AnimatedSlideIn';

export type AnimatedScaleInProps = HTMLMotionProps<'div'> & {
  variants?: typeof scaleInVariants;
};

export const AnimatedScaleIn = forwardRef<HTMLDivElement, AnimatedScaleInProps>(
  ({ className, children, variants = scaleInVariants, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('animated-scale-in', className)}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
AnimatedScaleIn.displayName = 'AnimatedScaleIn';

export type AnimatedFadeInProps = HTMLMotionProps<'div'> & {
  delay?: number;
  variants?: typeof fadeInUpVariants;
};

export const AnimatedFadeIn = forwardRef<HTMLDivElement, AnimatedFadeInProps>(
  ({ className, children, variants = fadeInUpVariants, delay = 0, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('animated-fade-in', className)}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut', delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
);
AnimatedFadeIn.displayName = 'AnimatedFadeIn';

export const StaggerContainer = ({
  children,
  stagger = 0.05,
  delay = 0,
}: {
  children: ReactNode;
  stagger?: number;
  delay?: number;
}) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={{
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { staggerChildren: stagger, delayChildren: delay } },
    }}
  >
    {children}
  </motion.div>
);

export const StaggerItem = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut', delay } },
    }}
  >
    {children}
  </motion.div>
);

export const PageTransition = ({
  children,
}: {
  children: ReactNode;
}) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={{
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: 'easeIn' } },
    }}
  >
    {children}
  </motion.div>
);

export const AnimatePresence = motion.AnimatePresence;

export const springTransition = { type: 'spring', stiffness: 300, damping: 30 };
export const easeOutTransition = { duration: 0.2, ease: 'easeOut' };
export const easeInOutTransition = { duration: 0.3, ease: 'easeInOut' };

export const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return reducedMotion;
};

import { useState, useEffect } from 'react';