export const colors = {
  // Canvas & Surfaces
  canvas: '#F6F5EE',
  surfaceCard: '#FFFFFF',
  surfaceSubtle: '#F3F3ED',
  border: '#EAE9E2',

  // Typography
  textMain: '#1A1A1A',
  textBody: '#4B4B4B',
  textMuted: '#949492',

  // Primary Brand Signature (Balance Card)
  primaryYellow: '#F9D938',
  primaryYellowLight: '#FDF6D6',
  primaryYellowDark: '#E1BD14',

  // Semantic & Category Accents
  expenseCoral: '#E84D60',
  expenseCoralBg: '#FCEBE9',

  incomeLavender: '#7B73F6',
  incomeLavenderBg: '#EFEBFE',

  mint: '#2EC4B6',
  mintBg: '#E6F7F5',

  cyan: '#1AC8DB',
  cyanBg: '#E3F8FB',

  rose: '#F24379',
  roseBg: '#FDE7EE',

  orange: '#F97316',
  orangeBg: '#FFF7ED',
};

export const typography = {
  hero: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.textMain,
  },
  headline: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.textMain,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textMain,
  },
  label: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.textBody,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textBody,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textMuted,
  },
};

export const radii = {
  card: 24,
  cardSm: 16,
  pill: 9999,
  round: 50,
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  activePill: {
    shadowColor: '#F9D938',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 2,
  },
};
