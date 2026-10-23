import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PackageCheck } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SmtStackParamList } from '../../../types';
import { colors } from '../../../theme';
import SmtHeader from '../components/SmtHeader';
import AcceptanceContent from '../../../components/AcceptanceContent';
import { useSmtAcceptanceFlow } from '../hooks/useSmtAcceptanceFlow';

type Props = {
  navigation: NativeStackNavigationProp<SmtStackParamList, 'SmtAcceptance'>;
};

const SmtAcceptanceScreen: React.FC<Props> = ({ navigation }) => {
  const flow = useSmtAcceptanceFlow();

  return (
    <View style={styles.container}>
      <SmtHeader
        title="STK Acceptance"
        subtitle="Scan & Submit Acceptance SMT"
        icon={<PackageCheck color={colors.primary} size={20} />}
        onBack={() => navigation.goBack()}
      />

      <AcceptanceContent
        accentColor={colors.primary}
        infoText="Scan barcode STK untuk memulai proses Acceptance SMT"
        flow={flow}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});

export default SmtAcceptanceScreen;
