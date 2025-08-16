import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../utils/services/apiService';
import { RateLimitStatus as RateLimitStatusType, rateLimitStorage } from '../utils/storage/rateLimitStorage';
import { COLORS, SPACING, FONT_SIZE } from '../constants/theme';

interface RateLimitStatusProps {
  style?: any;
  compact?: boolean;
  showDetailedInfo?: boolean;
}

interface UsageStats {
  totalRequestsToday: number;
  requestsInLastHour: number;
  requestsInLastMinute: number;
  averageRequestsPerDay: number;
}

export default function RateLimitStatus({ 
  style, 
  compact = false, 
  showDetailedInfo = false 
}: RateLimitStatusProps) {
  const [status, setStatus] = useState<RateLimitStatusType | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  const loadRateLimitData = useCallback(async () => {
    try {
      setLoading(true);
      const [rateLimitStatus, stats] = await Promise.all([
        apiService.getRateLimitStatus(),
        apiService.getUsageStats(),
      ]);
      setStatus(rateLimitStatus);
      setUsageStats(stats);
      setLastUpdateTime(Date.now());
    } catch (error) {
      console.error('Failed to load rate limit data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRateLimitData();
    
    // Update every 10 seconds
    const interval = setInterval(loadRateLimitData, 10000);
    
    return () => clearInterval(interval);
  }, [loadRateLimitData]);

  const getStatusColor = useCallback((remaining: number, total: number): string => {
    const percentage = (remaining / total) * 100;
    if (percentage <= 10) return COLORS.DANGER;
    if (percentage <= 25) return COLORS.WARNING;
    return COLORS.SUCCESS;
  }, []);

  const getStatusIcon = useCallback((remaining: number, total: number): any => {
    const percentage = (remaining / total) * 100;
    if (percentage <= 10) return 'warning';
    if (percentage <= 25) return 'alert-circle';
    return 'checkmark-circle';
  }, []);

  const handleClearData = useCallback(() => {
    Alert.alert(
      'Clear Rate Limit Data',
      'This will reset all rate limit counters. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await rateLimitStorage.clearRateLimitData();
              await loadRateLimitData();
              Alert.alert('Success', 'Rate limit data cleared successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear rate limit data.');
            }
          },
        },
      ]
    );
  }, [loadRateLimitData]);

  const formatQuota = useCallback((used: number, total: number): string => {
    return `${used}/${total}`;
  }, []);

  if (loading || !status) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="small" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Compact view for main UI
  if (compact) {
    // const dailyUsed = 100 - status.remainingRequests.daily;
    const dailyColor = getStatusColor(status.remainingRequests.daily, 100);
    const dailyIcon = getStatusIcon(status.remainingRequests.daily, 100);

    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={() => setShowDetailModal(true)}
        disabled={loading}
      >
        <Ionicons name={dailyIcon} size={16} color={dailyColor} />
        <Text style={[styles.compactText, { color: dailyColor }]}>
          {status.remainingRequests.daily}/100
        </Text>
      </TouchableOpacity>
    );
  }

  // Full status view
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setShowDetailModal(true)}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="speedometer" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.title}>API Usage</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.GRAY_500} />
      </TouchableOpacity>

      <View style={styles.quotaGrid}>
        <View style={styles.quotaItem}>
          <Text style={styles.quotaLabel}>Daily</Text>
          <Text style={[
            styles.quotaValue,
            { color: getStatusColor(status.remainingRequests.daily, 100) }
          ]}>
            {formatQuota(100 - status.remainingRequests.daily, 100)}
          </Text>
        </View>
        <View style={styles.quotaItem}>
          <Text style={styles.quotaLabel}>Per Minute</Text>
          <Text style={[
            styles.quotaValue,
            { color: getStatusColor(status.remainingRequests.shortTerm, 10) }
          ]}>
            {formatQuota(10 - status.remainingRequests.shortTerm, 10)}
          </Text>
        </View>
        <View style={styles.quotaItem}>
          <Text style={styles.quotaLabel}>Burst</Text>
          <Text style={[
            styles.quotaValue,
            { color: getStatusColor(status.remainingRequests.burst, 3) }
          ]}>
            {formatQuota(3 - status.remainingRequests.burst, 3)}
          </Text>
        </View>
      </View>

      {/* Detailed Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>API Usage Details</Text>
            <TouchableOpacity
              onPress={() => setShowDetailModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.GRAY_800} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Current Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Limits</Text>
              
              <View style={styles.limitItem}>
                <View style={styles.limitHeader}>
                  <Text style={styles.limitName}>Daily Quota</Text>
                  <Text style={[
                    styles.limitValue,
                    { color: getStatusColor(status.remainingRequests.daily, 100) }
                  ]}>
                    {status.remainingRequests.daily} remaining
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${((100 - status.remainingRequests.daily) / 100) * 100}%`,
                        backgroundColor: getStatusColor(status.remainingRequests.daily, 100),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.limitDescription}>
                  100 requests per 24 hours
                </Text>
              </View>

              <View style={styles.limitItem}>
                <View style={styles.limitHeader}>
                  <Text style={styles.limitName}>Per Minute</Text>
                  <Text style={[
                    styles.limitValue,
                    { color: getStatusColor(status.remainingRequests.shortTerm, 10) }
                  ]}>
                    {status.remainingRequests.shortTerm} remaining
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${((10 - status.remainingRequests.shortTerm) / 10) * 100}%`,
                        backgroundColor: getStatusColor(status.remainingRequests.shortTerm, 10),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.limitDescription}>
                  10 requests per minute
                </Text>
              </View>

              <View style={styles.limitItem}>
                <View style={styles.limitHeader}>
                  <Text style={styles.limitName}>Burst Protection</Text>
                  <Text style={[
                    styles.limitValue,
                    { color: getStatusColor(status.remainingRequests.burst, 3) }
                  ]}>
                    {status.remainingRequests.burst} remaining
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${((3 - status.remainingRequests.burst) / 3) * 100}%`,
                        backgroundColor: getStatusColor(status.remainingRequests.burst, 3),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.limitDescription}>
                  3 requests per 10 seconds
                </Text>
              </View>
            </View>

            {/* Usage Statistics */}
            {usageStats && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Usage Statistics</Text>
                
                <View style={styles.statGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{usageStats.totalRequestsToday}</Text>
                    <Text style={styles.statLabel}>Today</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{usageStats.requestsInLastHour}</Text>
                    <Text style={styles.statLabel}>Last Hour</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{usageStats.averageRequestsPerDay}</Text>
                    <Text style={styles.statLabel}>Daily Average</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Reset Times */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Next Reset Times</Text>
              
              <View style={styles.resetItem}>
                <Text style={styles.resetLabel}>Daily Quota:</Text>
                <Text style={styles.resetTime}>
                  {new Date(status.resetTimes.daily).toLocaleString()}
                </Text>
              </View>
              
              {status.resetTimes.shortTerm > Date.now() && (
                <View style={styles.resetItem}>
                  <Text style={styles.resetLabel}>Per Minute:</Text>
                  <Text style={styles.resetTime}>
                    {new Date(status.resetTimes.shortTerm).toLocaleString()}
                  </Text>
                </View>
              )}
              
              {status.resetTimes.burst > Date.now() && (
                <View style={styles.resetItem}>
                  <Text style={styles.resetLabel}>Burst:</Text>
                  <Text style={styles.resetTime}>
                    {new Date(status.resetTimes.burst).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={loadRateLimitData}
              >
                <Ionicons name="refresh" size={20} color={COLORS.PRIMARY} />
                <Text style={styles.actionButtonText}>Refresh Data</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.dangerButton]}
                onPress={handleClearData}
              >
                <Ionicons name="trash" size={20} color={COLORS.DANGER} />
                <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                  Clear Rate Limit Data
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.lastUpdate}>
              <Text style={styles.lastUpdateText}>
                Last updated: {new Date(lastUpdateTime).toLocaleTimeString()}
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.MD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  compactText: {
    marginLeft: SPACING.XS,
    fontSize: FONT_SIZE.SM,
    fontWeight: '600',
  },
  loadingText: {
    marginLeft: SPACING.SM,
    fontSize: FONT_SIZE.SM,
    color: COLORS.GRAY_500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: SPACING.SM,
    fontSize: FONT_SIZE.MD,
    fontWeight: '600',
    color: COLORS.GRAY_800,
  },
  quotaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quotaItem: {
    alignItems: 'center',
  },
  quotaLabel: {
    fontSize: FONT_SIZE.XS,
    color: COLORS.GRAY_500,
    marginBottom: SPACING.XS,
  },
  quotaValue: {
    fontSize: FONT_SIZE.SM,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.LG,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  modalTitle: {
    fontSize: FONT_SIZE.LG,
    fontWeight: '700',
    color: COLORS.GRAY_800,
  },
  closeButton: {
    padding: SPACING.SM,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.LG,
  },
  section: {
    marginBottom: SPACING.XL,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.MD,
    fontWeight: '600',
    color: COLORS.GRAY_800,
    marginBottom: SPACING.MD,
  },
  limitItem: {
    marginBottom: SPACING.LG,
  },
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  limitName: {
    fontSize: FONT_SIZE.MD,
    fontWeight: '500',
    color: COLORS.GRAY_800,
  },
  limitValue: {
    fontSize: FONT_SIZE.SM,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.BORDER,
    borderRadius: 3,
    marginBottom: SPACING.SM,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  limitDescription: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.GRAY_500,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.XL,
    fontWeight: '700',
    color: COLORS.PRIMARY,
    marginBottom: SPACING.XS,
  },
  statLabel: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.GRAY_500,
  },
  resetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  resetLabel: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.GRAY_500,
  },
  resetTime: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.GRAY_800,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MD,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: SPACING.SM,
  },
  actionButtonText: {
    marginLeft: SPACING.SM,
    fontSize: FONT_SIZE.MD,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  dangerButton: {
    borderColor: COLORS.DANGER,
  },
  dangerButtonText: {
    color: COLORS.DANGER,
  },
  lastUpdate: {
    alignItems: 'center',
    marginTop: SPACING.LG,
    paddingTop: SPACING.LG,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  lastUpdateText: {
    fontSize: FONT_SIZE.SM,
    color: COLORS.GRAY_500,
  },
});