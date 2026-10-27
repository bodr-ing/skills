import glob,os
surf=[("poster","Street poster"),("app-icon","App icon"),("tote","Tote bag"),("jar-label","Jar label"),("window-decal","Shop window")]
logos=[l for l in [("06-stamp","06 Stamp"),("04-bite","04 Bite"),("01-minimal","01 Minimal"),("03-angled","03 Angled")] if glob.glob(f"photos/{l[0]}-*.jpg")]
rows=""
for s,sn in surf:
    rows+=f'<h3>{sn}</h3><div class="prow">'+"".join(f'<figure><img src="photos/{l}-{s}.jpg" alt="{ln} logo on a {sn.lower()}" loading="lazy"><figcaption>{ln}</figcaption></figure>' for l,ln in logos if os.path.exists(f"photos/{l}-{s}.jpg"))+'</div>'
html=f'<section><h2>Out in the world</h2><p class="hint">Photo mockups made by an image model from the SVGs above. {", ".join(ln for _,ln in logos)} so far.</p>{rows}</section>'
open("photos.html","w").write(html)
