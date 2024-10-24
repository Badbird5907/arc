"use client";

import { DelayContext } from "@/components/framer/animation-context";
import { motion } from "framer-motion";
import React, { useContext } from "react";

type PopInProps = {
  duration: number;
  once?: boolean;
  children: React.ReactNode;
  delay?: number; // TODO: stagger children
  className?: string;
};
const PopIn = ({ once = true, ...props }: PopInProps) => {
  const contextDelay = useContext(DelayContext);
  const delay = props.delay ?? contextDelay.delay;
  return (
    <motion.div
      {...props}
      initial={"hidden"}
      whileInView={"visible"}
      viewport={{ once }}
      transition={{ duration: props.duration, delay }}
      variants={{
        visible: { opacity: 1, scale: 1 },
        hidden: { opacity: 0, scale: 0 },
      }}>
      {props.children}
    </motion.div>
  );
};

export default PopIn;