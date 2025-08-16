import React from 'react';
import { Ionicons } from "@expo/vector-icons";
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { BORDER_RADIUS, COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from "../../constants/theme";

interface SearchBarProps {
  inputText: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onFocus: () => void;
  onBlur: () => void;
  isMainInputFocused: boolean;
  showRecentOverlay: boolean;
  onCancel: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = React.memo(({
  inputText,
  onChangeText,
  onSubmit,
  onFocus,
  onBlur,
  isMainInputFocused,
  showRecentOverlay,
  onCancel,
  placeholder = "Type Spanish or English"
}) => {
  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputWrapper}>
        <Ionicons 
          name="search" 
          size={20} 
          color={COLORS.GRAY} 
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.mainInput}
          value={inputText}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={COLORS.GRAY}
          returnKeyType="send"
          enablesReturnKeyAutomatically={true}
          blurOnSubmit={false}
          maxLength={500}
        />
      </View>
      {showRecentOverlay && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

SearchBar.displayName = 'SearchBar';

const styles = StyleSheet.create({
  inputContainer: {
    position: "relative",
    padding: SPACING.LG,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.SM,
  },
  inputWrapper: {
    position: "relative",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BORDER_RADIUS.XXL,
    backgroundColor: COLORS.WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
    paddingLeft: SPACING.LG,
  },
  mainInput: {
    flex: 1,
    borderRadius: BORDER_RADIUS.XXL,
    paddingLeft: SPACING.SM,
    paddingRight: SPACING.LG,
    paddingVertical: SPACING.MD,
    maxHeight: 100,
    minWidth: 0,
    backgroundColor: "transparent",
    fontSize: FONT_SIZE.LG,
  },
  searchIcon: {
    marginRight: 0,
  },
  cancelButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZE.LG,
    color: COLORS.PRIMARY,
    fontWeight: FONT_WEIGHT.MEDIUM,
  },
});