import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SmtStackParamList } from '../../../types';
import { colors } from '../../../theme';
import SmtHeader from '../components/SmtHeader';

type Props = {
  navigation: NativeStackNavigationProp<SmtStackParamList, 'Finish'>;
};

const FinishScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <SmtHeader
        title="Finish"
        subtitle="Selesaikan proses SMT"
        icon={<CheckCircle2 color={colors.success} size={18} />}
        iconBgColor={`${colors.success}25`}
        onBack={() => navigation.navigate('SmtHome')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.placeholderContainer}>
          <CheckCircle2 color={colors.textMuted} size={64} />
          <Text style={styles.placeholderTitle}>Finish</Text>
          <Text style={styles.placeholderText}>
            Fitur ini akan segera tersedia.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default FinishScreen;
