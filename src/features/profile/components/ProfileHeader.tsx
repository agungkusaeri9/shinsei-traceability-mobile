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
      <Text style={styles.username}>{user.username.toLowerCase()}</Text>
      {/* <View style={styles.roleBadge}>
        <Text style={styles.roleText}>{user.role}</Text>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 20 },
  avatarContainer: {
    width: 70,
    height: 70,
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
  avatarText: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827' },
  username: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  roleBadge: {
    marginTop: 2,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
  },
  roleText: { fontSize: 12, color: '#3730A3', fontWeight: '600' },
});

export default ProfileHeader;
