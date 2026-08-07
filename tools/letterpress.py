#!/usr/bin/env python3
"""letterpress — turn a markdown letter into email-ready HTML.

Usage:
    python3 tools/letterpress.py private/letters/drafts/my-letter.md

Writes my-letter.html next to the markdown file and opens it in your
browser. From there: Select All, Copy, and paste into an email, a blog
editor, or anywhere that accepts rich text. Every style is written
directly onto each element (no stylesheet), because that is the only
kind of styling email clients reliably keep.

This is a deliberately small program. It understands just enough
markdown for a letter — headings, paragraphs, quotes, lists, links,
emphasis, code — and sets it in book-like type. Reading it top to
bottom is encouraged.
"""

import html
import re
import sys
import webbrowser
from pathlib import Path

# ---------------------------------------------------------------- type

SERIF = "Georgia, 'Iowan Old Style', 'Times New Roman', serif"
MONO = "Menlo, Consolas, 'Courier New', monospace"

STYLE = {
    "page": "margin:0; padding:3em 1.25em; background:#fbfaf7;",
    "letter": (
        f"max-width:33em; margin:0 auto; font-family:{SERIF}; "
        "font-size:18px; line-height:1.75; color:#26241f;"
    ),
    "h1": "font-size:1.5em; font-weight:normal; line-height:1.35; margin:0 0 1.4em;",
    "h2": "font-size:1.15em; font-weight:bold; margin:1.8em 0 0.6em;",
    "h3": "font-size:1em; font-weight:bold; font-style:italic; margin:1.6em 0 0.5em;",
    "p": "margin:0 0 1.1em;",
    "blockquote": (
        "margin:1.3em 0 1.3em 1.5em; padding-left:1em; "
        "border-left:2px solid #cfc8ba; color:#57534a; font-style:italic;"
    ),
    "ul": "margin:0 0 1.1em; padding-left:1.4em;",
    "li": "margin:0 0 0.35em;",
    "code": (
        f"font-family:{MONO}; font-size:0.82em; "
        "background:#f0ede5; padding:0.1em 0.35em; border-radius:3px;"
    ),
    "pre": (
        f"font-family:{MONO}; font-size:0.82em; line-height:1.55; "
        "background:#f0ede5; padding:1em 1.2em; border-radius:6px; "
        "margin:0 0 1.1em; overflow-x:auto; white-space:pre;"
    ),
    "a": "color:#7a5c2e;",
    "divider": "text-align:center; margin:1.8em 0; color:#a89f8d; font-size:1.1em;",
}


def tag(name, content, style):
    return f'<{name} style="{STYLE[style]}">{content}</{name}>'


# ------------------------------------------------------- inline marks

def smarten(text):
    """Straight marks -> typographer's marks: quotes, dashes, ellipses."""
    text = text.replace("---", "—").replace("--", "—")
    text = text.replace("...", "…")
    # An opening quote follows the start of text or whitespace; anything
    # else (mid-word apostrophes, closing quotes) curls the other way.
    text = re.sub(r'(^|(?<=\s))"', "“", text)
    text = text.replace('"', "”")
    text = re.sub(r"(^|(?<=\s))'", "‘", text)
    text = text.replace("'", "’")
    return text


def inline(text):
    """Render one run of text: escape it, then apply the inline marks."""
    text = html.escape(text, quote=False)

    # Pull `code` spans out first so nothing below touches their insides.
    stash = []

    def keep(match):
        stash.append(tag("code", match.group(1), "code"))
        return f"\x00{len(stash) - 1}\x00"

    text = re.sub(r"`([^`]+)`", keep, text)

    # Links are stashed too: smarten() must never curl the quotes inside
    # a tag the press itself wrote, or the href stops being a URL.
    def keep_link(match):
        stash.append(
            f'<a style="{STYLE["a"]}" href="{match.group(2)}">{smarten(match.group(1))}</a>'
        )
        return f"\x00{len(stash) - 1}\x00"

    text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", keep_link, text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", text)
    text = smarten(text)

    for i, kept in enumerate(stash):
        text = text.replace(f"\x00{i}\x00", kept)
    return text


# ------------------------------------------------------------ blocks

def render(markdown):
    """Walk the letter line by line, grouping lines into blocks."""
    out = []
    lines = markdown.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            i += 1

        elif stripped.startswith("```"):  # fenced code: verbatim, no marks
            i += 1
            body = []
            while i < len(lines) and not lines[i].strip().startswith("```"):
                body.append(lines[i])
                i += 1
            i += 1  # closing fence
            out.append(tag("pre", html.escape("\n".join(body)), "pre"))

        elif stripped in ("---", "***"):  # a section break becomes a fleuron
            out.append(tag("p", "❦", "divider"))
            i += 1

        elif stripped.startswith("#"):
            level = min(len(stripped) - len(stripped.lstrip("#")), 3)
            out.append(tag(f"h{level}", inline(stripped.lstrip("# ")), f"h{level}"))
            i += 1

        elif stripped.startswith(">"):
            body = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                body.append(lines[i].strip().lstrip("> "))
                i += 1
            quoted = tag("p", inline(" ".join(body)), "p")
            out.append(tag("blockquote", quoted, "blockquote"))

        elif stripped.startswith("- "):
            items = []
            while i < len(lines) and lines[i].strip().startswith("- "):
                items.append(tag("li", inline(lines[i].strip()[2:]), "li"))
                i += 1
            out.append(tag("ul", "".join(items), "ul"))

        else:  # a paragraph: consecutive plain lines joined into one flow
            body = []
            while i < len(lines) and lines[i].strip() and not re.match(
                r"^(```|---$|\*\*\*$|#|>|- )", lines[i].strip()
            ):
                body.append(lines[i].strip())
                i += 1
            out.append(tag("p", inline(" ".join(body)), "p"))

    return "\n".join(out)


def press(md_path):
    markdown = md_path.read_text(encoding="utf-8")
    body = render(markdown)

    heading = re.search(r"^#\s+(.+)$", markdown, re.MULTILINE)
    title = html.escape(heading.group(1)) if heading else md_path.stem

    page = (
        "<!doctype html>\n<html>\n<head>\n<meta charset='utf-8'>\n"
        f"<title>{title}</title>\n</head>\n"
        f'<body style="{STYLE["page"]}">\n'
        f'<div style="{STYLE["letter"]}">\n{body}\n</div>\n'
        "</body>\n</html>\n"
    )

    out_path = md_path.with_suffix(".html")
    out_path.write_text(page, encoding="utf-8")
    return out_path


def main(argv):
    args = [a for a in argv if a != "--no-open"]
    if len(args) != 1:
        print(__doc__)
        return 2

    md_path = Path(args[0])
    if not md_path.is_file():
        print(f"letterpress: no such file: {md_path}")
        return 1

    out_path = press(md_path)
    print(f"pressed: {out_path}")
    print("open it, Select All, Copy, and paste where the letter is going.")
    if "--no-open" not in argv:
        webbrowser.open(out_path.resolve().as_uri())
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
