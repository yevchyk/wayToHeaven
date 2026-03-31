const contentAudioModules = import.meta.glob('/src/content/**/*.{ogg,mp3,wav,m4a,webm}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const AUDIO_EXTENSIONS = ['ogg', 'mp3', 'wav', 'm4a', 'webm'] as const;

function uniqueValues<T>(values: readonly T[]) {
  return Array.from(new Set(values));
}

function normalizeModulePath(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return normalizedPath.replace(/\/+/g, '/');
}

function buildConventionalModulePaths(assetId: string) {
  if (!assetId.startsWith('chapter-')) {
    return [];
  }

  const [chapterId, ...restParts] = assetId.split('/');
  const relativeAssetPath = restParts.join('/');

  if (!relativeAssetPath) {
    return [];
  }

  const assetBasePath = relativeAssetPath.replace(/\.(ogg|mp3|wav|m4a|webm)$/i, '');
  const explicitPath = /\.(ogg|mp3|wav|m4a|webm)$/i.test(relativeAssetPath)
    ? [`/src/content/chapters/${chapterId}/${relativeAssetPath}`]
    : [];
  const extensionVariants = AUDIO_EXTENSIONS.map(
    (extension) => `/src/content/chapters/${chapterId}/${assetBasePath}.${extension}`,
  );

  return uniqueValues([...explicitPath, ...extensionVariants].map(normalizeModulePath));
}

export function getSuggestedContentAudioPaths(assetId: string | null, sourcePath?: string) {
  if (!assetId && !sourcePath) {
    return [];
  }

  return uniqueValues(
    [
      sourcePath ? normalizeModulePath(sourcePath) : null,
      ...(assetId ? buildConventionalModulePaths(assetId) : []),
    ].filter((value): value is string => Boolean(value)),
  ).map((path) => path.replace(/^\//, ''));
}

export function resolveContentAudioUrl(assetId: string | null, sourcePath?: string) {
  if (!assetId && !sourcePath) {
    return null;
  }

  const candidatePaths = getSuggestedContentAudioPaths(assetId, sourcePath).map((path) =>
    normalizeModulePath(path),
  );

  for (const candidatePath of candidatePaths) {
    const resolvedUrl = contentAudioModules[candidatePath];

    if (resolvedUrl) {
      return resolvedUrl;
    }
  }

  return null;
}
