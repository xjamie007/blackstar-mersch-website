#!/usr/bin/env python3
"""
Keeps all FLBB game data on the site fresh, sourced live from FLBB's public
.ics calendar feeds (luxembourg.basketball):

  1. index.html          -> the "Gameday" cards (next game per category)
  2. teams/<team>.html    -> each team's own full-season schedule table

Meant to run daily via GitHub Actions (see .github/workflows/update-games.yml)
so dates/times/opponents never go stale on their own.

Usage: python3 scripts/update-next-games.py
(run from the repo root — it reads/writes index.html and teams/*.html in place)
"""
import re
import sys
import time as time_module
import unicodedata
import urllib.request
from datetime import datetime, date, timedelta

INDEX_HTML = "index.html"

# For games where FLBB's own .ics feed hasn't marked a time as confirmed yet
# (time 00:00:00), the match's own detail page on luxembourg.basketball often
# already shows a provisional kickoff time before the feed catches up. We only
# pay the extra per-game HTTP request for games within this many days, so a
# daily run doesn't waste hundreds of requests on far-future fixtures nobody
# is looking at yet.
MATCH_PAGE_FALLBACK_WINDOW_DAYS = 60

# One .ics feed per BSM team category. teamPage/teamLabelKey/teamLabel/bsmName
# must match what index.html's nextCategoryGames renderer expects (see
# buildGamesGrid()); teamPage doubles as the path to that team's own page,
# whose "nextGames" schedule table (see buildGamesGrid() there too) is kept
# in sync with the same feed.
TEAMS = [
    {"code": "SHBSM",  "teamPage": "teams/senior-a-men.html",   "teamLabelKey": "team.senior-a-men",   "teamLabel": "Senior A Hären",  "bsmName": "Black Star Mersch"},
    {"code": "SDBSM",  "teamPage": "teams/senior-a-women.html", "teamLabelKey": "team.senior-a-women", "teamLabel": "Senior A Dammen", "bsmName": "Black Star Mersch"},
    {"code": "SHBSMB", "teamPage": "teams/senior-b-men.html",   "teamLabelKey": "team.senior-b-men",   "teamLabel": "Senior B Hären",  "bsmName": "Black Star Mersch B"},
    {"code": "SDBSMB", "teamPage": "teams/senior-b-women.html", "teamLabelKey": "team.senior-b-women", "teamLabel": "Senior B Dammen", "bsmName": "Black Star Mersch B"},
    {"code": "SHBSMC", "teamPage": "teams/senior-c-men.html",   "teamLabelKey": "team.senior-c-men",   "teamLabel": "Senior C Hären",  "bsmName": "Black Star Mersch C"},
    {"code": "CABSM",  "teamPage": "teams/u18-cadets.html",     "teamLabelKey": None, "teamLabel": "U18 – Cadets",    "bsmName": "Black Star Mersch"},
    {"code": "SCBSM",  "teamPage": "teams/u16-scolaires.html",  "teamLabelKey": None, "teamLabel": "U16 – Scolaires", "bsmName": "Black Star Mersch"},
    {"code": "FIBSM",  "teamPage": "teams/u14-minis.html",      "teamLabelKey": None, "teamLabel": "U14 – Minis",     "bsmName": "Black Star Mersch"},
]

