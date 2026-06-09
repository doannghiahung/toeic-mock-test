"use client";

import React, { useState, useEffect, useRef } from "react";
import questionsData from "../data/questions.json";
import {
  getTOEICScore,
  getPartFromQuestion,
  getFeedbackText
} from "../lib/scoreConverter";

// Helper to get group of questions that share the same passage or audio context
function getQuestionGroup(qNum) {
  if (qNum >= 1 && qNum <= 6) return [qNum];
  if (qNum >= 7 && qNum <= 31) return [qNum];
  if (qNum >= 32 && qNum <= 70) {
    const start = 32 + Math.floor((qNum - 32) / 3) * 3;
    return [start, start + 1, start + 2];
  }
  if (qNum >= 71 && qNum <= 100) {
    const start = 71 + Math.floor((qNum - 71) / 3) * 3;
    return [start, start + 1, start + 2];
  }
  if (qNum >= 101 && qNum <= 130) return [qNum];
  if (qNum >= 131 && qNum <= 146) {
    const start = 131 + Math.floor((qNum - 131) / 4) * 4;
    return [start, start + 1, start + 2, start + 3];
  }
  
  const groups = [
    [147, 148],
    [149, 150],
    [151, 152],
    [153, 154],
    [155, 156, 157],
    [158, 159, 160],
    [161, 162, 163],
    [164, 165, 166, 167],
    [168, 169, 170, 171],
    [172, 173, 174, 175],
    [176, 177, 178, 179, 180],
    [181, 182, 183, 184, 185],
    [186, 187, 188, 189, 190],
    [191, 192, 193, 194, 195],
    [196, 197, 198, 199, 200]
  ];
  for (const g of groups) {
    if (g.includes(qNum)) return g;
  }
  return [qNum];
}

function getGroupRangeLabel(qNum) {
  const group = getQuestionGroup(qNum);
  if (group.length === 1) return `${qNum} / 200`;
  return `${group[0]} - ${group[group.length - 1]} / 200`;
}

// Helper to get passage/photo image path
function getPassageImage(qNum) {
  if (qNum >= 1 && qNum <= 6) return `/assets/part1_q${qNum}.png`;
  
  // Part 3/4 graphics
  if (qNum >= 65 && qNum <= 67) return "/assets/graphics/graphic_65_67.png";
  if (qNum >= 68 && qNum <= 70) return "/assets/graphics/graphic_68_70.png";
  if (qNum >= 92 && qNum <= 94) return "/assets/graphics/graphic_92_94.png";
  if (qNum >= 95 && qNum <= 97) return "/assets/graphics/graphic_95_97.png";
  if (qNum >= 98 && qNum <= 100) return "/assets/graphics/graphic_98_100.png";
  
  // Part 6 passages
  if (qNum >= 131 && qNum <= 134) return "/assets/passages/passage_131_134.png";
  if (qNum >= 135 && qNum <= 138) return "/assets/passages/passage_135_138.png";
  if (qNum >= 139 && qNum <= 142) return "/assets/passages/passage_139_142.png";
  if (qNum >= 143 && qNum <= 146) return "/assets/passages/passage_143_146.png";
  
  // Part 7 passages
  if (qNum >= 147 && qNum <= 148) return "/assets/passages/passage_147_148.png";
  if (qNum >= 149 && qNum <= 150) return "/assets/passages/passage_149_150.png";
  if (qNum >= 151 && qNum <= 152) return "/assets/passages/passage_151_152.png";
  if (qNum >= 153 && qNum <= 154) return "/assets/passages/passage_153_154.png";
  if (qNum >= 155 && qNum <= 157) return "/assets/passages/passage_155_157.png";
  if (qNum >= 158 && qNum <= 160) return "/assets/passages/passage_158_160.png";
  if (qNum >= 161 && qNum <= 163) return "/assets/passages/passage_161_163.png";
  if (qNum >= 164 && qNum <= 167) return "/assets/passages/passage_164_167.png";
  if (qNum >= 168 && qNum <= 171) return "/assets/passages/passage_168_171.png";
  if (qNum >= 172 && qNum <= 175) return "/assets/passages/passage_172_175.png";
  if (qNum >= 176 && qNum <= 180) return "/assets/passages/passage_176_180.png";
  if (qNum >= 181 && qNum <= 185) return "/assets/passages/passage_181_185.png";
  if (qNum >= 186 && qNum <= 190) return "/assets/passages/passage_186_190.png";
  if (qNum >= 191 && qNum <= 195) return "/assets/passages/passage_191_195.png";
  if (qNum >= 196 && qNum <= 200) return "/assets/passages/passage_196_200.png";
  return null;
}

