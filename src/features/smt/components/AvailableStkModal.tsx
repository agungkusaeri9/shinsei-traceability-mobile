import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScanBarcode, X } from 'lucide-react-native';

import Button from '../../../components/Button';
import { colors, shadows } from '../../../theme';
import type { AvailableStkDetail } from '../types';

type Props = {
  detail: AvailableStkDetail | null;
  accentColor: string;
  onClose: () => void;
};

const AvailableStkModal: React.FC<Props> = ({ detail, accentColor, onClose }) => (
  <Modal
    visible={detail !== null}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.overlay}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Daftar STK Available</Text>
            <Text style={styles.subtitle}>
              PDDM: {detail?.inventoryCode} | Part: {detail?.partNumber || '-'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X color={colors.textPrimary} size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {detail?.stkList?.length ? (
            detail.stkList.map((stk, index) => (
              <View key={`${stk}-${index}`} style={styles.item}>
                <ScanBarcode color={accentColor} size={18} />
                <View style={styles.itemContent}>
                  <Text style={styles.itemNumber}>{stk}</Text>
                  <Text style={styles.itemPart}>
                    Part No: {detail.partNumber || '-'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Tidak ada STK yang tersedia</Text>
          )}
        </ScrollView>

        <Button
          title="Tutup"
          variant="outline"
          onPress={onClose}
          style={styles.closeButton}
        />
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  list: {
    maxHeight: 300,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: `${colors.textMuted}15`,
  },
  itemContent: {
    flex: 1,
    marginLeft: 10,
  },
  itemNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemPart: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  closeButton: {
    marginTop: 16,
  },
});

export default AvailableStkModal;
