import json, pandas as pd
from shapely.geometry import shape

with open("data/india_pin_codes_2025.json", "r", encoding="utf-8") as f:
    geo = json.load(f)

rows = []
for feat in geo["features"]:
    props = feat["properties"]
    pin = str(props.get("Pincode"))
    geom = shape(feat["geometry"])
    c = geom.centroid
    rows.append({
        "pincode": pin,
        "lat": c.y,
        "lng": c.x
    })

pd.DataFrame(rows).to_csv("data/pincode_coords.csv", index=False)
print("Created data/pincode_coords.csv")
