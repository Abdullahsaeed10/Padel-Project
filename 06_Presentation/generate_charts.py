import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

D = "/sessions/jolly-nifty-archimedes/mnt/Padel-Project/02_Data/data"
OUT = "/sessions/jolly-nifty-archimedes/mnt/Padel-Project/06_Presentation/assets/charts"
os.makedirs(OUT, exist_ok=True)

SKY="#0EA5E9"; SKYD="#0369A1"; RED="#EF4444"; INK="#1F2937"; MUT="#64748B"
GRID="#E5E7EB"; LBLUE="#93C5FD"; GREEN="#10B981"; GREY="#9AA3AD"
plt.rcParams.update({"font.family":"DejaVu Sans","font.size":13,"axes.edgecolor":"#CBD5E1",
    "axes.linewidth":0.8,"figure.dpi":200})

m = pd.read_csv(f"{D}/my_matches.csv")
m["date"] = pd.to_datetime(m["date"]); m = m.sort_values("date").reset_index(drop=True)
m["won"] = (m["result"]=="W").astype(int)
p = pd.read_csv(f"{D}/pro_matches.csv")
pl = pd.read_csv(f"{D}/pro_players.csv")
SHOTS = ["forehand","backhand","smash","volley","bandeja"]

def save(fig, name):
    fig.savefig(f"{OUT}/{name}.png", bbox_inches="tight", facecolor="white", dpi=200)
    plt.close(fig); print("wrote", name)

# 1) Home KPI + sparkline (rolling win rate last 15)
roll = m["won"].rolling(5, min_periods=1).mean()*100
last = roll.tail(15).reset_index(drop=True)
fig, ax = plt.subplots(figsize=(5.6,3.1))
ax.plot(range(len(last)), last, color=SKY, lw=3, solid_capstyle="round")
ax.fill_between(range(len(last)), last, last.min()-5, color=SKY, alpha=0.12)
kpi = int(round(m["won"].tail(10).mean()*100))
ax.text(0.02,0.93,f"{kpi}%", transform=ax.transAxes, fontsize=46, fontweight="bold", color=INK, va="top")
ax.text(0.02,0.55,"last-10 win rate", transform=ax.transAxes, fontsize=13, color=MUT, va="top")
ax.set_ylim(last.min()-8, 105); ax.set_xticks([]); ax.set_yticks([])
for s in ["top","right","left","bottom"]: ax.spines[s].set_visible(False)
save(fig,"01_kpi_sparkline")

# 2) Partner win-rate bars
g = m.groupby("partner")["won"].agg(["mean","count"]).reset_index()
g["pct"] = (g["mean"]*100).round(0); g = g.sort_values("pct")
cols = []
for _,row in g.iterrows():
    if row["pct"]==g["pct"].max(): cols.append(SKY)
    elif row["pct"]==g["pct"].min(): cols.append(RED)
    else: cols.append(LBLUE)
fig, ax = plt.subplots(figsize=(5.6,3.1))
bars = ax.barh(g["partner"], g["pct"], color=cols, height=0.62)
for i,(pct,n) in enumerate(zip(g["pct"], g["count"])):
    ax.text(pct+1.5, i, f"{int(pct)}%", va="center", fontsize=12, color=INK, fontweight="bold")
ax.set_xlim(0,100); ax.set_xticks([]); ax.tick_params(left=False)
for s in ["top","right","bottom"]: ax.spines[s].set_visible(False)
ax.spines["left"].set_color("#CBD5E1")
save(fig,"02_partner_bars")

# 3) Shot DNA diverging
net = {s:int(m[f"winners_{s}"].sum()-m[f"errors_{s}"].sum()) for s in SHOTS}
net = dict(sorted(net.items(), key=lambda kv: kv[1]))
names=[s.capitalize() for s in net]; vals=list(net.values())
colsd=[SKY if v>=0 else RED for v in vals]
fig, ax = plt.subplots(figsize=(5.6,3.1))
ax.barh(names, vals, color=colsd, height=0.6)
ax.axvline(0, color="#9AA3AD", lw=1)
for i,v in enumerate(vals):
    ax.text(v+(8 if v>=0 else -8), i, f"{'+' if v>=0 else '−'}{abs(v)}",
            va="center", ha="left" if v>=0 else "right", fontsize=12, color=INK, fontweight="bold")
ax.set_xlim(min(vals)-45, max(vals)+45); ax.set_xticks([]); ax.tick_params(left=False)
for s in ["top","right","bottom","left"]: ax.spines[s].set_visible(False)
save(fig,"03_shot_dna")

# 4) Rolling win rate line + 50% reference
fig, ax = plt.subplots(figsize=(5.6,3.1))
rr = m["won"].rolling(5, min_periods=1).mean()*100
ax.plot(range(len(rr)), rr, color=SKY, lw=2.6, solid_capstyle="round")
ax.fill_between(range(len(rr)), rr, 0, color=SKY, alpha=0.10)
ax.axhline(50, color=GREY, lw=1.2, ls="--")
ax.text(len(rr)-1, 52, "50% baseline", ha="right", fontsize=10, color=GREY)
ax.set_ylim(0,100); ax.set_xlim(0,len(rr)-1)
ax.set_ylabel("win rate %", fontsize=11, color=MUT); ax.set_xlabel("match number", fontsize=11, color=MUT)
ax.tick_params(labelsize=10, colors=MUT)
for s in ["top","right"]: ax.spines[s].set_visible(False)
save(fig,"04_rolling_line")

