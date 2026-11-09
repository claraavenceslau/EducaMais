// Paleta baseada no protótipo "Paleta do Educa+" (site Mobile II).
// Os valores do protótipo aparecem como `brand`, `violet`, `accent`, `danger`,
// `successFill`, `background` e `text`. Onde o texto branco ou colorido sobre
// eles não atingia contraste 4,5:1 (WCAG AA), existe uma variante mais escura
// (`primary`, `textMuted`, `placeholder`, `successText`) para uso em textos.
export const colors = {
  background: '#F0F2F8', // protótipo: Fundo claro
  surface: '#FFFFFF', // protótipo: Superfície
  text: '#252733', // protótipo: Texto
  textMuted: '#5F6376',
  placeholder: '#6B6F80',
  border: '#D9DBE6',

  brand: '#667EEA', // protótipo: Primária (preenchimentos e destaques, sem texto pequeno)
  primary: '#4F5FD6', // Primária escurecida: botões, links e textos (5,3:1 com branco)
  violet: '#764BA2', // protótipo: Secundária
  accent: '#FF9A22', // protótipo: Acento (use texto escuro sobre ele)
  infoBg: '#EEF0FD',

  danger: '#FF6B6B', // protótipo: Erro / excluir (contornos e preenchimentos)
  error: '#C62848', // texto de erro
  errorBg: '#FDECEF',

  successFill: '#51CF66', // protótipo: Sucesso (preenchimentos)
  success: '#2E8B5E', // ícones
  successText: '#1F7A4D', // textos
  successBg: '#E8F8EE',

  warnText: '#8A4B00',
  warnBg: '#FFF1DC',
};

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

// Pontos de corte do protótipo: celular até 767 px e desktop a partir de 1025 px.
export const layout = { phoneMax: 767, wideMin: 1025, contentMax: 960 };

export const shadow = {
  card: {
    shadowColor: '#252733',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
};
