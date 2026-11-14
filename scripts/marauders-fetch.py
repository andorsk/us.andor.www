import json, urllib.request, urllib.parse
S, W, N, E = 37.748, -122.485, 37.812, -122.388   # Presidio -> Embarcadero, Marina -> Mission
q = f"""[out:json][timeout:120];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|unclassified|pedestrian)$"]({S},{W},{N},{E});
  way["leisure"="park"]({S},{W},{N},{E});
  way["natural"~"^(coastline|water|wood)$"]({S},{W},{N},{E});
  way["landuse"="forest"]({S},{W},{N},{E});
  node["place"~"^(neighbourhood|suburb|quarter)$"]({S},{W},{N},{E});
);
out geom tags;"""
req = urllib.request.Request("https://overpass-api.de/api/interpreter", data=urllib.parse.urlencode({"data": q}).encode(),
                             headers={"User-Agent": "andor-us-map-build/1.0"})
d = json.load(urllib.request.urlopen(req, timeout=180))
json.dump(d, open("osm.json", "w"))
print(len(d["elements"]), "elements")
