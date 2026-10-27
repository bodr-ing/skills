import math, random
G="#00915a"; DG="#0a6f45"; LG="#9fd68a"; PL="#cfe8bf"; P="#ff4aa2"; W="#f4f5ec"; K="#12352a"
def f(x): return f"{x:.2f}".rstrip("0").rstrip(".")
ROUND="M0,-3 C-10,-6 -17,-16 -14,-25 C-11,-34 11,-34 14,-25 C17,-16 10,-6 0,-3Z"
HEART="M0,-2 C-8,-6 -16,-13 -15,-23 C-14,-32 -4,-34 0,-27 C4,-34 14,-32 15,-23 C16,-13 8,-6 0,-2Z"
TRI="M0,-4 C-8,-8 -17,-14 -16,-23 C-15,-31 -7,-33 0,-33 C7,-33 15,-31 16,-23 C17,-14 8,-8 0,-4Z"
def lobes(path, attrs, cx=50, cy=50, s=1.0, extra=""):
    return "".join(f'<path d="{path}" transform="translate({cx} {cy}) rotate({a}) scale({s})" {attrs}/>' for a in (0,120,240))+extra
def seeds(pts, attrs, cx=50, cy=50, s=1.0, rx=2.2, ry=4.6):
    out=[]
    for a in (0,120,240):
        for (x,y,r) in pts:
            out.append(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" transform="translate({cx} {cy}) rotate({a}) scale({s}) rotate({r} {x} {y})" {attrs}/>')
    return "".join(out)
FAN3=[(-6,-21,-28),(0,-25,0),(6,-21,28)]
FAN4=[(-5,-26,-20),(5,-26,20),(-6,-16,-35),(6,-16,35)]
FAN5=[(-7,-22,-30),(0,-27,0),(7,-22,30),(-3,-14,-15),(3,-14,15)]
def wobble(cx,cy,r,amp,n,seed,k=7):
    rnd=random.Random(seed); ph=[rnd.random()*6.28 for _ in range(4)]
    pts=[]
    for i in range(n):
        t=2*math.pi*i/n
        rr=r+amp*(math.sin(k*t+ph[0])*.5+math.sin(3*t+ph[1])*.3+math.sin(13*t+ph[2])*.2)
        pts.append((cx+rr*math.sin(t), cy-rr*math.cos(t)))
    return "M"+" L".join(f"{f(x)},{f(y)}" for x,y in pts)+"Z"
def dashes(r, n, attrs, cx=50, cy=50, l=3):
    return "".join(f'<line x1="0" y1="{-r}" x2="0" y2="{-r+l}" transform="translate({cx} {cy}) rotate({360*i/n+7})" {attrs}/>' for i in range(n))
def ht(id, color, size=2.2, r=.7):
    return f'<pattern id="{id}" width="{size}" height="{size}" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="{size/2}" cy="{size/2}" r="{r}" fill="{color}"/></pattern>'

M={}
# 01 minimal: ring + outlined trefoil, pink seeds
M["minimal"]=("Minimal",
 f'<circle cx="52.2" cy="52.2" r="40" fill="{P}"/>'
 f'<circle cx="50" cy="50" r="38" fill="{W}" stroke="{G}" stroke-width="8"/>'
 + lobes(ROUND, f'fill="{G}" stroke="{G}" stroke-width="11" stroke-linejoin="round"', s=.82)
 + lobes(ROUND, f'fill="{W}"', s=.82)
 + seeds(FAN4, f'fill="{P}"', s=.82, rx=2.4, ry=5))
# 02 sticker: wobbly dark skin, green lobes with pink halo, paper seeds
M["sticker"]=("Sticker",
 f'<defs><radialGradient id="st-fl"><stop offset=".6" stop-color="{W}"/><stop offset="1" stop-color="{PL}"/></radialGradient></defs>'
 f'<path d="{wobble(50,50,45.5,1.4,120,2)}" fill="{P}"/>'
 f'<path d="{wobble(50,50,44,1.2,120,2)}" fill="{G}"/>'
 f'<circle cx="50" cy="50" r="36" fill="url(#st-fl)"/>'
 + dashes(40.2,26,f'stroke="{LG}" stroke-width="1.6" stroke-linecap="round"',l=1.4)
 + lobes(ROUND, f'fill="none" stroke="{P}" stroke-opacity=".22" stroke-width="4"', s=.9)
 + lobes(ROUND, f'fill="{G}"', s=.9)
 + seeds(FAN3, f'fill="{W}"', s=.9))
# 03 angled: tipped slice showing its thickness
face=(f'<circle cx="50" cy="50" r="40" fill="url(#an-fl)"/>'
 + lobes(ROUND, f'fill="{P}" fill-opacity=".85"', s=.78) + seeds(FAN3, f'fill="{W}"', s=.78))
M["angled"]=("Angled",
 f'<defs><radialGradient id="an-fl"><stop offset=".55" stop-color="{W}"/><stop offset="1" stop-color="#ffd3e8"/></radialGradient>'
 f'<clipPath id="an-cl"><path d="M8,50 A42 26 0 0 0 92 50 L92 62 A42 26 0 0 1 8 62Z"/></clipPath></defs>'
 f'<g transform="rotate(-24 50 50)">'
 f'<path d="M6.5,52 A43.5 27 0 0 0 93.5 52 L93.5 64 A43.5 27 0 0 1 6.5 64Z" fill="{P}" transform="translate(-1.5 1.5)"/>'
 f'<path d="M8,50 A42 26 0 0 0 92 50 L92 62 A42 26 0 0 1 8 62Z" fill="{G}"/>'
 + "".join(f'<path d="M{x},{56+ (abs(x-50)/42)**2*-10 if False else 0}" />' for x in [])
 + f'<g clip-path="url(#an-cl)" stroke="{LG}" stroke-width="1.6" stroke-linecap="round" opacity=".8">'
 + "".join(f'<line x1="{x}" y1="{50+26*math.sqrt(max(0,1-((x-50)/42)**2))+1}" x2="{x+1.5}" y2="{50+26*math.sqrt(max(0,1-((x-50)/42)**2))+10}"/>' for x in range(14,90,7))
 + '</g>'
 f'<ellipse cx="50" cy="50" rx="42" ry="26" fill="{G}"/>'
 f'<g transform="translate(50 50) scale(1 .6) translate(-50 -50)"><circle cx="50" cy="50" r="40" fill="{W}"/>{face}</g>'
 '</g>')
# 04 bite
bite="".join(f'<circle cx="{x}" cy="{y}" r="{r}"/>' for x,y,r in [(77,19,8.5),(85.5,30,8),(66,12,7)])
M["bite"]=("Bite",
 f'<defs><mask id="bi-m"><rect x="-10" y="-10" width="120" height="120" fill="#fff"/><g fill="#000">{bite}</g></mask>'
 f'<mask id="bi-m2"><rect x="-10" y="-10" width="120" height="120" fill="#fff"/><g fill="#000" transform="translate(-1.6 -1.6)">{bite}</g></mask></defs>'
 f'<g mask="url(#bi-m2)"><circle cx="51.6" cy="51.6" r="43" fill="{P}"/></g>'
 f'<g mask="url(#bi-m)"><circle cx="50" cy="50" r="43" fill="{G}"/><circle cx="50" cy="50" r="35.5" fill="{P}"/><circle cx="50" cy="50" r="34.5" fill="{W}"/>'
 + dashes(39.5,22,f'stroke="{W}" stroke-width="1.5" stroke-linecap="round"',l=2.4)
 + lobes(ROUND, f'fill="{P}"', s=.82) + seeds(FAN3, f'fill="{W}"', s=.82) + '</g>')
# 05 mascot
M["mascot"]=("Mascot",
 f'<defs>{ht("ma-ht",LG,2.2,.75)}</defs>'
 f'<circle cx="51.6" cy="51.6" r="42" fill="{P}"/><circle cx="50" cy="50" r="42" fill="{G}"/><circle cx="50" cy="50" r="35" fill="{W}"/>'
 + dashes(38.5,20,f'stroke="{P}" stroke-width="1.3" stroke-linecap="round" opacity=".8"',l=1)
 + "".join(f'<ellipse cx="0" cy="-19" rx="12" ry="9.5" transform="translate(50 50) rotate({a})" fill="url(#ma-ht)"/><ellipse cx="0" cy="-19" rx="12" ry="9.5" transform="translate(50 50) rotate({a})" fill="{LG}" opacity=".35"/>' for a in (0,120,240))
 + seeds([(-5,-18,-30),(0,-22,0),(5,-18,30)], f'fill="{W}" stroke="{P}" stroke-width=".9"', rx=1.9, ry=3.6)
 + f'<g fill="{DG}"><circle cx="44" cy="49" r="2.2"/><circle cx="56" cy="49" r="2.2"/><rect x="47" y="54" width="6" height="1.8" rx=".9"/></g>')
# 06 stamp: halftone fade ring, big pink lobes
M["stamp"]=("Stamp",
 f'<defs>{ht("sp-ht",G,2.4,.8)}<radialGradient id="sp-g"><stop offset=".72" stop-color="#fff" stop-opacity="0"/><stop offset=".9" stop-color="#fff"/></radialGradient><mask id="sp-m"><circle cx="50" cy="50" r="40" fill="url(#sp-g)"/></mask></defs>'
 f'<circle cx="50" cy="50" r="40" fill="{W}"/><circle cx="50" cy="50" r="40" fill="url(#sp-ht)" mask="url(#sp-m)"/>'
 f'<circle cx="50" cy="50" r="40.5" fill="none" stroke="{G}" stroke-width="6"/>'
 + lobes(ROUND, f'fill="{P}"', s=.9) + seeds(FAN3, f'fill="{W}"', s=.9, rx=2.4, ry=5.2))
# 07 chunky
M["chunky"]=("Chunky",
 f'<defs>{ht("ch-ht",G,2.1,.6)}</defs>'
 f'<circle cx="51.5" cy="51.5" r="41" fill="{P}"/><circle cx="50" cy="50" r="41" fill="{G}"/><circle cx="50" cy="50" r="32" fill="{W}"/>'
 + lobes(TRI, 'fill="url(#ch-ht)"', s=.85)
 + seeds(FAN3, f'fill="{P}"', s=.85, rx=2.8, ry=6))
# 08 hand-drawn
rnd=random.Random(8)
flecks="".join(f'<circle cx="{f(50+r*math.sin(t))}" cy="{f(50-r*math.cos(t))}" r=".9" fill="{P}"/>' for t,r in [(rnd.random()*6.28, 22+rnd.random()*10) for _ in range(9)])
leaves="".join(f'<ellipse cx="0" cy="-30" rx="1" ry="2.6" transform="translate(50 50) rotate({a})" fill="{LG}"/>' for a in range(60,360,120))
M["handdrawn"]=("Hand-drawn",
 f'<path d="{wobble(50,50,44,1.8,90,8,k=9)}" fill="{G}"/>'
 f'<path d="{wobble(50,50,38.5,1.2,90,9)}" fill="{LG}" opacity=".85"/>'
 f'<path d="{wobble(50,50,35,1.2,90,10)}" fill="{W}"/>'
 + dashes(41.3,16,f'stroke="{P}" stroke-width="1.6" stroke-linecap="round"',l=1.6)
 + lobes(HEART, f'fill="{PL}" stroke="{LG}" stroke-width="2.4" stroke-linejoin="round"', s=.82)
 + seeds([(-5,-20,-25),(5,-20,25),(0,-12,0)], f'fill="{P}"', cx=50.8, cy=50.8, s=.82, rx=2.4, ry=4.8)
 + seeds([(-5,-20,-25),(5,-20,25),(0,-12,0)], f'fill="{W}"', s=.82, rx=2.4, ry=4.8)
 + flecks + leaves)
def svg(k): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">{M[k][1]}</svg>'
if __name__=="__main__":
    import os; os.makedirs("svg",exist_ok=True)
    for i,k in enumerate(M,1): open(f"svg/{i:02d}-{k}.svg","w").write(svg(k))

def mono(k):
    s=svg(k)
    for c in (G,DG,P,K): s=s.replace(c,"#0b5d3b")
    for c in (W,PL,LG,"#ffd3e8"): s=s.replace(c,"#f5f6ef")
    return s
if __name__=="__main__":
    for i,k in enumerate(M,1): open(f"svg/mono-{i:02d}-{k}.svg","w").write(mono(k))
