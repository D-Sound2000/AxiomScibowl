from __future__ import annotations

import csv
import html.parser
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path

from pypdf import PdfReader


SOURCE_PAGE = "https://science.osti.gov/wdts/nsb/Regional-Competitions/Resources/HS-Sample-Questions"
SOURCE_ORIGIN = "https://science.osti.gov"
ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "data" / "scibowl_pdfs"
CSV_PATH = ROOT / "data" / "scibowl_questions.csv"
JSON_PATH = ROOT / "src" / "fixtures" / "scibowl_questions.json"

CATEGORY_MAP = {
    "BIOLOGY": "Biology",
    "CHEMISTRY": "Chemistry",
    "CHEM": "Chemistry",
    "EARTH SCIENCE": "Earth & Space",
    "EARTH AND SPACE": "Earth & Space",
    "EARTH & SPACE": "Earth & Space",
    "ASTRONOMY": "Earth & Space",
    "ENERGY": "Energy",
    "GENERAL SCIENCE": "Energy",
    "MATHEMATICS": "Math",
    "MATH": "Math",
    "PHYSICS": "Physics",
}

CATEGORY_ORDER = {
    "Biology": 0,
    "Earth & Space": 1,
    "Chemistry": 2,
    "Energy": 3,
    "Math": 4,
    "Physics": 5,
}

TYPE_ORDER = {"Tossup": 0, "Bonus": 1}
FORMAT_ORDER = {"Multiple Choice": 0, "Short Answer": 1}

STOPWORDS = {
    "what", "which", "when", "where", "this", "that", "these", "those", "with", "from",
    "into", "than", "then", "they", "their", "there", "about", "after", "before", "most",
    "least", "following", "answer", "accept", "read", "term", "name", "type", "called",
    "given", "find", "best", "common", "science", "bowl", "question", "bonus", "toss",
    "short", "multiple", "choice",
}


class LinkParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "a":
            return
        href = dict(attrs).get("href")
        if href and re.match(r"^/-/media/wdts/nsb/pdf/HS-Sample-Questions/.+\.pdf$", href, re.I):
            self.links.append(urllib.parse.urljoin(SOURCE_ORIGIN, href))


@dataclass
class Question:
    id: str
    category: str
    type: str
    format: str
    question: str
    answer: str
    keywords: list[str]
    year: str
    tournament: str
    source_set: str
    source_round: str
    source_url: str
    question_number: str


def fetch_links() -> list[str]:
    with urllib.request.urlopen(SOURCE_PAGE, timeout=30) as response:
        page = response.read().decode("utf-8", errors="ignore")
    parser = LinkParser()
    parser.feed(page)
    return sorted(set(parser.links), key=natural_key)


def natural_key(value: str) -> list[int | str]:
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", value)]


def filename_for(url: str) -> Path:
    parsed = urllib.parse.urlparse(url)
    parts = [urllib.parse.unquote(part) for part in parsed.path.split("/") if part]
    set_name = next((part for part in parts if part.lower().startswith("sample-set-")), "unknown-set")
    return PDF_DIR / set_name / parts[-1]


def download(url: str) -> Path:
    path = filename_for(url)
    if path.exists() and path.stat().st_size > 0:
        return path
    path.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=45) as response:
        path.write_bytes(response.read())
    time.sleep(0.05)
    return path


def extract_text(path: Path) -> str:
    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def normalize_text(text: str) -> str:
    text = text.replace("\u2013", "-").replace("\u2014", "-")
    text = text.replace("\u00a0", " ")
    text = re.sub(r"\r", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"High School Round \d+\s+Page \d+", "\n", text, flags=re.I)
    return text.strip()


def clean_inline(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([,.;:)])", r"\1", text)
    text = re.sub(r"([(])\s+", r"\1", text)
    return text.strip(" -\n\t")


def normalize_category(raw: str) -> str | None:
    raw = clean_inline(raw).upper().replace("&", "AND")
    raw = raw.replace("EARTH AND SPACE", "EARTH AND SPACE")
    raw = re.sub(r"[^A-Z ]", "", raw)
    raw = re.sub(r"\s+", " ", raw).strip()
    return CATEGORY_MAP.get(raw)


def normalize_format(raw: str) -> str:
    raw = clean_inline(raw).lower()
    if "multiple" in raw:
        return "Multiple Choice"
    return "Short Answer"


def packet_meta(url: str) -> tuple[str, str, str]:
    path = urllib.parse.unquote(urllib.parse.urlparse(url).path)
    set_match = re.search(r"Sample-Set-(\d+)", path, re.I)
    source_set = f"Sample Set {set_match.group(1)}" if set_match else "Sample Set"
    filename = Path(path).stem
    year_match = re.search(r"(20\d{2}|19\d{2})", filename)
    year = year_match.group(1) if year_match else ""
    round_match = re.search(r"(?:round|rd|hs_|hs-|reg_)?[-_ ]?(\d{1,2})[a-c]?$", filename, re.I)
    source_round = f"Round {round_match.group(1)}" if round_match else filename
    return source_set, source_round, year


