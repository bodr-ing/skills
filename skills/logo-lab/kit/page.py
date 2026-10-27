from marks import M
keys=list(M)
names={k:M[k][0] for k in keys}
def cells(fn):
    return '<div class="row">'+"".join(f'<figure class="cell" data-k="{k}">{fn(f"svg/{i:02d}-{k}.svg",k)}<figcaption>{i:02d} · {names[k]}</figcaption></figure>' for i,k in enumerate(keys,1))+'</div>'
sections=[
("On the site","The slice replaces the o in the wordmark, plus the small nav mark.",
 lambda s,k: f'<div class="m-site"><div class="nav"><img src="{s}" alt="">The Bodring Co.</div><div class="hero">b<img src="{s}" alt="">dring</div></div>'),
("Street poster","Wheat-pasted on a wall. Does it read from across the street?",
 lambda s,k: f'<div class="m-wall"><div class="poster"><span class="tape"></span><img src="{s}" alt=""><b>bir bodring</b><small>one cucumber · bodr.ing</small></div></div>'),
("App icon","Home screen, on paper and on green.",
 lambda s,k: f'<div class="m-phone"><div class="app"><span class="ic paper"><img src="{s}" alt=""></span><i>bodring</i></div><div class="app"><span class="ic green"><img src="{s}" alt=""></span><i>nodos</i></div></div>'),
("Instagram","Profile picture in the round crop.",
 lambda s,k: f'<div class="m-ig"><span class="av"><img src="{s}" alt=""></span><div><b>birbodring</b><small>The Bodring Co. · apps &amp; games</small></div></div>'),
("Browser tab","Favicon at real size, 16 and 32 px.",
 lambda s,k: f'<div class="m-tab"><span class="tab"><img src="{s}" width="16" height="16" alt="">bodr.ing</span><img src="{s}" width="32" height="32" alt=""></div>'),
("Laptop sticker","Die-cut sticker on a dark lid.",
 lambda s,k: f'<div class="m-lid"><img src="{s}" alt=""></div>'),
("One colour","Printed in a single ink, for a rubber stamp, a jar label or embroidery.",
 lambda s,k: f'<div class="m-sil"><img src="{s.replace('svg/','svg/mono-')}" alt=""></div>'),
]
body="".join(f'<section><h2>{t}</h2><p class="hint">{h}</p>{cells(fn)}</section>' for t,h,fn in sections)
picks="".join(f'<button class="pick" data-k="{k}"><img src="svg/{i:02d}-{k}.svg" alt=""><span>{i:02d} · {names[k]}</span></button>' for i,k in enumerate(keys,1))
tpl=open("tpl.html").read()
open("index.html","w").write(tpl.replace("%VERDICT%",open("verdict.html").read() if __import__("os").path.exists("verdict.html") else "").replace("%PHOTOS%",open("photos.html").read() if __import__("os").path.exists("photos.html") else "").replace("%BODY%",body).replace("%PICKS%",picks).replace("%NAMES%",str({k:f"{i:02d} · {names[k]}" for i,k in enumerate(keys,1)}).replace("'",'"')))
