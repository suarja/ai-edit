import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Menu } from 'lucide-react-native';
import { useSidebar } from '@/contexts/SidebarContext';

interface DrawerToggleProps {
  color?: string;
  size?: number;
}

export default function DrawerToggle({ 
  color = '#fff', 
  size = 24 
}: DrawerToggleProps) {
  const { toggleSidebar } = useSidebar();

  const toggleDrawer = () => {
    toggleSidebar();
  };

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={toggleDrawer}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Menu size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    marginLeft: 10,
  },
}); 