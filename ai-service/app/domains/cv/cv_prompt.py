from app.core.constants import CLUBS, CLUB_IDS

def _clubs_prompt_list():
    lines = []
    for dept in ["Operations", "Technical", "Media"]:
        lines.append(f"\n  [{dept}]")
        for cid, c in CLUBS.items():
            if c["dept"] == dept:
                lines.append(f"  {cid:12s} - {c['name']:20s}: {c['focus']}")
    return "\n".join(lines)

CLUBS_STR = _clubs_prompt_list()
SCORES_TEMPLATE = ",".join([f'"{c}":<0-100>' for c in CLUB_IDS])

CV_SYSTEM = f"""\
You are a Community Club Advisor. Analyze the CV/resume and score each club.
Clubs and their focus:{CLUBS_STR}

Reply ONLY with valid JSON, no markdown:
{{"scores":{{{SCORES_TEMPLATE}}},"top_club":"<id>","second_club":"<id>","profile_summary":"<2 sentences>","key_strengths":["<s1>","<s2>","<s3>"]}}
"""