def parse_packet(text: str, url: str, start_index: int) -> list[Question]:
    source_set, source_round, year = packet_meta(url)
    normalized = normalize_text(text)
    pattern = re.compile(
        r"(?P<type>TOSS[- ]?UP|BONUS)\s+"
        r"(?P<number>\d{1,3})[\).]\s*"
        r"(?P<category>[A-Za-z &]+?)\s+[-\u2014]?\s*"
        r"(?P<format>Multiple Choice|Short Answer)\s+"
        r"(?P<body>.*?)(?=\s+(?:TOSS[- ]?UP|BONUS)\s+\d{1,3}[\).]|\Z)",
        re.I | re.S,
    )

    questions: list[Question] = []
    next_index = start_index
    for match in pattern.finditer(normalized):
        category = normalize_category(match.group("category"))
        if not category:
            continue
        body = match.group("body")
        answer_match = re.search(r"\bANSWER\s*:\s*(?P<answer>.*)", body, re.I | re.S)
        if not answer_match:
            continue
        question_text = body[: answer_match.start()]
        answer_text = answer_match.group("answer")
        answer_text = re.split(r"\n\s*(?:TOSS[- ]?UP|BONUS)\s*$", answer_text, flags=re.I)[0]

        question = clean_inline(question_text)
        answer = clean_inline(answer_text)
        if len(question) < 8 or len(answer) < 1:
            continue

        q_type = "Tossup" if match.group("type").upper().startswith("TOSS") else "Bonus"
        q_format = normalize_format(match.group("format"))
        qid = f"DOE-HS-{next_index:05d}"
        next_index += 1
        questions.append(
            Question(
                id=qid,
                category=category,
                type=q_type,
                format=q_format,
                question=question,
                answer=answer,
                keywords=keywords_for(question, answer),
                year=year,
                tournament="DOE HS Sample Questions",
                source_set=source_set,
                source_round=source_round,
                source_url=url,
                question_number=match.group("number"),
            )
        )
    return questions


def keywords_for(question: str, answer: str) -> list[str]:
    source = f"{answer} {question}"
    words = []
    for token in re.findall(r"[A-Za-z][A-Za-z0-9'-]{3,}", source):
        lower = token.lower().strip("'")
        if lower not in STOPWORDS and lower not in words:
            words.append(lower)
        if len(words) == 6:
            break
    return words


def sorted_questions(questions: list[Question]) -> list[Question]:
    return sorted(
        questions,
        key=lambda q: (
            CATEGORY_ORDER.get(q.category, 99),
            TYPE_ORDER.get(q.type, 99),
            FORMAT_ORDER.get(q.format, 99),
            natural_key(q.source_set),
            natural_key(q.source_round),
            int(q.question_number) if q.question_number.isdigit() else 0,
        ),
    )


def write_outputs(questions: list[Question]) -> None:
    CSV_PATH.parent.mkdir(parents=True, exist_ok=True)
    fields = [
        "id", "category", "type", "format", "question", "answer", "keywords",
        "year", "tournament", "source_set", "source_round", "source_url", "question_number",
    ]
    with CSV_PATH.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for q in questions:
            row = q.__dict__.copy()
            row["keywords"] = "|".join(q.keywords)
            writer.writerow(row)

    JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "questions": [
            {
                **q.__dict__,
                "year": q.year or q.source_set.replace("Sample Set ", "Set "),
            }
            for q in questions
        ]
    }
    JSON_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> int:
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    links = fetch_links()
    print(f"Found {len(links)} PDF links")
    all_questions: list[Question] = []
    for i, url in enumerate(links, start=1):
        try:
            path = download(url)
            text = extract_text(path)
            parsed = parse_packet(text, url, len(all_questions) + 1)
            all_questions.extend(parsed)
            print(f"[{i:03d}/{len(links)}] {path.name}: {len(parsed)} questions")
        except Exception as exc:
            print(f"[{i:03d}/{len(links)}] ERROR {url}: {exc}", file=sys.stderr)
    all_questions = sorted_questions(all_questions)
    # Re-number after sorting for stable topic/type ordering.
    for index, q in enumerate(all_questions, start=1):
        q.id = f"DOE-HS-{index:05d}"
    write_outputs(all_questions)
    print(f"Wrote {len(all_questions)} questions")
    print(f"CSV: {CSV_PATH}")
    print(f"JSON: {JSON_PATH}")
    return 0 if len(all_questions) >= 2000 else 1


if __name__ == "__main__":
    raise SystemExit(main())