# FLBB club-name -> club-code lookup (for opponent crest images), scraped from
# https://www.luxembourg.basketball/jouer/les-clubs/ — extend if a new club
# shows up in a division BSM plays in and its logo doesn't render.
CLUB_CODES = {
    "ab contern": "CON", "amicale steesel": "AMI", "arantia larochette": "ARA",
    "as soleuvre": "SOL", "avanti mondorf 2000": "MON", "bascharage hedgehogs": "BAS",
    "basket esch": "LAL", "bbc dikrich": "DIE", "bbc east side pirates": "BEP",
    "bbc kaldall": "KAY", "bbc käldall": "KAY", "black frogs schieren": "FRO",
    "black star mersch": "BSM", "cfbb u18": "U18",
    "entente residence/amicale u18": "ERA", "entente résidence/amicale u18": "ERA",
    "entente res ami": "ERA",
    "etzella ettelbruck": "ETZ", "grengewald hueschtert": "GRE", "gréngewald hueschtert": "GRE",
    "kordall steelers": "KDS", "les sangliers wooltz": "SAN", "luxembourg phoenix": "CED",
    "mambra mamer": "MAM", "mess": "MES", "musel pikes": "MUS", "nitia bettembourg": "NIT",
    "north fox": "FOX", "racing luxembourg": "RAC", "rebound preizerdaul": "PRE",
    "rebound préizerdaul": "PRE", "residence walferdange": "RES", "résidence walferdange": "RES",
    "sparta bertrange": "SPA", "special olympics luxembourg": "LSO", "t71 dudelange": "T71",
    "telstar hesperange": "TEL", "us heffingen": "HEF", "vibball": "VBE", "zesummen aktiv": "ZAK",
}

ENTRY_RE = re.compile(
    r'\{date:"(?P<date>[^"]*)", weekday:(?P<weekday>\d+), time:(?P<time>null|"[^"]*"), '
    r'homeAway:"(?P<homeAway>[^"]*)", opponent:"(?P<opponent>(?:[^"\\]|\\.)*)", '
    r'opponentCode:(?P<opponentCode>null|"[^"]*"), venue:"(?P<venue>(?:[^"\\]|\\.)*)", '
    r'gameNumber:"(?P<gameNumber>\d+)", competition:"(?P<competition>(?:[^"\\]|\\.)*)"\},'
)


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (BSM-website-bot)"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse_ics_events(text):
    events = []
    for block in text.split("BEGIN:VEVENT")[1:]:
        block = block.split("END:VEVENT")[0]
        ev = {}
        m = re.search(r"SUMMARY:(.+)", block)
        if m:
            ev["summary"] = m.group(1).strip()
        m = re.search(r"DESCRIPTION:(.+)", block)
        if m:
            ev["description"] = m.group(1).strip()
        m = re.search(r"DTSTART:(\d{8})T(\d{6})", block)
        if m:
            ev["date"] = m.group(1)
            ev["time_raw"] = m.group(2)
        if "date" in ev and "summary" in ev:
            events.append(ev)
    return events


def club_code_for(name):
    n = re.sub(r"\s+[ABC]$", "", name).strip().lower()
    n = re.sub(r"^(bc|ab|as|us)\s+", "", n)
    if n in CLUB_CODES:
        return CLUB_CODES[n]
    lname = name.strip().lower()
    if lname in CLUB_CODES:
        return CLUB_CODES[lname]
    for key, code in CLUB_CODES.items():
        if key in lname or lname in key:
            return code
    return None


def game_number_of(ev):
    m = re.search(r"Game number:\s*(\d+)", ev.get("description", ""))
    return m.group(1) if m else None


def slugify_team(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.lower().replace("'", "").strip()
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"[^a-z0-9-]", "", s)
    return s


def slugify_comp(s):
    s = s.replace(":", "").lower().strip()
    s = re.sub(r"\s+", "-", s)
    return s


def flbb_match_url(game_number, date_str, home_name, away_name, competition):
    return (
        f"https://www.luxembourg.basketball/match/{game_number}/{date_str}/"
        f"{slugify_team(home_name)}/{slugify_team(away_name)}/{slugify_comp(competition)}"
    )


def fetch_match_page_time(url):
    """FLBB's own match-detail page often shows a provisional kickoff time
    (e.g. '26/09/2026 - 14h30') before that same time is confirmed in the
    bulk .ics feed. Scrape it as a fallback so the site shows what's actually
    on FLBB right now, not just what the feed has gotten around to yet."""
    try:
        html = fetch(url)
    except Exception:
        return None
    m = re.search(r"\d{2}/\d{2}/\d{4}\s*-\s*(\d{1,2})h(\d{2})", html)
    if not m:
        return None
    hh, mi = m.groups()
    return f"{int(hh):02d}:{mi}"


