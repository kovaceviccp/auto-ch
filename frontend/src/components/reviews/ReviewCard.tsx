"use client";

import { StarRating } from "./StarRating";

export interface Review {
  id: number;
  reviewer_name?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

interface ReviewCardProps {
  review: Review;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export function ReviewCard({ review }: ReviewCardProps) {
  const initials = getInitials(review.reviewer_name);
  const displayName = review.reviewer_name || "Anonym";

  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold select-none">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          {/* Top row: name + date */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm truncate">
              {displayName}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatDate(review.created_at)}
            </span>
          </div>

          {/* Stars */}
          <div className="mt-1">
            <StarRating value={review.rating} size="sm" />
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="mt-2 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
