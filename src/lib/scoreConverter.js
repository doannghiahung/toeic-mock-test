// TOEIC raw score to scale score converter based on official standard tables
// Each array represents correct answers count from 0 to 100

const listeningScores = [
  5, 5, 5, 5, 5, 5, 5, 10, 15, 20, 
  25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 
  75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 
  125, 130, 135, 140, 145, 150, 155, 160, 165, 170, 
  175, 180, 185, 190, 195, 200, 205, 210, 215, 220, 
  225, 230, 235, 240, 245, 250, 255, 260, 265, 270, 
  275, 280, 285, 290, 295, 300, 310, 320, 325, 330, 
  335, 340, 345, 350, 355, 360, 365, 370, 375, 380, 
  385, 390, 395, 400, 405, 410, 415, 420, 425, 430, 
  435, 440, 445, 450, 455, 460, 470, 480, 485, 490, 
  495
];

const readingScores = [
  5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 
  10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 
  60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 
  110, 115, 120, 125, 130, 135, 140, 145, 150, 155, 
  160, 165, 170, 175, 180, 185, 190, 195, 200, 205, 
  210, 215, 220, 225, 230, 235, 240, 245, 250, 255, 
  260, 265, 270, 275, 280, 285, 290, 295, 300, 305, 
  310, 315, 320, 325, 330, 335, 340, 345, 350, 355, 
  360, 380, 385, 390, 395, 400, 405, 410, 415, 420, 
  425, 430, 435, 440, 445, 450, 460, 470, 480, 490, 
  495
];

export function getListeningScore(correctCount) {
  const count = Math.max(0, Math.min(100, correctCount));
  return listeningScores[count];
}

export function getReadingScore(correctCount) {
  const count = Math.max(0, Math.min(100, correctCount));
  return readingScores[count];
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
