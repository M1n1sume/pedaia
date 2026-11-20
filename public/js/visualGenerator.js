// PEDAIA Visual Generator Engine for Educational Deliverables
// Generates subject-specific, topic-tailored, high-fidelity vector illustrations,
// diagrams, and visual pictures for slides, posters, worksheets, and flashcards.

/**
 * Detect the pedagogical visual domain based on subject and topic keywords
 */
export function detectVisualCategory(topic = '', subject = '') {
  const text = `${topic} ${subject}`.toLowerCase();

  // If subject explicitly indicates domain, respect it
  if (/histor/i.test(subject)) return 'history';
  if (/biolog/i.test(subject)) return 'biology';
  if (/chem/i.test(subject)) return 'chemistry';
  if (/physic/i.test(subject)) return 'physics';
  if (/math/i.test(subject)) return 'mathematics';
  if (/econom/i.test(subject)) return 'economics';
  if (/literat|english|reading/i.test(subject)) return 'literature';
  if (/comput|technol|cs|coding|program/i.test(subject)) return 'technology';

  if (/photo|cell|dna|gene|organism|biolog|plant|animal|ecolog|ecosystem|\bevolut|microb|bacteria|virus|anatomy|heart|brain|respirat|digest/i.test(text)) {
    return 'biology';
  }
  if (/chem|atom|reaction|molecule|acid|base|element|periodic|compound|bond|solution|stoichiometr|gas|electron|nuclear/i.test(text)) {
    return 'chemistry';
  }
  if (/physic|force|motion|newton|gravity|speed|velocity|accelerat|momentum|energy|circuit|electric|magnet|wave|optics|light|sound|thermodynam/i.test(text)) {
    return 'physics';
  }
  if (/math|algebra|calculus|geometr|triangle|pythagor|trig|equation|function|graph|parabola|statistic|probabilit|fraction|matrix/i.test(text)) {
    return 'mathematics';
  }
  if (/econom|supply|demand|market|price|money|financ|trade|inflation|gdp|business|cost|profit|monopol/i.test(text)) {
    return 'economics';
  }
  if (/history|war|ancient|empire|revolut|century|treaty|civil|president|dynasty|medieval|rome|greece|america|colonial/i.test(text)) {
    return 'history';
  }
  if (/english|literat|poem|poetry|sonnet|novel|author|narrat|character|rhetoric|grammar|shakespeare|metaphor|theme/i.test(text)) {
    return 'literature';
  }
  if (/comput|code|program|network|algorithm|software|data|database|cloud|ai|machine learning|web|cyber|security|internet|server/i.test(text)) {
    return 'technology';
  }

  return 'conceptual';
}

/**
 * Generates an authentic, high-impact educational visual SVG tailored to topic and subject
 */