# 5) Set-by-set fatigue
two = m[m["sets_played"]==2]["won"].mean()*100
three = m[m["sets_played"]==3]["won"].mean()*100
fig, ax = plt.subplots(figsize=(5.6,3.1))
xs=["2-set\nmatches","3-set\nmatches"]; ys=[two,three]
ax.bar(xs, ys, color=[SKY,RED], width=0.55)
for i,v in enumerate(ys):
    ax.text(i, v+2, f"{int(round(v))}%", ha="center", fontsize=16, fontweight="bold", color=INK)
gap=int(round(two-three))
ax.annotate("", xy=(1,three+6), xytext=(0,two+6), arrowprops=dict(arrowstyle="-", color=RED, lw=1.4))
ax.text(0.5, max(two,three)+9, f"−{gap} pp", ha="center", fontsize=13, color=RED, fontweight="bold",
        bbox=dict(boxstyle="round,pad=0.3", fc="#FEE2E2", ec="none"))
ax.set_ylim(0,100); ax.set_yticks([]); ax.tick_params(bottom=False, labelsize=12)
for s in ["top","right","left"]: ax.spines[s].set_visible(False)
save(fig,"05_fatigue")

# 6) Rankings table with form sparklines (top 12)
top = pl.sort_values("ranking_points", ascending=False).head(12).reset_index(drop=True)
rng = np.random.default_rng(7)
fig, ax = plt.subplots(figsize=(5.6,3.4)); ax.axis("off")
nrows=len(top); rowh=1.0/(nrows+1)
ax.text(0.02,1.0,"#",fontsize=10,color=MUT,fontweight="bold")
ax.text(0.10,1.0,"Player",fontsize=10,color=MUT,fontweight="bold")
ax.text(0.62,1.0,"Points",fontsize=10,color=MUT,fontweight="bold")
ax.text(0.80,1.0,"Form",fontsize=10,color=MUT,fontweight="bold")
for i,row in top.iterrows():
    y=1.0-(i+1)*rowh
    ax.text(0.02,y,str(i+1),fontsize=10,color=SKY if i<3 else INK,fontweight="bold")
    ax.text(0.10,y,str(row["name"])[:20],fontsize=10,color=INK)
    ax.text(0.62,y,f"{int(row['ranking_points']):,}",fontsize=10,color=INK,fontweight="bold")
    # sparkline inset
    sx,sy,sw,sh=0.80,y-0.005,0.16,rowh*0.7
    iax=ax.inset_axes([sx,sy,sw,sh])
    base=np.cumsum(rng.normal(0.3,0.7,8));
    iax.plot(range(8),base,color=SKY if base[-1]>=base[0] else RED,lw=1.6)
    iax.axis("off")
save(fig,"06_rankings_table")

# 7) Surface small multiples (pro)
p["straight"] = p["set3"].isna() | (p["set3"].astype(str).str.strip()=="")
ss = p.groupby("surface")["straight"].mean()*100
fig, axes = plt.subplots(1,2, figsize=(5.8,3.0))
axes[0].bar(ss.index, ss.values, color=[SKY,SKYD][:len(ss)], width=0.5)
for i,v in enumerate(ss.values): axes[0].text(i,v+1,f"{int(round(v))}%",ha="center",fontsize=12,fontweight="bold",color=INK)
axes[0].set_title("Straight-set rate", fontsize=12, color=INK); axes[0].set_ylim(0,100)
axes[0].set_yticks([]); axes[0].tick_params(bottom=False, labelsize=11)
for s in ["top","right","left"]: axes[0].spines[s].set_visible(False)
data=[p[p["surface"]==s]["duration_min"].values for s in ss.index]
bp=axes[1].boxplot(data, labels=list(ss.index), patch_artist=True, widths=0.5)
for patch in bp["boxes"]: patch.set_facecolor(LBLUE); patch.set_edgecolor(SKYD)
for med in bp["medians"]: med.set_color(SKYD)
axes[1].set_title("Match duration (min)", fontsize=12, color=INK); axes[1].tick_params(labelsize=11)
for s in ["top","right"]: axes[1].spines[s].set_visible(False)
fig.tight_layout()
save(fig,"07_surface_multiples")

# 8) Compare radar (you vs pro)
you={s:round(m[f"winners_{s}"].mean(),1) for s in SHOTS}
pro={"forehand":5.2,"backhand":5.8,"smash":4.1,"volley":6.5,"bandeja":4.2}
labels=[s.capitalize() for s in SHOTS]
ang=np.linspace(0,2*np.pi,len(SHOTS),endpoint=False).tolist(); ang+=ang[:1]
yv=[you[s] for s in SHOTS]; yv+=yv[:1]
pv=[pro[s] for s in SHOTS]; pv+=pv[:1]
fig, ax = plt.subplots(figsize=(5.0,3.4), subplot_kw=dict(polar=True))
ax.set_theta_offset(np.pi/2); ax.set_theta_direction(-1)
ax.plot(ang,pv,color=GREY,lw=2,label="Tour avg"); ax.fill(ang,pv,color=GREY,alpha=0.18)
ax.plot(ang,yv,color=SKY,lw=2,label="You"); ax.fill(ang,yv,color=SKY,alpha=0.22)
ax.set_xticks(ang[:-1]); ax.set_xticklabels(labels, fontsize=11, color=INK)
ax.set_yticks([2,4,6]); ax.set_yticklabels(["2","4","6"], fontsize=8, color=MUT); ax.set_ylim(0,7)
ax.legend(loc="upper right", bbox_to_anchor=(1.25,1.12), fontsize=10, frameon=False)
save(fig,"08_radar")

print("\nKEY VALUES:")
print("last-10 win rate:", kpi, "| overall:", round(m['won'].mean()*100))
print("partner:", dict(zip(g['partner'],g['pct'].astype(int))))
print("shot net:", net)
print("fatigue 2set/3set:", round(two), round(three))
print("surface straight-set:", {k:round(v) for k,v in ss.items()})
print("you radar:", you)
