"""
translator.py
-------------
Translator class that converts a predicted English word into its
multilingual SLSL dictionary entry (EN / Sinhala / Tamil).

Fallback strategy:
  - If word is in the dictionary → return full translation.
  - If not found → return English-only result with a flag.
  - Single-letter inputs → return only the English letter.
"""

from __future__ import annotations

from translation.dictionary import SLSL_DICT, get_translation


class Translator:
    """
    High-level translation interface used by the inference pipeline
    and the FastAPI endpoint.

    Example:
        translator = Translator()
        result = translator.translate("water")
        # {
        #   "word": "water",
        #   "en": "Water",
        #   "si": "වතුර",
        #   "ta": "தண்ணீர்",
        #   "found": True
        # }
    """

    def translate(self, word: str) -> dict[str, str | bool]:
        """
        Translate a predicted word into EN / SI / TA.

        Args:
            word: The predicted English word (one or more letters).

        Returns:
            dict with keys: word, en, si, ta, found
        """
        word_clean = word.strip().lower()

        # Single character — treat as alphabet letter, no Sinhala/Tamil mapping
        if len(word_clean) == 1:
            return {
                "word":  word_clean.upper(),
                "en":    word_clean.upper(),
                "si":    word_clean.upper(),
                "ta":    word_clean.upper(),
                "found": False,
            }

        entry = get_translation(word_clean)

        if entry:
            return {
                "word":  word_clean,
                "en":    entry["en"],
                "si":    entry["si"],
                "ta":    entry["ta"],
                "found": True,
            }

        # Fallback — word not in dictionary
        return {
            "word":  word_clean,
            "en":    word_clean.title(),   # Best-effort capitalised English
            "si":    word_clean.title(),   # Untranslated
            "ta":    word_clean.title(),
            "found": False,
        }

    def translate_letter(self, letter: str) -> dict[str, str]:
        """
        Return a translation result for a single predicted letter.

        Args:
            letter: Single uppercase letter, e.g. "A"
        """
        return self.translate(letter.strip())

    @staticmethod
    def available_words() -> list[str]:
        """Return all words that have full translations available."""
        return sorted(SLSL_DICT.keys())


if __name__ == "__main__":
    t = Translator()
    for word in ["water", "hello", "hospital", "xyz", "A"]:
        print(f"  {word!r:12} → {t.translate(word)}")