def resolve_event(ev, bsm_name, *, allow_match_page_fallback=True):
    """Turn a raw .ics VEVENT dict into the fields our JS entries need,
    relative to a specific BSM team name (e.g. 'Black Star Mersch B')."""
    summary = ev["summary"].replace("\\n", " ")  # FLBB escapes literal newlines as "\n"
    comp_m = re.search(r"\[(.+?)\]", summary)
    competition = comp_m.group(1).strip() if comp_m else ""
    teams_part = summary.split("[")[0].strip()
    if "-" not in teams_part:
        return None
    home_name, away_name = [p.strip() for p in teams_part.split("-", 1)]

    is_home = home_name == bsm_name or bsm_name in home_name
    is_away = away_name == bsm_name or bsm_name in away_name
    if not is_home and not is_away:
        return None

    opponent = away_name if is_home else home_name
    home_away = "home" if is_home else "away"
    d = datetime.strptime(ev["date"], "%Y%m%d").date()
    weekday = d.weekday()  # Monday=0 .. Sunday=6 — matches the site's dayKeysFull mapping
    date_str = d.strftime("%Y-%m-%d")
    time_raw = ev.get("time_raw", "000000")
    time_str = f"{time_raw[0:2]}:{time_raw[2:4]}" if time_raw and time_raw != "000000" else None

    if time_str is None and allow_match_page_fallback:
        game_number = game_number_of(ev)
        within_window = d <= date.today() + timedelta(days=MATCH_PAGE_FALLBACK_WINDOW_DAYS)
        if game_number and within_window:
            url = flbb_match_url(game_number, date_str, home_name, away_name, competition)
            time_module.sleep(0.2)  # be polite to FLBB's server across dozens of lookups
            time_str = fetch_match_page_time(url)

    return {
        "date": date_str,
        "weekday": weekday,
        "time": time_str,
        "homeAway": home_away,
        "opponent": opponent,
        "opponentCode": club_code_for(opponent),
        "competition": competition,
    }


def js_str(v):
    return "null" if v is None else '"' + str(v).replace("\\", "\\\\").replace('"', '\\"') + '"'


def js_entry_for_index(g):
    return (
        "    {date:%s, weekday:%d, time:%s, homeAway:%s, opponent:%s, opponentCode:%s, "
        "teamPage:%s, teamLabelKey:%s, teamLabel:%s, gameNumber:%s, competition:%s, bsmName:%s},"
    ) % (
        js_str(g["date"]), g["weekday"], js_str(g["time"]), js_str(g["homeAway"]), js_str(g["opponent"]),
        js_str(g["opponentCode"]), js_str(g["teamPage"]), js_str(g["teamLabelKey"]), js_str(g["teamLabel"]),
        js_str(g["gameNumber"]), js_str(g["competition"]), js_str(g["bsmName"]),
    )


def update_index_html(next_games):
    with open(INDEX_HTML, "r", encoding="utf-8") as f:
        html = f.read()

    block = "\n".join(js_entry_for_index(g) for g in next_games)
    new_array = (
        "  // GAMES_DATA_START (auto-generated — do not hand-edit the block below, see /scripts/update-next-games.py)\n"
        "  const nextCategoryGames = [\n" + block + "\n  ];\n"
        "  // GAMES_DATA_END"
    )
    pattern = re.compile(r"  // GAMES_DATA_START.*?// GAMES_DATA_END", re.DOTALL)
    if not pattern.search(html):
        print("ERROR: could not find GAMES_DATA_START/END markers in index.html", file=sys.stderr)
        return False

    updated = pattern.sub(new_array, html)
    if updated == html:
        return False
    with open(INDEX_HTML, "w", encoding="utf-8") as f:
        f.write(updated)
    return True


