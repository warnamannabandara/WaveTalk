"""
dictionary.py
-------------
Multilingual SLSL word dictionary.

Maps English words (keyed in lowercase) to their translations:
  - en: English
  - si: Sinhala (සිංහල)
  - ta: Tamil   (தமிழ்)

This represents a curated starter set of common Sri Lankan Sign Language
vocabulary. Expand this dictionary as you collect more gesture data.
"""

from __future__ import annotations

# ── Core SLSL Multilingual Dictionary ─────────────────────────
SLSL_DICT: dict[str, dict[str, str]] = {
    # Greetings & Basics
    "hello": {
        "en": "Hello",
        "si": "හෙලෝ",
        "ta": "வணக்கம்",
    },
    "hi": {
        "en": "Hi",
        "si": "හායි",
        "ta": "ஹாய்",
    },
    "bye": {
        "en": "Goodbye",
        "si": "සමු ගනිමු",
        "ta": "விடை",
    },
    "thanks": {
        "en": "Thank you",
        "si": "ස්තූතියි",
        "ta": "நன்றி",
    },
    "sorry": {
        "en": "Sorry",
        "si": "සමාවෙන්න",
        "ta": "மன்னிக்கவும்",
    },
    "yes": {
        "en": "Yes",
        "si": "ඔව්",
        "ta": "ஆம்",
    },
    "no": {
        "en": "No",
        "si": "නැහැ",
        "ta": "இல்லை",
    },
    "please": {
        "en": "Please",
        "si": "කරුණාකර",
        "ta": "தயவுசெய்து",
    },
    "help": {
        "en": "Help",
        "si": "උදව්",
        "ta": "உதவி",
    },
    "okay": {
        "en": "Okay",
        "si": "හරි",
        "ta": "சரி",
    },

    # Basic needs
    "water": {
        "en": "Water",
        "si": "වතුර",
        "ta": "தண்ணீர்",
    },
    "food": {
        "en": "Food",
        "si": "ආහාර",
        "ta": "உணவு",
    },
    "eat": {
        "en": "Eat",
        "si": "කෑම කන්න",
        "ta": "சாப்பிடு",
    },
    "drink": {
        "en": "Drink",
        "si": "බොන්න",
        "ta": "குடி",
    },
    "sleep": {
        "en": "Sleep",
        "si": "නිදාගන්න",
        "ta": "தூக்கம்",
    },
    "medicine": {
        "en": "Medicine",
        "si": "ඖෂධ",
        "ta": "மருந்து",
    },
    "hospital": {
        "en": "Hospital",
        "si": "රෝහල",
        "ta": "மருத்துவமனை",
    },
    "toilet": {
        "en": "Toilet",
        "si": "වැසිකිළිය",
        "ta": "கழிவறை",
    },

    # Family
    "mother": {
        "en": "Mother",
        "si": "අම්මා",
        "ta": "அம்மா",
    },
    "father": {
        "en": "Father",
        "si": "අප්පා",
        "ta": "அப்பா",
    },
    "brother": {
        "en": "Brother",
        "si": "අයියා",
        "ta": "அண்ணன்",
    },
    "sister": {
        "en": "Sister",
        "si": "නංගී",
        "ta": "அக்கா",
    },
    "friend": {
        "en": "Friend",
        "si": "යාළුවා",
        "ta": "நண்பன்",
    },

    # Places & directions
    "home": {
        "en": "Home",
        "si": "ගෙදර",
        "ta": "வீடு",
    },
    "school": {
        "en": "School",
        "si": "පාසල",
        "ta": "பள்ளி",
    },
    "work": {
        "en": "Work",
        "si": "වැඩ",
        "ta": "வேலை",
    },
    "police": {
        "en": "Police",
        "si": "පොලිසිය",
        "ta": "காவல்துறை",
    },

    # Time
    "today": {
        "en": "Today",
        "si": "අද",
        "ta": "இன்று",
    },
    "tomorrow": {
        "en": "Tomorrow",
        "si": "හෙට",
        "ta": "நாளை",
    },
    "morning": {
        "en": "Morning",
        "si": "උදෑසන",
        "ta": "காலை",
    },

    # Emotions
    "happy": {
        "en": "Happy",
        "si": "සතුටු",
        "ta": "மகிழ்ச்சி",
    },
    "sad": {
        "en": "Sad",
        "si": "දුකට",
        "ta": "சோகம்",
    },
    "pain": {
        "en": "Pain",
        "si": "වේදනාව",
        "ta": "வலி",
    },

    # Numbers (words)
    "one":   {"en": "One",   "si": "එක",    "ta": "ஒன்று"},
    "two":   {"en": "Two",   "si": "දෙක",    "ta": "இரண்டு"},
    "three": {"en": "Three", "si": "තුන",    "ta": "மூன்று"},
    "four":  {"en": "Four",  "si": "හතර",   "ta": "நான்கு"},
    "five":  {"en": "Five",  "si": "පහ",     "ta": "ஐந்து"},
}


# ── Convenience accessors ─────────────────────────────────────

def get_translation(word: str) -> dict[str, str] | None:
    """
    Look up a word in the SLSL dictionary.

    Args:
        word: English word (case-insensitive).

    Returns:
        dict with keys 'en', 'si', 'ta', or None if not found.
    """
    return SLSL_DICT.get(word.lower().strip())


def list_all_words() -> list[str]:
    """Return all known English words in the dictionary."""
    return sorted(SLSL_DICT.keys())


if __name__ == "__main__":
    # Quick self-test
    tests = ["water", "hello", "FOOD", "xyz"]
    for t in tests:
        result = get_translation(t)
        print(f"  {t!r:12} → {result}")
    print(f"\nTotal entries: {len(SLSL_DICT)}")
