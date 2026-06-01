# Skill: 日次設備解析 グラフ生成

## 概要

日次設備データから、以下の4種類のグラフを生成するPythonスクリプト集。  
レポート構成・分析ルール・テンプレートは `daily_equipment_analysis_skill.md` を参照すること。

---

## 共通設定

```python
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import matplotlib.dates as mdates
import matplotlib.font_manager as fm
import subprocess

def detect_japanese_font() -> list[str]:
    """
    実行環境で利用可能な日本語フォントを動的に検出して返す。
    見つかった順に優先度が高い。見つからない場合は空リストを返す。

    対応フォント（優先順）：
      - IPAGothic / IPAexGothic（Linux標準日本語フォント）
      - Noto Sans CJK JP（Google Notoフォント）
      - Yu Gothic / Meiryo（Windows環境）
      - Hiragino Sans / Hiragino Kaku Gothic ProN（macOS環境）
    """
    candidates = [
        "IPAGothic", "IPAexGothic",
        "Noto Sans CJK JP", "Noto Sans JP",
        "Yu Gothic", "Meiryo",
        "Hiragino Sans", "Hiragino Kaku Gothic ProN",
    ]
    available = {f.name for f in fm.fontManager.ttflist}
    found = [f for f in candidates if f in available]

    if not found:
        # fc-list でシステムフォントを直接検索（Linux）
        try:
            result = subprocess.run(
                ["fc-list", ":lang=ja", "--format=%{family}\n"],
                capture_output=True, text=True, timeout=5
            )
            fc_fonts = {line.strip().split(",")[0] for line in result.stdout.splitlines() if line.strip()}
            found = [f for f in candidates if f in fc_fonts]
        except Exception:
            pass

    return found

# --- フォント設定（日本語） ---
_ja_fonts = detect_japanese_font()
if not _ja_fonts:
    import warnings
    warnings.warn(
        "日本語フォントが見つかりませんでした。グラフの日本語ラベルが□になる可能性があります。"
        "IPAフォント（fonts-ipafont）またはNoto CJKフォント（fonts-noto-cjk）を"
        "インストールしてください。\n"
        "  Ubuntu/Debian: sudo apt-get install -y fonts-ipafont fonts-noto-cjk\n"
        "  pip環境:       pip install japanize-matplotlib",
        UserWarning, stacklevel=1
    )

plt.rcParams["font.family"] = _ja_fonts + ["DejaVu Sans", "sans-serif"]
plt.rcParams["axes.unicode_minus"] = False
```

> **日本語フォントが□になる場合のインストール手順**
>
> | 環境 | コマンド |
> |---|---|
> | Ubuntu / Debian | `sudo apt-get install -y fonts-ipafont fonts-noto-cjk` |
> | pip（仮想環境など） | `pip install japanize-matplotlib` |
> | Windows | MS GothicまたはYu Gothicが標準搭載のため通常不要 |
> | macOS | Hiraginoフォントが標準搭載のため通常不要 |
>
> インストール後、matplotlibのフォントキャッシュを再構築する：
> ```python
> import matplotlib.font_manager as fm
> fm._load_fontmanager(try_read_cache=False)
> ```

### 共通ユーティリティ関数

```python
def find_col(df, candidates, required=True):
    """カラム名の揺れを吸収して対象カラムを返す"""
    normalized = {str(c).strip().lower(): c for c in df.columns}
    for cand in candidates:
        key = cand.strip().lower()
        if key in normalized:
            return normalized[key]
    for c in df.columns:
        c_str = str(c).strip().lower()
        for cand in candidates:
            if cand.strip().lower() in c_str:
                return c
    if required:
        raise KeyError(f"対象カラムが見つかりません: {candidates}")
    return None

def to_datetime_col(df, candidates):
    col = find_col(df, candidates)
    s = pd.to_datetime(df[col], errors="coerce")
    if s.isna().all():
        raise ValueError(f"日時変換できる列がありません: {candidates}")
    return s
```

---

## 稼働分類マッピング

RTMSの `efficiency_data` コネクタが送信する `status_name` と `group` の対応表。  
`group` カラムが存在する場合はそのまま使用し、`status_name` のみの場合は `classify_operation()` でグループに変換する。

| status_name | group（グループ） |
|---|---|
| 稼働 | 操業時間 |
| 速度低下 | 性能ロス時間 |
| チョコ停 | 性能ロス時間 |
| 故障 | 停止ロス時間 |
| 段取り・調整 | 停止ロス時間 |
| 立上り | 停止ロス時間 |
| 前干渉 | 停止ロス時間 |
| 後干渉 | 停止ロス時間 |
| 計画停止中 | 計画停止時間 |
| 休憩時間 | 計画停止時間 |
| 停止中 | 停止ロス時間 ※区間補完で自動付与 |

```python
# status_name → group の完全一致マップ
_CLASSIFICATION_MAP = {
    "稼働":       "操業時間",
    "速度低下":   "性能ロス時間",
    "チョコ停":   "性能ロス時間",
    "故障":       "停止ロス時間",
    "段取り・調整": "停止ロス時間",
    "立上り":     "停止ロス時間",
    "前干渉":     "停止ロス時間",
    "後干渉":     "停止ロス時間",
    "計画停止中": "計画停止時間",
    "休憩時間":   "計画停止時間",
    "停止中":     "停止ロス時間",   # RTMS が区間補完で自動付与
}

def classify_operation(label: str) -> str:
    """
    status_name からグループを返す。
    マップに存在しない値は「停止ロス時間」として扱う。
    """
    return _CLASSIFICATION_MAP.get(str(label).strip(), "停止ロス時間")
```

---

## Chart 1：30分別 生産推移とアラーム件数

### レイアウト仕様

| 要素 | 仕様 |
|---|---|
| グラフ種別 | 棒グラフ（良品数・不良数積み上げ）＋散布図（アラーム丸マーカー） |
| X軸 | 時刻（30分単位、00:00〜翌00:00） |
| 左Y軸 | 生産数（個/30分）― 良品数：青棒、不良数：赤積み上げ |
| 右Y軸 | アラーム件数 ― オレンジ丸マーカー、件数>0のみ表示 |
| KPIテキスト | 左上に「良品 X,XXX / 不良 X / 歩留 XX.XXX%」枠付きで表示 |
| ゼロ生産帯 | 連続ゼロ開始時刻に破線縦線＋「HH:MM以降 生産0」注記 |
| figsize | (14, 6) |

