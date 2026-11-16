import React from 'react';

interface FractionDisplayProps {
  num: number | string;
  den: number | string;
  whole?: number;
  large?: boolean;
  className?: string;
}

export const FractionDisplay: React.FC<FractionDisplayProps> = ({
  num,
  den,
  whole = 0,
  large = false,
  className = '',
}) => {
  const sizeClass = large ? 'frac-lg' : '';
  const fracPart = (
    <span className={`frac ${sizeClass} ${whole && whole > 0 ? '' : className}`}>
      <span className="frac-num">{num}</span>
      <span className="frac-den">{den}</span>
    </span>
  );

  if (whole && whole > 0) {
    return (
      <span className={`mixed-frac ${sizeClass} ${className}`}>
        <span className="mixed-whole">{whole}</span>
        {fracPart}
      </span>
    );
  }

  return fracPart;
};
