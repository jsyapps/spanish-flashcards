import { StyleSheet } from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZE, FONT_WEIGHT, SHADOW, SPACING } from '../constants/theme';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.XXXXL,
  },
  loadingText: {
    fontSize: FONT_SIZE.LG,
    color: COLORS.GRAY,
  },
  emptyText: {
    fontSize: FONT_SIZE.XL,
    color: COLORS.GRAY,
    marginTop: SPACING.LG,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FONT_SIZE.MD,
    color: COLORS.GRAY,
    marginTop: SPACING.SM,
    textAlign: 'center',
  },
  // Enhanced Button styles
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.LG,
    borderRadius: BORDER_RADIUS.LG,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...SHADOW.SM,
  },
  primaryButtonPressed: {
    backgroundColor: COLORS.PRIMARY_DARK,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: COLORS.WHITE,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    fontSize: FONT_SIZE.LG,
    letterSpacing: 0.5,
  },
  
  secondaryButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.LG,
    borderRadius: BORDER_RADIUS.LG,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...SHADOW.SM,
  },
  secondaryButtonPressed: {
    backgroundColor: COLORS.SECONDARY_DARK,
    transform: [{ scale: 0.98 }],
  },
  secondaryButtonText: {
    color: COLORS.WHITE,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    fontSize: FONT_SIZE.LG,
    letterSpacing: 0.5,
  },
  
  outlineButton: {
    backgroundColor: COLORS.WHITE,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.LG,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    ...SHADOW.SM,
  },
  outlineButtonPressed: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    transform: [{ scale: 0.98 }],
  },
  outlineButtonDisabled: {
    borderColor: COLORS.DISABLED,
    backgroundColor: COLORS.DISABLED_BACKGROUND,
  },
  
  // Ghost button for subtle actions
  ghostButton: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.LG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  ghostButtonPressed: {
    backgroundColor: COLORS.GRAY_100,
  },
  ghostButtonText: {
    color: COLORS.PRIMARY,
    fontWeight: FONT_WEIGHT.MEDIUM,
    fontSize: FONT_SIZE.LG,
  },
  // Enhanced Input styles
  textInput: {
    borderWidth: 2,
    borderColor: COLORS.INPUT_BORDER,
    borderRadius: BORDER_RADIUS.LG,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    fontSize: FONT_SIZE.LG,
    backgroundColor: COLORS.INPUT_BACKGROUND,
    color: COLORS.GRAY_800,
    fontWeight: FONT_WEIGHT.REGULAR,
    minHeight: 48,
    ...SHADOW.SM,
  },
  textInputFocus: {
    borderColor: COLORS.INPUT_BORDER_FOCUS,
    ...SHADOW.MD,
  },
  multilineInput: {
    borderWidth: 2,
    borderColor: COLORS.INPUT_BORDER,
    borderRadius: BORDER_RADIUS.LG,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    fontSize: FONT_SIZE.LG,
    minHeight: 120,
    backgroundColor: COLORS.INPUT_BACKGROUND,
    color: COLORS.GRAY_800,
    fontWeight: FONT_WEIGHT.REGULAR,
    textAlignVertical: 'top',
    ...SHADOW.SM,
  },
  multilineInputFocus: {
    borderColor: COLORS.INPUT_BORDER_FOCUS,
    ...SHADOW.MD,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.XL,
    padding: SPACING.XL,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: FONT_SIZE.XL,
    fontWeight: 'bold',
    marginBottom: SPACING.XL,
    textAlign: 'center',
    color: COLORS.DARK_GRAY,
  },
  modalLabel: {
    fontSize: FONT_SIZE.LG,
    fontWeight: 'bold',
    marginBottom: SPACING.SM,
    marginTop: SPACING.LG,
    color: COLORS.DARK_GRAY,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.XL,
  },
  modalButton: {
    flex: 1,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    marginHorizontal: 5,
  },
  // Enhanced Card styles
  card: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    padding: SPACING.XL,
    borderRadius: BORDER_RADIUS.XL,
    marginBottom: SPACING.MD,
    
    ...SHADOW.MD,
  },
  cardHover: {
    ...SHADOW.LG,
    transform: [{ scale: 1.02 }],
  },
  cardPressed: {
    ...SHADOW.SM,
    transform: [{ scale: 0.98 }],
  },
  // Checkbox styles
  checkbox: {
    width: SPACING.XL,
    height: SPACING.XL,
    borderRadius: SPACING.XS,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    marginRight: SPACING.SM,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    backgroundColor: COLORS.PRIMARY,
  },
});