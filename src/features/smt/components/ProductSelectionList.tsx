import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, shadows } from '../../../theme';
import type { OrderLotProduct } from '../types';

type Props = {
  products: OrderLotProduct[];
  accentColor: string;
  onSelect: (product: OrderLotProduct) => void;
};

const ProductSelectionList: React.FC<Props> = ({
  products,
  accentColor,
  onSelect,
}) => (
  <View style={styles.container}>
    {products.map(product => (
      <TouchableOpacity
        key={product.id}
        activeOpacity={0.8}
        onPress={() => onSelect(product)}
        style={[styles.card, { borderColor: `${accentColor}30` }]}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{product.name}</Text>
          {product.code ? (
            <Text style={styles.subtitle}>Code: {product.code}</Text>
          ) : null}
          {product.customerName ? (
            <Text style={styles.subtitle}>Customer: {product.customerName}</Text>
          ) : null}
        </View>
        <View style={[styles.badge, { backgroundColor: accentColor }]}>
          <Text style={styles.badgeText}>Pilih</Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    ...shadows.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ProductSelectionList;
