/* eslint-disable react/display-name */
import type { HTMLMotionProps } from "framer-motion";
import { motion } from "framer-motion";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import React from "react";

interface DivProps extends HTMLMotionProps<"div"> {
  index?: number;
}

//& ForwardRefComponent<HTMLDivElement, HTMLMotionProps<"div">>;

const Panel: ForwardRefExoticComponent<
  DivProps & RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, DivProps>(
  ({ children, index, ...rest }, ref) => {
    return (
      <motion.div
        {...rest}
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: (index ?? 1) * 0.03 }}
      >
        {children}
      </motion.div>
    );
  }
);

export default Panel;
