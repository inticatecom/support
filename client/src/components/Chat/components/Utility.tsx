// Resources
import { motion } from "motion/react";

export function Loader() {
  return (
    <div className="flex justify-center items-center gap-1">
      {Array.from({ length: 4 }).map((_, index) => (
        <motion.span
          animate={{ scaleY: [1, 1.3, 1] }}
          transition={{
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut",
            duration: 0.8,
          }}
          key={index}
          className="bg-white w-1 h-4 rounded-full"
        />
      ))}
    </div>
  );
}
