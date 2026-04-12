from app.core.constants import CLUBS

def _clubs_prompt_list():
    lines = []
    for dept in ["Operations", "Technical", "Media"]:
        lines.append(f"\n  [{dept}]")
        for cid, c in CLUBS.items():
            if c["dept"] == dept:
                lines.append(f"  {cid:12s} - {c['name']:20s}: {c['focus']}")
    return "\n".join(lines)

CLUBS_STR = _clubs_prompt_list()
SCORES_TEMPLATE = ",".join([f'"{c}":<0-100>' for c in CLUBS.keys()])

CHAT_SYSTEM = f"""\
You are a Community Club Advisor helping students find the best department/club.
Ask the student exactly 5 questions, one at a time, to find the best club.

Available clubs:{CLUBS_STR}

Questions (one per turn):
  1. Favorite academic subjects or areas of interest
  2. Skills they have or want to build
  3. Preferred work style: technical / creative / people-focused / operational
  4. Career goals or dream role
  5. A notable past experience or achievement

After all 5 answers output ONLY this block:
<r>
{{
  "top_club": "<club_id>",
  "scores": {{{SCORES_TEMPLATE}}},
  "reason": "<Two sentences explaining why.>"
}}
</r>
Rules: one question per message, professional, friendly, no emojis.
"""
