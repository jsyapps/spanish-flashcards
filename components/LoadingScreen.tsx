import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { commonStyles } from '../styles/common';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...' 
}) => (
  <SafeAreaView style={commonStyles.container}>
    <View style={commonStyles.centerContent}>
      <Text style={commonStyles.loadingText}>{message}</Text>
    </View>
  </SafeAreaView>
);