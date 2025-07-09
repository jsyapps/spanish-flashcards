import { StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, SHADOW } from '../constants/theme';

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
  // Button styles
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.LG,
  },
  secondaryButton: {
    backgroundColor: COLORS.SECONDARY,
    paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.LG,
  },
  outlineButton: {
    backgroundColor: COLORS.WHITE,
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
  },
  outlineButtonDisabled: {
    borderColor: COLORS.DISABLED,
    backgroundColor: COLORS.DISABLED_BACKGROUND,
  },
  // Input styles
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    fontSize: FONT_SIZE.LG,
    backgroundColor: COLORS.INPUT_BACKGROUND,
  },
  multilineInput: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    fontSize: FONT_SIZE.LG,
    minHeight: 80,
    backgroundColor: COLORS.INPUT_BACKGROUND,
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
  // Card styles
  card: {
    backgroundColor: COLORS.WHITE,
    padding: SPACING.XL,
    borderRadius: BORDER_RADIUS.XL,
    marginBottom: SPACING.SM,
    shadowColor: SHADOW.color,
    shadowOffset: SHADOW.offset,
    shadowOpacity: SHADOW.opacity,
    shadowRadius: SHADOW.radius,
    elevation: SHADOW.elevation,
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