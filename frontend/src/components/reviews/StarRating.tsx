"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-7 h-7",
};

function StarIcon({
  fill,
  className,
}: {
  fill: "full" | "half" | "empty";
  className?: string;
}) {
  const id = `half-${Math.random().toString(36).slice(2, 8)}`;

  if (fill === "full") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (fill === "half") {
    return (
      <svg
        viewBox="0 0 24 24"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={id}>
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
        </defs>
        {/* empty background star */}
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* filled left half */}
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          clipPath={`url(#${id})`}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Read-only display: rounds value to nearest 0.5 and renders half-star if needed. */
function ReadOnlyStars({
  value,
  sizeClass,
}: {
  value: number;
  sizeClass: string;
}) {
  // Round to nearest 0.5
  const rounded = Math.round(value * 2) / 2;

  return (
    <div className="flex items-center gap-0.5 text-primary-500">
      {Array.from({ length: 5 }, (_, i) => {
        const starNumber = i + 1;
        let fill: "full" | "half" | "empty";
        if (rounded >= starNumber) {
          fill = "full";
        } else if (rounded >= starNumber - 0.5) {
          fill = "half";
        } else {
          fill = "empty";
        }
        return <StarIcon key={i} fill={fill} className={sizeClass} />;
      })}
    </div>
  );
}

/** Interactive stars with hover highlight. */
function InteractiveStars({
  value,
  onChange,
  sizeClass,
}: {
  value: number;
  onChange: (v: number) => void;
  sizeClass: string;
}) {
  const [hovered, setHovered] = useState<number>(0);

  const display = hovered > 0 ? hovered : value;

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => setHovered(0)}
      role="radiogroup"
      aria-label="Bewertung"
    >
      {Array.from({ length: 5 }, (_, i) => {
        const starValue = i + 1;
        const filled = display >= starValue;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === starValue}
            aria-label={`${starValue} Stern${starValue !== 1 ? "e" : ""}`}
            className={`transition-colors ${filled ? "text-primary-500" : "text-gray-300"} hover:text-primary-500`}
            onMouseEnter={() => setHovered(starValue)}
            onClick={() => onChange(starValue)}
          >
            <StarIcon fill={filled ? "full" : "empty"} className={sizeClass} />
          </button>
        );
      })}
    </div>
  );
}

export function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  const sizeClass = sizeMap[size];

  if (onChange) {
    return (
      <InteractiveStars value={value} onChange={onChange} sizeClass={sizeClass} />
    );
  }

  return <ReadOnlyStars value={value} sizeClass={sizeClass} />;
}
