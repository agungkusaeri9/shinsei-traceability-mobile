import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ClipboardCheck } from 'lucide-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { QaAssyStackParamList } from '../../../types';
import { colors } from '../../../theme';
import QaAssyHeader from '../components/QaAssyHeader';
import AcceptanceContent from '../../../components/AcceptanceContent';
import { useQaAcceptanceFlow } from '../hooks/useQaAcceptanceFlow';

type Props = {
  navigation: NativeStackNavigationProp<QaAssyStackParamList, 'QaAcceptance'>;
};

const QaAcceptanceScreen: React.FC<Props> = ({ navigation }) => {
  const flow = useQaAcceptanceFlow();

  return (
    <View style={styles.container}>
      <QaAssyHeader
        title="STK Acceptance"
        subtitle="Scan & Submit Acceptance"
        icon={<ClipboardCheck color={colors.indigo} size={20} />}
        onBack={() => navigation.goBack()}
      />

      <AcceptanceContent
        accentColor={colors.indigo}
        infoText="Scan barcode STK untuk memulai proses Acceptance"
        flow={flow}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});

export default QaAcceptanceScreen;
