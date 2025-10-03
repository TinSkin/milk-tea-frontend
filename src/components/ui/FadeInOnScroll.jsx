import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import React from "react";

/**
 * Props:
 * - direction: "left" | "right" (default: "left")
 * - duration: số giây transition (default: 0.8)
 * - delay: độ trễ (default: 0)
 * - children: nội dung bên trong
 */
const FadeInOnScroll = ({
  direction = "left",
  duration = 0.8,
  delay = 0,
  children,
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const variants = {
    hidden: {
      opacity: 0,
      x: direction === "left" ? -100 : 100,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration,
        delay,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

export default FadeInOnScroll;