### Pythonスクリプト

```python
from pathlib import Path

OUTPUT_PATH = Path("production_alarm_trend.png")

def build_chart1(production_df, alarm_df, target_date, equipment_name="設備名"):
    prod = production_df.copy()
    alm  = alarm_df.copy()

    prod["_time"] = to_datetime_col(
        prod, ["started_at", "timestamp", "datetime", "時刻", "日時", "記録時刻"]
    )
    good_col = find_col(prod, ["good_qty", "良品数", "good_count", "ok数"])
    ng_col   = find_col(prod, ["ng_qty", "不良数", "ng_count"], required=False)

    prod["_good"] = pd.to_numeric(prod[good_col], errors="coerce").fillna(0)
    prod["_ng"]   = pd.to_numeric(prod[ng_col],   errors="coerce").fillna(0) if ng_col else 0
    prod = prod.dropna(subset=["_time"])

    base_idx = pd.date_range(f"{target_date} 00:00", periods=48, freq="30min")
    good_30  = prod.set_index("_time")["_good"].resample("30min").sum().reindex(base_idx, fill_value=0)
    ng_30    = prod.set_index("_time")["_ng"].resample("30min").sum().reindex(base_idx, fill_value=0)

    alm["_time"] = to_datetime_col(
        alm, ["started_at", "alarm_time", "timestamp", "datetime", "発生時刻"]
    )
    alm = alm.dropna(subset=["_time"])
    alm_30 = (
        pd.Series(1, index=alm["_time"])
        .resample("30min").sum()
        .reindex(base_idx, fill_value=0)
    )

    total_good = int(good_30.sum())
    total_ng   = int(ng_30.sum())
    total_prod = total_good + total_ng
    yield_pct  = total_good / total_prod * 100 if total_prod > 0 else 0

    # ゼロ生産帯開始検出
    prod_arr   = (good_30 + ng_30).values
    zero_start = None
    for i in range(len(prod_arr)):
        if prod_arr[i] == 0 and all(v == 0 for v in prod_arr[i:]):
            zero_start = base_idx[i]
            break

    fig, ax1 = plt.subplots(figsize=(14, 6))
    bar_w = pd.Timedelta("25min")

    ax1.bar(base_idx, good_30.values, width=bar_w,
            color="#4c78a8", alpha=0.9, label="良品数", zorder=3)
    ax1.bar(base_idx, ng_30.values, width=bar_w,
            bottom=good_30.values, color="#e45756", alpha=0.9,
            label="不良数", zorder=3)

    ax1.set_xlabel("時刻", fontsize=11)
    ax1.set_ylabel("生産数（個/30分）", fontsize=11)
    ax1.set_ylim(bottom=0, top=360)
    ax1.grid(True, axis="y", alpha=0.3, zorder=0)
    ax1.tick_params(axis="x", rotation=45)
    ax1.xaxis.set_major_locator(mdates.HourLocator(interval=1))
    ax1.xaxis.set_major_formatter(mdates.DateFormatter("%H:%M"))

    ax2 = ax1.twinx()
    nonzero_mask = alm_30.values > 0
    if nonzero_mask.any():
        ax2.scatter(
            base_idx[nonzero_mask], alm_30.values[nonzero_mask],
            color="#f58518", s=130, zorder=5, label="アラーム件数/30分"
        )
        for t, v in zip(base_idx[nonzero_mask], alm_30.values[nonzero_mask]):
            ax2.annotate(
                str(int(v)), (t, v),
                textcoords="offset points", xytext=(0, 7),
                ha="center", fontsize=9, color="#f58518", fontweight="bold"
            )
    ax2.set_ylabel("アラーム件数", fontsize=11, color="#f58518")
    ax2.tick_params(axis="y", labelcolor="#f58518")
    ax2.set_ylim(0, 8)

    if zero_start is not None:
        ax1.axvline(zero_start, color="gray", linestyle="--", linewidth=1.4, zorder=4)
        ax1.text(
            zero_start + pd.Timedelta("12min"), 310,
            f"{zero_start.strftime('%H:%M')}以降 生産0",
            fontsize=9, color="gray"
        )

    kpi_text = f"良品 {total_good:,} / 不良 {total_ng} / 歩留 {yield_pct:.3f}%"
    ax1.text(
        0.01, 0.97, kpi_text,
        transform=ax1.transAxes, fontsize=10, va="top",
        bbox=dict(boxstyle="round,pad=0.4", facecolor="white",
                  edgecolor="gray", alpha=0.9)
    )

    ax1.set_title(
        f"{equipment_name}：30分別 生産推移とアラーム件数（{target_date}）",
        fontsize=13, pad=10
    )
    h1, l1 = ax1.get_legend_handles_labels()
    h2, l2 = ax2.get_legend_handles_labels()
    ax1.legend(h1 + h2, l1 + l2, loc="upper right", fontsize=9)

    plt.tight_layout()
    plt.savefig(OUTPUT_PATH, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"saved: {OUTPUT_PATH}")

if __name__ == "__main__":
    # production_df, alarm_df が事前に読み込まれている前提
    build_chart1(production_df, alarm_df, target_date="YYYY-MM-DD", equipment_name="設備名")
```

---

## Chart 2：操業・ロス時間構成

### レイアウト仕様

