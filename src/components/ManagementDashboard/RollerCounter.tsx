"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface RollerDigitProps {
  digit: string;
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

function SingleRollerDigit({ digit }: RollerDigitProps) {
  const isNumber = !isNaN(parseInt(digit, 10));

  if (!isNumber) {
    return <span className="inline-block text-white font-mono">{digit}</span>;
  }

  const num = parseInt(digit, 10);

  return (
    <div className="relative inline-block h-10 w-6 overflow-hidden align-middle">
      <motion.div
        className="flex flex-col items-center"
        initial={false}
        animate={{ y: -num * 40 }}
        transition={{
          type: 'spring',
          stiffness: 280,
          damping: 24,
        }}
      >
        {DIGITS.map((d) => (
          <div
            key={d}
            className="h-10 flex items-center justify-center font-mono font-bold text-3xl sm:text-4xl text-white select-none"
          >
            {d}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

interface RollerCounterProps {
  value: number;
  className?: string;
}

export function RollerCounter({ value, className = '' }: RollerCounterProps) {
  // Format as comma separated number e.g. "684" or "1,248"
  const formattedString = value.toLocaleString();
  const characters = formattedString.split('');

  return (
    <div className={`inline-flex items-center tracking-tight ${className}`}>
      {characters.map((char, index) => (
        <SingleRollerDigit key={index} digit={char} />
      ))}
    </div>
  );
}
