import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../../../../theme';
import Button from '../../../../components/Button';
import type { PhotoAsset } from '../../hooks/useStockInFlow';

type Props = {
  photo: PhotoAsset | null;
  onTakePhoto: () => void;
  onRemovePhoto: () => void;
};

/** Optional evidence-photo section of Stock In step 3. */
const StockInPhotoSection: React.FC<Props> = ({
  photo,
  onTakePhoto,
  onRemovePhoto,
}) => (
  <View style={styles.photoSection}>
    <Text style={styles.photoLabel}>Evidence Photo (Opsional)</Text>
    {photo ? (
      <View style={styles.photoPreviewContainer}>
        <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
        <Button
          title="Hapus Foto"
          variant="danger"
          onPress={onRemovePhoto}
          style={styles.removePhotoBtn}
        />
      </View>
    ) : (
      <Button
        title="Ambil Foto"
        onPress={onTakePhoto}
        style={styles.takePhotoBtn}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  photoSection: {
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: `${colors.textMuted}20`,
  },
  photoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  photoPreviewContainer: {
    alignItems: 'center',
    gap: 12,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: `${colors.textMuted}10`,
    resizeMode: 'cover',
  },
  removePhotoBtn: {
    alignSelf: 'stretch',
    paddingVertical: 10,
  },
  takePhotoBtn: {
    paddingVertical: 10,
  },
});

export default StockInPhotoSection;
