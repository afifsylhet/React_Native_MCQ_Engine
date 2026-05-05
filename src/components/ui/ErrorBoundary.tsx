import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    
    // In production, send to error tracking service (Sentry, etc)
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            backgroundColor: colors.background,
          }}
        >
          <MaterialCommunityIcons
            name="alert-circle"
            size={64}
            color={colors.danger}
            style={{ marginBottom: spacing.lg }}
          />

          <Text
            style={{
              fontSize: typography.scale.lg.fontSize,
              fontWeight: typography.weights.bold as any,
              color: colors.textPrimary,
              marginBottom: spacing.md,
              textAlign: 'center',
            }}
          >
            ওহ! কিছু একটা ভুল হয়েছে
          </Text>

          <Text
            style={{
              fontSize: typography.scale.sm.fontSize,
              color: colors.textSecondary,
              marginBottom: spacing.lg,
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            {this.state.error?.message || 'একটি অপ্রত্যাশিত সমস্যা হয়েছে। আবার চেষ্টা করুন।'}
          </Text>

          {__DEV__ && (
            <View
              style={{
                backgroundColor: colors.surfaceAlt,
                borderRadius: spacing.borderRadius.md,
                padding: spacing.md,
                marginBottom: spacing.lg,
                maxHeight: 120,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: colors.textTertiary,
                  fontFamily: 'monospace',
                }}
              >
                {this.state.error?.toString()}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={this.handleReset}
            style={{
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              backgroundColor: colors.primary,
              borderRadius: spacing.borderRadius.md,
              marginBottom: spacing.md,
            }}
          >
            <Text
              style={{
                color: colors.surface,
                fontWeight: typography.weights.bold as any,
              }}
            >
              আবার চেষ্টা করুন
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              // In production, navigate to home
              // navigation.reset({ routes: [{ name: 'Home' }] });
            }}
            style={{
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
            }}
          >
            <Text
              style={{
                color: colors.primary,
                fontWeight: typography.weights.semibold as any,
              }}
            >
              হোমে যান
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
