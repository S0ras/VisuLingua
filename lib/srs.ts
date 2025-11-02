// SM-2 Algorithm for Spaced Repetition
// Based on SuperMemo 2 algorithm

export interface ReviewData {
  easinessFactor: number
  interval: number
  repetitions: number
  nextReview: Date
}

/**
 * Calculate next review based on quality of recall
 * @param quality - Quality of recall (0-5)
 *   5: perfect response
 *   4: correct response after hesitation
 *   3: correct response with difficulty
 *   2: incorrect but familiar
 *   1: incorrect, seemed familiar
 *   0: complete blackout
 * @param previousData - Previous review data
 * @returns New review data
 */
export function calculateNextReview(
  quality: number,
  previousData?: ReviewData
): ReviewData {
  const minEF = 1.3
  
  // Initialize defaults for new cards
  let easinessFactor = previousData?.easinessFactor ?? 2.5
  let interval = previousData?.interval ?? 0
  let repetitions = previousData?.repetitions ?? 0

  // Calculate new easiness factor
  easinessFactor = Math.max(
    minEF,
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  )

  // Calculate interval and repetitions
  if (quality < 3) {
    // Incorrect response - reset
    repetitions = 0
    interval = 0
  } else {
    // Correct response
    if (repetitions === 0) {
      interval = 1 // 1 day
    } else if (repetitions === 1) {
      interval = 6 // 6 days
    } else {
      interval = Math.round(interval * easinessFactor)
    }
    repetitions += 1
  }

  // Calculate next review date
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return {
    easinessFactor,
    interval,
    repetitions,
    nextReview,
  }
}
