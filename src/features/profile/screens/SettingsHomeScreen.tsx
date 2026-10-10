import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../../types';
import { Globe } from 'lucide-react-native';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;
};

const settingsItems = [
  {
    id: 'changeIp',
    label: 'Change IP Address',
    description: 'Atur Base URL / IP address server API',
    icon: <Globe size={20} color="#111827" />,
  },
];

const SettingsHomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleItemPress = (id: string) => {
    switch (id) {
      case 'changeIp':
        navigation.navigate('ChangeIPAddress');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.menuContainer}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === settingsItems.length - 1 && styles.menuItemLast,
              ]}
              activeOpacity={0.7}
              onPress={() => handleItemPress(item.id)}
            >
              <View style={styles.menuIcon}>{item.icon}</View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.description ? (
                  <Text style={styles.menuDesc}>{item.description}</Text>
                ) : null}
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContent: { paddingTop: 16, paddingBottom: 40 },
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
  menuIcon: { marginRight: 14 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, color: '#111827', fontWeight: '500' },
  menuDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  menuArrow: { fontSize: 22, color: '#D1D5DB' },
});

export default SettingsHomeScreen;