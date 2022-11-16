import "./style.css";
import books from "./books";
import { getNewVerse, parseVerse, type Verse } from "./verse";

const displayHeadingEl = document.getElementById("display-heading");
const displayParEl = document.getElementById("display-par");

const inputEl = document.getElementById("input") as HTMLInputElement;
// inputEl.addEventListener('input', handleInput);
inputEl.addEventListener("keyup", handleInput);

const prevButton = document.getElementById("prev-button");
prevButton.addEventListener("click", setPrevVerse);

const nextButton = document.getElementById("next-button");
nextButton.addEventListener("click", setNextVerse);

let sessionVerses: Verse[] = [];
let sessionResults = [];
let startTime = 0;
let endTime = 0;

function setVerse(verse: Verse) {
  refreshElements();
  displayHeadingEl.innerText = `${verse.book_name} ${verse.chapter}:${verse.verse}`;
  // displayParEl.innerText = verse.text;

  stringToSpanArray(verse.text).forEach((span) => {
    displayParEl.appendChild(span);
  });
}

function refreshElements() {
  displayParEl.innerHTML = "";
  inputEl.value = "";
}

async function setNextVerse() {
  const currentVerse = sessionVerses[sessionVerses.length - 1];
  let currentBook = currentVerse.book_name;
  let currentChapter = currentVerse.chapter;
  let currentVerseNumber = currentVerse.verse;

  let verse = undefined;
  try {
    verse = await getNewVerse(
      currentBook,
      currentChapter,
      currentVerseNumber + 1
    );
  } catch (e) {
    console.log("no verse found, trying next chapter");
    try {
      verse = await getNewVerse(currentBook, currentChapter + 1, 1);
    } catch (e) {
      console.log("no verse found, trying next book");
      try {
        const bookIndex = books.indexOf(currentBook) + 1;
        const book = books[bookIndex];
        verse = await getNewVerse(book, 1, 1);
      } catch (e) {
        console.log("no verse found");
      }
    }
  }
  sessionVerses.push(verse);
  setVerse(sessionVerses[sessionVerses.length - 1]);
}

// Terrible implementation !!!
async function setPrevVerse() {
  if (sessionVerses.length > 1) {
    sessionVerses.pop();
    setVerse(sessionVerses[sessionVerses.length - 1]);
  } else {
    alert("No previous verse in the current session.");
  }
}

function stringToSpanArray(input: String): HTMLSpanElement[] {
  let spans = [];
  let count = 0;
  for (let c of input) {
    let newEl = document.createElement("span");
    newEl.setAttribute("id", `c-${count}`);
    newEl.innerText = c;
    spans.push(newEl);
    count++;
  }
  return spans;
}

function handleInput() {
  const text = inputEl.value;
  const currentVerseText = parseVerse(sessionVerses[sessionVerses.length - 1].text);

  for (let i = 0; i < currentVerseText.length; i++) {
    const spanEl = document.getElementById(`c-${i}`);
    if (i < text.length && text.length <= currentVerseText.length) {
      if (text[i] === currentVerseText[i]) {
        spanEl.setAttribute("class", "correct");
      } else {
        spanEl.setAttribute("class", "wrong");
      }
    } else {
      spanEl.setAttribute("class", "");
    }
  }

  if (text.length === 1) {
    // start timer
    console.log("START");
    startTime = new Date().getTime();
    console.log(startTime);
  }
  if (text == currentVerseText) verseCompleted(currentVerseText)
}

function verseCompleted(currentVerseText){
  // stop timer
  console.log("FINISH");
  endTime = new Date().getTime();
  console.log(endTime);

  // const totalTime = (endTime - startTime) / 1000;
  // sessionResults.push(` ${totalTime} Seconds`);
  // document.getElementById('results-prev').innerText = `${sessionResults}`;
  const words = currentVerseText.split(/\s+/).length;
  const minutes = (endTime - startTime) / 1000 / 60;
  const wpm = Math.round(words / minutes);
  const res = ` ${wpm} wpm`;
  document.getElementById("results-latest").innerText = ` ${wpm} wpm`;
  document.getElementById("results-prev").innerText = `${sessionResults}`;
  sessionResults.push(res);
}

async function main() {
  const initialVerse = await getNewVerse("Genesis", 1, 1);
  sessionVerses.push(initialVerse);
  setVerse(initialVerse);
}

main();
