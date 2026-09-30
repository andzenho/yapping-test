"""Собирает types.js для мини-аппа из raboty/test-types.md проекта Карины.

Запуск из корня репо: python3 tools/build_types.py [путь к test-types.md]
По умолчанию берёт ../raboty/test-types.md (репо лежит в папке проекта).
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "..", "raboty", "test-types.md")
DST = os.path.join(HERE, "..", "types.js")
IDS = {"Эксперт": "expert", "Советчица": "sovet", "Правдорубка": "pravda", "Рассказчица": "rasskaz",
       "Своя в доску": "svoya", "Смелая": "smelaya", "Гид": "gid"}

md = open(SRC, encoding="utf-8").read()
blocks = re.split(r"\n## \d\. ", md)[1:]

def field(body, name):
    m = re.search(r"\*\*" + re.escape(name) + r":\*\* (.+)", body)
    return m.group(1).strip() if m else None

types = []
for body in blocks:
    name = body.split("\n", 1)[0].strip()
    if name not in IDS:
        continue
    topics_block = body.split("**Примеры тем, которые идеально зайдут под твой тип блогера**", 1)[1].split("**5 готовых роликов**")[0]
    topics = [l[2:].strip() for l in topics_block.splitlines() if l.startswith("- ")]
    reels_block = body.split("**5 готовых роликов**", 1)[1].split("**Чего тебе не снимать:**")[0]
    reels = []
    for m in re.finditer(r"\d\. «(.+?)»\n\s+Что сказать дальше: (.+?)\n\s+Чем закончить: «(.+?)»(?:\n\s+Например: «(.+?)»)?", reels_block):
        r = {"phrase": m.group(1), "next": m.group(2).strip(), "end": m.group(3)}
        if m.group(4):
            r["ex"] = m.group(4)
        reels.append(r)
    t = {
        "id": IDS[name], "name": name,
        "tagline": field(body, "Коротко"),
        "second": field(body, "Если это второй тип"),
        "sticker": field(body, "Стикер"),
        "why": field(body, "За что тебя будут смотреть"),
        "where": field(body, "Где твои темы"),
        "find": field(body, "Как найти свою прямо сейчас"),
        "topics": topics, "reels": reels,
        "dont": field(body, "Чего тебе не снимать"),
        "karina": field(body, "У Карины"),
    }
    assert len(reels) == 5 and len(topics) >= 12, (name, len(reels), len(topics))
    types.append(t)

assert len(types) == 7
with open(DST, "w", encoding="utf-8") as f:
    f.write("/* Сгенерировано из raboty/test-types.md: python3 tools/build_types.py. Руками не править. */\n")
    f.write("window.TYPES = " + json.dumps(types, ensure_ascii=False, indent=1) + ";\n")
print("ok:", [(t["name"], len(t["topics"]), len(t["reels"])) for t in types])
