import type { Suit, Rank, PositionInfo, PreflopRanges } from '../types';

// Card Constants
export const suits: Suit[] = ['♠', '♥', '♦', '♣'];
export const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

// Position Constants
export const positions: PositionInfo[] = [
  { value: 'EP', label: 'Early Position' },
  { value: 'MP', label: 'Middle Position' },
  { value: 'CO', label: 'Cutoff' },
  { value: 'BTN', label: 'Button' },
  { value: 'SB', label: 'Small Blind' },
  { value: 'BB', label: 'Big Blind' }
];

// Preflop Ranges Constants
export const preflopRanges: PreflopRanges = {
  EP: {
    raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AQs', 'AJs', 'AKo'],
    call: ['88', '77', 'ATs', 'KQs', 'AQo'],
    fold: 'default'
  },
  MP: {
    raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AQs', 'AJs', 'ATs', 'KQs', 'AKo', 'AQo'],
    call: ['77', '66', 'A9s', 'KJs', 'QJs', 'JTs', 'AJo'],
    fold: 'default'
  },
  CO: {
    raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'QJs', 'JTs', 'AKo', 'AQo', 'AJo', 'KQo'],
    call: ['55', '44', 'A8s', 'A7s', 'KTs', 'QTs', 'J9s', 'T9s', 'ATo'],
    fold: 'default'
  },
  BTN: {
    raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '87s', '76s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo', 'QJo'],
    call: ['K8s', 'K7s', 'Q8s', 'J8s', '97s', '86s', '75s', '65s', 'A9o', 'KTo', 'QTo'],
    fold: 'default'
  },
  SB: {
    raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A5s', 'A4s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s', 'AKo', 'AQo', 'AJo', 'KQo'],
    call: ['44', '33', '22', 'A6s', 'A3s', 'A2s', 'K9s', 'Q9s', 'J9s', '87s', '76s', 'ATo', 'KJo'],
    fold: 'default'
  },
  BB: {
    raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'AKo', 'AQo'],
    call: ['77', '66', '55', '44', '33', '22', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KTs', 'K9s', 'K8s', 'K7s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '75s', '65s', 'AJo', 'ATo', 'A9o', 'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo'],
    fold: 'default'
  }
};

// Position Advantages Text
export const positionAdvantages: Record<string, string> = {
  EP: 'early position with many players left to act',
  MP: 'middle position with moderate positional advantage',
  CO: 'cutoff position with good positional advantage',
  BTN: 'button position with maximum positional advantage',
  SB: 'small blind position acting first postflop',
  BB: 'big blind position with money already invested'
};
