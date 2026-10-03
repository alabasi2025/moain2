#!/usr/bin/env python3
"""WCAG 2.x contrast of the colour tokens in docs/04-design/00-design-system.md (light + dark)."""
import colorsys
def hsl(h,s,l):
    r,g,b = colorsys.hls_to_rgb(h/360, l/100, s/100); return (r,g,b)
def lum(c):
    f=lambda v: v/12.92 if v<=0.03928 else ((v+0.055)/1.055)**2.4
    r,g,b=map(f,c); return 0.2126*r+0.7152*g+0.0722*b
def cr(a,b):
    la,lb=sorted([lum(a),lum(b)],reverse=True); return (la+0.05)/(lb+0.05)
W=(1,1,1)
L = dict(bg=hsl(36,30,97), surface=W, surface2=hsl(36,25,95), ink=hsl(30,20,12), ink2=hsl(30,10,38), ink3=hsl(30,8,58),
         brand500=hsl(28,42,42), brand600=hsl(28,42,36), brand50=hsl(28,42,96), brand100=hsl(28,42,90),
         success=hsl(152,55,36), warning=hsl(38,92,45), danger=hsl(4,72,50), info=hsl(210,70,48), locked=hsl(262,50,50))
D = dict(bg=hsl(30,12,8), surface=hsl(30,10,11), surface2=hsl(30,9,14), ink=hsl(36,20,94), ink2=hsl(36,10,70), ink3=hsl(36,8,50),
         brand500=hsl(28,42,58), brand50_light_leak=hsl(28,42,96))
rows = [
 ("light","ink on bg",L['ink'],L['bg'],4.5), ("light","ink-2 on surface",L['ink2'],L['surface'],4.5),
 ("light","ink-3 on bg (caption/placeholder)",L['ink3'],L['bg'],4.5), ("light","ink-3 on surface",L['ink3'],L['surface'],4.5),
 ("light","brand-500 text on white",L['brand500'],W,4.5), ("light","white text on brand-500 (primary button)",W,L['brand500'],4.5),
 ("light","ink on brand-50 (hero card)",L['ink'],L['brand50'],4.5), ("light","brand-600 on brand-100 (active nav)",L['brand600'],L['brand100'],4.5),
 ("light","success text on white",L['success'],W,4.5), ("light","warning text on white",L['warning'],W,4.5),
 ("light","danger text on white",L['danger'],W,4.5), ("light","info text on white",L['info'],W,4.5),
 ("light","warning as non-text (>=3)",L['warning'],W,3.0),
 ("dark","ink on bg",D['ink'],D['bg'],4.5), ("dark","ink-3 on surface",D['ink3'],D['surface'],4.5),
 ("dark","white on brand-500 (primary button)",W,D['brand500'],4.5), ("dark","brand-500 text on surface",D['brand500'],D['surface'],4.5),
 ("dark","undefined brand-50 hero bg vs dark ink",D['ink'],D['brand50_light_leak'],4.5),
]
for theme,name,fg,bg,need in rows:
    r=cr(fg,bg); print(f"{'PASS' if r>=need else 'FAIL'}  [{theme}] {name}: {r:.2f}:1 (need {need})")