def update_team_page(path, events_by_game_number, bsm_name):
    """Rewrite only the entries in this team's own nextGames table whose
    gameNumber is present in the live feed — anything FLBB hasn't published
    yet (future rounds not in the feed) is left exactly as it was."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            html = f.read()
    except FileNotFoundError:
        print(f"  ! {path} not found, skipping", file=sys.stderr)
        return False

    block_re = re.compile(r"// GAMES_DATA_START.*?// GAMES_DATA_END", re.DOTALL)
    bm = block_re.search(html)
    if not bm:
        print(f"  ! no GAMES_DATA markers in {path}, skipping", file=sys.stderr)
        return False
    block = bm.group(0)

    def repl(m):
        ev = events_by_game_number.get(m.group("gameNumber"))
        if not ev:
            return m.group(0)  # not (yet) in the feed — leave untouched
        resolved = resolve_event(ev, bsm_name)
        if not resolved:
            return m.group(0)
        return (
            '{date:%s, weekday:%d, time:%s, homeAway:%s, opponent:%s, opponentCode:%s, '
            'venue:%s, gameNumber:%s, competition:%s},'
        ) % (
            js_str(resolved["date"]), resolved["weekday"], js_str(resolved["time"]),
            js_str(resolved["homeAway"]), js_str(resolved["opponent"]), js_str(resolved["opponentCode"]),
            '"' + m.group("venue") + '"',  # already-escaped JS string content — reuse verbatim, don't re-escape
            js_str(m.group("gameNumber")), js_str(resolved["competition"]),
        )

    new_block = ENTRY_RE.sub(repl, block)
    if new_block == block:
        return False

    html = html[:bm.start()] + new_block + html[bm.end():]
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    return True


def main():
    next_games = []
    any_changes = False

    for team in TEAMS:
        print(f"Checking {team['teamLabel']} ({team['code']}) ...")
        try:
            text = fetch(f"https://www.luxembourg.basketball/layout/themes/flbb/calendar/{team['code']}.ics")
        except Exception as e:
            print(f"  ! could not fetch {team['code']}: {e}", file=sys.stderr)
            continue

        events = parse_ics_events(text)
        events_by_game_number = {gn: ev for ev in events if (gn := game_number_of(ev))}

        # 1) next upcoming game -> homepage Gameday card
        today = date.today().strftime("%Y%m%d")
        upcoming = sorted((e for e in events if e.get("date", "") >= today), key=lambda e: e["date"])
        if upcoming:
            resolved = resolve_event(upcoming[0], team["bsmName"])
            if resolved:
                gn = game_number_of(upcoming[0]) or ""
                print(f"  -> next: {resolved['date']} {resolved['time'] or 'TBD'} vs {resolved['opponent']} ({resolved['homeAway']})")
                next_games.append({**resolved, "gameNumber": gn, "teamPage": team["teamPage"],
                                    "teamLabelKey": team["teamLabelKey"], "teamLabel": team["teamLabel"],
                                    "bsmName": team["bsmName"]})
            else:
                print(f"  ! could not match '{team['bsmName']}' in next event", file=sys.stderr)
        else:
            print("  -> no upcoming game found, homepage card will be omitted")

        # 2) sync this team's own full-season schedule table
        if update_team_page(team["teamPage"], events_by_game_number, team["bsmName"]):
            print(f"  -> updated {team['teamPage']}")
            any_changes = True

    if not next_games:
        print("ERROR: no games found for any team — leaving index.html untouched (likely a fetch problem).", file=sys.stderr)
        sys.exit(1)

    if update_index_html(next_games):
        print("index.html updated.")
        any_changes = True

    if not any_changes:
        print("No changes needed anywhere — data already up to date.")


if __name__ == "__main__":
    main()
