import json, urllib.request, urllib.parse
S, W, N, E = 37.748, -122.485, 37.812, -122.388
q = f"""[out:json][timeout:120];
( relation["leisure"="park"]({S},{W},{N},{E}); relation["boundary"="national_park"]({S},{W},{N},{E}); );
out geom tags;"""
req = urllib.request.Request("https://overpass-api.de/api/interpreter", data=urllib.parse.urlencode({"data": q}).encode(),
                             headers={"User-Agent": "andor-us-map-build/1.0"})
d = json.load(urllib.request.urlopen(req, timeout=180))
json.dump(d, open("osm_rel.json", "w")); print([e.get("tags", {}).get("name") for e in d["elements"]])
