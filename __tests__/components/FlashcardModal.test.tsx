import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import FlashcardModal from '../../components/FlashcardModal';

describe('FlashcardModal', () => {
  const defaultProps = {
    visible: true,
    userMessage: 'hola',
    response: 'hello',
    onSave: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when visible', () => {
    const { getByText, getByDisplayValue } = render(
      <FlashcardModal {...defaultProps} />
    );

    expect(getByText('Edit Flashcard')).toBeTruthy();
    expect(getByDisplayValue('hola')).toBeTruthy();
    expect(getByDisplayValue('hello')).toBeTruthy();
  });

  it('should not render modal when not visible', () => {
    const { queryByText } = render(
      <FlashcardModal {...defaultProps} visible={false} />
    );

    expect(queryByText('Edit Flashcard')).toBeNull();
  });

  it('should call onSave with updated values when save button is pressed', async () => {
    const mockOnSave = jest.fn();
    const { getByDisplayValue, getByText } = render(
      <FlashcardModal {...defaultProps} onSave={mockOnSave} />
    );

    const frontInput = getByDisplayValue('hola');
    const backInput = getByDisplayValue('hello');

    fireEvent.changeText(frontInput, 'buenos días');
    fireEvent.changeText(backInput, 'good morning');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('buenos días', 'good morning');
    });
  });

  it('should call onCancel when cancel button is pressed', () => {
    const mockOnCancel = jest.fn();
    const { getByText } = render(
      <FlashcardModal {...defaultProps} onCancel={mockOnCancel} />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should disable save button when front text is empty', () => {
    const { getByDisplayValue, getByText } = render(
      <FlashcardModal {...defaultProps} />
    );

    const frontInput = getByDisplayValue('hola');
    fireEvent.changeText(frontInput, '');

    const saveButton = getByText('Save');
    expect(saveButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('should disable save button when back text is empty', () => {
    const { getByDisplayValue, getByText } = render(
      <FlashcardModal {...defaultProps} />
    );

    const backInput = getByDisplayValue('hello');
    fireEvent.changeText(backInput, '');

    const saveButton = getByText('Save');
    expect(saveButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('should enable save button when both fields have content', () => {
    const { getByText } = render(
      <FlashcardModal {...defaultProps} />
    );

    const saveButton = getByText('Save');
    expect(saveButton.props.accessibilityState?.disabled).toBeFalsy();
  });

  it('should update state when text inputs change', () => {
    const { getByDisplayValue } = render(
      <FlashcardModal {...defaultProps} />
    );

    const frontInput = getByDisplayValue('hola');
    const backInput = getByDisplayValue('hello');

    fireEvent.changeText(frontInput, 'adiós');
    fireEvent.changeText(backInput, 'goodbye');

    expect(getByDisplayValue('adiós')).toBeTruthy();
    expect(getByDisplayValue('goodbye')).toBeTruthy();
  });

  it('should reset form when modal becomes visible with new props', () => {
    const { rerender, getByDisplayValue } = render(
      <FlashcardModal {...defaultProps} visible={false} />
    );

    rerender(
      <FlashcardModal
        {...defaultProps}
        visible={true}
        userMessage="gato"
        response="cat"
      />
    );

    expect(getByDisplayValue('gato')).toBeTruthy();
    expect(getByDisplayValue('cat')).toBeTruthy();
  });
});