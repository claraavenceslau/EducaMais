import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import type { Attachment } from '../types';
import { kindFromMime } from '../utils/attachments';
import { newId } from '../utils/id';

export type PickResult =
  | { status: 'ok'; attachment: Attachment }
  | { status: 'canceled' }
  | { status: 'denied'; message: string }
  | { status: 'error'; message: string };

type Asset = { uri: string; fileName?: string | null; fileSize?: number; mimeType?: string };

function fromImage(asset: Asset): Attachment {
  const name = asset.fileName || asset.uri.split('/').pop() || 'foto.jpg';
  return {
    id: newId('a'),
    kind: 'image',
    name,
    uri: asset.uri,
    mimeType: asset.mimeType ?? 'image/jpeg',
    sizeBytes: asset.fileSize,
  };
}

export async function takePhoto(): Promise<PickResult> {
  try {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      return { status: 'denied', message: 'Sem permissão da câmera. Você pode escolher uma foto da galeria.' };
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (result.canceled || !result.assets[0]) return { status: 'canceled' };
    return { status: 'ok', attachment: fromImage(result.assets[0]) };
  } catch {
    return { status: 'error', message: 'Não foi possível abrir a câmera neste aparelho.' };
  }
}

export async function pickPhoto(): Promise<PickResult> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (result.canceled || !result.assets[0]) return { status: 'canceled' };
    return { status: 'ok', attachment: fromImage(result.assets[0]) };
  } catch {
    return { status: 'error', message: 'Não foi possível abrir a galeria.' };
  }
}

export async function pickDocument(): Promise<PickResult> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets[0]) return { status: 'canceled' };
    const a = result.assets[0];
    return {
      status: 'ok',
      attachment: {
        id: newId('a'),
        kind: kindFromMime(a.mimeType),
        name: a.name,
        uri: a.uri,
        mimeType: a.mimeType,
        sizeBytes: a.size,
      },
    };
  } catch {
    return { status: 'error', message: 'Não foi possível abrir os documentos.' };
  }
}
