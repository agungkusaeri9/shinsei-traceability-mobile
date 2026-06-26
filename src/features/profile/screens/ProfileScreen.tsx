import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppTabParamList } from '../../../types';
import ProfileHeader from '../components/ProfileHeader';
import { useAuth } from '../../../hooks/useAuth';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';
import { Cog, Info, User } from 'lucide-react-native/icons';

type Props = {
  navigation: NativeStackNavigationProp<AppTabParamList, 'Profile'>;
};

const menuItems = [
  { id: 'account', label: 'Akun', icon: <User size={20} color="#111827" /> },
  { id: 'setting', label: 'Pengaturan', icon: <Cog size={20} color="#111827" /> },
  { id: 'about', label: 'Tentang Aplikasi', icon: <Info size={20} color="#111827" /> },
];

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const mockUser = user ?? {
    id: '1',
    name: 'User',
    username: 'user',
    role: 'user',
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        <ProfileHeader user={mockUser} />

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              activeOpacity={0.7}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <Button
          title="Keluar"
          variant="danger"
          onPress={() => setShowLogoutModal(true)}
          style={styles.logoutBtn}
        />

        <Text style={styles.version}>Versi 1.0.0</Text>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari aplikasi?"
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
        confirmText="Keluar"
        cancelText="Batal"
        confirmVariant="danger"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0D1B2A',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
  },
  backBtn: { fontSize: 15, color: '#1A73E8', fontWeight: '600' },
  topBarTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  scrollContent: { paddingBottom: 40 },
  menuContainer: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 15, color: '#111827', fontWeight: '500' },
  menuArrow: { fontSize: 22, color: '#D1D5DB' },
  logoutBtn: { marginHorizontal: 20, marginTop: 24 },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 20,
  },
});

export default ProfileScreen;
