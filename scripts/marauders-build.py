"""OpenStreetMap -> an inked realm: projected, simplified SVG paths, labels, and walker routes along real streets."""
import heapq, json, math
S, W, N, E = 37.748, -122.485, 37.812, -122.388
VW, VH = 1200, 1000
d = json.load(open("osm.json"))["elements"]

def xy(lat, lon):
    return ((lon - W) / (E - W) * VW, (N - lat) / (N - S) * VH)

def simplify(pts, tol):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy) or 1e-9
    best, idx = 0, 0
    for i in range(1, len(pts) - 1):
        px, py = pts[i]
        dist = abs(dy * px - dx * py + x2 * y1 - y2 * x1) / L
        if dist > best:
            best, idx = dist, i
    if best > tol:
        return simplify(pts[: idx + 1], tol)[:-1] + simplify(pts[idx:], tol)
    return [pts[0], pts[-1]]

def simplify_ring(pts, tol):
    """A closed outline: split at the far point and simplify both halves (the plain version collapses loops)."""
    if len(pts) < 4:
        return pts
    far = max(range(len(pts)), key=lambda i: math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]))
    return simplify(pts[: far + 1], tol)[:-1] + simplify(pts[far:], tol)

def path(pts, close=False):
    s = "M" + " L".join(f"{x:.0f} {y:.0f}" for x, y in pts)
    return s + (" Z" if close else "")

def area(pts):
    return abs(sum(pts[i][0] * pts[i - 1][1] - pts[i - 1][0] * pts[i][1] for i in range(len(pts)))) / 2

out = {"major": [], "mid": [], "minor": [], "parks": [], "water": [], "coast": [], "labels": [], "routes": {}}
park_labels = []
graph, coord = {}, {}
for el in d:
    t = el.get("tags", {})
    if el["type"] == "node":
        name = t.get("name")
        if name:
            x, y = xy(el["lat"], el["lon"])
            out["labels"].append([name, round(x), round(y), "hood"])
        continue
    geom = el.get("geometry") or []
    pts = [xy(g["lat"], g["lon"]) for g in geom if g]
    if len(pts) < 2:
        continue
    hw = t.get("highway")
    if hw:
        cls = "major" if hw in ("motorway", "trunk", "primary") else "mid" if hw in ("secondary", "tertiary") else "minor"
        out[cls].append(path(simplify(pts, 0.9 if cls == "minor" else 0.6)))
        if hw not in ("motorway",):  # routing graph (people don't walk the freeway)
            ids = [(round(g["lat"], 5), round(g["lon"], 5)) for g in geom if g]
            for a, b in zip(ids, ids[1:]):
                w = math.hypot(*(p - q for p, q in zip(xy(*a), xy(*b))))
                graph.setdefault(a, []).append((b, w)); graph.setdefault(b, []).append((a, w))
                coord[a], coord[b] = xy(*a), xy(*b)
    elif t.get("natural") == "coastline":
        out["coast"].append(path(simplify(pts, 0.8)))
    elif t.get("natural") == "water":
        out["water"].append(path(simplify_ring(pts, 0.8), True))
    else:  # park / wood / forest
        sp = simplify_ring(pts, 1.0)
        if len(sp) >= 3 and area(sp) > 60:
            out["parks"].append(path(sp, True))
            if t.get("name") and area(sp) > 2500:
                cx = sum(p[0] for p in sp) / len(sp); cy = sum(p[1] for p in sp) / len(sp)
                park_labels.append([t["name"], round(cx), round(cy), "park", area(sp)])

# Big parks stored as multi-part areas (the Presidio): draw their outer edges.
for rel in json.load(open("osm_rel.json"))["elements"]:
    for m in rel.get("members", []):
        if m.get("role") == "outer" and m.get("geometry"):
            pts = [xy(g["lat"], g["lon"]) for g in m["geometry"] if g]
            if len(pts) >= 2:
                out["parks"].append(path(simplify(pts, 1.0)))
    if rel.get("tags", {}).get("name") == "Presidio of San Francisco":
        x, y = xy(37.7975, -122.4660)
        park_labels.append(["The Presidio", round(x), round(y), "park", 1e9])