// Category lists per Part for Detailed Analysis
const partCategories = {
  1: [
    { name: "# People description", qNums: [1, 2, 4, 5, 6] },
    { name: "# Scene/Object description", qNums: [3] }
  ],
  2: [
    { name: "# Wh-question", qNums: [7, 8, 9, 12, 13, 15, 16, 17, 18, 19, 20, 23, 24, 26] },
    { name: "# Yes/No question", qNums: [10, 22, 28, 31] },
    { name: "# Other question types", qNums: [11, 21, 25, 30] },
    { name: "# Statement", qNums: [27, 29] }
  ],
  3: [
    { name: "# Main idea question", qNums: [32, 35, 38, 41, 53, 56, 59, 65, 68] },
    { name: "# Detail question", qNums: [33, 34, 36, 37, 39, 44, 45, 46, 47, 48, 49, 51, 52, 54, 55, 58, 60, 61, 62, 63, 67, 69] },
    { name: "# Inference/implied meaning question", qNums: [40, 42, 50, 57] },
    { name: "# Prediction question", qNums: [43, 64] },
    { name: "# Graphic question", qNums: [66, 70] }
  ],
  4: [
    { name: "# Detail question", qNums: [71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 82, 84, 85, 87, 88, 90, 92, 93, 95, 97, 98, 100] },
    { name: "# Inference/implied meaning question", qNums: [81, 91] },
    { name: "# Main idea question", qNums: [83, 86, 89] },
    { name: "# Graphic question", qNums: [94, 96, 99] }
  ],
  5: [
    { name: "# Function word question", qNums: [101, 118, 123, 125, 126, 127, 128, 129] },
    { name: "# Grammar question_Word form", qNums: [102, 103, 106, 108, 111, 120, 122] },
    { name: "# Vocabulary question", qNums: [104, 105, 107, 112, 113, 115, 119] },
    { name: "# Grammar question_Verb form", qNums: [109, 114, 116, 121, 124, 130] },
    { name: "# Grammar question_Sentence structures", qNums: [110] },
    { name: "# Vocabulary question_Phrasal verb", qNums: [117] }
  ],
  6: [
    { name: "# Grammar question_Sentence structures", qNums: [131] },
    { name: "# Vocabulary question", qNums: [132, 135, 139, 145, 146] },
    { name: "# Grammar question_Verb form", qNums: [133, 136, 143] },
    { name: "# Sentence insertion", qNums: [134, 137, 141] },
    { name: "# Function word question", qNums: [138, 140, 144] },
    { name: "# Grammar question_Word form", qNums: [142] }
  ],
  7: [
    { name: "# Main idea question", qNums: [147, 158, 161, 164, 165, 168, 172, 176] },
    { name: "# Detail question", qNums: [148, 150, 151, 152, 153, 155, 156, 159, 163, 169, 178, 182, 183, 185, 186, 187, 188, 191, 193, 194, 196, 198] },
    { name: "# Inference/implied meaning question", qNums: [149, 154, 160, 162, 166, 167, 173, 179, 181] },
    { name: "# Vocabulary question", qNums: [157, 170, 174, 177, 192, 197] },
    { name: "# Sentence insertion", qNums: [171, 175] },
    { name: "# Cross-text question", qNums: [180, 184, 189, 190, 195, 199, 200] }
  ]
};

