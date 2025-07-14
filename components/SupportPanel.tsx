import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { AlertCircle, Mic, Bug } from 'lucide-react-native';

export type SupportContact = {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
};

type Props = {
  contacts?: SupportContact[];
};

const defaultContacts: SupportContact[] = [
  {
    label: 'Email',
    icon: <AlertCircle size={24} color="#fff" />,
    onPress: () => Linking.openURL('mailto:jason.h.suarez@gmail.com'),
  },
  {
    label: 'WhatsApp',
    icon: <Mic size={24} color="#25D366" />,
    onPress: () => Linking.openURL('https://wa.me/33660789132'),
  },
  {
    label: 'Discord : Rejoindre le serveur',
    icon: <Bug size={24} color="#7289da" />,
    onPress: () => Linking.openURL('https://discord.gg/xNzaCV9cPb'),
  },
  {
    label: 'Telegram',
    icon: <AlertCircle size={24} color="#229ED9" />,
    onPress: () => Linking.openURL('https://t.me/editia_support_bot'),
  },
];

const SupportPanel: React.FC<Props> = ({ contacts = defaultContacts }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Support</Text>
    <View style={styles.contactContainer}>
      <Text style={styles.contactHeader}>
        Contactez l&apos;équipe via votre canal préféré :
      </Text>
      {contacts.map((contact, idx) => (
        <TouchableOpacity
          key={contact.label + idx}
          style={styles.settingItem}
          onPress={contact.onPress}
        >
          <View style={styles.settingInfo}>
            {contact.icon}
            <Text style={styles.settingText}>{contact.label}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  contactContainer: {
    backgroundColor: '#181a20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 8,
  },
  contactHeader: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SupportPanel;
