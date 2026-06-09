// TOEIC raw score to scale score converter based on official standard tables
// Each array represents correct answers count from 0 to 100

export function getListeningScore(correctCount) {
  const count = Math.max(0, Math.min(100, correctCount));
  return Math.min(495, count * 5);
}

export function getReadingScore(correctCount) {
  const count = Math.max(0, Math.min(100, correctCount));
  return Math.min(495, count * 5);
}

export function getTOEICScore(listeningCorrect, readingCorrect) {
  const listening = getListeningScore(listeningCorrect);
  const reading = getReadingScore(readingCorrect);
  return {
    listening,
    reading,
    total: listening + reading
  };
}

export function getPartFromQuestion(qNum) {
  if (qNum >= 1 && qNum <= 6) return 1;
  if (qNum >= 7 && qNum <= 31) return 2;
  if (qNum >= 32 && qNum <= 70) return 3;
  if (qNum >= 71 && qNum <= 100) return 4;
  if (qNum >= 101 && qNum <= 130) return 5;
  if (qNum >= 131 && qNum <= 146) return 6;
  if (qNum >= 147 && qNum <= 200) return 7;
  return 0;
}

export function getFeedbackText(score) {
  if (score >= 900) return "Excellent! You have professional working proficiency.";
  if (score >= 785) return "Very Good! You have advanced working proficiency.";
  if (score >= 605) return "Good! You have basic working proficiency.";
  if (score >= 405) return "Intermediate! You can satisfy basic social demands.";
  return "Elementary proficiency. Keep practicing!";
}