export default function Home() {
  const [screen, setScreen] = useState("welcome"); // welcome, leaderboard, exam, result
  const [userName, setUserName] = useState("");
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(1);
  
  // Timer states (2h 5m = 125 minutes = 7500 seconds)
  const [timer, setTimer] = useState(7500);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isListeningDone, setIsListeningDone] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [timeSpentOnSubmit, setTimeSpentOnSubmit] = useState(0);
  
  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState([]);
  const [isFetchingLeaderboard, setIsFetchingLeaderboard] = useState(false);
  
  // Result analysis states
  const [activePartTab, setActivePartTab] = useState(1);
  const [selectedReviewQ, setSelectedReviewQ] = useState(null);
  
  const audioRef = useRef(null);
  const handleSubmitRef = useRef(null);
  useEffect(() => {
    handleSubmitRef.current = handleSubmitTest;
  });
  
  // Anti-cheat: disable text selection, right-click, double-click, and copy-paste
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleCopyPaste = (e) => e.preventDefault();
    const handleSelectStart = (e) => e.preventDefault();
    
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("selectstart", handleSelectStart);
    
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("selectstart", handleSelectStart);
    };
  }, []);
  
  // Stop listening section and prompt transition to reading
  const handleListeningDoneClick = () => {
    setIsTimerPaused(true);
    setShowTransition(true);
    setIsListeningDone(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // Explicitly handle grid button clicks, including scroll and transition checks
  const handleGridClick = (num) => {
    if (num >= 101 && !isListeningDone) {
      handleListeningDoneClick();
      return;
    }
    
    setCurrentQuestion(num);
    
    setTimeout(() => {
      const el = document.getElementById(`q-card-${num}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  };


  
  // Timer interval logic
  useEffect(() => {
    if (screen !== "exam" || isTimerPaused || showTransition) return;
    
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (handleSubmitRef.current) {
            handleSubmitRef.current(); // Auto submit
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [screen, isTimerPaused, showTransition]);
  
  // Handle moving from Q100 to Q101 (listening to reading transition)
  useEffect(() => {
    if (screen !== "exam") return;
    
    if (currentQuestion === 101 && !isListeningDone) {
      // Pause timer, show transition popup
      setIsTimerPaused(true);
      setShowTransition(true);
      setIsListeningDone(true);
      
      // Pause audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [currentQuestion, isListeningDone, screen]);
  
  const handleStartExam = () => {
    if (!userName.trim()) return;
    
    setUserAnswers({});
    setCurrentQuestion(1);
    setTimer(7500);
    setIsTimerPaused(false);
    setIsListeningDone(false);
    setShowTransition(false);
    setScreen("exam");
    
    // Play audio
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch((err) => console.log("Audio autoplay was blocked:", err));
      }
    }, 200);
  };
  
  const handleStartReading = () => {
    setShowTransition(false);
    setIsTimerPaused(false);
    // Move to question 101
    setCurrentQuestion(101);
  };
  
  const handleFetchLeaderboard = async () => {
    setIsFetchingLeaderboard(true);
    setScreen("leaderboard");
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingLeaderboard(false);
    }
  };
  
  const handleSelectOption = (qNum, option) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qNum]: option
    }));
  };
  
  const handleNext = () => {
    if (currentQuestion < 200) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };
  
  const handleBack = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };
  
  const handleSubmitTest = async () => {
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Calculate spent time
    const spent = 7500 - timer;
    setTimeSpentOnSubmit(spent);
    
    // Calculate scores
    let listeningCorrect = 0;
    let readingCorrect = 0;
    
    for (let q = 1; q <= 200; q++) {
      const isCorrect = userAnswers[q] === questionsData[q.toString()].correct_answer;
      if (isCorrect) {
        if (q <= 100) listeningCorrect++;
        else readingCorrect++;
      }
    }
    
    const scaleScore = getTOEICScore(listeningCorrect, readingCorrect);
    
    // Send to leaderboard API
    try {
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          score: scaleScore.total,
          listeningCorrect,
          readingCorrect,
          timeSpent: spent,
          date: new Date().toLocaleDateString("vi-VN")
        })
      });
    } catch (err) {
      console.error("Failed to submit score:", err);
    }
    
    setScreen("result");
  };
  
  // Formatting helper
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [
      h.toString().padStart(2, "0"),
      m.toString().padStart(2, "0"),
      s.toString().padStart(2, "0")
    ].join(":");
  };
  
  // Calculate scoring states for result screen
  const getExamStats = () => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    let listeningCorrect = 0;
    let readingCorrect = 0;
    
    const partsStats = {};
    for (let p = 1; p <= 7; p++) {
      partsStats[p] = { correct: 0, total: 0 };
    }
    
    for (let q = 1; q <= 200; q++) {
      const chosen = userAnswers[q];
      const correctAns = questionsData[q.toString()].correct_answer;
      const part = getPartFromQuestion(q);
      
      partsStats[part].total++;
      
      if (!chosen) {
        skipped++;
      } else if (chosen === correctAns) {
        correct++;
        partsStats[part].correct++;
        if (q <= 100) listeningCorrect++;
        else readingCorrect++;
      } else {
        wrong++;
      }
    }
    
    const scaleScore = getTOEICScore(listeningCorrect, readingCorrect);
    return {
      correct,
      wrong,
      skipped,
      listeningCorrect,
      readingCorrect,
      scaleScore,
      partsStats
    };
  };
  
  const stats = screen === "result" ? getExamStats() : null;
  const currentQInfo = questionsData[currentQuestion.toString()];

  // Custom sidebar rendering helper
  const renderSidebarNavigation = () => {
    return (
      <div className="nav-pane">
        <div className="nav-pane-header">
          <h3>Phiếu trả lời</h3>
          <div className="progress-info">
            <span>Đã làm: {Object.keys(userAnswers).length} / 200</span>
            <span>{Math.round((Object.keys(userAnswers).length / 200) * 100)}%</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${(Object.keys(userAnswers).length / 200) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid-container">
          {[1, 2, 3, 4, 5, 6, 7].map((part) => (
            <div key={part}>
              <div className="part-section-title">Part {part}</div>
              <div className="grid-buttons">
                {Array.from({ length: 200 }, (_, i) => i + 1)
                  .filter((num) => getPartFromQuestion(num) === part)
                  .map((num) => (
                    <button
                      key={num}
                      className={`grid-btn ${currentQuestion === num ? 'active' : ''} ${userAnswers[num] ? 'answered' : ''}`}
                      onClick={() => handleGridClick(num)}
                    >
                      {num}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Custom listening question card rendering helper
  const renderListeningQuestionCard = (qNum) => {
    const qInfo = questionsData[qNum.toString()];
    const isPhoto = qNum >= 1 && qNum <= 6;
    
    return (
      <div
        key={qNum}
        id={`q-card-${qNum}`}
        className={`listening-question-item ${currentQuestion === qNum ? 'highlighted' : ''}`}
        onClick={() => setCurrentQuestion(qNum)}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div className="question-title" style={{ fontSize: "1.1rem" }}>
            <span style={{ color: "var(--color-primary)", fontWeight: "bold", marginRight: "8px" }}>
              Câu {qNum}:
            </span>
            {qInfo.question_text || (isPhoto ? "Quan sát ảnh và chọn đáp án mô tả đúng nhất:" : "Nghe và chọn câu phản hồi phù hợp nhất:")}
          </div>
          
          {isPhoto && getPassageImage(qNum) && (
            <div style={{ textAlign: "center", marginBottom: "15px", border: "1px solid var(--color-border)", borderRadius: "8px", overflow: "hidden", maxWidth: "450px" }}>
              <img
                src={getPassageImage(qNum)}
                alt={`Part 1 Photo Q${qNum}`}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          )}
          
          <div className="options-container" style={{ flexDirection: "row", flexWrap: "wrap", gap: "15px" }}>
            {Object.keys(qInfo.options).map((key) => (
              <div
                key={key}
                className={`option-card ${userAnswers[qNum] === key ? 'selected' : ''}`}
                style={{ flex: "1 1 200px", minWidth: "150px" }}
                onClick={(e) => {
                  e.stopPropagation(); // prevent card click
                  handleSelectOption(qNum, key);
                  setCurrentQuestion(qNum);
                }}
              >
                <div className="option-circle"></div>
                <span className="option-letter">({key})</span>
                <span className="option-text">{qInfo.options[key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Custom listening grouped questions rendering helper
  const renderGroupedListeningQuestions = (startNum, endNum) => {
    const renderedGroups = [];
    for (let q = startNum; q <= endNum; q += 3) {
      const qRange = [q, q + 1, q + 2];
      const hasGraphic = getPassageImage(q) !== null;
      
      renderedGroups.push(
        <div key={q} style={{ border: "1px solid var(--color-border)", borderRadius: "16px", padding: "25px", backgroundColor: "#ffffff", marginBottom: "35px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", gap: "20px", flexDirection: hasGraphic ? "row" : "column", flexWrap: "wrap" }}>
            {hasGraphic && (
              <div style={{ flex: "1 1 350px", maxWidth: "500px", border: "1px solid var(--color-border)", borderRadius: "8px", overflow: "hidden" }}>
                <img
                  src={getPassageImage(q)}
                  alt="Graphic Reference"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            )}
            
            <div style={{ flex: "2 1 400px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", fontWeight: "bold", borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>
                NHÓM CÂU HỎI {q} - {q + 2}
              </div>
              
              {qRange.map((qNum) => {
                const qInfo = questionsData[qNum.toString()];
                return (
                  <div
                    key={qNum}
                    id={`q-card-${qNum}`}
                    className={`listening-question-item ${currentQuestion === qNum ? 'highlighted' : ''}`}
                    style={{ margin: 0, boxShadow: "none", border: "1px solid var(--color-border)" }}
                    onClick={() => setCurrentQuestion(qNum)}
                  >
                    <div className="question-title">
                      <span style={{ color: "var(--color-primary)", fontWeight: "bold", marginRight: "8px" }}>
                        Câu {qNum}:
                      </span>
                      {qInfo.question_text || `Chọn đáp án đúng nhất cho câu hỏi số ${qNum}:`}
                    </div>
                    
                    <div className="options-container" style={{ flexDirection: "row", flexWrap: "wrap", gap: "10px" }}>
                      {Object.keys(qInfo.options).map((key) => (
                        <div
                          key={key}
                          className={`option-card ${userAnswers[qNum] === key ? 'selected' : ''}`}
                          style={{ flex: "1 1 200px", minWidth: "150px", padding: "10px 15px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOption(qNum, key);
                            setCurrentQuestion(qNum);
                          }}
                        >
                          <div className="option-circle" style={{ width: "18px", height: "18px" }}></div>
                          <span className="option-letter">({key})</span>
                          <span className="option-text" style={{ fontSize: "0.9rem" }}>{qInfo.options[key]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
    return renderedGroups;
  };

  const renderReadingQuestionCard = (qNum) => {
    const qInfo = questionsData[qNum.toString()];
    
    return (
      <div
        key={qNum}
        id={`q-card-${qNum}`}
        className={`listening-question-item ${currentQuestion === qNum ? 'highlighted' : ''}`}
        onClick={() => setCurrentQuestion(qNum)}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div className="question-title" style={{ fontSize: "1.1rem" }}>
            <span style={{ color: "var(--color-primary)", fontWeight: "bold", marginRight: "8px" }}>
              Câu {qNum}:
            </span>
            {qInfo.question_text || "Chọn đáp án thích hợp:"}
          </div>
          
          <div className="options-container" style={{ flexDirection: "row", flexWrap: "wrap", gap: "15px" }}>
            {Object.keys(qInfo.options).map((key) => (
              <div
                key={key}
                className={`option-card ${userAnswers[qNum] === key ? 'selected' : ''}`}
                style={{ flex: "1 1 200px", minWidth: "150px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectOption(qNum, key);
                  setCurrentQuestion(qNum);
                }}
              >
                <div className="option-circle"></div>
                <span className="option-letter">({key})</span>
                <span className="option-text">{qInfo.options[key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGroupedReadingQuestions = (startNum, endNum, isPart6) => {
    const renderedGroups = [];
    let q = startNum;
    
    while (q <= endNum) {
      const group = getQuestionGroup(q);
      const firstQ = group[0];
      const lastQ = group[group.length - 1];
      const hasGraphic = getPassageImage(firstQ) !== null;
      
      renderedGroups.push(
        <div key={firstQ} style={{ border: "1px solid var(--color-border)", borderRadius: "16px", padding: "25px", backgroundColor: "#ffffff", marginBottom: "35px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", gap: "25px", flexDirection: "row", flexWrap: "wrap" }}>
            {hasGraphic && (
              <div style={{ flex: "1 1 400px", maxWidth: "600px", border: "1px solid var(--color-border)", borderRadius: "8px", overflow: "hidden", backgroundColor: "#fafafa" }}>
                <img
                  src={getPassageImage(firstQ)}
                  alt="Reading Passage Reference"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            )}
            
            <div style={{ flex: "1.5 1 450px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", fontWeight: "bold", borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>
                NHÓM CÂU HỎI {firstQ} - {lastQ}
              </div>
              
              {group.map((qNum) => {
                const qInfo = questionsData[qNum.toString()];
                return (
                  <div
                    key={qNum}
                    id={`q-card-${qNum}`}
                    className={`listening-question-item ${currentQuestion === qNum ? 'highlighted' : ''}`}
                    style={{ margin: 0, boxShadow: "none", border: "1px solid var(--color-border)" }}
                    onClick={() => setCurrentQuestion(qNum)}
                  >
                    <div className="question-title">
                      <span style={{ color: "var(--color-primary)", fontWeight: "bold", marginRight: "8px" }}>
                        Câu {qNum}:
                      </span>
                      {qInfo.question_text || "Chọn đáp án thích hợp:"}
                    </div>
                    
                    <div className="options-container" style={{ flexDirection: "row", flexWrap: "wrap", gap: "10px" }}>
                      {Object.keys(qInfo.options).map((key) => (
                        <div
                          key={key}
                          className={`option-card ${userAnswers[qNum] === key ? 'selected' : ''}`}
                          style={{ flex: "1 1 200px", minWidth: "150px", padding: "10px 15px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOption(qNum, key);
                            setCurrentQuestion(qNum);
                          }}
                        >
                          <div className="option-circle" style={{ width: "18px", height: "18px" }}></div>
                          <span className="option-letter">({key})</span>
                          <span className="option-text" style={{ fontSize: "0.9rem" }}>{qInfo.options[key]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
      
      q = lastQ + 1;
    }
    
    return renderedGroups;
  };

  const renderReviewQuestionCard = (qNum) => {
    const qInfo = questionsData[qNum.toString()];
    const isPhoto = qNum >= 1 && qNum <= 6;
    const correctAns = qInfo.correct_answer;
    const chosen = userAnswers[qNum];
    
    return (
      <div
        key={qNum}
        id={`review-q-${qNum}`}
        className={`listening-question-item ${chosen === correctAns ? 'review-correct' : chosen ? 'review-wrong' : 'review-skipped'}`}
        style={{ borderLeftWidth: "5px" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div className="question-title" style={{ fontSize: "1.1rem" }}>
            <span style={{ color: "var(--color-primary)", fontWeight: "bold", marginRight: "8px" }}>
              Câu {qNum}:
            </span>
            {qInfo.question_text || (isPhoto ? "Quan sát ảnh và chọn đáp án mô tả đúng nhất:" : "Nghe và chọn câu phản hồi phù hợp nhất:")}
            
            {chosen === correctAns ? (
              <span className="review-badge-correct" style={{ marginLeft: "10px", fontSize: "0.85rem", backgroundColor: "var(--color-correct-light)", color: "var(--color-correct)", padding: "4px 8px", borderRadius: "6px", fontWeight: "bold" }}>
                Đúng
              </span>
            ) : chosen ? (
              <span className="review-badge-wrong" style={{ marginLeft: "10px", fontSize: "0.85rem", backgroundColor: "var(--color-wrong-light)", color: "var(--color-wrong)", padding: "4px 8px", borderRadius: "6px", fontWeight: "bold" }}>
                Sai (Đáp án: {correctAns})
              </span>
            ) : (
              <span className="review-badge-skipped" style={{ marginLeft: "10px", fontSize: "0.85rem", backgroundColor: "#f1f5f9", color: "#64748b", padding: "4px 8px", borderRadius: "6px", fontWeight: "bold" }}>
                Chưa làm (Đáp án: {correctAns})
              </span>
            )}
          </div>
          
          {isPhoto && getPassageImage(qNum) && (
            <div style={{ textAlign: "center", marginBottom: "15px", border: "1px solid var(--color-border)", borderRadius: "8px", overflow: "hidden", maxWidth: "600px" }}>
              <img
                src={getPassageImage(qNum)}
                alt={`Part 1 Photo Q${qNum}`}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          )}
          
          <div className="options-container" style={{ flexDirection: "row", flexWrap: "wrap", gap: "15px" }}>
            {Object.keys(qInfo.options).map((key) => {
              const isCorrect = key === correctAns;
              const isChosen = key === chosen;
              
              let cardClass = "";
              if (isCorrect) cardClass = "correct";
              else if (isChosen) cardClass = "wrong";
              
              return (
                <div
                  key={key}
                  className={`modal-option-card ${cardClass}`}
                  style={{ flex: "1 1 200px", minWidth: "150px", pointerEvents: "none" }}
                >
                  <div className="circle">
                    {isCorrect ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: "12px", height: "12px", stroke: "white", strokeWidth: "3" }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : isChosen ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: "12px", height: "12px", stroke: "white", strokeWidth: "3" }}>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    ) : (
                      <span></span>
                    )}
                  </div>
                  <span className="option-letter">({key})</span>
                  <span className="option-text">{qInfo.options[key]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderGroupedReviewQuestions = (startNum, endNum, isPart6) => {
    const renderedGroups = [];
    let q = startNum;
    
    while (q <= endNum) {
      const group = getQuestionGroup(q);
      const firstQ = group[0];
      const lastQ = group[group.length - 1];
      const hasGraphic = getPassageImage(firstQ) !== null;
      
      renderedGroups.push(
        <div key={firstQ} style={{ border: "1px solid var(--color-border)", borderRadius: "16px", padding: "25px", backgroundColor: "#ffffff", marginBottom: "35px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", gap: "30px", flexDirection: "column" }}>
            {hasGraphic && (
              <div style={{ textAlign: "center", border: "1px solid var(--color-border)", borderRadius: "12px", overflow: "hidden", backgroundColor: "#fafafa", padding: "15px", maxWidth: "800px", margin: "0 auto" }}>
                <img
                  src={getPassageImage(firstQ)}
                  alt="Review Passage Reference"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            )}
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.95rem", fontWeight: "bold", borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>
                NHÓM CÂU HỎI {firstQ} - {lastQ}
              </div>
              
              {group.map((qNum) => {
                const qInfo = questionsData[qNum.toString()];
                const correctAns = qInfo.correct_answer;
                const chosen = userAnswers[qNum];
                
                return (
                  <div
                    key={qNum}
                    id={`review-q-${qNum}`}
                    className={`listening-question-item ${chosen === correctAns ? 'review-correct' : chosen ? 'review-wrong' : 'review-skipped'}`}
                    style={{ margin: 0, boxShadow: "none", border: "1px solid var(--color-border)", borderLeftWidth: "5px" }}
                  >
                    <div className="question-title" style={{ fontSize: "1.05rem", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
                      <span>
                        <span style={{ color: "var(--color-primary)", fontWeight: "bold", marginRight: "8px" }}>
                          Câu {qNum}:
                        </span>
                        {qInfo.question_text || "Chọn đáp án thích hợp:"}
                      </span>
                      
                      {chosen === correctAns ? (
                        <span className="review-badge-correct" style={{ fontSize: "0.8rem", backgroundColor: "var(--color-correct-light)", color: "var(--color-correct)", padding: "3px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                          Đúng
                        </span>
                      ) : chosen ? (
                        <span className="review-badge-wrong" style={{ fontSize: "0.8rem", backgroundColor: "var(--color-wrong-light)", color: "var(--color-wrong)", padding: "3px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                          Sai (Đáp án: {correctAns})
                        </span>
                      ) : (
                        <span className="review-badge-skipped" style={{ fontSize: "0.8rem", backgroundColor: "#f1f5f9", color: "#64748b", padding: "3px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                          Chưa làm (Đáp án: {correctAns})
                        </span>
                      )}
                    </div>
                    
                    <div className="options-container" style={{ flexDirection: "row", flexWrap: "wrap", gap: "10px" }}>
                      {Object.keys(qInfo.options).map((key) => {
                        const isCorrect = key === correctAns;
                        const isChosen = key === chosen;
                        
                        let cardClass = "";
                        if (isCorrect) cardClass = "correct";
                        else if (isChosen) cardClass = "wrong";
                        
                        return (
                          <div
                            key={key}
                            className={`option-card modal-option-card ${cardClass}`}
                            style={{ flex: "1 1 200px", minWidth: "150px", padding: "10px 15px", pointerEvents: "none" }}
                          >
                            <div className="circle">
                              {isCorrect ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: "12px", height: "12px", stroke: "white", strokeWidth: "3" }}>
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : isChosen ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: "12px", height: "12px", stroke: "white", strokeWidth: "3" }}>
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              ) : (
                                <span></span>
                              )}
                            </div>
                            <span className="option-letter">({key})</span>
                            <span className="option-text" style={{ fontSize: "0.9rem" }}>{qInfo.options[key]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
      
      q = lastQ + 1;
    }
    
    return renderedGroups;
  };
  
  return (
    <>
      {/* Hidden background continuous audio */}
      <audio ref={audioRef} src="/audio.mp3" loop={false} />
      
      {/* 1. Welcome Screen */}
      {screen === "welcome" && (
        <div className="welcome-container">
          <div className="welcome-card">
            <h1 className="welcome-logo">TOEIC <span>Mock Test</span></h1>
            <p>Trang web thi thử TOEIC Online chính thức - Đề 12</p>
            
            <div className="input-group">
              <label className="input-label" htmlFor="student-name">HỌ VÀ TÊN THÍ SINH</label>
              <input
                id="student-name"
                className="welcome-input"
                type="text"
                placeholder="Nhập tên của bạn để bắt đầu..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            
            <button
              className="welcome-btn"
              disabled={!userName.trim()}
              onClick={handleStartExam}
              style={{ marginBottom: "15px" }}
            >
              Bắt đầu bài thi
            </button>
            
            <button
              className="welcome-btn"
              style={{
                backgroundColor: "white",
                color: "var(--color-primary)",
                border: "2px solid var(--color-primary)",
                boxShadow: "none"
              }}
              onClick={handleFetchLeaderboard}
            >
              Bảng xếp hạng công khai
            </button>
          </div>
        </div>
      )}
      
      {/* 2. Leaderboard Screen */}
      {screen === "leaderboard" && (
        <div className="welcome-container" style={{ padding: "40px 20px" }}>
          <div className="welcome-card" style={{ maxWidth: "800px" }}>
            <h2 className="leaderboard-title">BẢNG XẾP HẠNG THI THỬ</h2>
            
            {isFetchingLeaderboard ? (
              <div style={{ padding: "40px", color: "var(--color-text-muted)" }}>Đang tải dữ liệu...</div>
            ) : (
              <div className="leaderboard-table-container">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>Hạng</th>
                      <th>Thí Sinh</th>
                      <th>Điểm Số</th>
                      <th>Nghe/Đọc</th>
                      <th>Thời Gian</th>
                      <th>Ngày Thi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: "30px", color: "var(--color-text-muted)" }}>
                          Chưa có lượt thi nào được ghi nhận.
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((record, index) => (
                        <tr key={index}>
                          <td>
                            <span className={`rank-badge ${index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other'}`}>
                              {index + 1}
                            </span>
                          </td>
                          <td>
                            <span className="leaderboard-name">{record.name}</span>
                          </td>
                          <td>
                            <span className="leaderboard-score">{record.score}</span>
                          </td>
                          <td style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                            {record.listeningCorrect * 5}/{record.readingCorrect * 5}
                          </td>
                          <td style={{ color: "var(--color-text-muted)" }}>
                            {formatTime(record.timeSpent)}
                          </td>
                          <td style={{ color: "var(--color-text-muted)" }}>
                            {record.date}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            <button
              className="welcome-btn"
              style={{
                backgroundColor: "white",
                color: "var(--color-primary)",
                border: "2px solid var(--color-primary)",
                boxShadow: "none",
                maxWidth: "200px",
                margin: "0 auto"
              }}
              onClick={() => setScreen("welcome")}
            >
              Quay lại
            </button>
          </div>
        </div>
      )}
      
      {/* 3. Exam Dashboard Screen */}
      {screen === "exam" && (
        <div className="exam-layout">
          {/* Header */}
          <div className="exam-header">
            <h1 className="header-logo">TOEIC <span>Online</span></h1>
            <div className="header-info">
              <span style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>
                Thí sinh: <span style={{ color: "var(--color-text-main)" }}>{userName}</span>
              </span>
              <div className={`timer-box ${isTimerPaused || showTransition ? 'timer-paused' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {formatTime(timer)}
              </div>
              <button className="submit-btn" onClick={handleSubmitTest}>
                Nộp bài
              </button>
            </div>
          </div>
          
          {/* Main workspace */}
          {currentQuestion <= 100 ? (
            <div className="listening-workspace">
              {/* Scrollable list of Q1 to Q100 */}
              <div className="listening-scroll-area">
                {/* Part 1 */}
                <div className="part-header">PART 1: PHOTO DESCRIPTION (Câu 1 - 6)</div>
                {Array.from({ length: 6 }, (_, i) => i + 1).map((qNum) => renderListeningQuestionCard(qNum))}
                
                {/* Part 2 */}
                <div className="part-header">PART 2: QUESTION-RESPONSE (Câu 7 - 31)</div>
                {Array.from({ length: 25 }, (_, i) => i + 7).map((qNum) => renderListeningQuestionCard(qNum))}
                
                {/* Part 3 */}
                <div className="part-header">PART 3: CONVERSATIONS (Câu 32 - 70)</div>
                {renderGroupedListeningQuestions(32, 70)}
                
                {/* Part 4 */}
                <div className="part-header">PART 4: TALKS (Câu 71 - 100)</div>
                {renderGroupedListeningQuestions(71, 100)}
                
                {/* Bottom action button */}
                <div className="listening-footer-action">
                  <button className="transition-btn" onClick={handleListeningDoneClick}>
                    Chuyển sang phần thi Reading
                  </button>
                </div>
              </div>
              
              {/* Sidebar navigation */}
              {renderSidebarNavigation()}
            </div>
          ) : (
            <div className="listening-workspace">
              {/* Scrollable list of Q101 to Q200 */}
              <div className="listening-scroll-area">
                {/* Part 5 */}
                <div className="part-header">PART 5: INCOMPLETE SENTENCES (Câu 101 - 130)</div>
                {Array.from({ length: 30 }, (_, i) => i + 101).map((qNum) => renderReadingQuestionCard(qNum))}
                
                {/* Part 6 */}
                <div className="part-header">PART 6: TEXT COMPLETION (Câu 131 - 146)</div>
                {renderGroupedReadingQuestions(131, 146, true)}
                
                {/* Part 7 */}
                <div className="part-header">PART 7: READING COMPREHENSION (Câu 147 - 200)</div>
                {renderGroupedReadingQuestions(147, 200, false)}
                
                {/* Bottom action button */}
                <div className="listening-footer-action" style={{ display: "flex", justifyContent: "center", gap: "20px", margin: "40px 0" }}>
                  <button className="submit-btn" style={{ padding: "15px 40px", fontSize: "1.1rem", height: "auto", borderRadius: "12px", width: "auto" }} onClick={handleSubmitTest}>
                    Nộp bài thi
                  </button>
                </div>
              </div>
              
              {/* Sidebar navigation */}
              {renderSidebarNavigation()}
            </div>
          )}
          
          {/* Transition overlay from Listening to Reading */}
          {showTransition && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ textAlign: "center", maxWidth: "500px" }}>
                <h3 className="modal-title" style={{ borderColor: "var(--color-secondary)" }}>
                  Hoàn Thành Listening!
                </h3>
                <p style={{ color: "var(--color-text-main)", marginBottom: "20px", fontSize: "1.05rem" }}>
                  Bạn đã kết thúc 100 câu phần Listening.
                  Thời gian làm bài đang được tạm dừng. Hãy chuẩn bị sẵn sàng cho phần Reading.
                </p>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "30px", fontSize: "0.9rem" }}>
                  Bấm nút bên dưới để tiếp tục làm Part 5 (Reading) và tính thời gian tiếp tục.
                </p>
                <button
                  className="welcome-btn"
                  onClick={handleStartReading}
                  style={{ width: "auto", padding: "12px 30px" }}
                >
                  Bắt đầu làm bài Reading
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 4. Results Screen */}
      {screen === "result" && stats && (
        <div className="results-container">
          <div className="results-header">
            <p className="score-title">THI THỬ ONLINE TOEIC - ĐỀ 12</p>
            <h1>Chúc mừng {userName} đã hoàn thành xong bài thi!</h1>
            <p>Dưới đây là kết quả bài thi thử của bạn.</p>
            
            <div className="results-score-display">
              <div className="score-title">YOUR SCORE</div>
              <div className="score-num">{stats.scaleScore.total}/990</div>
            </div>
            <div style={{ marginTop: "10px", fontWeight: 500 }}>
              {getFeedbackText(stats.scaleScore.total)}
            </div>
          </div>
          
          {/* Quick stats cards */}
          <div className="results-stats-grid">
            <div className="stat-card correct">
              <div className="stat-card-title">Trả lời đúng</div>
              <div className="stat-card-value">{stats.correct} Câu hỏi</div>
            </div>
            <div className="stat-card wrong">
              <div className="stat-card-title">Trả lời sai</div>
              <div className="stat-card-value">{stats.wrong} Câu hỏi</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Bỏ qua</div>
              <div className="stat-card-value">{stats.skipped} Câu hỏi</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Thời gian làm bài</div>
              <div className="stat-card-value">{formatTime(timeSpentOnSubmit)}</div>
            </div>
          </div>
          
          {/* Split Scores section */}
          <div className="scores-split-grid">
            <div className="split-card">
              <h3>
                <span>Listening</span>
                <span>{stats.scaleScore.listening}/495</span>
              </h3>
              <p>
                Số câu nghe trả lời chính xác: <strong>{stats.listeningCorrect}/100</strong> câu.
                Bạn có khả năng nghe hiểu khá tốt các ngữ cảnh giao tiếp trong môi trường công sở thông thường.
              </p>
            </div>
            
            <div className="split-card">
              <h3>
                <span>Reading</span>
                <span>{stats.scaleScore.reading}/495</span>
              </h3>
              <p>
                Số câu đọc trả lời chính xác: <strong>{stats.readingCorrect}/100</strong> câu.
                Bạn có thể hiểu hầu hết các văn bản thông báo, email và bài đọc trung bình trong môi trường làm việc.
              </p>
            </div>
          </div>
          
          {/* Review Workspace */}
          <h2 className="analysis-title" style={{ marginTop: "50px", marginBottom: "20px" }}>Xem lại đáp án chi tiết</h2>
          <div className="review-workspace" style={{ display: "flex", gap: "20px", overflow: "hidden", height: "80vh", border: "1px solid var(--color-border)", borderRadius: "16px", backgroundColor: "#f8fafc" }}>
            
            {/* Scrollable list of Q1 to Q200 */}
            <div className="review-scroll-area" style={{ flex: "1", overflowY: "auto", padding: "30px 40px" }}>
              {/* Part 1 */}
              <div className="part-header" id="review-part-1">PART 1: PHOTO DESCRIPTION (Câu 1 - 6)</div>
              {Array.from({ length: 6 }, (_, i) => i + 1).map((qNum) => renderReviewQuestionCard(qNum))}
              
              {/* Part 2 */}
              <div className="part-header" id="review-part-2">PART 2: QUESTION-RESPONSE (Câu 7 - 31)</div>
              {Array.from({ length: 25 }, (_, i) => i + 7).map((qNum) => renderReviewQuestionCard(qNum))}
              
              {/* Part 3 */}
              <div className="part-header" id="review-part-3">PART 3: CONVERSATIONS (Câu 32 - 70)</div>
              {renderGroupedReviewQuestions(32, 70, false)}
              
              {/* Part 4 */}
              <div className="part-header" id="review-part-4">PART 4: TALKS (Câu 71 - 100)</div>
              {renderGroupedReviewQuestions(71, 100, false)}
              
              {/* Part 5 */}
              <div className="part-header" id="review-part-5">PART 5: INCOMPLETE SENTENCES (Câu 101 - 130)</div>
              {Array.from({ length: 30 }, (_, i) => i + 101).map((qNum) => renderReviewQuestionCard(qNum))}
              
              {/* Part 6 */}
              <div className="part-header" id="review-part-6">PART 6: TEXT COMPLETION (Câu 131 - 146)</div>
              {renderGroupedReviewQuestions(131, 146, true)}
              
              {/* Part 7 */}
              <div className="part-header" id="review-part-7">PART 7: READING COMPREHENSION (Câu 147 - 200)</div>
              {renderGroupedReviewQuestions(147, 200, false)}
            </div>
            
            {/* Sidebar Navigation */}
            <div className="review-sidebar" style={{ width: "250px", borderLeft: "1px solid var(--color-border)", backgroundColor: "#ffffff", overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ fontWeight: "bold", fontSize: "1rem", color: "var(--color-text-main)", borderBottom: "1px solid var(--color-border)", paddingBottom: "10px" }}>
                Danh sách câu hỏi
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                {[1, 2, 3, 4, 5, 6, 7].map((part) => (
                  <div key={part}>
                    <div className="part-section-title" style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "8px", fontWeight: "bold" }}>
                      Part {part}
                    </div>
                    <div className="grid-buttons" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                      {Array.from({ length: 200 }, (_, i) => i + 1)
                        .filter((num) => getPartFromQuestion(num) === part)
                        .map((num) => {
                          const chosen = userAnswers[num];
                          const correctAns = questionsData[num.toString()].correct_answer;
                          const isCorrect = chosen === correctAns;
                          
                          let btnClass = "skipped";
                          if (chosen) {
                            btnClass = isCorrect ? "correct" : "wrong";
                          }
                          
                          return (
                            <button
                              key={num}
                              className={`grid-btn status-box ${btnClass}`}
                              style={{ width: "100%", height: "30px", fontSize: "0.8rem", borderRadius: "6px" }}
                              onClick={() => {
                                const el = document.getElementById(`review-q-${num}`);
                                if (el) {
                                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                                }
                              }}
                            >
                              {num}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div style={{ marginTop: "40px", display: "flex", gap: "20px", justifyContent: "center" }}>
            <button
              className="welcome-btn"
              style={{ maxWidth: "250px" }}
              onClick={() => handleFetchLeaderboard()}
            >
              Xem bảng xếp hạng
            </button>
            <button
              className="welcome-btn"
              style={{
                backgroundColor: "white",
                color: "var(--color-primary)",
                border: "2px solid var(--color-primary)",
                boxShadow: "none",
                maxWidth: "250px"
              }}
              onClick={() => {
                setScreen("welcome");
              }}
            >
              Làm bài thi mới
            </button>
          </div>
        </div>
      )}
      
      {/* Modal removed in favor of inline scrollable review */}
    </>
  );
}
