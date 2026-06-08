/**
 * Utility to dynamically discover and prioritize the best available Gemini model
 * for a user's API Key, ensuring backward and forward compatibility.
 */

function selectModelFromList(models) {
  if (!models || !Array.isArray(models) || models.length === 0) return null;

  // Filter for models supporting generateContent
  const generateModels = models.filter(m => 
    m.supportedGenerationMethods && 
    m.supportedGenerationMethods.includes('generateContent')
  );

  if (generateModels.length === 0) return null;

  // Extract model base names (removing the 'models/' prefix for match check)
  const getBaseName = (name) => name.replace(/^models\//, '');
  const names = generateModels.map(m => getBaseName(m.name));

  // Priorities list of stable/featured models in 2026
  const priorities = [
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
    'gemini-1.5-flash'
  ];

  for (const p of priorities) {
    if (names.includes(p)) {
      const found = generateModels.find(m => getBaseName(m.name) === p);
      return found.name; // returns the full path, e.g. "models/gemini-1.5-flash"
    }
  }

  // Look for any model containing "flash" (case insensitive)
  const anyFlash = generateModels.find(m => getBaseName(m.name).toLowerCase().includes('flash'));
  if (anyFlash) return anyFlash.name;

  // Look for any model containing "pro" (case insensitive)
  const anyPro = generateModels.find(m => getBaseName(m.name).toLowerCase().includes('pro'));
  if (anyPro) return anyPro.name;

  // Fallback to first generateContent model
  return generateModels[0].name;
}

export async function getBestAvailableModelAndUrl(apiKey) {
  if (!apiKey) {
    return {
      model: 'models/gemini-1.5-flash',
      version: 'v1beta',
      url: ''
    };
  }

  // Check if we already cached a verified model/URL in this session
  const cachedModel = sessionStorage.getItem('herverse-discovered-gemini-model');
  const cachedVersion = sessionStorage.getItem('herverse-discovered-gemini-version');
  if (cachedModel && cachedVersion) {
    return {
      model: cachedModel,
      version: cachedVersion,
      url: `https://generativelanguage.googleapis.com/${cachedVersion}/${cachedModel}:generateContent?key=${apiKey}`
    };
  }

  const defaultModel = 'models/gemini-1.5-flash';
  const defaultVersion = 'v1beta';

  try {
    // Try to list models on v1beta first
    let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    let version = 'v1beta';
    
    if (!res.ok) {
      // Try v1
      res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
      version = 'v1';
    }

    if (!res.ok) {
      // Fallback if both list requests fail (could be invalid key or network issue)
      return {
        model: defaultModel,
        version: defaultVersion,
        url: `https://generativelanguage.googleapis.com/${defaultVersion}/${defaultModel}:generateContent?key=${apiKey}`
      };
    }

    const data = await res.json();
    const selected = selectModelFromList(data.models);
    
    if (selected) {
      sessionStorage.setItem('herverse-discovered-gemini-model', selected);
      sessionStorage.setItem('herverse-discovered-gemini-version', version);
      return {
        model: selected,
        version,
        url: `https://generativelanguage.googleapis.com/${version}/${selected}:generateContent?key=${apiKey}`
      };
    }

    return {
      model: defaultModel,
      version: defaultVersion,
      url: `https://generativelanguage.googleapis.com/${defaultVersion}/${defaultModel}:generateContent?key=${apiKey}`
    };
  } catch (err) {
    console.error("Error listing Gemini models, using default:", err);
    return {
      model: defaultModel,
      version: defaultVersion,
      url: `https://generativelanguage.googleapis.com/${defaultVersion}/${defaultModel}:generateContent?key=${apiKey}`
    };
  }
}
