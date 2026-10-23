import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Button from '../../../components/Button';
import DetailRow from '../../../components/DetailRow';
import LoadingRow from '../../../components/LoadingRow';
import ProfileHeader from '../components/ProfileHeader';
import { useAccountDetailFlow } from '../hooks/useAccountDetailFlow';

const AccountDetailScreen: React.FC = () => {
  const {
    detail,
    headerUser,
    isLoading,
    errorMessage,
    refreshing,
    onRefresh,
    handleRetry,
  } = useAccountDetailFlow();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1A73E8']}
            tintColor="#1A73E8"
          />
        }>
        {isLoading && !detail ? (
          <View style={styles.stateContainer}>
            <LoadingRow text="Memuat detail akun..." />
          </View>
        ) : errorMessage && !detail ? (
          <View style={styles.stateContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Button
              title="Coba Lagi"
              onPress={handleRetry}
              style={styles.retryButton}
            />
          </View>
        ) : detail && headerUser ? (
          <>
            <ProfileHeader user={headerUser} />
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Detail Akun</Text>
              <DetailRow label="Nama Lengkap" value={detail.name} />
              <DetailRow label="Kode" value={detail.code} />
              <DetailRow label="Username" value={detail.username} />
              <DetailRow label="Role" value={detail.role.name} />
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { paddingTop: 8, paddingBottom: 40 },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  errorText: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: { alignSelf: 'stretch' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
    marginHorizontal: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
});

export default AccountDetailScreen;