# Labels: the neighborhoods people know, and the biggest parks, without crowding.
KEEP = {"Presidio Heights", "Pacific Heights", "Marina District", "Cow Hollow", "Russian Hill", "North Beach",
        "Chinatown", "Financial District", "Nob Hill", "Tenderloin", "Japantown", "Western Addition", "Haight-Ashbury",
        "Inner Richmond", "Mission District", "Castro", "Noe Valley", "South of Market", "Hayes Valley", "Lower Haight",
        "Mission Bay", "Inner Sunset", "Laurel Heights", "Telegraph Hill", "Duboce Triangle", "Cole Valley",
        "Lone Mountain", "Potrero Hill", "Union Square", "Fisherman's Wharf", "Seacliff", "Anza Vista", "Eureka Valley"}
hoods = [l for l in out["labels"] if l[0] in KEEP]
seen, labels = set(), []
for l in hoods:
    if l[0] not in seen:
        seen.add(l[0]); labels.append(l[:4])
for name, x, y, kind, a in sorted(park_labels, key=lambda r: -r[4])[:10]:
    if name not in seen and all(math.hypot(x - l[1], y - l[2]) > 70 for l in labels):
        seen.add(name); labels.append([name, x, y, kind])
# Keep labels clear of each other, the frame, the title cartouche (bottom left) and the compass (bottom right).
def box(l):
    w = len(l[0]) * (8.6 if l[3] == "hood" else 7) + 12
    return (l[1] - w / 2, l[2] - 15, l[1] + w / 2, l[2] + 5)
BLOCK = [(20, 860, 310, 990), (1050, 840, 1190, 990)]
placed = []
for l in labels:
    b = box(l)
    if b[0] < 30 or b[2] > 1170 or b[1] < 30 or b[3] > 970:
        continue
    if any(not (b[2] < o[0] or b[0] > o[2] or b[3] < o[1] or b[1] > o[3]) for o in BLOCK + [box(q) for q in placed]):
        continue
    placed.append(l)
out["labels"] = placed

# Walkers: mock routes between real places, along real streets (shortest path on the street graph).
# Only the biggest connected street network (footpaths that dead-end in a park would strand a walker).
comps, main = {}, set()
for start in graph:
    if start in comps:
        continue
    stack, comp = [start], set()
    while stack:
        u = stack.pop()
        if u in comp:
            continue
        comp.add(u); comps[u] = 1
        stack.extend(v for v, _ in graph[u] if v not in comp)
    if len(comp) > len(main):
        main = comp

def near(lat, lon):
    tx, ty = xy(lat, lon)
    return min(main, key=lambda k: (coord[k][0] - tx) ** 2 + (coord[k][1] - ty) ** 2)

def route(a, b):
    dist, prev, pq = {a: 0}, {}, [(0, a)]
    while pq:
        dd, u = heapq.heappop(pq)
        if u == b:
            break
        if dd > dist.get(u, 1e18):
            continue
        for v, w in graph.get(u, []):
            nd = dd + w
            if nd < dist.get(v, 1e18):
                dist[v], prev[v] = nd, u
                heapq.heappush(pq, (nd, v))
    p, u = [b], b
    while u != a:
        u = prev[u]; p.append(u)
    return [coord[k] for k in reversed(p)]

WALKS = {
    "Anton": [(37.8003, -122.4580), (37.8065, -122.4410), (37.8055, -122.4315), (37.7955, -122.3937)],
    "A Curious Cat": [(37.7720, -122.4602), (37.7700, -122.4469), (37.7764, -122.4346)],
    "The Night Courier": [(37.7596, -122.4269), (37.7650, -122.4219), (37.7880, -122.4075)],
    "A Wandering Scholar": [(37.7853, -122.4298), (37.7915, -122.4276), (37.8021, -122.4187), (37.8024, -122.4058)],
}
for name, stops in WALKS.items():
    pts = []
    nodes = [near(*s) for s in stops]
    for a, b in zip(nodes, nodes[1:]):
        seg = route(a, b)
        pts += seg if not pts else seg[1:]
    pts = simplify(pts, 0.6)
    out["routes"][name] = [[round(x, 1), round(y, 1)] for x, y in pts]

js = "const REALM = " + json.dumps(out, separators=(",", ":")) + ";\n"
open("realm.js", "w").write(js)
print({k: len(v) for k, v in out.items()}, f"{len(js)/1024:.0f} KB")
print([l[0] for l in out["labels"]])
