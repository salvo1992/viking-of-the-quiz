const API_URL = "https://opentdb.com/api.php?amount=5&type=multiple";

let currentQuestionIndex = 0;
let questions = [];
let score = 0;
let timer;
let timeLeft = 15;

// Elementi DOM
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const timeEl = document.getElementById("time");
const resultContainer = document.getElementById("result-container");
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restart-btn");
const shareBtn = document.getElementById("share-btn");
const historyList = document.getElementById("history-list");

// Avvia il gioco
fetchQuestions();

function fetchQuestions() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      questions = data.results;
      currentQuestionIndex = 0;
      score = 0;
      showQuestion();
    })
    .catch(err => {
      questionEl.textContent = "Errore nel caricamento delle domande.";
      console.error(err);
    });
}

function showQuestion() {
  resetState();
  const q = questions[currentQuestionIndex];
  questionEl.innerHTML = decodeHTML(q.question);
  const answers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);

  answers.forEach(answer => {
    const btn = document.createElement("button");
    btn.textContent = decodeHTML(answer);
    btn.onclick = () => checkAnswer(answer === q.correct_answer);
    answersEl.appendChild(btn);
  });

  startTimer();
}

function resetState() {
  clearInterval(timer);
  answersEl.innerHTML = "";
  timeLeft = 10;
  timeEl.textContent = timeLeft;
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft === 0) {
      clearInterval(timer);
      checkAnswer(false);
    }
  }, 1000);
}

function checkAnswer(correct) {
  clearInterval(timer);
  if (correct) score++;
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  document.getElementById("question-container").classList.add("hidden");
  resultContainer.classList.remove("hidden");
  scoreEl.innerHTML = `Hai totalizzato <strong>${score}</strong> su <strong>${questions.length}</strong> punti! 🏆`;

  saveScore(score);
  showHistory();
}

function saveScore(newScore) {
  const now = new Date();
  const scoreObj = {
    score: newScore,
    date: now.toLocaleString()
  };
  const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
  history.unshift(scoreObj);
  localStorage.setItem("quizHistory", JSON.stringify(history.slice(0, 5))); // Solo ultimi 5
}

function showHistory() {
  const history = JSON.parse(localStorage.getItem("quizHistory")) || [];
  historyList.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.date} - ${item.score} punti`;
    historyList.appendChild(li);
  });
}

restartBtn.onclick = () => {
  resultContainer.classList.add("hidden");
  document.getElementById("question-container").classList.remove("hidden");
  fetchQuestions();
};

shareBtn.onclick = () => {
  const message = `Ho totalizzato ${score}/${questions.length} nel quiz del Vikingo del Web! 🧠🔥 Provalo anche tu!`;
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
};

// Utility
function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
