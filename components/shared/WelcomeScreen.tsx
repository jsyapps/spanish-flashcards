import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS, FONT_SIZE, SPACING } from "../../constants/theme";

interface WelcomeScreenProps {
  title?: string;
  iconSource?: ImageSourcePropType;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = React.memo(({
  title = "Translate → Flashcard",
  iconSource = require('../../assets/images/icon-removebg-preview.png')
}) => {
  return (
    <View style={styles.welcomeContainer}>
      <Image 
        source={iconSource} 
        style={styles.welcomeIcon}
        resizeMode="contain"
      />
      <Text style={styles.welcomeText}>
        {title}
      </Text>
    </View>
  );
});

WelcomeScreen.displayName = 'WelcomeScreen';

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeIcon: {
    width: SPACING.XXXXL * 3, // 120px
    height: SPACING.XXXXL * 3, // 120px
  },
  welcomeText: {
    fontSize: FONT_SIZE.XL,
    color: COLORS.GRAY,
    textAlign: 'center',
    marginTop: SPACING.LG,
    paddingHorizontal: SPACING.LG,
    maxWidth: '90%',
  },
});