const contentImageModules = import.meta.glob('/src/content/**/*.{png,jpg,jpeg,webp,avif,svg}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const IMAGE_EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg', 'avif', 'svg'] as const;

function uniqueValues<T>(values: readonly T[]) {
  return Array.from(new Set(values));
}

function normalizeModulePath(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return normalizedPath.replace(/\/+/g, '/');
}

export function humanizeContentAssetLabel(value: string) {
  return value
    .replace(/\.[^.]+$/, '')
    .split(/[\/_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildConventionalModulePaths(assetId: string) {
  if (!assetId.startsWith('chapter-') && !assetId.startsWith('prologue/')) {
    return [];
  }

  const [rootId, ...restParts] = assetId.split('/');
  const relativeAssetPath = restParts.join('/');

  if (!rootId || !relativeAssetPath) {
    return [];
  }

  const rootImagePath = rootId.startsWith('chapter-')
    ? `/src/content/chapters/${rootId}/images`
    : `/src/content/${rootId}/images`;
  const assetBasePath = relativeAssetPath.replace(/\.(png|webp|jpg|jpeg|avif|svg)$/i, '');
  const explicitPath = /\.(png|webp|jpg|jpeg|avif|svg)$/i.test(relativeAssetPath)
    ? [`${rootImagePath}/${relativeAssetPath}`]
    : [];
  const extensionVariants = IMAGE_EXTENSIONS.map(
    (extension) => `${rootImagePath}/${assetBasePath}.${extension}`,
  );

  return uniqueValues([...explicitPath, ...extensionVariants].map(normalizeModulePath));
}

export function getSuggestedContentImagePaths(assetId: string | null, sourcePath?: string) {
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

export function resolveContentImageUrl(assetId: string | null, sourcePath?: string) {
  if (!assetId && !sourcePath) {
    return null;
  }

  const candidatePaths = getSuggestedContentImagePaths(assetId, sourcePath).map((path) =>
    normalizeModulePath(path),
  );

  for (const candidatePath of candidatePaths) {
    const resolvedUrl = contentImageModules[candidatePath];

    if (resolvedUrl) {
      return resolvedUrl;
    }
  }

  return null;
}
