export const CATEGORIES = ['Biology', 'Earth & Space', 'Chemistry', 'Energy', 'Math', 'Physics']

export const CAT_ABBR = {
  'Biology': 'BIO',
  'Earth & Space': 'EARTH',
  'Chemistry': 'CHEM',
  'Energy': 'ENGY',
  'Math': 'MATH',
  'Physics': 'PHYS',
}

export const PRACTICE_SUBSETS = [
  {
    id: 'cell-bio',
    label: 'Cell Biology',
    category: 'Biology',
    terms: ['cell', 'organelle', 'membrane', 'mitochondria', 'ribosome', 'nucleus', 'endoplasmic', 'golgi', 'chloroplast', 'osmosis', 'diffusion', 'mitosis', 'meiosis'],
  },
  {
    id: 'genetics',
    label: 'Genetics',
    category: 'Biology',
    terms: ['dna', 'rna', 'gene', 'genetic', 'chromosome', 'allele', 'dominant', 'recessive', 'transcription', 'translation', 'mutation', 'heredity'],
  },
  {
    id: 'ecology-evolution',
    label: 'Ecology & Evolution',
    category: 'Biology',
    terms: ['ecosystem', 'population', 'community', 'evolution', 'natural selection', 'adaptation', 'speciation', 'biome', 'food web', 'succession', 'fitness'],
  },
  {
    id: 'anatomy-physiology',
    label: 'Anatomy & Physiology',
    category: 'Biology',
    terms: ['heart', 'blood', 'lung', 'kidney', 'neuron', 'muscle', 'bone', 'digestive', 'respiratory', 'circulatory', 'hormone', 'immune', 'nervous'],
  },
  {
    id: 'biochem-metabolism',
    label: 'Biochemistry',
    category: 'Biology',
    terms: ['enzyme', 'protein', 'lipid', 'carbohydrate', 'atp', 'glycolysis', 'krebs', 'photosynthesis', 'respiration', 'amino acid', 'metabolism'],
  },
  {
    id: 'astronomy',
    label: 'Astronomy',
    category: 'Earth & Space',
    terms: ['star', 'planet', 'galaxy', 'moon', 'solar', 'comet', 'asteroid', 'nebula', 'redshift', 'telescope', 'orbit', 'eclipse', 'supernova'],
  },
  {
    id: 'geology',
    label: 'Geology',
    category: 'Earth & Space',
    terms: ['rock', 'mineral', 'plate tectonic', 'fault', 'earthquake', 'volcano', 'igneous', 'sedimentary', 'metamorphic', 'magma', 'crust', 'mantle'],
  },
  {
    id: 'weather-climate',
    label: 'Weather & Climate',
    category: 'Earth & Space',
    terms: ['weather', 'climate', 'atmosphere', 'cloud', 'wind', 'hurricane', 'pressure', 'front', 'temperature', 'precipitation', 'coriolis'],
  },
  {
    id: 'ocean-water',
    label: 'Ocean & Water',
    category: 'Earth & Space',
    terms: ['ocean', 'stream', 'river', 'lake', 'groundwater', 'aquifer', 'wave', 'tide', 'current', 'salinity', 'glacier', 'hydrologic'],
  },
  {
    id: 'stoichiometry',
    label: 'Stoichiometry',
    category: 'Chemistry',
    terms: ['mole', 'molar', 'stoichiometry', 'mass', 'grams', 'solution', 'concentration', 'limiting', 'yield', 'balance', 'equation'],
  },
  {
    id: 'atomic-periodic',
    label: 'Atomic & Periodic',
    category: 'Chemistry',
    terms: ['atom', 'electron', 'proton', 'neutron', 'periodic', 'ionization', 'electronegativity', 'isotope', 'orbital', 'quantum number'],
  },
  {
    id: 'bonding-structure',
    label: 'Bonding & Structure',
    category: 'Chemistry',
    terms: ['bond', 'ionic', 'covalent', 'molecular', 'lewis', 'geometry', 'hybridization', 'polar', 'crystal', 'intermolecular'],
  },
  {
    id: 'thermo-kinetics',
    label: 'Thermo & Kinetics',
    category: 'Chemistry',
    terms: ['enthalpy', 'entropy', 'gibbs', 'activation', 'rate', 'kinetic', 'equilibrium', 'reaction rate', 'catalyst', 'temperature'],
  },
  {
    id: 'acid-base-equilibrium',
    label: 'Acids & Equilibrium',
    category: 'Chemistry',
    terms: ['acid', 'base', 'ph', 'buffer', 'equilibrium', 'ka', 'kb', 'titration', 'conjugate', 'le chatelier', 'solubility'],
  },
  {
    id: 'organic',
    label: 'Organic Chemistry',
    category: 'Chemistry',
    terms: ['organic', 'alkane', 'alkene', 'alkyne', 'benzene', 'alcohol', 'ketone', 'aldehyde', 'carboxylic', 'ester', 'polymer'],
  },
  {
    id: 'circuits',
    label: 'Circuits',
    category: 'Energy',
    terms: ['circuit', 'voltage', 'current', 'resistance', 'resistor', 'capacitor', 'inductor', 'ohm', 'power', 'battery', 'electric'],
  },
  {
    id: 'renewables',
    label: 'Renewables',
    category: 'Energy',
    terms: ['solar', 'wind', 'hydroelectric', 'renewable', 'photovoltaic', 'geothermal', 'biomass', 'turbine', 'fuel cell'],
  },
  {
    id: 'nuclear-energy',
    label: 'Nuclear Energy',
    category: 'Energy',
    terms: ['nuclear', 'fission', 'fusion', 'reactor', 'radioactive', 'uranium', 'plutonium', 'half-life', 'radiation'],
  },
  {
    id: 'thermal-engines',
    label: 'Thermal Systems',
    category: 'Energy',
    terms: ['heat', 'engine', 'thermal', 'efficiency', 'carnot', 'temperature', 'boiler', 'steam', 'entropy', 'conduction'],
  },
  {
    id: 'algebra',
    label: 'Algebra',
    category: 'Math',
    terms: ['equation', 'polynomial', 'factor', 'linear', 'quadratic', 'variable', 'slope', 'function', 'root', 'solve'],
  },
  {
    id: 'geometry',
    label: 'Geometry',
    category: 'Math',
    terms: ['triangle', 'circle', 'angle', 'area', 'volume', 'radius', 'diameter', 'polygon', 'parallel', 'perpendicular', 'coordinate'],
  },
  {
    id: 'calculus',
    label: 'Calculus',
    category: 'Math',
    terms: ['derivative', 'integral', 'limit', 'calculus', 'differentiation', 'antiderivative', 'slope', 'rate of change'],
  },
  {
    id: 'probability-statistics',
    label: 'Probability & Stats',
    category: 'Math',
    terms: ['probability', 'statistics', 'mean', 'median', 'standard deviation', 'variance', 'random', 'combination', 'permutation'],
  },
  {
    id: 'number-theory',
    label: 'Number Theory',
    category: 'Math',
    terms: ['prime', 'integer', 'divisible', 'factorial', 'modulo', 'remainder', 'sequence', 'series', 'ratio', 'fraction'],
  },
  {
    id: 'mechanics',
    label: 'Mechanics',
    category: 'Physics',
    terms: ['force', 'mass', 'acceleration', 'velocity', 'momentum', 'energy', 'work', 'friction', 'gravity', 'projectile', 'torque'],
  },
  {
    id: 'waves-optics',
    label: 'Waves & Optics',
    category: 'Physics',
    terms: ['wave', 'light', 'lens', 'mirror', 'frequency', 'wavelength', 'diffraction', 'interference', 'reflection', 'refraction', 'sound'],
  },
  {
    id: 'electricity-magnetism',
    label: 'E&M',
    category: 'Physics',
    terms: ['electric', 'magnetic', 'charge', 'field', 'coulomb', 'voltage', 'current', 'induction', 'emf', 'capacitor'],
  },
  {
    id: 'modern-physics',
    label: 'Modern Physics',
    category: 'Physics',
    terms: ['quantum', 'photon', 'electron', 'relativity', 'nuclear', 'radioactive', 'de broglie', 'planck', 'photoelectric'],
  },
  {
    id: 'fluids-thermal',
    label: 'Fluids & Thermal',
    category: 'Physics',
    terms: ['fluid', 'pressure', 'density', 'buoyancy', 'heat', 'temperature', 'gas', 'thermodynamic', 'bernoulli', 'pascal'],
  },
  {
    id: 'lab-methods',
    label: 'Lab Methods',
    category: 'Energy',
    terms: ['measurement', 'significant figures', 'instrument', 'uncertainty', 'experiment', 'safety', 'data', 'laboratory'],
  },
]

const fallbackSubsetByCategory = {
  'Biology': 'cell-bio',
  'Earth & Space': 'astronomy',
  'Chemistry': 'stoichiometry',
  'Energy': 'thermal-engines',
  'Math': 'algebra',
  'Physics': 'mechanics',
}

export function getQuestionSubset(question) {
  const haystack = `${question.question} ${question.answer} ${(question.keywords || []).join(' ')}`.toLowerCase()
  let best = null
  let bestScore = 0

  PRACTICE_SUBSETS.forEach((subset) => {
    if (subset.category !== question.category) return
    const score = subset.terms.reduce((total, term) => total + (haystack.includes(term.toLowerCase()) ? 1 : 0), 0)
    if (score > bestScore) {
      best = subset
      bestScore = score
    }
  })

  return best || PRACTICE_SUBSETS.find((subset) => subset.id === fallbackSubsetByCategory[question.category])
}

export function enrichQuestionsWithSubsets(questions) {
  return questions.map((question) => {
    const subset = getQuestionSubset(question)
    return {
      ...question,
      subsetId: subset?.id || 'general',
      subsetLabel: subset?.label || 'General Review',
    }
  })
}
