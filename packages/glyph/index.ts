/* eslint-disable capitalized-comments, id-length, max-lines, sort-keys -- Glyph tables are grouped by Unicode block and preserve conventional one-character names where they are the glyph identity. */

const BRAILLE_CODE_POINT_OFFSET = 10_240;
const BRAILLE_PATTERN_COUNT = 256;

/**
Unicode glyph catalog for a roguelike renderer.

Prefer glyphs that render clearly in the target game font. Width and coverage
vary by platform, especially outside the Basic Multilingual Plane.
*/

// ─────────────────────────────────────────────────────────────────────────────
// 1. ASCII PRINTABLE  (U+0021–U+007E)
//    The universal baseline — guaranteed in every font.
// ─────────────────────────────────────────────────────────────────────────────
export const ASCII = {
  // Punctuation / symbols
  EXCLAIM: "!", // strong enemies, alerts
  DQUOTE: '"', // fungi, stalactites
  HASH: "#", // walls (classic)
  DOLLAR: "$", // gold, treasure
  PERCENT: "%", // fungus, food
  AMPERSAND: "&", // large monsters
  SQUOTE: "'", // pebble, stalagmite
  LPAREN: "(", // armour (NetHack)
  RPAREN: ")", // weapon (NetHack)
  ASTERISK: "*", // gem, projectile, spell
  PLUS: "+", // door (open), healing
  COMMA: ",", // item on floor, grass
  MINUS: "-", // wand, horizontal wall
  DOT: ".", // floor, ground, empty
  SLASH: "/", // wand, diagonal
  COLON: ":", // food, corpse
  SEMICOLON: ";", // slime trail, special
  LT: "<", // stairs up
  EQUALS: "=", // ring
  GT: ">", // stairs down
  QUESTION: "?", // scroll
  AT: "@", // player
  LBRACKET: "[", // armour
  BACKSLASH: "\\", // diagonal, wand
  RBRACKET: "]", // armour
  CARET: "^", // trap
  UNDERSCORE: "_", // altar, floor variant
  BACKTICK: "`", // grave, rune
  LCURLY: "{", // fountain, statue
  PIPE: "|", // vertical wall, wand
  RCURLY: "}", // chest, statue
  TILDE: "~", // water, lava surface

  // Letters (commonly repurposed for monsters, classic NetHack style)
  // Lowercase
  a: "a",
  b: "b",
  c: "c",
  d: "d",
  e: "e",
  f: "f",
  g: "g",
  h: "h",
  i: "i",
  j: "j",
  k: "k",
  l: "l",
  m: "m",
  n: "n",
  o: "o",
  p: "p",
  q: "q",
  r: "r",
  s: "s",
  t: "t",
  u: "u",
  v: "v",
  w: "w",
  x: "x",
  y: "y",
  z: "z",

  // Uppercase
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  F: "F",
  G: "G",
  H: "H",
  I: "I",
  J: "J",
  K: "K",
  L: "L",
  M: "M",
  N: "N",
  O: "O",
  P: "P",
  Q: "Q",
  R: "R",
  S: "S",
  T: "T",
  U: "U",
  V: "V",
  W: "W",
  X: "X",
  Y: "Y",
  Z: "Z",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 2. LATIN EXTENDED & SPECIAL LETTERS
//    Great for named entities and rare item types.
// ─────────────────────────────────────────────────────────────────────────────
export const LATIN_EXTENDED = {
  // Latin-1 Supplement (U+00C0–U+00FF)
  A_GRAVE: "À",
  A_ACUTE: "Á",
  A_CIRC: "Â",
  A_TILDE: "Ã",
  A_DIAER: "Ä",
  A_RING: "Å",
  AE: "Æ", // rune-like, powerful entities
  C_CEDIL: "Ç",
  ETH: "Ð", // demon, death entity
  O_SLASH: "Ø",
  THORN: "Þ", // thorned creature
  SHARP_S: "ß",
  SCHWA: "ə", // strange creature
  EZH: "ʒ", // shadow creature

  // Latin Extended-B / IPA exotic
  HOOKTOP_B: "ɓ",
  HOOKTOP_D: "ɗ",
  HOOKTOP_G: "ɠ",
  TURNED_M: "ɯ",
  LATIN_SMALL_GAMMA: "ɣ",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 3. GREEK  (U+0391–U+03C9)
//    Perfect for powerful/magical entities, rune labels.
// ─────────────────────────────────────────────────────────────────────────────
export const GREEK = {
  ALPHA: "α",
  ALPHA_U: "Α",
  BETA: "β",
  BETA_U: "Β",
  GAMMA: "γ",
  GAMMA_U: "Γ",
  DELTA: "δ",
  DELTA_U: "Δ", // delta = change, portal
  EPSILON: "ε",
  EPSILON_U: "Ε",
  ZETA: "ζ",
  ZETA_U: "Ζ",
  ETA: "η",
  ETA_U: "Η",
  THETA: "θ",
  THETA_U: "Θ", // classic "eye" / void
  IOTA: "ι",
  IOTA_U: "Ι",
  KAPPA: "κ",
  KAPPA_U: "Κ",
  LAMBDA: "λ",
  LAMBDA_U: "Λ", // lambda = ray, beam
  MU: "μ",
  MU_U: "Μ",
  NU: "ν",
  NU_U: "Ν",
  XI: "ξ",
  XI_U: "Ξ", // xi = tentacled creature
  PI: "π",
  PI_U: "Π",
  RHO: "ρ",
  RHO_U: "Ρ",
  SIGMA: "σ",
  SIGMA_U: "Σ",
  SIGMA_F: "ς", // final sigma
  TAU: "τ",
  TAU_U: "Τ",
  UPSILON: "υ",
  UPSILON_U: "Υ",
  PHI: "φ",
  PHI_U: "Φ", // phi = orb, portal
  CHI: "χ",
  CHI_U: "Χ", // chi = chaos symbol
  PSI: "ψ",
  PSI_U: "Ψ", // psi = mind creature, psychic
  OMEGA: "ω",
  OMEGA_U: "Ω", // omega = final boss, god
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 4. CYRILLIC  (U+0400–U+04FF)
//    Adds a dark/foreign feel for hostile entities.
// ─────────────────────────────────────────────────────────────────────────────
export const CYRILLIC = {
  ZHE: "Ж", // spider-like silhouette
  TSE: "Ц",
  CHE: "Ч",
  SHA: "Ш", // wide multi-legged creature
  SHCHA: "Щ",
  HARD_SIGN: "Ъ",
  YERU: "Ы",
  SOFT_SIGN: "Ь",
  YU: "Ю",
  YA: "Я", // reversed R — strange humanoid
  DE: "Д",
  EL: "Л",
  PE: "П",
  EF: "Ф", // orb-like
  ER_LC: "р",
  ZHE_LC: "ж",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 5. RUNIC  (U+16A0–U+16FF)
//    Perfect for ancient inscriptions, magical items, shrines.
// ─────────────────────────────────────────────────────────────────────────────
export const RUNIC = {
  FEHU: "ᚠ", // wealth / cattle
  URUZ: "ᚢ", // strength
  THURISAZ: "ᚦ", // thorn / giant
  ANSUZ: "ᚨ", // god / message
  RAIDHO: "ᚱ", // journey
  KENAZ: "ᚲ", // torch / fire
  GEBO: "ᚷ", // gift
  WUNJO: "ᚹ", // joy
  HAGALAZ: "ᚺ", // hail / disruption
  NAUTHIZ: "ᚾ", // need / constraint
  ISA: "ᛁ", // ice
  JERA: "ᛃ", // year / harvest
  EIHWAZ: "ᛇ", // yew / death
  PERTHRO: "ᛈ", // fate / mystery
  ALGIZ: "ᛉ", // protection (looks like trident/antlers)
  SOWILO: "ᛊ", // sun
  TIWAZ: "ᛏ", // victory / justice (arrow-up)
  BERKANAN: "ᛒ", // growth / birch
  EHWAZ: "ᛖ", // horse / movement
  MANNAZ: "ᛗ", // humanity
  LAGUZ: "ᛚ", // water / lake
  INGWAZ: "ᛜ", // fertility
  DAGAZ: "ᛞ", // day / breakthrough
  OTHALAN: "ᛟ", // heritage / homeland
  // Additional runes
  GER: "ᛄ",
  CALC: "ᛣ",
  STAN: "ᛥ",
  LONG_BRANCH_OSS: "ᚬ",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 6. BOX-DRAWING  (U+2500–U+257F)
//    The foundation of dungeon walls, corridors, and UI frames.
// ─────────────────────────────────────────────────────────────────────────────
export const BOX = {
  // Light
  H: "─", // light horizontal
  V: "│", // light vertical
  TL: "┌", // light down+right
  TR: "┐", // light down+left
  BL: "└", // light up+right
  BR: "┘", // light up+left
  T_DOWN: "┬", // light down+horizontal
  T_UP: "┴", // light up+horizontal
  T_RIGHT: "├", // light right+vertical
  T_LEFT: "┤", // light left+vertical
  CROSS: "┼", // light cross

  // Heavy
  H_HEAVY: "━",
  V_HEAVY: "┃",
  TL_HEAVY: "┏",
  TR_HEAVY: "┓",
  BL_HEAVY: "┗",
  BR_HEAVY: "┛",
  T_DOWN_H: "┳",
  T_UP_H: "┻",
  T_RIGHT_H: "┣",
  T_LEFT_H: "┫",
  CROSS_H: "╋",

  // Double
  H_DOUBLE: "═",
  V_DOUBLE: "║",
  TL_DOUBLE: "╔",
  TR_DOUBLE: "╗",
  BL_DOUBLE: "╚",
  BR_DOUBLE: "╝",
  T_DOWN_D: "╦",
  T_UP_D: "╩",
  T_RIGHT_D: "╠",
  T_LEFT_D: "╣",
  CROSS_D: "╬",

  // Dashed / dotted  (passages, secret doors)
  H_DASH2: "╌", // 2-dash light
  V_DASH2: "╎",
  H_DASH2_H: "╍", // 2-dash heavy
  V_DASH2_H: "╏",
  H_DASH3: "┄", // 3-dash light
  V_DASH3: "┆",
  H_DASH3_H: "┅",
  V_DASH3_H: "┇",
  H_DASH4: "┈", // 4-dash light
  V_DASH4: "┊",
  H_DASH4_H: "┉",
  V_DASH4_H: "┋",

  // Rounded corners  (natural caves)
  TL_ROUND: "╭",
  TR_ROUND: "╮",
  BL_ROUND: "╰",
  BR_ROUND: "╯",

  // Diagonal / arc
  DIAG_TL_BR: "╲",
  DIAG_TR_BL: "╱",
  DIAG_CROSS: "╳",

  // Mixed weight single-double combos (subset)
  TL_D_R_L: "╒", // double horizontal, light vertical
  TL_L_R_D: "╓",
  TR_D_L_L: "╕",
  TR_L_L_D: "╖",
  BL_D_R_L: "╘",
  BL_L_R_D: "╙",
  BR_D_L_L: "╛",
  BR_L_L_D: "╜",
  T_R_D_H: "╞",
  T_L_D_H: "╡",
  T_D_D_H: "╥",
  T_U_D_H: "╨",
  CX_D_H: "╫",
  CX_H_D: "╪",

  // Half-width connections
  H_UP_LIGHT_DOWN_HEAVY: "╿",
  H_DOWN_LIGHT_UP_HEAVY: "╽",
  V_LEFT_LIGHT_RIGHT_HEAVY: "╾",
  V_RIGHT_LIGHT_LEFT_HEAVY: "╼",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 7. BLOCK ELEMENTS  (U+2580–U+259F)
//    Sub-cell terrain, health bars, partial fills.
// ─────────────────────────────────────────────────────────────────────────────
export const BLOCK = {
  // Vertical eighths (top-down fill)
  TOP_HALF: "▀", // top half
  TOP_1_8: "▔", // upper 1/8
  FULL: "█", // full block
  LOWER_HALF: "▄", // lower half
  LOWER_1_8: "▁", // lower 1/8
  LOWER_2_8: "▂",
  LOWER_3_8: "▃",
  LOWER_4_8: "▄",
  LOWER_5_8: "▅",
  LOWER_6_8: "▆",
  LOWER_7_8: "▇",

  // Horizontal eighths (left-right fill — great for HP bars)
  LEFT_1_8: "▏",
  LEFT_2_8: "▎",
  LEFT_3_8: "▍",
  LEFT_4_8: "▌", // left half
  LEFT_5_8: "▋",
  LEFT_6_8: "▊",
  LEFT_7_8: "▉",
  RIGHT_HALF: "▐",

  // Shading (excellent for fog of war, unexplored areas)
  SHADE_LIGHT: "░", // 25%  — barely visible
  SHADE_MEDIUM: "▒", // 50%  — dim memory
  SHADE_DARK: "▓", // 75%  — fading memory
  SHADE_FULL: "█", // 100%

  // Quadrant blocks (terrain detail, minimap)
  QUAD_TL: "▘",
  QUAD_TR: "▝",
  QUAD_BL: "▖",
  QUAD_BR: "▗",
  QUAD_NOT_TR: "▙", // TL+BL+BR
  QUAD_NOT_BR: "▛", // TL+TR+BL
  // U+2598 ▘ TL   U+2599 ▙ TL+BL+BR   U+259A ▚ TL+BR
  // U+259B ▛ TL+TR+BL  U+259C ▜ TL+TR+BR
  // U+259D ▝ TR   U+259E ▞ TR+BL   U+259F ▟ TR+BL+BR
  Q_TL: "▘",
  Q_TL_BL_BR: "▙",
  Q_TL_BR: "▚", // checkerboard diagonal
  Q_TL_TR_BL: "▛",
  Q_TL_TR_BR: "▜",
  Q_TR: "▝",
  Q_TR_BL: "▞", // other diagonal
  Q_TR_BL_BR: "▟",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 8. BRAILLE PATTERNS  (U+2800–U+28FF)
//    256 unique patterns per cell — excellent for fine-grained terrain,
//    noise, particle effects, and minimap encoding.
// ─────────────────────────────────────────────────────────────────────────────
export const BRAILLE = {
  BLANK: "⠀", // empty (U+2800)
  // Dots are numbered 1-8 (left column top-to-bottom: 1,2,3,7; right: 4,5,6,8)
  // Common useful patterns:
  D1: "⠁", // single dot top-left
  D2: "⠂",
  D3: "⠄",
  D4: "⠈",
  D5: "⠐",
  D6: "⠠",
  D7: "⡀",
  D8: "⢀",
  D12: "⠃",
  D14: "⠉",
  D15: "⠑",
  D16: "⠡",
  D17: "⡁",
  D18: "⢁",
  D24: "⠊",
  D25: "⠒",
  D26: "⠢",
  D34: "⠌",
  D35: "⠔",
  D36: "⠤",
  D45: "⠘",
  D46: "⠨",
  D56: "⠰",
  D78: "⣀",
  D123: "⠇",
  D456: "⠸",
  D1234: "⠏",
  D5678: "⢸",
  D1357: "⡅", // sparse diagonal
  D2468: "⢪",
  TOP_ROW: "⠉", // dots 1+4
  BOTTOM_ROW: "⣀", // dots 7+8
  LEFT_COL: "⡇", // dots 1+2+3+7
  RIGHT_COL: "⢸", // dots 4+5+6+8
  ALL_DOTS: "⣿", // all 8 dots — solid
  HALF_TOP: "⠛",
  HALF_BOTTOM: "⣤",
  // Sparse / noise
  SPARSE_1: "⠂",
  SPARSE_2: "⠶",
  SPARSE_3: "⡛",
  // Note: generate the full 256-entry table programmatically:
  //   String.fromCodePoint(0x2800 | bitmask)  where bitmask ∈ [0,255]
} as const;

/**
Generates any Braille character from an 8-bit dot mask.

@param mask - Dot mask using b0=dot1 through b7=dot8.
@returns The matching Unicode Braille pattern.
*/
export const braille = (mask: number): string =>
  String.fromCodePoint(
    BRAILLE_CODE_POINT_OFFSET +
      (((mask % BRAILLE_PATTERN_COUNT) + BRAILLE_PATTERN_COUNT) %
        BRAILLE_PATTERN_COUNT),
  );

// ─────────────────────────────────────────────────────────────────────────────
// 9. GEOMETRIC SHAPES  (U+25A0–U+25FF)
//    Items, projectiles, power-ups, orbs, nodes.
// ─────────────────────────────────────────────────────────────────────────────
export const GEO = {
  // Squares
  SQ_FULL: "■", // solid wall, block
  SQ_EMPTY: "□", // open frame, node
  SQ_SMALL_FULL: "▪", // small filled — pebble
  SQ_SMALL_EMPTY: "▫", // small empty — marker
  SQ_MED_FULL: "◼",
  SQ_MED_EMPTY: "◻",

  // Rectangles
  RECT_H_FULL: "▬", // horizontal bar
  RECT_H_EMPTY: "▭",
  RECT_V_FULL: "▮", // vertical bar / pillar
  RECT_V_EMPTY: "▯",

  // Triangles
  TRI_UP: "▲", // pointing up — spike, mountain
  TRI_DOWN: "▼", // pointing down
  TRI_LEFT: "◀",
  TRI_RIGHT: "▶",
  TRI_UP_SM: "▴",
  TRI_DOWN_SM: "▾",
  TRI_LEFT_SM: "◂",
  TRI_RIGHT_SM: "▸",
  TRI_UP_EMPTY: "△",
  TRI_DOWN_EMPTY: "▽",
  TRI_LEFT_EMPTY: "◁",
  TRI_RIGHT_EMPTY: "▷",

  // Circles / orbs
  CIRCLE_FULL: "●", // orb, eye
  CIRCLE_EMPTY: "○", // ring, halo
  CIRCLE_SMALL: "•", // bullet, dot (U+2022)
  CIRCLE_MEDIUM: "⚬",
  CIRCLE_LARGE_EMPTY: "◯",
  CIRCLE_HALF_L: "◐", // half-filled left
  CIRCLE_HALF_R: "◑", // half-filled right
  CIRCLE_HALF_B: "◒", // half-filled bottom
  CIRCLE_HALF_T: "◓", // half-filled top
  CIRCLE_Q_TL: "◔", // quarter filled
  CIRCLE_Q_TR: "◕",
  CIRCLE_DOTTED: "◉", // bullseye / focus
  CIRCLE_BULL: "◎", // double circle — gate
  FISHEYE: "◉",
  SHADOW_CIRC: "◍",
  SHADED_CIRC: "◌", // dotted outline

  // Diamonds
  DIAMOND_FULL: "◆", // gem, key item
  DIAMOND_EMPTY: "◇", // portal, marker
  DIAMOND_SM: "◈", // center-dotted
  LOZENGE: "◊", // (U+25CA) thinner diamond

  // Pentagons / polygons
  PENTA_FULL: "⬠",
  HEXA_FULL: "⬡", // hex tile

  // Stars (in geometric shapes range)
  STAR_4: "✦", // 4-point star
  STAR_4_EMPTY: "✧",
  STAR_6_FULL: "⋆", // small 6-point asterism
  STAR_8: "✴",

  // Misc
  STROKED_SQ: "⊠", // X in square — blocked
  DOTTED_SQ: "⊡", // dot in square — pressure plate
  BULLSEYE: "⊙", // U+2299 — target, switch
  CIRCLE_PLUS: "⊕", // orb of power
  CIRCLE_MINUS: "⊖",
  CIRCLE_X: "⊗", // forbidden zone
  CIRCLE_DOT: "⊙",
  CROSS_IN_CIRCLE: "⊕",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 10. ARROWS  (U+2190–U+21FF + Supplemental)
//     Directional indicators, projectiles, movement.
// ─────────────────────────────────────────────────────────────────────────────
export const ARROWS = {
  LEFT: "←",
  UP: "↑",
  RIGHT: "→",
  DOWN: "↓",
  NE: "↗",
  NW: "↖",
  SE: "↘",
  SW: "↙",
  LEFT_RIGHT: "↔",
  UP_DOWN: "↕",

  LEFT_DBL: "⇐",
  UP_DBL: "⇑",
  RIGHT_DBL: "⇒",
  DOWN_DBL: "⇓",

  LEFT_WIDE: "⇦",
  UP_WIDE: "⇧",
  RIGHT_WIDE: "⇨",
  DOWN_WIDE: "⇩",

  // Heavy arrows
  RIGHT_HEAVY: "➡",
  LEFT_HEAVY: "⬅",
  UP_HEAVY: "⬆",
  DOWN_HEAVY: "⬇",

  // Curved
  CURVE_UR: "↱",
  CURVE_UL: "↰",
  CURVE_DR: "↳",
  CURVE_DL: "↲",

  // Round-trip / rotation
  CW: "↻",
  CCW: "↺",

  // Zigzag / wave
  WAVE_R: "↝",
  WAVE_L: "↜",
  SQUIG_R: "⇝",
  SQUIG_L: "⇜",

  // Triple
  RIGHT_TRIPLE: "⇶",
  RIGHT_PAIRED: "⇉",
  LEFT_PAIRED: "⇇",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 11. MATHEMATICAL & OPERATORS  (U+2200–U+22FF + misc)
//     Arcane symbols, runes, magical glyphs, status effects.
// ─────────────────────────────────────────────────────────────────────────────
export const MATH = {
  FORALL: "∀", // "for all" — area effect
  PARTIAL: "∂", // partial derivative — flux
  EXIST: "∃", // existence glyph
  EMPTY_SET: "∅", // void, nothing
  NABLA: "∇", // gradient — downward force
  IN: "∈", // element of
  NOT_IN: "∉",
  PRODUCT: "∏", // product glyph — manufacture
  SUM: "∑", // sigma-like sum
  MINUS_SIGN: "−",
  ASTERISK_OP: "∗", // bullet / star operator
  RING_OP: "∘", // ring operator — small orb
  SQRT: "√", // root symbol
  INFINITY: "∞", // endless dungeon
  ANGLE: "∠", // angle — trap
  PERP: "⊥", // perpendicular — altar
  TOP: "⊤", // top symbol
  AND: "∧", // logical and — claw/spike up
  OR: "∨", // logical or — claw/spike down
  INTERSECT: "∩", // arch / doorway
  UNION: "∪", // cup / pit
  INTEGRAL: "∫", // scroll, flow
  THEREFORE: "∴", // three dots — summoning
  BECAUSE: "∵", // inverted three dots
  SIMILAR: "∼", // wave / water
  APPROX: "≈", // double wave — deep water / lava
  NOT_EQUAL: "≠",
  CONGRUENT: "≅",
  LESS_MUCH: "≪",
  GREATER_MUCH: "≫",
  PRECEDES: "≺",
  FOLLOWS: "≻",
  SUB_SET: "⊂", // subset — enclosure
  SUPER_SET: "⊃",
  XOR: "⊻", // exclusive or — chaos rune
  NAND: "⊼",
  NOR: "⊽",
  DIAMOND_OP: "⋄", // small diamond
  STAR_OP: "⋆", // star operator
  DIV_TIMES: "⋇",
  BOWTIE: "⋈", // hourglass / portal
  LTIMES: "⋉", // left semidirect product
  RTIMES: "⋊",
  BULLET: "∙", // bullet operator (U+2219)
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 12. MISCELLANEOUS SYMBOLS  (U+2600–U+26FF)
//     Weather, astrology, chess, cards — status, environment.
// ─────────────────────────────────────────────────────────────────────────────
export const MISC_SYMBOLS = {
  // Celestial / weather (single-width in most fonts)
  SUN_FILLED: "☀", // daylight area
  SUN_EMPTY: "☁", // cloud / mist
  LIGHTNING: "☇", // electrified
  SNOWFLAKE: "❄", // cold / ice (U+2744, Dingbats)
  UMBRELLA: "☂", // water protection
  ANKH: "☥", // life symbol

  // Astrological (status effects, class symbols)
  ARIES: "♈",
  TAURUS: "♉",
  GEMINI: "♊",
  CANCER: "♋",
  LEO: "♌",
  VIRGO: "♍",
  LIBRA: "♎",
  SCORPIO: "♏",
  SAGITTARIUS: "♐",
  CAPRICORN: "♑",
  AQUARIUS: "♒",
  PISCES: "♓",

  // Planetary
  MERCURY: "☿", // quicksilver
  VENUS: "♀", // female / life
  MARS: "♂", // male / war
  JUPITER: "♃", // expansion
  SATURN: "♄", // time / death
  URANUS: "♅",
  NEPTUNE: "♆", // trident
  PLUTO: "♇",

  // Chess (for piece-based entities)
  KING_W: "♔",
  KING_B: "♚",
  QUEEN_W: "♕",
  QUEEN_B: "♛",
  ROOK_W: "♖",
  ROOK_B: "♜",
  BISHOP_W: "♗",
  BISHOP_B: "♝",
  KNIGHT_W: "♘",
  KNIGHT_B: "♞",
  PAWN_W: "♙",
  PAWN_B: "♟",

  // Cards (suits — items, factions)
  SPADE: "♠",
  HEART: "♥",
  DIAMOND_SUIT: "♦",
  CLUB: "♣",
  SPADE_W: "♤",
  HEART_W: "♡",
  DIAMOND_W: "♢",
  CLUB_W: "♧",

  // Religious / arcane
  CROSS: "✝", // altar, holy
  CROSS_EMPTY: "†", // dagger, death (U+2020)
  DOUBLE_CROSS: "‡", // U+2021
  STAR_DAVID: "✡", // hexagram
  FLEUR_DE_LIS: "⚜", // nobility
  CADUCEUS: "⚕", // healing
  HAMMER: "⚒", // crafting
  SWORD_CROSS: "⚔", // combat
  SCALES: "⚖", // justice
  ATOM: "⚛", // arcane energy
  BIOHAZARD: "☣", // poison zone
  RADIATION: "☢", // curse zone
  PEACE: "☮", // sanctuary
  YIN_YANG: "☯", // balance / duality
  SKULL: "☠", // death / poison
  COFFIN: "⚰", // death
  ANCHOR: "⚓", // heavy / slow
  HOURGLASS: "⧗", // geometric variant

  // Misc useful
  SNOWMAN: "☃", // ice golem
  TELEPHONE: "✆", // communication
  SCISSORS: "✂", // trap
  WARNING: "⚠", // alert
  RECYCLE: "♻", // regeneration
  WHEELCHAIR: "♿", // slow debuff (creative)
  NOTES: "♩", // music note — bard
  NOTE: "♪",
  NOTES_BEAM: "♫",
  NOTE_DBL: "♬",

  // Suit-like outlines
  FLOWER: "✿", // nature
  SNOWFLAKE_2: "✻", // ice variant
  SPARKLE: "✺", // magic aura
  SPARKLE_2: "✹",
  PINWHEEL: "✸",
  STAR_OUTLINE: "✩", // U+2729 — dim star
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 13. DINGBATS  (U+2700–U+27BF)
//     Decorative glyphs for items, effects, markers.
// ─────────────────────────────────────────────────────────────────────────────
export const DINGBATS = {
  // Arrows (Dingbat)
  ARR_RIGHT_HEAVY: "➤",
  ARR_RIGHT_WHITE: "➢",
  ARR_RIGHT_OPEN: "➜",
  ARR_CURVE_UP: "➫",
  ARR_CURVE_DOWN: "➯",

  // Stars
  STAR_5: "★", // filled 5-point
  STAR_5_EMPTY: "☆", // empty 5-point
  STAR_6: "✶",
  STAR_ASTERISK: "✳",
  STAR_EXPLODE: "✺",
  SNOWFLAKE_3: "❄", // (U+2744)
  SNOWFLAKE_4: "❅",
  SNOWFLAKE_5: "❆",

  // Crosses
  CROSS_1: "✚", // U+271A — filled
  CROSS_LIGHT: "✛",
  CROSS_SQUARE: "✜",
  CROSS_HEAVY: "✝",
  LATIN_CROSS: "†", // U+2020
  CROSS_CERQEE: "✞",
  MALTESE: "✠", // maltese cross
  STAR_CROSS: "✡", // hexagram

  // Bullets / dots
  DOT_CENTERED: "⁃", // hyphen bullet
  TRIAN_BULLET: "‣", // triangular bullet

  // Check / X marks
  CHECK: "✓",
  CHECK_HEAVY: "✔",
  BALLOT_X: "✗",
  BALLOT_X_HEAVY: "✘",

  // Hands/pointing
  RIGHT_POINTING: "☞",
  LEFT_POINTING: "☜",
  UP_POINTING: "☝",
  DOWN_POINTING: "☟",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 14. SUPPLEMENTAL ARROWS & MISC TECHNICAL  (U+27F0–U+27FF, U+2B00–U+2BFF)
// ─────────────────────────────────────────────────────────────────────────────
export const ARROWS_SUPP = {
  // Misc mathematical / supplemental arrows
  LONG_RIGHT: "⟶",
  LONG_LEFT: "⟵",
  LONG_LR: "⟷",
  DBL_LONG_R: "⟹",
  DBL_LONG_L: "⟸",

  // Misc symbols and arrows (U+2B00–U+2BFF)
  PENTA_ARROW_R: "⭆",
  CIRCLE_ARROW: "⭮",
  CIRCLE_ARROW_CW: "⭯",
  WEDGE_UP: "⩚",
  WEDGE_DOWN: "⩛",
  WHITE_STAR_5: "⭒", // alt 5-point star
  DIAMOND_LG: "⬥", // large diamond
  DIAMOND_SM_W: "⬦",
  TRIANGLE_UP: "⭡",
  TRIANGLE_DN: "⭣",
  TRIANGLE_LT: "⭠",
  TRIANGLE_RT: "⭢",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 15. LETTERLIKE SYMBOLS  (U+2100–U+214F)
//     Item labels, quest markers, special rooms.
// ─────────────────────────────────────────────────────────────────────────────
export const LETTERLIKE = {
  ACCOUNT_OF: "℀",
  ADDRESSED_TO: "℁",
  DOUBLE_C: "ℂ", // complex numbers — arcane
  EULER_CONST: "ℯ",
  NATURAL_NUMS: "ℕ",
  RATIONALS: "ℚ",
  REALS: "ℝ",
  INTEGERS: "ℤ",
  PLANCK: "ℏ", // physical constant
  SCRIPT_L: "ℓ", // liter / script l
  IMAGINARY: "ℑ", // imaginary part
  PRESCRIPTION: "℞", // prescription — potion
  RESPONSE: "℟",
  REAL_PART: "ℜ",
  TRADEMARK: "™",
  OHM: "Ω", // (same as Greek omega uppercase)
  INVERTED_OHM: "℧", // mho — lightning resistance
  ANGSTROM: "Å", // distance
  KELVIN: "K",
  FACSIMILE: "℻",
  INO: "℩",
  ROTATED_C: "Ↄ", // reversed C
  TURNED_F: "Ⅎ", // digamma
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 16. CURRENCY  (U+20A0–U+20CF)
//     Economy, shop, loot types.
// ─────────────────────────────────────────────────────────────────────────────
export const CURRENCY = {
  EURO: "€",
  POUND: "£",
  YEN: "¥",
  CENT: "¢",
  FLORIN: "ƒ",
  DONG: "₫",
  WON: "₩",
  RUPEE: "₹",
  SHEKEL: "₪",
  LIRA: "₺",
  RUBLE: "₽",
  BITCOIN: "₿",
  CURRENCY_GEN: "¤", // generic currency — unknown coins
  DRACHMA: "₯",
  CRUZEIRO: "₢",
  PESETA: "₧",
  KIPS: "₭",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 17. SUPERSCRIPTS, SUBSCRIPTS & COMBINING  (for status display)
// ─────────────────────────────────────────────────────────────────────────────
export const SUPER_SUB = {
  // Superscripts
  SUP_0: "⁰",
  SUP_1: "¹",
  SUP_2: "²",
  SUP_3: "³",
  SUP_4: "⁴",
  SUP_5: "⁵",
  SUP_6: "⁶",
  SUP_7: "⁷",
  SUP_8: "⁸",
  SUP_9: "⁹",
  SUP_PLUS: "⁺",
  SUP_MINUS: "⁻",
  SUP_EQ: "⁼",
  SUP_LP: "⁽",
  SUP_RP: "⁾",
  SUP_N: "ⁿ",
  SUP_I: "ⁱ",

  // Subscripts
  SUB_0: "₀",
  SUB_1: "₁",
  SUB_2: "₂",
  SUB_3: "₃",
  SUB_4: "₄",
  SUB_5: "₅",
  SUB_6: "₆",
  SUB_7: "₇",
  SUB_8: "₈",
  SUB_9: "₉",
  SUB_PLUS: "₊",
  SUB_MINUS: "₋",
  SUB_EQ: "₌",
  SUB_LP: "₍",
  SUB_RP: "₎",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 18. ENCLOSED ALPHANUMERIC  (U+2460–U+24FF)
//     Level numbers, zone labels, key indicators.
// ─────────────────────────────────────────────────────────────────────────────
export const ENCLOSED = {
  // Circled digits ①–⑳
  C1: "①",
  C2: "②",
  C3: "③",
  C4: "④",
  C5: "⑤",
  C6: "⑥",
  C7: "⑦",
  C8: "⑧",
  C9: "⑨",
  C10: "⑩",
  C11: "⑪",
  C12: "⑫",
  C13: "⑬",
  C14: "⑭",
  C15: "⑮",
  C16: "⑯",
  C17: "⑰",
  C18: "⑱",
  C19: "⑲",
  C20: "⑳",

  // Parenthesized digits
  P1: "⑴",
  P2: "⑵",
  P3: "⑶",
  P4: "⑷",
  P5: "⑸",

  // Circled Latin
  CA: "Ⓐ",
  CB: "Ⓑ",
  CC: "Ⓒ",
  CD: "Ⓓ",
  CE: "Ⓔ",
  CF: "Ⓕ",
  CG: "Ⓖ",
  CH: "Ⓗ",
  CI: "Ⓘ",
  CJ: "Ⓙ",
  CK: "Ⓚ",
  CL: "Ⓛ",
  CM: "Ⓜ",
  CN: "Ⓝ",
  CO: "Ⓞ",
  CP: "Ⓟ",
  CQ: "Ⓠ",
  CR: "Ⓡ",
  CS: "Ⓢ",
  CT: "Ⓣ",
  CU: "Ⓤ",
  CV: "Ⓥ",
  CW: "Ⓦ",
  CX: "Ⓧ",
  CY: "Ⓨ",
  CZ: "Ⓩ",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 19. OGHAM  (U+1680–U+169F)
//     Ancient tree-script — shrines, nature magic inscriptions.
// ─────────────────────────────────────────────────────────────────────────────
export const OGHAM = {
  SPACE: " ", // U+1680
  BEITH: "ᚁ",
  LUIS: "ᚂ",
  FEARN: "ᚃ",
  SAIL: "ᚄ",
  NION: "ᚅ",
  HUATH: "ᚆ",
  DAIR: "ᚇ",
  TINNE: "ᚈ",
  COLL: "ᚉ",
  QUERT: "ᚊ",
  MUIN: "ᚋ",
  GORT: "ᚌ",
  NGETAL: "ᚍ",
  STRAIF: "ᚎ",
  RUIS: "ᚏ",
  AILM: "ᚐ",
  ONN: "ᚑ",
  UR: "ᚒ",
  EDAD: "ᚓ",
  IDAD: "ᚔ",
  EABHADH: "ᚕ",
  OR: "ᚖ",
  UILLEANN: "ᚗ",
  IPHIN: "ᚘ",
  EMANCHOLL: "ᚙ",
  PEITH: "ᚚ",
  FORFEDA: "᚛",
  TERM: "᚜",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 20. ALCHEMICAL SYMBOLS  (U+1F700–U+1F77F)
//     Potion types, element symbols, transmutation.
//     Note: above U+FFFF — verify your font has this block.
// ─────────────────────────────────────────────────────────────────────────────
export const ALCHEMICAL = {
  QUINTESSENCE: "🜀",
  AIR: "🜁",
  FIRE: "🜂",
  EARTH: "🜃",
  WATER: "🜄",
  AQUA_VITAE: "🜅",
  AQUA_VITAE_2: "🜆",
  AQUA_REGIA: "🜇",
  AQUA_REGIA_2: "🜈",
  VINEGAR: "🜉",
  VITRIOL: "🜊", // sulfuric acid — corrosion
  VITRIOL_COPPER: "🜋",
  SALT: "🜔", // preservation
  SULFUR: "🜍", // brimstone — fire/hell
  SULFUR_2: "🜎",
  MERCURY: "🜏", // quicksilver — speed
  GOLD: "🜚", // transmuted / pure
  SILVER: "🜛",
  IRON: "🜠",
  COPPER: "🜡",
  TIN: "🜤",
  LEAD: "🜨", // heavy
  ANTIMONY: "🜺",
  ARSENIC: "🜺",
  STONE: "🝓", // philosopher's stone
  CROCUS_METALS: "🝡",
  POWDER: "🝣",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 21. ANCIENT SYMBOLS — COPTIC, GOTHIC, GLAGOLITIC (flavor / arcane)
// ─────────────────────────────────────────────────────────────────────────────
export const COPTIC = {
  // A selection of Coptic (U+2C80–U+2CFF) — alien-looking letters
  ALFA: "Ⲁ",
  alfa: "ⲁ",
  VIDA: "Ⲃ",
  vida: "ⲃ",
  GAMMA: "Ⲅ",
  gamma: "ⲅ",
  DALDA: "Ⲇ",
  dalda: "ⲇ",
  EIE: "Ⲉ",
  eie: "ⲉ",
  SOU: "Ⲋ",
  sou: "ⲋ",
  ZATA: "Ⲍ",
  zata: "ⲍ",
  HATE: "Ⲏ",
  hate: "ⲏ",
  THETHE: "Ⲑ",
  thethe: "ⲑ",
  IAUDA: "Ⲓ",
  iauda: "ⲓ",
  KAPA: "Ⲕ",
  kapa: "ⲕ",
  LAULA: "Ⲗ",
  laula: "ⲗ",
  MI: "Ⲙ",
  mi: "ⲙ",
  NI: "Ⲛ",
  ni: "ⲛ",
  KSI: "Ⲝ",
  ksi: "ⲝ",
  PI: "Ⲡ",
  pi: "ⲡ",
  RO: "Ⲣ",
  ro: "ⲣ",
  SIMA: "Ⲥ",
  sima: "ⲥ",
  TAU: "Ⲧ",
  tau: "ⲧ",
  FI: "Ⲫ",
  fi: "ⲫ",
  KHI: "Ⲭ",
  khi: "ⲭ",
  PSI: "Ⲯ",
  psi: "ⲯ",
  OOU: "Ⲱ",
  oou: "ⲱ",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 22. COMBINING CHARACTERS (applied to a base glyph for effects)
//     e.g.  'e' + COMBINING.ENCLOSING_CIRCLE  →  ⓔ  look-alike
//     Render with caution — terminal support varies.
// ─────────────────────────────────────────────────────────────────────────────
export const COMBINING = {
  // Diacritics (U+0300–U+036F)
  GRAVE: "\u{300}",
  ACUTE: "\u{301}",
  CIRC: "\u{302}",
  TILDE_C: "\u{303}",
  MACRON: "\u{304}",
  OVERLINE: "\u{305}",
  BREVE: "\u{306}",
  DOT_ABOVE: "\u{307}",
  DIAERESIS: "\u{308}",
  HOOK_ABOVE: "\u{309}",
  RING_ABOVE: "\u{30A}",
  DOUBLE_ACUTE: "\u{30B}",
  CARON: "\u{30C}",
  VERT_LINE_ABV: "\u{30D}",
  DOUBLE_VERT_ABV: "\u{30E}",
  DOUBLE_GRAVE: "\u{30F}",
  CANDRABINDU: "\u{310}",
  INVERTED_BREVE: "\u{311}",
  HORN: "\u{31B}",
  DOT_BELOW: "\u{323}",
  DIAER_BELOW: "\u{324}",
  RING_BELOW: "\u{325}",
  CEDILLA: "\u{327}",
  OGONEK: "\u{328}",

  // Enclosing
  ENCLOSING_CIRCLE: "\u{20DD}", // character + ⃝  = circled char
  ENCLOSING_KEYCAP: "\u{20E3}", // char + ⃣ = keycap
  ENCLOSING_CIRCLE_BP: "\u{20E0}", // prohibited sign
  ENCLOSING_DIAMOND: "\u{20DF}",
  ENCLOSING_SQUARE: "\u{20DE}",
  COMBINING_LONG_STROKE_OVERLAY: "\u{336}", // strikethrough

  // Overlay
  LONG_SOLIDUS: "\u{338}", // NOT slash overlay
  SHORT_SOLIDUS: "\u{337}",
} as const;

/**
Applies combining characters to a base glyph.

@param base - Base glyph.
@param combiners - Combining marks to append to the base glyph.
@returns The composed glyph sequence.
*/
export const combine = (
  base: string,
  ...combiners: ReadonlyArray<string>
): string => `${base}${combiners.join("")}`;
