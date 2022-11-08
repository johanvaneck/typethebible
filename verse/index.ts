export interface Verse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface VerseApiResponse {
  reference: string;
  verses: Verse[];
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note: string;
}

export async function getNewVerse(
  bookName: string,
  chapterNumber: number,
  verseNumber: number,
  apiUrl: string = "https://bible-api.com/"
) {
  const bookNameClean = bookName.replace(/\s/g, "");
  const query = `${apiUrl}${bookNameClean}${chapterNumber}:${verseNumber}`;
  const response = await fetch(query);
  const data: VerseApiResponse = await response.json();
  const verse: Verse = data.verses[0];
  return verse;
}