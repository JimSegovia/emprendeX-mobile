import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const ASSET_SCHEMES = ['ph:', 'ph-upload:', 'assets-library:'];

export async function copyAssetToLocal(uri: string): Promise<string> {
  const scheme = uri.split(':')[0] + ':';

  if (!ASSET_SCHEMES.includes(scheme)) {
    return uri;
  }

  const result = await manipulateAsync(uri, [], { format: SaveFormat.JPEG });
  return result.uri;
}