| 要素 | 仕様 |
|---|---|
| グラフ種別 | ドーナツ（左）＋横棒グラフ（右）の2パネル |
| ドーナツ中央 | 「合計\nXXX.X分」を表示 |
| ドーナツ凡例 | 区分名・分数・割合(%)を下部に表示 |
| 横棒右端 | 「XXX.X分 / XX.X% / XX件」を表示 |
| 色定義 | 操業時間：緑(#2ca02c) / 性能ロス：赤(#d62728) / 停止ロス：黄(#f4d03f) / 計画停止：青(#4c78a8) |
| figsize | (12, 6) |

### Pythonスクリプト

```python
from pathlib import Path

OUTPUT_PATH = Path("operation_composition.png")

GROUP_COLORS = {
    "操業時間":   "#2ca02c",
    "性能ロス時間": "#d62728",
    "停止ロス時間": "#f4d03f",
    "計画停止時間": "#4c78a8",
}
GROUP_ORDER = ["操業時間", "性能ロス時間", "停止ロス時間", "計画停止時間"]

def build_chart2(operation_df, target_date, equipment_name="設備名"):
    op = operation_df.copy()

    group_col    = find_col(op, ["group", "グループ"], required=False)
    class_col    = find_col(op, ["status_name", "稼働分類", "分類", "operation_type"])
    duration_col = find_col(op, ["継続時間", "duration", "duration_min", "分"], required=False)

    if duration_col is not None:
        op["_dur_min"] = pd.to_numeric(op[duration_col], errors="coerce")
    else:
        start_col = find_col(op, ["started_at", "開始時刻", "start_time"])
        end_col   = find_col(op, ["ended_at",   "終了時刻", "end_time"])
        start = pd.to_datetime(op[start_col], errors="coerce")
        end   = pd.to_datetime(op[end_col],   errors="coerce")
        op["_dur_min"] = (end - start).dt.total_seconds() / 60

    op["_dur_min"] = op["_dur_min"].fillna(0).clip(lower=0)

    # group カラムが存在すればそのまま使う、なければ status_name から変換
    if group_col is not None:
        op["_group"] = op[group_col].astype(str).str.strip()
    else:
        op["_group"] = op[class_col].map(classify_operation)

    grp = op.groupby("_group").agg(
        dur_min=("_dur_min", "sum"),
        event_count=("_dur_min", "count")
    ).reindex(GROUP_ORDER, fill_value=0)

    total_min  = grp["dur_min"].sum()
    grp["pct"] = grp["dur_min"] / total_min * 100

    fig, (ax_donut, ax_bar) = plt.subplots(1, 2, figsize=(12, 6))
    fig.suptitle(
        f"{equipment_name}：操業・ロス時間構成（{target_date}）",
        fontsize=13, y=1.01
    )

    # ---- ドーナツ ----
    active        = grp[grp["dur_min"] > 0].sort_values("dur_min", ascending=False)
    colors_active = [GROUP_COLORS[k] for k in active.index]
    wedges, _     = ax_donut.pie(
        active["dur_min"], colors=colors_active,
        startangle=90, counterclock=False,
        wedgeprops=dict(width=0.5, edgecolor="white")
    )
    ax_donut.text(0, 0, f"合計\n{total_min:.1f}分",
                  ha="center", va="center", fontsize=14, fontweight="bold")
    legend_labels = [
        f"{k}\n{v:.1f}分 ({p:.1f}%)"
        for k, v, p in zip(active.index, active["dur_min"], active["pct"])
    ]
    ax_donut.legend(wedges, legend_labels, loc="lower center",
                    bbox_to_anchor=(0.5, -0.22), ncol=1, fontsize=9, frameon=False)
    ax_donut.set_title("時間構成", fontsize=11, pad=8)

    # ---- 横棒 ----
    active_bar = grp[grp["dur_min"] > 0]
    bar_colors = [GROUP_COLORS[k] for k in active_bar.index]
    bars = ax_bar.barh(
        active_bar.index, active_bar["dur_min"],
        color=bar_colors, alpha=0.9, edgecolor="white", height=0.5
    )
    for bar, (idx, row) in zip(bars, active_bar.iterrows()):
        label = f"{row['dur_min']:.1f}分 / {row['pct']:.1f}% / {int(row['event_count'])}件"
        ax_bar.text(
            bar.get_width() + total_min * 0.015,
            bar.get_y() + bar.get_height() / 2,
            label, va="center", fontsize=9
        )
    ax_bar.set_xlabel("分", fontsize=10)
    ax_bar.set_title("区分別 時間・件数", fontsize=11, pad=8)
    ax_bar.grid(True, axis="x", alpha=0.3)
    ax_bar.set_xlim(right=total_min * 1.40)
    ax_bar.invert_yaxis()

    plt.tight_layout()
    plt.savefig(OUTPUT_PATH, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"saved: {OUTPUT_PATH}")

if __name__ == "__main__":
    # operation_df が事前に読み込まれている前提
    build_chart2(operation_df, target_date="YYYY-MM-DD", equipment_name="設備名")
```

---

## Chart 3：アラーム Pareto

### レイアウト仕様

| 要素 | 仕様 |
|---|---|
| グラフ種別 | 棒グラフ（件数）＋折れ線（累積比率） |
| 棒色 | オレンジ (#f58518)、白枠線 (edgecolor="white") |
| 棒幅 | BAR_W = 1.0（隙間なし） |
| X軸ラベル | **No.1, No.2, ...（番号のみ）** |
| 棒の上 | 「X件\nYYY秒」を clip_on=False で表示 |
| 累積折れ線 | **左Y軸に描画**（Y値 = 累積件数）、原点(0,0)から開始、**各棒の右端**に点を配置 |
| 右Y軸 | 累積比率(%)の目盛りのみ表示（0/20/40/60/80/100%固定）、上限 = total件 = 100% |
| 80%ライン | 破線で表示 |
| 折れ線色 | 紺 (#4c78a8)、丸マーカー |
| 参照テーブル | グラフ下部に配置（No. / アラームNo / アラーム名 / 件数 / 継続秒数）。ヘッダー背景 #4c78a8、偶数行に薄い帯色 |
| figsize | (14, 6 + テーブル高さ)（アラーム件数に応じて動的に調整） |

> **重要：**
> - 折れ線は**右Y軸ではなく左Y軸**に描画し、Y値に累積件数を使う
> - `ax1.set_ylim(0, total)` と `ax2.set_ylim(0, total)` を揃えることで、右Y軸の100%が最終点と一致する
> - 棒ラベル・累積ラベルは `clip_on=False` / `annotation_clip=False` で ylim 外に表示する
> - X軸を番号化することでラベル重なりを解消し、参照テーブルで詳細を確認できる

### Pythonスクリプト

```python
from pathlib import Path

OUTPUT_PATH = Path("alarm_pareto.png")

def build_chart3(alarm_df, target_date, equipment_name="設備名"):
    alm = alarm_df.copy()

    code_col  = find_col(alm, ["alarm_no",   "アラーム番号", "alarm_code"],  required=False)
    name_col  = find_col(alm, ["alarm_name", "アラーム名称", "message"],     required=False)
    start_col = find_col(alm, ["started_at", "発生時刻", "alarm_time"])
    end_col   = find_col(alm, ["ended_at",   "復旧時刻", "end_time"],        required=False)

    alm["_started_at"] = pd.to_datetime(alm[start_col], errors="coerce")
    if end_col:
        alm["_ended_at"] = pd.to_datetime(alm[end_col], errors="coerce")
        alm["_dur_sec"]  = (alm["_ended_at"] - alm["_started_at"]).dt.total_seconds().clip(lower=0)
    else:
        alm["_dur_sec"] = 0

    if code_col and name_col:
        alm["_key"]   = alm[code_col].astype(str)
        alm["_label"] = alm[name_col].astype(str)
    elif name_col:
        alm["_key"]   = alm[name_col].astype(str)
        alm["_label"] = alm[name_col].astype(str)
    elif code_col:
        alm["_key"]   = alm[code_col].astype(str)
        alm["_label"] = alm[code_col].astype(str)
    else:
        raise KeyError("アラーム番号またはアラーム名称の列が必要です。")

    summary = (
        alm.groupby(["_key", "_label"])
        .agg(count=("_key", "count"), dur_sec=("_dur_sec", "sum"))
        .reset_index()
        .sort_values("count", ascending=False)
        .reset_index(drop=True)
    )

    n          = len(summary)
    total      = summary["count"].sum()
    cum_counts = summary["count"].cumsum().values
    cum_pcts   = cum_counts / total * 100

    # X軸は番号のみ（ラベル重なりを防ぐ）
    x_labels = [f"No.{i + 1}" for i in range(n)]
    x_pos    = list(range(n))
    BAR_W    = 1.0

    # グラフ(上)＋参照テーブル(下) の2段レイアウト
    tbl_height = max(1.5, n * 0.28)
    fig = plt.figure(figsize=(14, 6 + tbl_height))
    gs  = fig.add_gridspec(2, 1, height_ratios=[6, tbl_height], hspace=0.5)
    ax1 = fig.add_subplot(gs[0])

    bars = ax1.bar(x_pos, summary["count"], width=BAR_W,
                   color="#f58518", alpha=0.9, zorder=3,
                   edgecolor="white", linewidth=0.8,
                   align="center")
    ax1.set_ylabel("件数", fontsize=11)
    ax1.set_xlabel("アラーム", fontsize=11)
    ax1.set_title(
        f"{equipment_name}：アラームPareto（件数＋継続秒数）（{target_date} JST）",
        fontsize=13, pad=10
    )
    ax1.set_xticks(x_pos)
    ax1.set_xticklabels(x_labels, fontsize=10)
    ax1.grid(True, axis="y", alpha=0.3, zorder=0)
    ax1.set_ylim(0, total)

    for bar, cnt, sec in zip(bars, summary["count"], summary["dur_sec"]):
        ax1.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + total * 0.02,
            f"{int(cnt)}件\n{int(sec)}秒",
            ha="center", va="bottom", fontsize=9, fontweight="bold",
            clip_on=False
        )

    cum_x = [-BAR_W/2] + [i + BAR_W/2 for i in range(n)]
    cum_y = [0]        + list(cum_counts)

    ax1.plot(cum_x, cum_y, color="#4c78a8", marker="o",
             linewidth=2, markersize=7, zorder=5)

    ax2 = ax1.twinx()
    ax2.set_ylim(0, total)
    pct_ticks = [0, 20, 40, 60, 80, 100]
    ax2.set_yticks([total * p / 100 for p in pct_ticks])
    ax2.set_yticklabels([f"{p}%" for p in pct_ticks])
    ax2.set_ylabel("累積比率（%）", fontsize=11, color="#4c78a8")
    ax2.tick_params(axis="y", labelcolor="#4c78a8")

    y80 = total * 0.80
    ax1.axhline(y80, color="#4c78a8", linestyle="--", alpha=0.4, linewidth=1.2)
    ax1.text(n - 1 + BAR_W/2 - 0.05, y80 + total * 0.01, "80%",
             fontsize=9, color="#4c78a8", alpha=0.8)

    for cx, cy, pct in zip(cum_x[1:], cum_y[1:], cum_pcts):
        ax1.annotate(
            f"{pct:.1f}%", (cx, cy),
            textcoords="offset points", xytext=(0, 8),
            ha="center", fontsize=9, color="#4c78a8",
            annotation_clip=False
        )

    ax1.set_xlim(-BAR_W/2, n - 1 + BAR_W/2)
    ax2.set_xlim(-BAR_W/2, n - 1 + BAR_W/2)

    # ── 参照テーブル ──
    ax_tbl = fig.add_subplot(gs[1])
    ax_tbl.axis("off")

    col_labels = ["No.", "アラームNo", "アラーム名", "件数", "継続秒数"]
    rows = [
        [
            f"No.{i + 1}",
            row["_key"],
            row["_label"],
            int(row["count"]),
            int(row["dur_sec"]),
        ]
        for i, (_, row) in enumerate(summary.iterrows())
    ]

    tbl = ax_tbl.table(
        cellText=rows,
        colLabels=col_labels,
        cellLoc="center",
        bbox=[0.0, 0.0, 1.0, 1.0],
    )
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(8)
    tbl.auto_set_column_width([0, 1, 2, 3, 4])

    # ヘッダー行スタイル
    for col_idx in range(len(col_labels)):
        cell = tbl[0, col_idx]
        cell.set_facecolor("#4c78a8")
        cell.get_text().set_color("white")
        cell.get_text().set_fontweight("bold")

    # データ行スタイル（偶数行に薄い帯）
    for row_idx in range(1, len(rows) + 1):
        bg = "#f0f4f8" if row_idx % 2 == 0 else "white"
        for col_idx in range(len(col_labels)):
            tbl[row_idx, col_idx].set_facecolor(bg)
        # アラーム名列（col_idx=2）は左寄せ
        tbl[row_idx, 2].get_text().set_ha("left")

    plt.savefig(OUTPUT_PATH, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"saved: {OUTPUT_PATH}")

if __name__ == "__main__":
    # alarm_df が事前に読み込まれている前提
    build_chart3(alarm_df, target_date="YYYY-MM-DD", equipment_name="設備名")
```

---

## Chart 4：OEE・可動率 ダッシュボード

### レイアウト仕様

| 要素 | 仕様 |
|---|---|
| グラフ種別 | 2パネル（左：時間ロスツリー / 右：OEEコンポーネント棒）|
| 左パネル | 3段の積み上げ横棒。総時間→計画稼働時間→正味稼働時間の順にロス要因を可視化 |
| 右パネル | 可動率・性能率・品質率・OEE の水平バー。85%基準線付き |
| 色定義 | 操業時間：緑(#2ca02c) / 性能ロス：赤(#d62728) / 停止ロス：黄(#f4d03f) / 計画停止：青(#4c78a8) |
| 性能率未提供 | 右パネルに「算出不可（基準CT未提供）」と注記 |
| figsize | (14, 6) |

### 引数

| 引数 | 型 | 説明 |
|---|---|---|
| `operation_df` | DataFrame | 稼働分類ログ（`group` または `status_name` + 時刻列） |
| `production_df` | DataFrame | 生産実績（`good_qty`, `ng_qty` + 時刻列） |
| `target_date` | str | 対象日付 "YYYY-MM-DD" |
| `equipment_name` | str | 設備名（グラフタイトルに使用） |
| `standard_cycle_time_sec` | float \| None | 基準サイクルタイム（秒）。None の場合は性能率・OEE を算出不可とする |

### Pythonスクリプト

```python
from pathlib import Path

OUTPUT_PATH = Path("oee_availability_dashboard.png")

def build_chart4(operation_df, production_df, target_date, equipment_name="設備名",
                 standard_cycle_time_sec=None):
    op   = operation_df.copy()
    prod = production_df.copy()

    # --- 時間集計 ---
    group_col = find_col(op, ["group", "グループ"], required=False)
    class_col = find_col(op, ["status_name", "稼働分類", "分類", "operation_type"])

    start_col = find_col(op, ["started_at", "開始時刻", "start_time"])
    end_col   = find_col(op, ["ended_at",   "終了時刻", "end_time"])
    dur_col   = find_col(op, ["継続時間", "duration", "duration_min"], required=False)

    if dur_col is not None:
        op["_dur_min"] = pd.to_numeric(op[dur_col], errors="coerce")
    else:
        s = pd.to_datetime(op[start_col], errors="coerce")
        e = pd.to_datetime(op[end_col],   errors="coerce")
        op["_dur_min"] = (e - s).dt.total_seconds() / 60

    op["_dur_min"] = op["_dur_min"].fillna(0).clip(lower=0)

    # group カラムが存在すればそのまま使う、なければ status_name から変換
    if group_col is not None:
        op["_group"] = op[group_col].astype(str).str.strip()
    else:
        op["_group"] = op[class_col].map(classify_operation)

    dur = op.groupby("_group")["_dur_min"].sum()
    t_op          = dur.get("操業時間",   0.0)
    t_perf        = dur.get("性能ロス時間", 0.0)
    t_stop        = dur.get("停止ロス時間", 0.0)
    t_planned_stp = dur.get("計画停止時間", 0.0)

    t_total   = t_op + t_perf + t_stop + t_planned_stp  # 総時間
    t_planned = t_op + t_perf + t_stop                  # 計画稼働時間
    t_net     = t_op + t_perf                            # 正味稼働時間

    # --- 生産集計 ---
    good_col = find_col(prod, ["good_qty", "良品数", "good_count", "ok数"])
    ng_col   = find_col(prod, ["ng_qty", "不良数", "ng_count"], required=False)
    total_good = pd.to_numeric(prod[good_col], errors="coerce").fillna(0).sum()
    total_ng   = pd.to_numeric(prod[ng_col],   errors="coerce").fillna(0).sum() if ng_col else 0
    total_prod = total_good + total_ng

    # --- KPI算出 ---
    availability = (t_net / t_planned * 100)        if t_planned > 0 else None
    quality      = (total_good / total_prod * 100)  if total_prod > 0 else None

    if standard_cycle_time_sec is not None and t_net > 0:
        performance = min((total_prod * standard_cycle_time_sec / 60) / t_net * 100, 100.0)
    else:
        performance = None

    oee = (availability * performance * quality / 10000
           if None not in (availability, performance, quality) else None)

    # 30分別可動率の算出（操業DFのstart/end時刻を使用）
    op["_start"] = pd.to_datetime(op[start_col], errors="coerce")
    op["_end"]   = pd.to_datetime(op[end_col],   errors="coerce")
    op_time = op.dropna(subset=["_start", "_end"]).copy()

    day_start   = pd.Timestamp(target_date)
    avail_hours = []
    avail_vals  = []
    for i in range(48):
        slot_s = day_start + pd.Timedelta(minutes=30 * i)
        slot_e = slot_s + pd.Timedelta(minutes=30)
        planned_min  = 0.0
        stoploss_min = 0.0
        for _, row in op_time.iterrows():
            ov_s = max(row["_start"], slot_s)
            ov_e = min(row["_end"],   slot_e)
            if ov_e <= ov_s:
                continue
            ov_min = (ov_e - ov_s).total_seconds() / 60
            if row["_group"] == "計画停止時間":
                planned_min  += ov_min
            elif row["_group"] == "停止ロス時間":
                stoploss_min += ov_min
        plan_slot = 30.0 - planned_min
        if plan_slot >= 1.0:
            val = max(0.0, min(100.0, (plan_slot - stoploss_min) / plan_slot * 100))
            avail_vals.append(val)
        else:
            avail_vals.append(float("nan"))
        avail_hours.append(slot_s.hour + slot_s.minute / 60)

    # ========================
    # 描画（3パネル）
    # ========================
    fig = plt.figure(figsize=(14, 9))
    fig.suptitle(
        f"{equipment_name}：OEE・可動率 ダッシュボード（{target_date}）",
        fontsize=13, y=1.01
    )
    gs = fig.add_gridspec(2, 2,
                          width_ratios=[1, 1],
                          height_ratios=[1, 1],
                          hspace=0.50, wspace=0.32)
    ax_tree  = fig.add_subplot(gs[:, 0])   # 左: 全高（ロスツリー）
    ax_kpi   = fig.add_subplot(gs[0, 1])   # 右上: OEEコンポーネント
    ax_avail = fig.add_subplot(gs[1, 1])   # 右下: 30分別可動率

    # ---- 左パネル：時間損失ウォーターフォール ----
    # (y_pos, ラベル, 左端x, 幅, 色, is_loss)
    wf_rows = [
        (5.0, "総時間",       0,        t_total,       "#bbbbbb", False),
        (4.0, "  計画停止",   t_planned, t_planned_stp, "#4c78a8", True),
        (3.0, "計画稼働時間", 0,        t_planned,     "#888888", False),
        (2.0, "  停止ロス",   t_net,    t_stop,        "#f4d03f", True),
        (1.0, "  性能ロス",   t_op,     t_perf,        "#d62728", True),
        (0.0, "操業時間",     0,        t_op,          "#2ca02c", False),
    ]

    for y_pos, label, left_x, width, color, is_loss in wf_rows:
        h = 0.38 if is_loss else 0.55
        ax_tree.barh(y_pos, width, left=left_x, height=h,
                     color=color, alpha=0.82, edgecolor="white", linewidth=0.8)
        # 左ラベル
        ax_tree.text(-t_total * 0.02, y_pos, label,
                     ha="right", va="center",
                     fontsize=9 if is_loss else 10,
                     color="#555555" if is_loss else "#111111")
        # 右の数値（損失は "−XX分"、基準は "XX分"）
        sign = "−" if is_loss else ""
        ax_tree.text(left_x + width + t_total * 0.015, y_pos,
                     f"{sign}{width:.0f}分",
                     ha="left", va="center",
                     fontsize=9, color="#555555" if is_loss else "#111111")

    # カスケード接続の縦点線
    # t_planned: 総時間→計画停止→計画稼働 の折れ目
    # t_op     : 性能ロス→操業時間 の折れ目
    for x_val, y_lo, y_hi in [
        (t_planned, 2.70, 5.28),
        (t_op,      0.28, 1.70),
    ]:
        ax_tree.plot([x_val, x_val], [y_lo, y_hi],
                     color="#cccccc", linestyle="--", linewidth=0.9, zorder=0)

    ax_tree.set_xlim(-t_total * 0.40, t_total * 1.25)
    ax_tree.set_ylim(-0.5, 5.7)
    ax_tree.axis("off")
    ax_tree.set_title("時間損失ウォーターフォール", fontsize=11, pad=8)

    from matplotlib.patches import Patch
    legend_items = [
        Patch(facecolor="#2ca02c", label="操業時間"),
        Patch(facecolor="#d62728", label="性能ロス時間"),
        Patch(facecolor="#f4d03f", label="停止ロス時間"),
        Patch(facecolor="#4c78a8", label="計画停止時間"),
    ]
    ax_tree.legend(handles=legend_items, loc="lower center",
                   bbox_to_anchor=(0.5, -0.08), ncol=4, fontsize=8, frameon=False)

    # ---- 右上パネル：OEEコンポーネント水平バー ----
    kpi_items = [
        ("可動率",  availability, "#4e79a7"),
        ("性能率",  performance,  "#f28e2b"),
        ("品質率",  quality,      "#59a14f"),
        ("OEE",    oee,          "#e15759"),
    ]

    for i, (label, val, color) in enumerate(kpi_items):
        y = len(kpi_items) - 1 - i
        ax_kpi.text(-3, y, label, ha="right", va="center", fontsize=11)
        if val is not None:
            ax_kpi.barh(y, val, color=color, alpha=0.85, height=0.5, edgecolor="white")
            ax_kpi.text(val + 1, y, f"{val:.1f}%", va="center", fontsize=11, fontweight="bold")
        else:
            ax_kpi.barh(y, 0, color=color, alpha=0.2, height=0.5, edgecolor="white")
            ax_kpi.text(2, y, "算出不可", va="center", fontsize=10, color="gray", style="italic")

    # 85%基準線（世界クラス）
    ax_kpi.axvline(85, color="#2ca02c", linestyle="--", alpha=0.5, linewidth=1.4)
    ax_kpi.text(85.5, len(kpi_items) - 0.3, "85%\n(世界クラス)",
                fontsize=8, color="#2ca02c", alpha=0.8)

    ax_kpi.set_xlim(-20, 120)
    ax_kpi.set_ylim(-0.7, len(kpi_items))
    ax_kpi.set_xlabel("%", fontsize=10)
    ax_kpi.set_yticks([])
    ax_kpi.set_title("OEEコンポーネント", fontsize=11, pad=8)
    ax_kpi.grid(True, axis="x", alpha=0.3)

    if performance is None:
        ax_kpi.text(0.5, -0.18, "※ 性能率・OEEは基準CT未提供のため算出不可",
                    transform=ax_kpi.transAxes, fontsize=8, color="gray",
                    ha="center", style="italic")

    # ---- 右下パネル：30分別 可動率折れ線 ----
    import numpy as np
    avail_arr = np.array(avail_vals, dtype=float)
    ax_avail.plot(avail_hours, avail_arr,
                  color="#4e79a7", linewidth=1.5, marker="o", markersize=3,
                  label="30分別可動率")
    ax_avail.fill_between(avail_hours, avail_arr, alpha=0.12, color="#4e79a7")
    ax_avail.axhline(85, color="#2ca02c", linestyle="--",
                     alpha=0.6, linewidth=1.2, label="85%基準")
    if availability is not None:
        ax_avail.axhline(availability, color="#e15759", linestyle=":",
                         alpha=0.7, linewidth=1.2, label=f"日次平均 {availability:.1f}%")
    ax_avail.set_xlim(0, 24)
    ax_avail.set_ylim(-5, 110)
    ax_avail.set_xticks(range(0, 25, 2))
    ax_avail.set_xticklabels([f"{h:02d}:00" for h in range(0, 25, 2)],
                              fontsize=8, rotation=30, ha="right")
    ax_avail.set_ylabel("%", fontsize=9)
    ax_avail.set_title("30分別 可動率推移", fontsize=11, pad=8)
    ax_avail.grid(True, alpha=0.3)
    ax_avail.legend(fontsize=8, loc="lower right")

    plt.tight_layout()
    plt.savefig(OUTPUT_PATH, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"saved: {OUTPUT_PATH}")

if __name__ == "__main__":
    # operation_df, production_df が事前に読み込まれている前提
    build_chart4(
        operation_df, production_df,
        target_date="YYYY-MM-DD",
        equipment_name="設備名",
        standard_cycle_time_sec=45.0,   # None にすると性能率・OEE は算出不可
    )
```

---

## Chart 5：サイクルタイム推移

### レイアウト仕様

| 要素 | 仕様 |
|---|---|
| グラフ種別 | 散布図（実測CT）＋折れ線（移動平均）＋水平参照線 |
| 散布点色 | 紺 (#4c78a8)、透明度50% |
| 移動平均 | オレンジ (#f58518)、ウィンドウ幅 = min(10, max(3, N//10)) |
| 基準CT線 | 緑破線 (#2ca02c)。基準CT×1.5 に赤点線 (#d62728) |
| X軸 | 時刻（mdates、2時間間隔）、45°回転 |
| Y軸 | サイクルタイム（秒） |
| 統計テキスト | 平均・σ・最大 を左上テキストボックスに表示 |
| figsize | (14, 5) |
| CT列がない場合 | タイムスタンプ差分からCTを計算。0以下・基準CT×10超は除外 |

> **重要：**
> - `standard_cycle_time_sec=None` の場合、基準CT線は非表示（散布＋移動平均のみ）
> - タイムスタンプ差分でCT計算する場合、最初の行は NaN になるため `dropna()` で除去する

### Pythonスクリプト

```python
from pathlib import Path

OUTPUT_PATH = Path("cycle_time_trend.png")

def build_chart5(production_df, target_date, equipment_name="設備名",
                 standard_cycle_time_sec=None):
    prod = production_df.copy()

    time_col = find_col(prod, ["started_at", "created_at", "timestamp", "発生時刻", "time"])
    ct_col   = find_col(prod, ["cycle_time", "サイクルタイム", "ct", "ct_sec"], required=False)

    prod["_time"] = pd.to_datetime(prod[time_col], errors="coerce")
    prod = prod.sort_values("_time").reset_index(drop=True)

    if ct_col:
        prod["_ct"] = pd.to_numeric(prod[ct_col], errors="coerce")
    else:
        # タイムスタンプ差分からCTを計算
        prod["_ct"] = prod["_time"].diff().dt.total_seconds()

    # 無効値除去（0以下 or 基準CT×10超）
    valid_mask = prod["_ct"] > 0
    if standard_cycle_time_sec:
        valid_mask &= prod["_ct"] < standard_cycle_time_sec * 10
    prod = prod[valid_mask].reset_index(drop=True)

    if prod.empty:
        print("CTデータなし。Chart5をスキップ。")
        return

    fig, ax = plt.subplots(figsize=(14, 5))

    # 散布図
    ax.scatter(prod["_time"], prod["_ct"],
               color="#4c78a8", alpha=0.5, s=20, zorder=3, label="実測CT")

    # 移動平均
    if len(prod) >= 5:
        window = min(10, max(3, len(prod) // 10))
        ma = prod["_ct"].rolling(window=window, center=True).mean()
        ax.plot(prod["_time"], ma, color="#f58518", linewidth=2,
                label=f"移動平均（{window}点）", zorder=4)

    # 基準CT・超過閾値
    if standard_cycle_time_sec:
        ax.axhline(standard_cycle_time_sec, color="#2ca02c", linestyle="--",
                   linewidth=1.5, label=f"基準CT: {standard_cycle_time_sec:.1f}秒", zorder=5)
        ax.axhline(standard_cycle_time_sec * 1.5, color="#d62728", linestyle=":",
                   linewidth=1.0, alpha=0.7,
                   label=f"基準CT×1.5: {standard_cycle_time_sec * 1.5:.1f}秒", zorder=5)

    ax.set_xlabel("時刻", fontsize=11)
    ax.set_ylabel("サイクルタイム（秒）", fontsize=11)
    ax.set_title(
        f"{equipment_name}：サイクルタイム推移（{target_date} JST）",
        fontsize=13, pad=10
    )
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%H:%M"))
    ax.xaxis.set_major_locator(mdates.HourLocator(interval=2))
    plt.setp(ax.get_xticklabels(), rotation=45, ha="right")
    ax.grid(True, alpha=0.3, zorder=0)
    ax.legend(loc="upper right", fontsize=9)

    # 統計テキスト
    ct_mean = prod["_ct"].mean()
    ct_std  = prod["_ct"].std()
    ct_max  = prod["_ct"].max()
    stats_text = f"平均: {ct_mean:.1f}秒  σ: {ct_std:.1f}秒  最大: {ct_max:.1f}秒"
    ax.text(0.01, 0.97, stats_text, transform=ax.transAxes,
            fontsize=9, va="top", ha="left",
            bbox=dict(boxstyle="round,pad=0.3", facecolor="white", alpha=0.8))

    plt.tight_layout()
    plt.savefig(OUTPUT_PATH, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"saved: {OUTPUT_PATH}")

if __name__ == "__main__":
    # production_df が事前に読み込まれている前提
    build_chart5(production_df, target_date="YYYY-MM-DD", equipment_name="設備名",
                 standard_cycle_time_sec=45.0)
```

---

## Chart 6：稼働タイムライン

### レイアウト仕様

| 要素 | 仕様 |
|---|---|
| グラフ種別 | 水平ガントチャート（`barh`） |
| 色定義 | GROUP_COLORS と同一（操業:緑 / 性能ロス:赤 / 停止ロス:黄 / 計画停止:青） |
| X軸 | 0〜24時間（対象日の00:00〜24:00）、2時間刻みで HH:MM 表示 |
| Y軸 | 稼働グループ（操業時間 / 性能ロス時間 / 停止ロス時間 / 計画停止時間） |
| 凡例 | 右上に表示（2列） |
| figsize | (16, 4) |

> **重要：**
> - X軸は数値（時間）で管理し、`start_h = (start - day_start).total_seconds() / 3600` で変換する
> - 対象日をまたぐイベントは `target_date` の00:00〜24:00にクリップして描画する
> - group カラムがなければ `classify_operation()` で変換する

### Pythonスクリプト

```python
from pathlib import Path
from matplotlib.patches import Patch

OUTPUT_PATH = Path("operation_timeline.png")

def build_chart6(operation_df, target_date, equipment_name="設備名"):
    op = operation_df.copy()

    group_col = find_col(op, ["group", "グループ"], required=False)
    class_col = find_col(op, ["status_name", "稼働分類", "分類", "operation_type"])
    start_col = find_col(op, ["started_at", "開始時刻", "start_time"])
    end_col   = find_col(op, ["ended_at",   "終了時刻", "end_time"])

    op["_start"] = pd.to_datetime(op[start_col], errors="coerce")
    op["_end"]   = pd.to_datetime(op[end_col],   errors="coerce")

    if group_col:
        op["_group"] = op[group_col].astype(str).str.strip()
    else:
        op["_group"] = op[class_col].map(classify_operation)

    op = op.dropna(subset=["_start", "_end"])
    op = op[op["_end"] > op["_start"]].reset_index(drop=True)

    if op.empty:
        print("タイムラインデータなし。Chart6をスキップ。")
        return

    day_start = pd.Timestamp(target_date)
    day_end   = day_start + pd.Timedelta(hours=24)

    # 対象日範囲にクリップ
    op["_start_clip"] = op["_start"].clip(lower=day_start, upper=day_end)
    op["_end_clip"]   = op["_end"].clip(lower=day_start, upper=day_end)
    op = op[op["_end_clip"] > op["_start_clip"]].reset_index(drop=True)

    # 数値（時間）に変換
    op["_start_h"] = (op["_start_clip"] - day_start).dt.total_seconds() / 3600
    op["_dur_h"]   = (op["_end_clip"]   - op["_start_clip"]).dt.total_seconds() / 3600

    # Y軸グループの順序（下→上）
    display_groups = ["計画停止時間", "停止ロス時間", "性能ロス時間", "操業時間"]

    fig, ax = plt.subplots(figsize=(16, 2.5))

    for _, row in op.iterrows():
        grp   = row["_group"]
        color = GROUP_COLORS.get(grp, "#888888")
        ax.barh(0, row["_dur_h"], left=row["_start_h"],
                height=0.5, color=color, alpha=0.85,
                edgecolor="white", linewidth=0.5)

    ax.set_yticks([])
    ax.set_xlim(0, 24)
    hour_ticks = list(range(0, 25, 2))
    ax.set_xticks(hour_ticks)
    ax.set_xticklabels([f"{h:02d}:00" for h in hour_ticks], fontsize=9)
    ax.set_xlabel("時刻", fontsize=11)
    ax.set_title(
        f"{equipment_name}：稼働タイムライン（{target_date} JST）",
        fontsize=13, pad=10
    )
    ax.grid(True, axis="x", alpha=0.3)

    legend_handles = [
        Patch(facecolor=GROUP_COLORS[g], label=g, alpha=0.85)
        for g in display_groups if g in GROUP_COLORS
    ]
    ax.legend(handles=legend_handles, loc="upper right", fontsize=9, ncol=2)

    plt.tight_layout()
    plt.savefig(OUTPUT_PATH, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"saved: {OUTPUT_PATH}")

if __name__ == "__main__":
    # operation_df が事前に読み込まれている前提
    build_chart6(operation_df, target_date="YYYY-MM-DD", equipment_name="設備名")
```

---

## 出力ファイル

| グラフ | ファイル名 |
|---|---|
| Chart 1 | `production_alarm_trend.png` |
| Chart 2 | `operation_composition.png` |
| Chart 3 | `alarm_pareto.png` |
| Chart 4 | `oee_availability_dashboard.png` |
| Chart 5 | `cycle_time_trend.png` |
| Chart 6 | `operation_timeline.png` |

---

## 変更履歴

| バージョン | 変更内容 |
|---|---|
| v1.0 | 初版 |
| v2.0 | Chart1：棒＋丸マーカー混合・KPIテキスト枠・ゼロ帯破線 / Chart2：ドーナツ＋横棒2パネル・件数表示 / Chart3：累積折れ線を原点から開始・継続秒数表示 |
| v2.1 | Chart3：棒グラフ隙間なし（BAR_W=1.0）・白枠線・累積折れ線の点を棒右端に合わせる |
| v2.2 | Chart3：累積折れ線を左Y軸に描画し点の高さを棒グラフと一致させる・右Y軸を比率(%)目盛りのみに変更・ylim上限をtotalに固定し100%を正確に表示 |
| v2.3 | グラフ生成スキルとレポートテンプレートスキルを分離 |
| v2.4 | 設備固有名称を除去し汎用化。関数引数に `equipment_name` を追加 |
| v2.5 | 共通設定に日本語フォント動的検出ロジックを追加。フォントなし時の警告・インストール手順を追記 |
| v2.6 | 稼働分類マッピングをRTMS定義に合わせて完全一致テーブルに変更。Chart4（OEE・可動率ダッシュボード）を追加。Chart2の色定義に計画停止時間（灰）を追加 |
| v2.7 | Chart5（サイクルタイム推移）・Chart6（稼働タイムライン）を追加。GROUP_COLORSを操業:緑/性能ロス:赤/停止ロス:黄/計画停止:青に変更 |
