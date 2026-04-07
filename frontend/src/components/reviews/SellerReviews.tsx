"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { StarRating } from "./StarRating";
import { ReviewCard, type Review } from "./ReviewCard";

interface ReviewSummary {
  average: number;
  count: number;
  distribution: Record<string, number>; // "1" → count, "2" → count, …
}

interface CanReviewResponse {
  can_review: boolean;
  reason?: string; // "already_reviewed" | "own_profile" | "not_authenticated"
}

interface SellerReviewsProps {
  sellerId: number;
  currentUserId?: number;
}

function DistributionBar({
  star,
  count,
  total,
}: {
  star: number;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-4 text-right text-gray-500 flex-shrink-0">{star}</span>
      <svg
        viewBox="0 0 12 12"
        className="w-3.5 h-3.5 text-primary-500 flex-shrink-0"
        aria-hidden="true"
      >
        <path
          d="M6 1l1.55 3.13L11 4.63l-2.5 2.43.59 3.44L6 8.9l-3.09 1.6.59-3.44L1 4.63l3.45-.5L6 1z"
          fill="currentColor"
        />
      </svg>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-gray-400 flex-shrink-0 text-xs">{count}</span>
    </div>
  );
}

export function SellerReviews({ sellerId, currentUserId }: SellerReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [canReview, setCanReview] = useState<CanReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review form state
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        api.get<Review[]>(`/reviews/seller/${sellerId}`),
        api.get<ReviewSummary>(`/reviews/seller/${sellerId}/summary`),
      ]);
      setReviews(reviewsRes.data);
      setSummary(summaryRes.data);

      if (currentUserId) {
        try {
          const canRes = await api.get<CanReviewResponse>(
            `/reviews/me/can-review/${sellerId}`
          );
          setCanReview(canRes.data);
        } catch {
          // If endpoint 401s / 403s, user simply cannot review
          setCanReview({ can_review: false });
        }
      }
    } catch {
      setError("Bewertungen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, [sellerId, currentUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formRating === 0) {
      setSubmitError("Bitte wählen Sie eine Bewertung aus.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post("/reviews", {
        seller_id: sellerId,
        rating: formRating,
        comment: formComment.trim() || undefined,
      });
      setFormRating(0);
      setFormComment("");
      await fetchData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setSubmitError(
        axiosErr?.response?.data?.detail || "Bewertung konnte nicht gespeichert werden."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-10 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
        {error}
      </div>
    );
  }

  const totalReviews = summary?.count ?? 0;
  const avgRating = summary?.average ?? 0;

  return (
    <div className="rounded-xl border border-gray-200 p-6 space-y-6">
      <h2 className="font-semibold text-gray-900 text-lg">Bewertungen</h2>

      {/* ── Summary ── */}
      {totalReviews > 0 ? (
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Average number + stars */}
          <div className="flex flex-col items-center justify-center min-w-[96px] gap-1">
            <span className="text-5xl font-bold text-gray-900 leading-none">
              {avgRating.toFixed(1)}
            </span>
            <StarRating value={avgRating} size="md" />
            <span className="text-xs text-gray-400 mt-0.5">
              {totalReviews} Bewertung{totalReviews !== 1 ? "en" : ""}
            </span>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 flex flex-col justify-center gap-1.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <DistributionBar
                key={star}
                star={star}
                count={summary?.distribution?.[String(star)] ?? 0}
                total={totalReviews}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">Noch keine Bewertungen vorhanden.</p>
      )}

      {/* ── Review Form ── */}
      {currentUserId && canReview?.can_review && (
        <form
          onSubmit={handleSubmit}
          className="border border-gray-200 rounded-xl p-5 space-y-4"
        >
          <div className="flex items-center gap-2.5 pb-1 border-b border-gray-100">
            <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-400 text-base leading-none select-none">
              {"★"}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm leading-none">Review this seller</h3>
              <p className="text-xs text-gray-400 mt-0.5">Teile deine Erfahrung mit anderen Käufern</p>
            </div>
          </div>

          {/* Star picker */}
          <div className="flex items-center gap-3">
            <StarRating value={formRating} onChange={setFormRating} size="lg" />
            {formRating > 0 && (
              <span className="text-sm text-gray-500">
                {["", "Sehr schlecht", "Schlecht", "Okay", "Gut", "Sehr gut"][formRating]}
              </span>
            )}
          </div>

          {/* Comment textarea */}
          <textarea
            value={formComment}
            onChange={(e) => setFormComment(e.target.value)}
            placeholder="Ihr Kommentar (optional)…"
            rows={3}
            maxLength={1000}
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-shadow"
          />

          {submitError && (
            <p className="text-xs text-red-600">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={submitting || formRating === 0}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            Bewertung senden
          </button>
        </form>
      )}

      {/* Graceful blocked states */}
      {currentUserId && canReview && !canReview.can_review && (
        <p className="text-xs text-gray-400 italic">
          {canReview.reason === "already_reviewed"
            ? "Sie haben diesen Verkäufer bereits bewertet."
            : canReview.reason === "own_profile"
            ? ""
            : null}
        </p>
      )}

      {/* ── Review list ── */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  );
}
