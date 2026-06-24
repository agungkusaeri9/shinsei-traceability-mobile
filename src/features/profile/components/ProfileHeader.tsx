import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { User } from '../../../types';
import { getInitials } from '../../../utils/formatter';

interface ProfileHeaderProps {
  user: User;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
      </View>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>{user.role}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 32 },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1A73E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  name: { fontSize: 22, fontWeight: '700', color: '#111827' },
  email: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  roleBadge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
  },
  roleText: { fontSize: 12, color: '#3730A3', fontWeight: '600' },
});

export default ProfileHeader;
