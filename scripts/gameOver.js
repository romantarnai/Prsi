const human_score = document.getElementById("human");
const ai_score = document.getElementById("ai");
const who = document.getElementById("who");

const score = localStorage.getItem("score").split(":");
const whoWon = localStorage.getItem("whoWon");

human_score.innerText = score[0];
ai_score.innerText = score[1];

who.innerText = `${whoWon} has won`.toUpperCase();
who.style.letterSpacing = ".075em";
who.style.wordSpacing = ".3em";
