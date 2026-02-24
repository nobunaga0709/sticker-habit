import type { Sticker } from '../types';

export const PRESET_STICKERS: Sticker[] = [
  // Normal (12 stickers)
  { id: 's001', name: 'ハート', emoji: '❤️', rarity: 'normal', color: '#FFE0E6' },
  { id: 's002', name: 'スター', emoji: '⭐', rarity: 'normal', color: '#FFF9C4' },
  { id: 's003', name: 'フラワー', emoji: '🌸', rarity: 'normal', color: '#FCE4EC' },
  { id: 's004', name: 'サンシャイン', emoji: '☀️', rarity: 'normal', color: '#FFF3E0' },
  { id: 's005', name: 'レインボー', emoji: '🌈', rarity: 'normal', color: '#E8F5E9' },
  { id: 's006', name: 'ムーン', emoji: '🌙', rarity: 'normal', color: '#E8EAF6' },
  { id: 's007', name: 'バタフライ', emoji: '🦋', rarity: 'normal', color: '#F3E5F5' },
  { id: 's008', name: 'リーフ', emoji: '🍀', rarity: 'normal', color: '#E8F5E9' },
  { id: 's009', name: 'ベル', emoji: '🔔', rarity: 'normal', color: '#FFFDE7' },
  { id: 's010', name: 'ダイヤ', emoji: '💎', rarity: 'normal', color: '#E1F5FE' },
  { id: 's011', name: 'ケーキ', emoji: '🎂', rarity: 'normal', color: '#FBE9E7' },
  { id: 's012', name: 'バルーン', emoji: '🎈', rarity: 'normal', color: '#FCE4EC' },
  // Rare (6 stickers)
  { id: 's013', name: 'ユニコーン', emoji: '🦄', rarity: 'rare', color: '#EDE7F6' },
  { id: 's014', name: 'ドラゴン', emoji: '🐉', rarity: 'rare', color: '#E8F5E9' },
  { id: 's015', name: 'クラウン', emoji: '👑', rarity: 'rare', color: '#FFF8E1' },
  { id: 's016', name: 'ダイヤモンド', emoji: '💠', rarity: 'rare', color: '#E1F5FE' },
  { id: 's017', name: 'マジック', emoji: '✨', rarity: 'rare', color: '#F3E5F5' },
  { id: 's018', name: 'フェニックス', emoji: '🔥', rarity: 'rare', color: '#FBE9E7' },
  // Super Rare (3 stickers)
  { id: 's019', name: 'ゴールドスター', emoji: '🌟', rarity: 'superRare', color: '#FFF9C4' },
  { id: 's020', name: 'レインボースター', emoji: '🎆', rarity: 'superRare', color: '#F8BBD0' },
  { id: 's021', name: 'マジックスター', emoji: '🪄', rarity: 'superRare', color: '#E8EAF6' },
];

export const STICKER_MAP = Object.fromEntries(PRESET_STICKERS.map(s => [s.id, s]));

export const RARITY_WEIGHTS = {
  normal: 70,   // 70%
  rare: 25,     // 25%
  superRare: 5, // 5%
};

export function drawGacha(ownedStickerIds: string[] = []): Sticker | null {
  const ownedSet = new Set(ownedStickerIds);
  const unowned = PRESET_STICKERS.filter(s => !ownedSet.has(s.id));

  // All stickers collected
  if (unowned.length === 0) return null;

  const rand = Math.random() * 100;
  let rarity: 'normal' | 'rare' | 'superRare';
  if (rand < RARITY_WEIGHTS.normal) {
    rarity = 'normal';
  } else if (rand < RARITY_WEIGHTS.normal + RARITY_WEIGHTS.rare) {
    rarity = 'rare';
  } else {
    rarity = 'superRare';
  }

  // Try the rolled rarity first; if all owned, pick from any unowned sticker
  const rarityPool = unowned.filter(s => s.rarity === rarity);
  const pool = rarityPool.length > 0 ? rarityPool : unowned;
  return pool[Math.floor(Math.random() * pool.length)];
}