export function generateEducationalVisual({
  topic = 'Instructional Concept',
  subject = 'General Studies',
  slideType = 'Content',
  slideIndex = 0,
  theme = {},
  visualStyle = 'diagram',
  width = 400,
  height = 240
} = {}) {
  const category = detectVisualCategory(topic, subject);
  const primary = theme.primary || '#4F46E5';
  const secondary = theme.secondary || '#06B6D4';
  const textColor = theme.textColor || '#FFFFFF';
  const mutedText = theme.mutedTextColor || '#94A3B8';
  const bgDark = theme.bgDark || '#0F172A';
  const cardDark = theme.cardDark || '#1E293B';
  const fontFamily = (theme.fontFamily || 'Inter, sans-serif').replace(/'/g, '');

  const safeTopic = escapeXml(truncateText(topic, 30));
  const safeSubject = escapeXml(truncateText(subject, 24));

  let artworkSvg = '';

  const params = {
    primary,
    secondary,
    textColor,
    mutedText,
    bgDark,
    cardDark,
    safeTopic,
    safeSubject,
    slideIndex
  };

  switch (category) {
    case 'biology':
      artworkSvg = generateBiologyArtwork(params);
      break;
    case 'chemistry':
      artworkSvg = generateChemistryArtwork(params);
      break;
    case 'physics':
      artworkSvg = generatePhysicsArtwork(params);
      break;
    case 'mathematics':
      artworkSvg = generateMathArtwork(params);
      break;
    case 'economics':
      artworkSvg = generateEconomicsArtwork(params);
      break;
    case 'history':
      artworkSvg = generateHistoryArtwork(params);
      break;
    case 'literature':
      artworkSvg = generateLiteratureArtwork(params);
      break;
    case 'technology':
      artworkSvg = generateTechnologyArtwork(params);
      break;
    default:
      artworkSvg = generateConceptualArtwork(params);
      break;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-full select-none" style="font-family: ${fontFamily}; border-radius: 12px; overflow: hidden;">
      <defs>
        <linearGradient id="vis-bg-grad-${slideIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${cardDark}" />
          <stop offset="100%" stop-color="${bgDark}" />
        </linearGradient>
        <linearGradient id="vis-accent-grad-${slideIndex}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${secondary}" />
        </linearGradient>
        <filter id="vis-glow-${slideIndex}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="vis-shadow-${slideIndex}" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.3" />
        </filter>
      </defs>

      <!-- Background Canvas -->
      <rect width="${width}" height="${height}" fill="url(#vis-bg-grad-${slideIndex})" rx="12" />
      <rect width="${width}" height="${height}" fill="none" stroke="${primary}" stroke-opacity="0.3" stroke-width="1.5" rx="12" />

      <!-- Subtle Grid Texture -->
      <g opacity="0.07" stroke="#FFFFFF" stroke-width="0.5">
        <line x1="0" y1="40" x2="${width}" y2="40" />
        <line x1="0" y1="80" x2="${width}" y2="80" />
        <line x1="0" y1="120" x2="${width}" y2="120" />
        <line x1="0" y1="160" x2="${width}" y2="160" />
        <line x1="0" y1="200" x2="${width}" y2="200" />
        <line x1="80" y1="0" x2="80" y2="${height}" />
        <line x1="160" y1="0" x2="160" y2="${height}" />
        <line x1="240" y1="0" x2="240" y2="${height}" />
        <line x1="320" y1="0" x2="320" y2="${height}" />
      </g>

      <!-- Specific Generated Illustration Artwork -->
      ${artworkSvg}

      <!-- Top Visual Badge -->
      <rect x="14" y="12" width="110" height="20" rx="10" fill="${primary}" fill-opacity="0.25" stroke="${primary}" stroke-width="1" />
      <circle cx="24" cy="22" r="3.5" fill="${secondary}" />
      <text x="34" y="26" fill="${textColor}" font-size="9" font-weight="bold" letter-spacing="0.5">VISUAL MODEL</text>

      <!-- Bottom Topic Legend Bar -->
      <rect x="14" y="${height - 28}" width="${width - 28}" height="18" rx="6" fill="${cardDark}" fill-opacity="0.7" />
      <text x="24" y="${height - 16}" fill="${mutedText}" font-size="9" font-weight="600">
        FIG: <tspan fill="${textColor}" font-weight="bold">${safeTopic}</tspan> • <tspan fill="${secondary}">${category.toUpperCase()}</tspan>
      </text>
    </svg>
  `.trim();
}

// -------------------------------------------------------------------------
// Subject Specific Artwork Generators
// -------------------------------------------------------------------------

function generateBiologyArtwork({ primary, secondary, textColor, mutedText, safeTopic, slideIndex, bgDark, cardDark }) {
  const variant = slideIndex % 3;
  if (variant === 0) {
    // Cell / Organism Model
    return `
      <!-- Cellular Anatomy Visual Model -->
      <ellipse cx="200" cy="115" rx="120" ry="70" fill="${primary}" fill-opacity="0.15" stroke="${primary}" stroke-width="2.5" stroke-dasharray="6 3" />
      <ellipse cx="200" cy="115" rx="105" ry="60" fill="${secondary}" fill-opacity="0.1" />
      
      <!-- Cell Nucleus -->
      <circle cx="170" cy="115" r="32" fill="${primary}" fill-opacity="0.8" stroke="#FFFFFF" stroke-width="1.5" />
      <circle cx="170" cy="115" r="14" fill="${secondary}" />
      <text x="170" y="119" fill="#FFFFFF" font-size="8" font-weight="bold" text-anchor="middle">NUCLEUS</text>

      <!-- Mitochondria / Energy Plant -->
      <ellipse cx="245" cy="95" rx="22" ry="12" fill="${secondary}" fill-opacity="0.85" rx="8" />
      <path d="M 230 95 Q 237 90 245 95 T 260 95" fill="none" stroke="#FFFFFF" stroke-width="1.5" />
      <text x="245" y="80" fill="${mutedText}" font-size="8" text-anchor="middle">Mitochondrion</text>

      <!-- Ribosomes & Cytoplasm Dots -->
      <circle cx="215" cy="140" r="4" fill="${secondary}" />
      <circle cx="245" cy="135" r="3.5" fill="${primary}" />
      <circle cx="130" cy="95" r="4" fill="${secondary}" />
      <circle cx="120" cy="130" r="3.5" fill="${primary}" />

      <!-- Energy Transfer Arrow -->
      <path d="M 270 115 L 330 115" stroke="${secondary}" stroke-width="2" marker-end="url(#arrow)" />
      <polygon points="330,111 340,115 330,119" fill="${secondary}" />
      <rect x="280" y="122" width="60" height="15" rx="4" fill="${primary}" fill-opacity="0.4" />
      <text x="310" y="133" fill="#FFFFFF" font-size="8" font-weight="bold" text-anchor="middle">ATP ENERGY</text>
    `;
  } else if (variant === 1) {
    // DNA Double Helix Model
    return `
      <!-- DNA Double Helix Structure -->
      <g transform="translate(100, 50)">
        <path d="M 20 20 Q 60 70 100 20 T 180 20 T 260 20" fill="none" stroke="${primary}" stroke-width="3.5" />
        <path d="M 20 60 Q 60 10 100 60 T 180 60 T 260 60" fill="none" stroke="${secondary}" stroke-width="3.5" />
        
        <!-- Base Pair Rungs -->
        <line x1="30" y1="35" x2="30" y2="45" stroke="#FFFFFF" stroke-width="2" />
        <line x1="60" y1="68" x2="60" y2="12" stroke="${secondary}" stroke-width="2" />
        <line x1="100" y1="20" x2="100" y2="60" stroke="#FFFFFF" stroke-width="2" />
        <line x1="140" y1="12" x2="140" y2="68" stroke="${primary}" stroke-width="2" />
        <line x1="180" y1="20" x2="180" y2="60" stroke="#FFFFFF" stroke-width="2" />
        <line x1="220" y1="68" x2="220" y2="12" stroke="${secondary}" stroke-width="2" />
        <line x1="250" y1="35" x2="250" y2="45" stroke="#FFFFFF" stroke-width="2" />

        <!-- Base Indicators -->
        <rect x="75" y="80" width="130" height="22" rx="6" fill="${primary}" fill-opacity="0.7" />
        <text x="140" y="94" fill="#FFFFFF" font-size="9" font-weight="bold" text-anchor="middle">A-T • G-C BASE PAIRS</text>
      </g>
    `;
  } else {
    // Ecosystem Energy Pyramid
    return `
      <polygon points="200,50 110,165 290,165" fill="${primary}" fill-opacity="0.2" stroke="${primary}" stroke-width="2" />
      <line x1="140" y1="125" x2="260" y2="125" stroke="${secondary}" stroke-width="1.5" stroke-dasharray="3 3" />
      <line x1="170" y1="85" x2="230" y2="85" stroke="${secondary}" stroke-width="1.5" stroke-dasharray="3 3" />
      
      <text x="200" y="75" fill="#FFFFFF" font-size="8" font-weight="bold" text-anchor="middle">APEX (10 J)</text>
      <text x="200" y="112" fill="${textColor}" font-size="9" font-weight="bold" text-anchor="middle">CONSUMERS (100 J)</text>
      <text x="200" y="152" fill="${textColor}" font-size="10" font-weight="bold" text-anchor="middle">PRODUCERS (1,000 J)</text>
    `;
  }
}

function generateChemistryArtwork({ primary, secondary, textColor, mutedText, safeTopic, slideIndex, bgDark, cardDark }) {
  const variant = slideIndex % 2;
  if (variant === 0) {
    // Atomic Shells & Orbitals
    return `
      <!-- Atomic Nucleus -->
      <ellipse cx="200" cy="115" rx="90" ry="35" fill="none" stroke="${primary}" stroke-width="1.5" transform="rotate(-30 200 115)" />
      <ellipse cx="200" cy="115" rx="90" ry="35" fill="none" stroke="${secondary}" stroke-width="1.5" transform="rotate(30 200 115)" />
      <ellipse cx="200" cy="115" rx="95" ry="30" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="1.5" transform="rotate(90 200 115)" />

      <!-- Orbiting Electrons -->
      <circle cx="130" cy="80" r="5" fill="${secondary}" />
      <circle cx="270" cy="150" r="5" fill="${secondary}" />
      <circle cx="265" cy="75" r="5" fill="${primary}" />
      <circle cx="135" cy="155" r="5" fill="${primary}" />

      <!-- Central Protons/Neutrons Hub -->
      <circle cx="200" cy="115" r="22" fill="${primary}" stroke="#FFFFFF" stroke-width="2" />
      <circle cx="195" cy="110" r="7" fill="${secondary}" />
      <circle cx="206" cy="118" r="6" fill="#FFFFFF" />
      <text x="200" y="145" fill="${textColor}" font-size="9" font-weight="bold" text-anchor="middle">NUCLEUS (p⁺ + n⁰)</text>
    `;
  } else {
    // Laboratory Reaction Apparatus / Beaker
    return `
      <!-- Beaker Outline -->
      <path d="M 170 65 L 170 150 Q 170 165 185 165 L 215 165 Q 230 165 230 150 L 230 65" fill="${cardDark}" stroke="${primary}" stroke-width="2.5" />
      <path d="M 172 110 L 228 110 L 228 152 Q 228 163 215 163 L 185 163 Q 172 163 172 152 Z" fill="${secondary}" fill-opacity="0.4" />
      
      <!-- Reaction Bubbles -->
      <circle cx="190" cy="130" r="4" fill="#FFFFFF" fill-opacity="0.8" />
      <circle cx="210" cy="120" r="3" fill="#FFFFFF" fill-opacity="0.8" />
      <circle cx="198" cy="100" r="4.5" fill="${secondary}" />
      <circle cx="202" cy="80" r="3.5" fill="${primary}" />

      <!-- Reaction Formula Callout -->
      <rect x="250" y="90" width="125" height="40" rx="8" fill="${primary}" fill-opacity="0.8" />
      <text x="312" y="107" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">A + B ➔ C + ΔH</text>
      <text x="312" y="121" fill="${mutedText}" font-size="8" text-anchor="middle">Exothermic Transition</text>
    `;
  }
}

function generatePhysicsArtwork({ primary, secondary, textColor, mutedText, safeTopic, slideIndex, bgDark, cardDark }) {
  const variant = slideIndex % 3;
  if (variant === 0) {
    // Force Vector Diagram / Dynamics
    return `
      <!-- Center Mass Block -->
      <rect x="160" y="90" width="80" height="50" rx="8" fill="${primary}" stroke="#FFFFFF" stroke-width="2" />
      <text x="200" y="120" fill="#FFFFFF" font-size="12" font-weight="bold" text-anchor="middle">MASS (m)</text>

      <!-- Surface Plane -->
      <line x1="80" y1="140" x2="320" y2="140" stroke="${mutedText}" stroke-width="2" />
      <line x1="100" y1="145" x2="90" y2="155" stroke="${mutedText}" stroke-width="1" />
      <line x1="140" y1="145" x2="130" y2="155" stroke="${mutedText}" stroke-width="1" />
      <line x1="180" y1="145" x2="170" y2="155" stroke="${mutedText}" stroke-width="1" />
      <line x1="220" y1="145" x2="210" y2="155" stroke="${mutedText}" stroke-width="1" />
      <line x1="260" y1="145" x2="250" y2="155" stroke="${mutedText}" stroke-width="1" />

      <!-- Force Vectors -->
      <!-- Applied Force Arrow (Right) -->
      <line x1="240" y1="115" x2="310" y2="115" stroke="${secondary}" stroke-width="3" />
      <polygon points="310,110 320,115 310,120" fill="${secondary}" />
      <text x="290" y="105" fill="${secondary}" font-size="10" font-weight="bold">F_app ➔</text>

      <!-- Friction Force Arrow (Left) -->
      <line x1="160" y1="115" x2="110" y2="115" stroke="#EF4444" stroke-width="2.5" />
      <polygon points="110,111 100,115 110,119" fill="#EF4444" />
      <text x="110" y="105" fill="#EF4444" font-size="9" font-weight="bold">← F_fric</text>

      <!-- Normal Force (Up) -->
      <line x1="200" y1="90" x2="200" y2="50" stroke="${secondary}" stroke-width="2" />
      <polygon points="196,50 200,42 204,50" fill="${secondary}" />
      <text x="210" y="55" fill="${secondary}" font-size="9" font-weight="bold">F_N</text>

      <!-- Gravity Force (Down) -->
      <line x1="200" y1="140" x2="200" y2="180" stroke="${primary}" stroke-width="2" />
      <polygon points="196,180 200,188 204,180" fill="${primary}" />
      <text x="210" y="178" fill="${primary}" font-size="9" font-weight="bold">F_g = mg</text>
    `;
  } else if (variant === 1) {
    // Wave Mechanics (Sine Wave with Wavelength & Amplitude)
    return `
      <line x1="50" y1="115" x2="350" y2="115" stroke="${mutedText}" stroke-width="1.5" stroke-dasharray="4 4" />
      
      <!-- Sine Wave Path -->
      <path d="M 50 115 Q 100 45 150 115 T 250 115 T 350 115" fill="none" stroke="${secondary}" stroke-width="3" />
      
      <!-- Amplitude Indicator -->
      <line x1="100" y1="115" x2="100" y2="55" stroke="${primary}" stroke-width="1.5" />
      <polygon points="98,55 100,47 102,55" fill="${primary}" />
      <text x="108" y="85" fill="${primary}" font-size="9" font-weight="bold">A (Amplitude)</text>

      <!-- Wavelength Indicator -->
      <line x1="100" y1="40" x2="300" y2="40" stroke="#FFFFFF" stroke-width="1.5" />
      <polygon points="105,38 97,40 105,42" fill="#FFFFFF" />
      <polygon points="295,38 303,40 295,42" fill="#FFFFFF" />
      <text x="200" y="34" fill="#FFFFFF" font-size="9" font-weight="bold" text-anchor="middle">λ (Wavelength)</text>
    `;
  } else {
    // Electrical Circuit Schematic
    return `
      <!-- Rectangular Circuit Loop -->
      <rect x="90" y="60" width="220" height="110" fill="none" stroke="${primary}" stroke-width="2.5" rx="6" />
      
      <!-- DC Battery Cell -->
      <rect x="75" y="100" width="30" height="30" fill="${bgDark}" />
      <line x1="82" y1="105" x2="98" y2="105" stroke="${secondary}" stroke-width="3" />
      <line x1="86" y1="118" x2="94" y2="118" stroke="${primary}" stroke-width="2" />
      <text x="65" y="118" fill="${secondary}" font-size="10" font-weight="bold">V (+/-)</text>

      <!-- Resistor -->
      <rect x="180" y="52" width="40" height="16" fill="${cardDark}" stroke="#FFFFFF" stroke-width="1.5" rx="2" />
      <text x="200" y="64" fill="#FFFFFF" font-size="9" font-weight="bold" text-anchor="middle">R (Ω)</text>

      <!-- Current Arrow -->
      <path d="M 130 55 L 160 55" stroke="${secondary}" stroke-width="2" />
      <polygon points="160,52 166,55 160,58" fill="${secondary}" />
      <text x="145" y="48" fill="${secondary}" font-size="9" font-weight="bold">I ➔</text>

      <rect x="150" y="135" width="100" height="22" rx="4" fill="${primary}" fill-opacity="0.5" />
      <text x="200" y="150" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">Ohm's Law: V = I × R</text>
    `;
  }
}

function generateMathArtwork({ primary, secondary, textColor, mutedText, safeTopic, slideIndex, bgDark, cardDark }) {
  const variant = slideIndex % 2;
  if (variant === 0) {
    // Cartesian Coordinate Graph with Curve
    return `
      <!-- Axes -->
      <line x1="80" y1="170" x2="330" y2="170" stroke="${mutedText}" stroke-width="2" />
      <polygon points="330,167 338,170 330,173" fill="${mutedText}" />
      <text x="340" y="174" fill="${mutedText}" font-size="10" font-weight="bold">x</text>

      <line x1="120" y1="190" x2="120" y2="45" stroke="${mutedText}" stroke-width="2" />
      <polygon points="117,45 120,37 123,45" fill="${mutedText}" />
      <text x="120" y="34" fill="${mutedText}" font-size="10" font-weight="bold" text-anchor="middle">y</text>

      <!-- Plotted Quadratic Curve -->
      <path d="M 130 160 Q 200 60 300 165" fill="none" stroke="${secondary}" stroke-width="3" />
      
      <!-- Key Vertex Point -->
      <circle cx="200" cy="112" r="5" fill="${primary}" stroke="#FFFFFF" stroke-width="2" />
      <rect x="210" y="98" width="85" height="20" rx="4" fill="${primary}" fill-opacity="0.8" />
      <text x="252" y="112" fill="#FFFFFF" font-size="9" font-weight="bold" text-anchor="middle">Vertex (h, k)</text>
    `;
  } else {
    // Pythagorean Geometric Right Triangle
    return `
      <!-- Right Triangle -->
      <polygon points="120,160 280,160 280,70" fill="${primary}" fill-opacity="0.25" stroke="${primary}" stroke-width="3" />
      
      <!-- Right Angle Marker -->
      <rect x="265" y="145" width="15" height="15" fill="none" stroke="${secondary}" stroke-width="1.5" />

      <!-- Hypotenuse -->
      <line x1="120" y1="160" x2="280" y2="70" stroke="${secondary}" stroke-width="3.5" />
      
      <!-- Labels -->
      <text x="200" y="178" fill="${textColor}" font-size="11" font-weight="bold" text-anchor="middle">Adjacent (a)</text>
      <text x="305" y="120" fill="${textColor}" font-size="11" font-weight="bold">Opposite (b)</text>
      <text x="180" y="105" fill="${secondary}" font-size="12" font-weight="bold">Hypotenuse (c)</text>

      <!-- Equation Badge -->
      <rect x="140" y="40" width="120" height="22" rx="6" fill="${secondary}" fill-opacity="0.3" stroke="${secondary}" stroke-width="1" />
      <text x="200" y="55" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">a² + b² = c²</text>
    `;
  }
}

function generateEconomicsArtwork({ primary, secondary, textColor, mutedText, safeTopic, slideIndex, bgDark, cardDark }) {
  return `
    <!-- Axes -->
    <line x1="80" y1="170" x2="320" y2="170" stroke="${mutedText}" stroke-width="2" />
    <text x="325" y="174" fill="${mutedText}" font-size="10" font-weight="bold">Q (Quantity)</text>

    <line x1="100" y1="190" x2="100" y2="50" stroke="${mutedText}" stroke-width="2" />
    <text x="100" y="42" fill="${mutedText}" font-size="10" font-weight="bold" text-anchor="middle">P (Price)</text>

    <!-- Supply Curve (Upward) -->
    <line x1="115" y1="160" x2="280" y2="65" stroke="${secondary}" stroke-width="3" />
    <text x="290" y="65" fill="${secondary}" font-size="11" font-weight="bold">S (Supply)</text>

    <!-- Demand Curve (Downward) -->
    <line x1="115" y1="65" x2="280" y2="160" stroke="${primary}" stroke-width="3" />
    <text x="290" y="165" fill="${primary}" font-size="11" font-weight="bold">D (Demand)</text>

    <!-- Equilibrium Point -->
    <circle cx="197" cy="112" r="6" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2" />
    <line x1="100" y1="112" x2="197" y2="112" stroke="#F59E0B" stroke-dasharray="3 3" />
    <line x1="197" y1="112" x2="197" y2="170" stroke="#F59E0B" stroke-dasharray="3 3" />

    <rect x="180" y="85" width="85" height="18" rx="4" fill="#F59E0B" />
    <text x="222" y="98" fill="#000000" font-size="9" font-weight="bold" text-anchor="middle">Equilibrium (E₀)</text>
  `;
}

function generateHistoryArtwork({ primary, secondary, textColor, mutedText, safeTopic, slideIndex, bgDark, cardDark }) {
  return `
    <!-- Historical Chronological Ribbon -->
    <line x1="60" y1="115" x2="340" y2="115" stroke="${primary}" stroke-width="3" />
    
    <!-- Milestone 1 -->
    <circle cx="100" cy="115" r="8" fill="${secondary}" stroke="#FFFFFF" stroke-width="2" />
    <rect x="70" y="65" width="60" height="32" rx="6" fill="${cardDark}" stroke="${secondary}" stroke-width="1" />
    <text x="100" y="79" fill="${secondary}" font-size="8" font-weight="bold" text-anchor="middle">ERA I</text>
    <text x="100" y="91" fill="${textColor}" font-size="7" text-anchor="middle">Origins</text>

    <!-- Milestone 2 (Major Catalyst) -->
    <circle cx="200" cy="115" r="12" fill="${primary}" stroke="#FFFFFF" stroke-width="2.5" />
    <rect x="160" y="135" width="80" height="32" rx="6" fill="${primary}" />
    <text x="200" y="149" fill="#FFFFFF" font-size="9" font-weight="bold" text-anchor="middle">CATALYST</text>
    <text x="200" y="161" fill="${mutedText}" font-size="7" text-anchor="middle">Turning Point</text>

    <!-- Milestone 3 -->
    <circle cx="300" cy="115" r="8" fill="${secondary}" stroke="#FFFFFF" stroke-width="2" />
    <rect x="270" y="65" width="60" height="32" rx="6" fill="${cardDark}" stroke="${secondary}" stroke-width="1" />
    <text x="300" y="79" fill="${secondary}" font-size="8" font-weight="bold" text-anchor="middle">LEGACY</text>
    <text x="300" y="91" fill="${textColor}" font-size="7" text-anchor="middle">Global Impact</text>
  `;
}

function generateLiteratureArtwork({ primary, secondary, textColor, mutedText, safeTopic, slideIndex, bgDark, cardDark }) {
  return `
    <!-- Narrative Arc / Freytag's Pyramid -->
    <path d="M 60 160 L 140 130 L 200 65 L 260 130 L 340 160" fill="none" stroke="${secondary}" stroke-width="3" />
    <polygon points="60,160 140,130 200,65 260,130 340,160 340,170 60,170" fill="${primary}" fill-opacity="0.15" />

    <!-- Climax Marker -->
    <circle cx="200" cy="65" r="6" fill="${primary}" stroke="#FFFFFF" stroke-width="2" />
    <rect x="165" y="40" width="70" height="18" rx="4" fill="${primary}" />
    <text x="200" y="52" fill="#FFFFFF" font-size="9" font-weight="bold" text-anchor="middle">CLIMAX</text>

    <!-- Narrative Stages -->
    <text x="90" y="152" fill="${mutedText}" font-size="8">Exposition</text>
    <text x="145" y="110" fill="${textColor}" font-size="8">Rising Action</text>
    <text x="265" y="110" fill="${textColor}" font-size="8">Falling Action</text>
    <text x="310" y="152" fill="${mutedText}" font-size="8">Resolution</text>
  `;
}

function generateTechnologyArtwork({ primary, secondary, textColor, mutedText, safeTopic, slideIndex, bgDark, cardDark }) {
  return `
    <!-- System Architecture Diagram (Client - Server - DB) -->
    <!-- Client Node -->
    <rect x="60" y="90" width="75" height="50" rx="8" fill="${primary}" stroke="#FFFFFF" stroke-width="1.5" />
    <text x="97" y="113" fill="#FFFFFF" font-size="10" font-weight="bold" text-anchor="middle">CLIENT</text>
    <text x="97" y="126" fill="${mutedText}" font-size="8" text-anchor="middle">UI / Browser</text>

    <!-- Arrow 1 -->
    <line x1="135" y1="115" x2="165" y2="115" stroke="${secondary}" stroke-width="2" stroke-dasharray="3 3" />
    <polygon points="165,111 172,115 165,119" fill="${secondary}" />

    <!-- Core Server Node -->
    <rect x="172" y="80" width="85" height="70" rx="10" fill="${secondary}" stroke="#FFFFFF" stroke-width="2" />
    <text x="214" y="108" fill="#FFFFFF" font-size="11" font-weight="bold" text-anchor="middle">AI ENGINE</text>
    <text x="214" y="124" fill="#0F172A" font-size="8" font-weight="bold" text-anchor="middle">Gateway / Logic</text>

    <!-- Arrow 2 -->
    <line x1="257" y1="115" x2="287" y2="115" stroke="${secondary}" stroke-width="2" />
    <polygon points="287,111 294,115 287,119" fill="${secondary}" />

    <!-- Database Cylinder -->
    <ellipse cx="325" cy="92" rx="28" ry="10" fill="${primary}" stroke="#FFFFFF" stroke-width="1.5" />
    <rect x="297" y="92" width="56" height="40" fill="${primary}" />
    <ellipse cx="325" cy="132" rx="28" ry="10" fill="${primary}" stroke="#FFFFFF" stroke-width="1.5" />
    <text x="325" y="116" fill="#FFFFFF" font-size="9" font-weight="bold" text-anchor="middle">STORAGE</text>
  `;
}

function generateConceptualArtwork({ primary, secondary, textColor, mutedText, safeTopic, safeSubject, slideIndex, bgDark, cardDark }) {
  return `
    <!-- Central Hub & Interconnected Satellites -->
    <!-- Connecting Radial Lines -->
    <line x1="200" y1="115" x2="100" y2="70" stroke="${primary}" stroke-width="2" stroke-dasharray="4 3" />
    <line x1="200" y1="115" x2="300" y2="70" stroke="${secondary}" stroke-width="2" stroke-dasharray="4 3" />
    <line x1="200" y1="115" x2="110" y2="160" stroke="${secondary}" stroke-width="2" stroke-dasharray="4 3" />
    <line x1="200" y1="115" x2="290" y2="160" stroke="${primary}" stroke-width="2" stroke-dasharray="4 3" />

    <!-- Satellite 1 -->
    <circle cx="100" cy="70" r="22" fill="${cardDark}" stroke="${primary}" stroke-width="2" />
    <text x="100" y="73" fill="#FFFFFF" font-size="8" font-weight="bold" text-anchor="middle">INPUTS</text>

    <!-- Satellite 2 -->
    <circle cx="300" cy="70" r="22" fill="${cardDark}" stroke="${secondary}" stroke-width="2" />
    <text x="300" y="73" fill="#FFFFFF" font-size="8" font-weight="bold" text-anchor="middle">OUTCOMES</text>

    <!-- Satellite 3 -->
    <circle cx="110" cy="160" r="20" fill="${cardDark}" stroke="${secondary}" stroke-width="2" />
    <text x="110" y="163" fill="#FFFFFF" font-size="8" font-weight="bold" text-anchor="middle">RULES</text>

    <!-- Satellite 4 -->
    <circle cx="290" cy="160" r="20" fill="${cardDark}" stroke="${primary}" stroke-width="2" />
    <text x="290" y="163" fill="#FFFFFF" font-size="8" font-weight="bold" text-anchor="middle">TRANSFER</text>

    <!-- Central Anchor Core -->
    <circle cx="200" cy="115" r="34" fill="${primary}" stroke="#FFFFFF" stroke-width="2.5" />
    <circle cx="200" cy="115" r="28" fill="${secondary}" fill-opacity="0.3" />
    <text x="200" y="113" fill="#FFFFFF" font-size="9" font-weight="bold" text-anchor="middle">SYSTEM</text>
    <text x="200" y="125" fill="#FFFFFF" font-size="8" text-anchor="middle">MODEL</text>
  `;
}

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

export function getVisualCaption(topic = 'Concept', slideType = 'Model', index = 1) {
  const types = {
    'Title': 'Overview & Anchor Phenomenon',
    'Objectives': 'Target Competency Blueprint',
    'Explanation': 'Primary Mechanism & Structural Hierarchy',
    'Activity': 'Collaborative Inquiry Diagram',
    'Summary': 'Key Takeaways & Conceptual Synthesis'
  };
  const label = types[slideType] || 'Conceptual Model';
  return `Fig ${index}: ${topic} — ${label}`;
}

export function svgToDataUri(svgString) {
  if (typeof btoa === 'function') {
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
  }
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
}

function truncateText(str, max = 30) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max - 1) + '…' : str;
}

function escapeXml(unsafe) {
  return String(unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}
