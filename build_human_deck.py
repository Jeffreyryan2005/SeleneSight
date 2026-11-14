import os
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_presentation():
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Palette
    C_BG = RGBColor(10, 15, 30)         # Deep aerospace dark #0A0F1E
    C_CARD = RGBColor(17, 27, 49)       # Tech slate #111B31
    C_BORDER = RGBColor(35, 55, 95)     # Subtle border #23375F
    C_CYAN = RGBColor(0, 229, 255)      # Electric Cyan #00E5FF
    C_GOLD = RGBColor(255, 183, 3)      # Amber Gold #FFB703
    C_GREEN = RGBColor(16, 185, 129)    # Emerald #10B981
    C_WHITE = RGBColor(255, 255, 255)
    C_MUTED = RGBColor(148, 163, 184)   # Slate 400
    C_ACCENT_BG = RGBColor(14, 38, 64)

    def set_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = C_BG
        bg.line.fill.background()
        return bg

    def add_top_bar(slide, tracker, title):
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(0.95))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p0 = tf.paragraphs[0]
        p0.text = tracker.upper()
        p0.font.size = Pt(9.5)
        p0.font.bold = True
        p0.font.color.rgb = C_CYAN
        p0.font.name = 'Arial'
        
        p1 = tf.add_paragraph()
        p1.text = title
        p1.font.size = Pt(21)
        p1.font.bold = True
        p1.font.color.rgb = C_WHITE
        p1.font.name = 'Arial'
        p1.space_before = Pt(3)

    def add_card(slide, left, top, width, height, fill_color=C_CARD, border_color=C_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = fill_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1)
        else:
            card.line.fill.background()
        return card

    # =========================================================================
    # SLIDE 1: COVER SLIDE
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1)

    # Left content box
    tb = s1.shapes.add_textbox(Inches(0.8), Inches(1.1), Inches(6.8), Inches(5.5))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "NASA SPACE APPS CHALLENGE 2026 • THE NEXT FRONTIER"
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p.font.name = 'Arial'

    p = tf.add_paragraph()
    p.text = "SELENESIGHT"
    p.font.size = Pt(38)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.font.name = 'Arial'
    p.space_before = Pt(8)

    p = tf.add_paragraph()
    p.text = "Lunar South Pole Mission & Trajectory Navigator"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = C_GOLD
    p.font.name = 'Arial'
    p.space_before = Pt(4)

    p = tf.add_paragraph()
    p.text = "A real-time mission planning cockpit that solves grazing solar elevation angles and direct-to-Earth communication blackouts across the 13 candidate Artemis III landing regions."
    p.font.size = Pt(12)
    p.font.color.rgb = C_MUTED
    p.font.name = 'Arial'
    p.space_before = Pt(14)

    p = tf.add_paragraph()
    p.text = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    p.font.size = Pt(8)
    p.font.color.rgb = C_BORDER
    p.space_before = Pt(10)

    p = tf.add_paragraph()
    p.text = "TEAM TWINTECH"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p.font.name = 'Arial'
    p.space_before = Pt(8)

    p = tf.add_paragraph()
    p.text = "• Jeffrey Ryan R — Full Stack & Trajectory Math Lead\n• Imaya Thillai S — Geospatial & Crater Database Lead\nFinal Year B.E. Computer Science & Engineering | SCAD CET, India"
    p.font.size = Pt(11)
    p.font.color.rgb = C_WHITE
    p.font.name = 'Arial'
    p.space_before = Pt(4)

    p = tf.add_paragraph()
    p.text = "Live Deployment: selenesight.vercel.app  |  GitHub: Jeffreyryan2005/SeleneSight"
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_GREEN
    p.font.bold = True
    p.font.name = 'Arial'
    p.space_before = Pt(14)

    # Right side: Embedded real polar map visual from the live app
    if os.path.exists("deck_assets/polar_map.png"):
        card = add_card(s1, Inches(7.8), Inches(1.1), Inches(4.7), Inches(5.3), C_CARD, C_BORDER)
        s1.shapes.add_picture("deck_assets/polar_map.png", Inches(8.0), Inches(1.3), Inches(4.3), Inches(4.3))
        # Label below image
        lbl = s1.shapes.add_textbox(Inches(8.0), Inches(5.75), Inches(4.3), Inches(0.5))
        lbl.text_frame.word_wrap = True
        lbl.text_frame.margin_left = lbl.text_frame.margin_right = lbl.text_frame.margin_top = lbl.text_frame.margin_bottom = 0
        lp = lbl.text_frame.paragraphs[0]
        lp.text = "Interactive Stereographic South Pole Map (80°S - 90°S) from Live App"
        lp.font.size = Pt(9)
        lp.font.color.rgb = C_MUTED
        lp.font.name = 'Arial'
        lp.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 2: THE PHYSICAL CHALLENGE
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2)
    add_top_bar(s2, "Mission Environment Analysis", "The Challenge: A Sun That Never Rises Above 3°")

    # Left Column: Detailed physical constraints
    c1 = add_card(s2, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.3))
    tb = s2.shapes.add_textbox(Inches(1.1), Inches(1.7), Inches(5.1), Inches(4.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "THE 1.54° AXIAL TILT TRAP"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_GOLD
    p.font.name = 'Arial'

    p = tf.add_paragraph()
    p.text = "Unlike Apollo landing sites near the equator where the Sun climbs overhead, the lunar South Pole experiences near-grazing solar angles (1.5° to 3.0° elevation). The Sun circles horizontally around the horizon, turning crater rims and mountain ridges into shadow-casters that stretch 10 to 40 km across candidate landing plains."
    p.font.size = Pt(11)
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(6)

    p = tf.add_paragraph()
    p.text = "TOPOGRAPHIC COMMS SHADOWING"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p.font.name = 'Arial'
    p.space_before = Pt(14)

    p = tf.add_paragraph()
    p.text = "Direct-to-Earth (DTE) radio links to NASA's Deep Space Network dishes (Goldstone, Madrid, Canberra) hover at mere 0° to 6° elevation. A single mountain crest (like Malapert Massif +5040m) completely severs line-of-sight communication for days."
    p.font.size = Pt(11)
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(6)

    p = tf.add_paragraph()
    p.text = "THE CONCURRENCY BOTTLENECK"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_GREEN
    p.font.name = 'Arial'
    p.space_before = Pt(14)

    p = tf.add_paragraph()
    p.text = "Commercial landers (CLPS) and Artemis crews face an unforgiving operational dilemma: having sunlight without comms means you cannot send mission telemetry; having comms in the dark quickly depletes lander batteries. Mission survival depends strictly on finding the rare concurrent overlap."
    p.font.size = Pt(11)
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(6)

    # Right Column: Comparative telemetry table & numbers
    c2 = add_card(s2, Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.3))
    tb2 = s2.shapes.add_textbox(Inches(7.1), Inches(1.7), Inches(5.1), Inches(4.9))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0

    p = tf2.paragraphs[0]
    p.text = "ENVIRONMENTAL COMPARISON MATRIX"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_CYAN

    p = tf2.add_paragraph()
    p.text = "Apollo (Equatorial) vs. Artemis (South Pole)"
    p.font.size = Pt(10)
    p.font.color.rgb = C_MUTED
    p.space_before = Pt(2)

    # Bulleted comparison
    points = [
        ("Solar Elevation", "Apollo: Up to 90° (zenith)", "Artemis: 1.5° – 3.0° (skimming)"),
        ("Shadow Behavior", "Apollo: Short, predictable", "Artemis: 10–40 km terrain occlusion"),
        ("Earth Visibility", "Apollo: High overhead (~60°)", "Artemis: Low northern horizon (0°–6°)"),
        ("Thermal Limits", "Apollo: +120°C daytime", "Artemis: Down to 40 K (-233°C in PSRs)"),
        ("Libration Drift", "Apollo: Minor operational impact", "Artemis: ±2° wobble causes radio loss"),
    ]
    for param, ap, art in points:
        p = tf2.add_paragraph()
        p.text = f"• {param}:"
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = C_GOLD
        p.space_before = Pt(8)
        
        p = tf2.add_paragraph()
        p.text = f"   {art}  (vs. {ap})"
        p.font.size = Pt(10)
        p.font.color.rgb = C_WHITE

    p = tf2.add_paragraph()
    p.text = "Why existing tools fail fast trade studies:"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_GREEN
    p.space_before = Pt(14)

    p = tf2.add_paragraph()
    p.text = "NASA SPICE kernels and Horizons batch scripts require complex command-line workflows. Evaluating dozens of landing coordinates with varying launch windows takes days instead of seconds."
    p.font.size = Pt(10)
    p.font.color.rgb = C_MUTED
    p.space_before = Pt(3)

    # =========================================================================
    # SLIDE 3: SOLUTION - 360° TOPOGRAPHIC HORIZONS
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3)
    add_top_bar(s3, "Cockpit Architecture & Scientific Validity", "Real-Time 360° Topographic Horizons & Raymarching")

    # Left: Explanation & Formulas
    add_card(s3, Inches(0.8), Inches(1.5), Inches(5.2), Inches(5.3))
    tb = s3.shapes.add_textbox(Inches(1.1), Inches(1.7), Inches(4.6), Inches(4.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "TERRAIN RAYMARCHING ENGINE"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_CYAN

    p = tf.add_paragraph()
    p.text = "SeleneSight samples NASA LOLA 30m Digital Elevation Models radially outward across 360 azimuthal degrees (0° to 359° at 1° resolution). It reconstructs the exact elevation silhouette of surrounding crater rims, peaks, and massifs."
    p.font.size = Pt(11)
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(6)

    p = tf.add_paragraph()
    p.text = "LUNAR CURVATURE CORRECTION"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_GOLD
    p.space_before = Pt(14)

    p = tf.add_paragraph()
    p.text = "Because the Moon's radius is only R_moon = 1,737 km (1/4 of Earth), distant massifs drop rapidly below the horizon. Without curvature correction, distant mountains appear artificially high:"
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(4)

    p = tf.add_paragraph()
    p.text = "tan(θ_apparent) = (z_peak - z_obs - d² / 2R_moon) / d"
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = C_CYAN
    p.space_before = Pt(6)

    p = tf.add_paragraph()
    p.text = "DYNAMIC ECLIPSE DETECTION"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_GREEN
    p.space_before = Pt(14)

    p = tf.add_paragraph()
    p.text = "At every timestamp, the app compares celestial vectors (Sun & Earth altitude) against the calculated horizon mask. If elevation falls below the ridge profile, the telemetry badge flags 'TOPOGRAPHIC ECLIPSE' or 'RADIO BLOCKED'."
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(4)

    # Right: Embedded Screenshot of the actual Horizon Sky Chart
    if os.path.exists("deck_assets/horizon_chart.png"):
        add_card(s3, Inches(6.3), Inches(1.5), Inches(6.2), Inches(5.3))
        s3.shapes.add_picture("deck_assets/horizon_chart.png", Inches(6.5), Inches(1.7), Inches(5.8), Inches(3.8))
        
        lbl = s3.shapes.add_textbox(Inches(6.5), Inches(5.65), Inches(5.8), Inches(0.9))
        lbl.text_frame.word_wrap = True
        lbl.text_frame.margin_left = lbl.text_frame.margin_right = lbl.text_frame.margin_top = lbl.text_frame.margin_bottom = 0
        lp = lbl.text_frame.paragraphs[0]
        lp.text = "ACTUAL SCREENSHOT: 360° Panoramic Horizon Silhouette from SeleneSight"
        lp.font.size = Pt(10)
        lp.font.bold = True
        lp.font.color.rgb = C_CYAN
        
        lp2 = lbl.text_frame.add_paragraph()
        lp2.text = "Shows mountain ridge profile (grey), solar trajectory (gold line with irradiance badge), and Earth position (blue marker at 2.4° elevation). Toggleable to Planar Polar Dome."
        lp2.font.size = Pt(9)
        lp2.font.color.rgb = C_MUTED
        lp2.space_before = Pt(2)

    # =========================================================================
    # SLIDE 4: THE GOLDEN WINDOW TIMELINE
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4)
    add_top_bar(s4, "Flight Operations & Concurrency Analysis", "Pinpointing the 'Golden Window': 14-Day Timeline Simulator")

    # Top: Full-width Embedded Timeline Gantt Chart Screenshot
    if os.path.exists("deck_assets/timeline_gantt.png"):
        add_card(s4, Inches(0.8), Inches(1.5), Inches(11.733), Inches(2.9))
        s4.shapes.add_picture("deck_assets/timeline_gantt.png", Inches(1.0), Inches(1.65), Inches(11.333), Inches(2.45))

    # Bottom: 3 Operational Tracks breakdown
    cards_data = [
        ("TRACK 1: SOLAR DAYLIGHT", C_GOLD, 
         "Evaluates 336 continuous hours in 2-hour steps. Tracks solar elevation above local horizon obstacles, ensuring lander solar array irradiance remains above battery survival thresholds (W/m²)."),
        ("TRACK 2: DSN EARTH LINK", C_CYAN, 
         "Models lunar libration cycles (±6.7° lat, ±7.9° lon wobble) to calculate unobstructed direct-to-Earth radio line-of-sight to NASA Deep Space Network ground antennas."),
        ("TRACK 3: THE GOLDEN WINDOW", C_GREEN, 
         "Automatically identifies and highlights concurrent operating windows (in emerald green) where astronauts have both full EVA sunlight and live Earth comms for video downlinks.")
    ]

    for idx, (title, color, desc) in enumerate(cards_data):
        cx = Inches(0.8 + idx * 4.0)
        add_card(s4, cx, Inches(4.6), Inches(3.733), Inches(2.3))
        tb = s4.shapes.add_textbox(cx + Inches(0.25), Inches(4.8), Inches(3.233), Inches(1.9))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = color
        
        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_WHITE
        p.space_before = Pt(6)

    # =========================================================================
    # SLIDE 5: GIS & CRATER HAZARD BUFFERING
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5)
    add_top_bar(s5, "Touchdown Safety & Planetary Datasets", "Robbins Crater DB Fusion & Preventing IM-1 Tip-Overs")

    # Left: Hazard math & IM-1 Lesson
    add_card(s5, Inches(0.8), Inches(1.5), Inches(5.5), Inches(5.3))
    tb = s5.shapes.add_textbox(Inches(1.1), Inches(1.7), Inches(4.9), Inches(4.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "THE ODYSSEUS (IM-1) LESSON"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_GOLD

    p = tf.add_paragraph()
    p.text = "In February 2024, Intuitive Machines' IM-1 lander touched down on an unexpected 12° slope near Malapert A crater, fractured a landing gear strut, and tipped onto its side. SeleneSight directly incorporates this flight lesson by enforcing strict multi-hazard clearance criteria:"
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(6)

    p = tf.add_paragraph()
    p.text = "• Slope Limits: Hard-flags any terrain with slope > 5° as hazardous."
    p.font.size = Pt(10)
    p.font.color.rgb = C_CYAN
    p.space_before = Pt(6)

    p = tf.add_paragraph()
    p.text = "• Crater Rim Buffer: Detects if landing ellipse falls within crater rim crests or interior permanent shadows."
    p.font.size = Pt(10)
    p.font.color.rgb = C_CYAN
    p.space_before = Pt(4)

    p = tf.add_paragraph()
    p.text = "• Boulder Ejecta Risk: Cross-references radial distance to nearby impact structures to compute rock abundance (k_rock)."
    p.font.size = Pt(10)
    p.font.color.rgb = C_CYAN
    p.space_before = Pt(4)

    p = tf.add_paragraph()
    p.text = "KAGGLE & USGS DATA INTEGRATION"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_GREEN
    p.space_before = Pt(14)

    p = tf.add_paragraph()
    p.text = "Ingested the Stuart Robbins Lunar Crater Database (1.3M+ global impact craters) from Kaggle/USGS, indexed by spatial R-tree for instantaneous coordinate clearance lookups during interactive navigation."
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(6)

    # Right: Embedded Crater Hazard screenshot
    if os.path.exists("deck_assets/crater_hazard.png"):
        add_card(s5, Inches(6.6), Inches(1.5), Inches(5.9), Inches(5.3))
        s5.shapes.add_picture("deck_assets/crater_hazard.png", Inches(6.8), Inches(1.8), Inches(5.5), Inches(3.1))
        
        lbl = s5.shapes.add_textbox(Inches(6.8), Inches(5.1), Inches(5.5), Inches(1.5))
        lbl.text_frame.word_wrap = True
        lbl.text_frame.margin_left = lbl.text_frame.margin_right = lbl.text_frame.margin_top = lbl.text_frame.margin_bottom = 0
        lp = lbl.text_frame.paragraphs[0]
        lp.text = "LIVE APP SCREENSHOT: 100m Touchdown Safety Checklist"
        lp.font.size = Pt(10)
        lp.font.bold = True
        lp.font.color.rgb = C_CYAN
        
        lp2 = lbl.text_frame.add_paragraph()
        lp2.text = "Provides real-time checks for slope margin (<5°), crater rim distance, ejecta boulder buffer, and communication direct line-of-sight with NASA DSN ground stations."
        lp2.font.size = Pt(9)
        lp2.font.color.rgb = C_MUTED
        lp2.space_before = Pt(3)

    # =========================================================================
    # SLIDE 6: MCDA SITE LEADERBOARD
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6)
    add_top_bar(s6, "Decision Support & Trade Studies", "Multi-Criteria Decision Analysis (MCDA) Ranking Engine")

    # Left: Explanation & Presets
    add_card(s6, Inches(0.8), Inches(1.5), Inches(5.2), Inches(5.3))
    tb = s6.shapes.add_textbox(Inches(1.1), Inches(1.7), Inches(4.6), Inches(4.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "MATHEMATICAL SCORING MODEL"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_CYAN

    p = tf.add_paragraph()
    p.text = "Evaluating candidate sites requires balancing competing engineering and scientific priorities. SeleneSight implements a normalized weighted scoring matrix:"
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(6)

    p = tf.add_paragraph()
    p.text = "Score_i = w_sun · S_sun + w_earth · S_earth + w_slope · (1 - S_slope) + w_ice · S_ice"
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = C_GOLD
    p.space_before = Pt(6)

    p = tf.add_paragraph()
    p.text = "ONE-CLICK MISSION PRESETS"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_GREEN
    p.space_before = Pt(14)

    presets = [
        ("Artemis III Crewed", "Maximizes Earth comms and slopes <5° for human lander safety."),
        ("Volatiles / Ice Prospecting", "Weights proximity to permanently shadowed crater floors."),
        ("CLPS Solar Scout", "Weights continuous solar illumination >80% for solar batteries."),
        ("Balanced Trade Study", "Equal 25% weights across all four operational vectors.")
    ]
    for name, desc in presets:
        p = tf.add_paragraph()
        p.text = f"• {name}: {desc}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_WHITE
        p.space_before = Pt(4)

    # Right: Embedded MCDA Scorer Screenshot
    if os.path.exists("deck_assets/mcda_scorer.png"):
        add_card(s6, Inches(6.3), Inches(1.5), Inches(6.2), Inches(5.3))
        s6.shapes.add_picture("deck_assets/mcda_scorer.png", Inches(6.5), Inches(1.75), Inches(5.8), Inches(3.7))
        
        lbl = s6.shapes.add_textbox(Inches(6.5), Inches(5.65), Inches(5.8), Inches(0.9))
        lbl.text_frame.word_wrap = True
        lbl.text_frame.margin_left = lbl.text_frame.margin_right = lbl.text_frame.margin_top = lbl.text_frame.margin_bottom = 0
        lp = lbl.text_frame.paragraphs[0]
        lp.text = "LIVE APP SCREENSHOT: Interactive Candidate Site Leaderboard"
        lp.font.size = Pt(10)
        lp.font.bold = True
        lp.font.color.rgb = C_CYAN
        
        lp2 = lbl.text_frame.add_paragraph()
        lp2.text = "Users drag sliders to adjust weights in real-time. Leaderboard dynamically recalculates ranks across all 13 Artemis III candidate landing regions."
        lp2.font.size = Pt(9)
        lp2.font.color.rgb = C_MUTED
        lp2.space_before = Pt(2)

    # =========================================================================
    # SLIDE 7: ARCHITECTURE & OPEN SCIENCE
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_bg(s7)
    add_top_bar(s7, "Engineering Rigor & Verification", "Full Stack Architecture, Team Credentials & Open Science")

    # Left: Data pipelines & tech stack
    add_card(s7, Inches(0.8), Inches(1.5), Inches(5.7), Inches(5.3))
    tb = s7.shapes.add_textbox(Inches(1.1), Inches(1.7), Inches(5.1), Inches(4.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "VERIFIED DATA PIPELINES"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_CYAN

    citations = [
        ("NASA JPL Horizons REST API", "Calculates lunar topocentric observer coordinates (CENTER='coord@301', QUANTITIES='4') for apparent azimuth & elevation."),
        ("NASA LRO LOLA PDS Archive", "SLDEM2015 30m digital elevation models for 360° radial terrain raymarching."),
        ("NASA Moon Trek (WMTS)", "OGC-compliant high-resolution Web Map Tile Services for South Pole polar stereographic mapping."),
        ("USGS / Kaggle Robbins Crater DB", "1.3M+ global crater database for crater rim and ejecta hazard buffering.")
    ]
    for src, desc in citations:
        p = tf.add_paragraph()
        p.text = f"• {src}:"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = C_GOLD
        p.space_before = Pt(6)
        
        p = tf.add_paragraph()
        p.text = f"   {desc}"
        p.font.size = Pt(9)
        p.font.color.rgb = C_WHITE

    p = tf.add_paragraph()
    p.text = "TECH STACK: Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React. Client-side SVG math rendering guarantees 60 FPS performance."
    p.font.size = Pt(9.5)
    p.font.color.rgb = C_GREEN
    p.space_before = Pt(10)

    # Right: Team TwinTech & Live Deliverables
    add_card(s7, Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.3))
    tb2 = s7.shapes.add_textbox(Inches(7.1), Inches(1.7), Inches(5.1), Inches(4.9))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0

    p = tf2.paragraphs[0]
    p.text = "TEAM TWINTECH"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_CYAN

    p = tf2.add_paragraph()
    p.text = "Final Year B.E. Computer Science & Engineering Students\nSCAD College of Engineering and Technology, Tamil Nadu, India"
    p.font.size = Pt(10)
    p.font.color.rgb = C_MUTED
    p.space_before = Pt(2)

    p = tf2.add_paragraph()
    p.text = "• Jeffrey Ryan R — Full Stack & Trajectory Math Lead"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(10)

    p = tf2.add_paragraph()
    p.text = "   Engineered the 360° raymarching algorithm, spherical curvature corrections, Next.js architecture, and NASA JPL Horizons query engine."
    p.font.size = Pt(9.5)
    p.font.color.rgb = C_MUTED

    p = tf2.add_paragraph()
    p.text = "• Imaya Thillai S — Geospatial & Crater Data Lead"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(8)

    p = tf2.add_paragraph()
    p.text = "   Integrated LOLA digital elevation models, Robbins crater dataset filtering, Horn's slope convolution, and MCDA scoring engine."
    p.font.size = Pt(9.5)
    p.font.color.rgb = C_MUTED

    p = tf2.add_paragraph()
    p.text = "MISSION READINESS SUMMARY"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = C_GREEN
    p.space_before = Pt(14)

    p = tf2.add_paragraph()
    p.text = "✓ Live Web App: https://selenesight.vercel.app\n✓ Public GitHub: https://github.com/Jeffreyryan2005/SeleneSight\n✓ 100% Functional Production Build — Zero Mock Data"
    p.font.size = Pt(10)
    p.font.color.rgb = C_WHITE
    p.space_before = Pt(4)

    output_path = r"c:\Users\user\Desktop\nasa\SeleneSight_NASA_Space_Apps_Submission.pptx"
    prs.save(output_path)
    print(f"Human-grade Presentation saved successfully to {output_path}")

if __name__ == '__main__':
    build_presentation()
