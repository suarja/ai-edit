import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { router } from 'expo-router';
import {
  FileText,
  Upload,
  Video,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  MessageCircle,
  User,
} from 'lucide-react-native';

interface DrawerFolder {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  isExpanded: boolean;
  items: DrawerItem[];
}

interface DrawerItem {
  id: string;
  name: string;
  route: string;
  description?: string;
}

interface CustomDrawerContentProps {
  state: any;
  navigation: any;
  descriptors: any;
}

export default function CustomDrawerContent(props: CustomDrawerContentProps) {
  const [folders, setFolders] = useState<DrawerFolder[]>([
    {
      id: 'script-generation',
      name: 'Script Generation',
      icon: FileText,
      isExpanded: true,
      items: [
        {
          id: 'chat-demo',
          name: 'Chat Interface',
          route: '/chat',
          description: 'Générer des scripts via chat',
        },
        {
          id: 'create-video',
          name: 'Créer une vidéo',
          route: '/request-video',
          description: 'Nouvelle demande de vidéo',
        },
      ],
    },
    {
      id: 'source-videos',
      name: 'Source Vidéos',
      icon: Upload,
      isExpanded: false,
      items: [
        {
          id: 'source-list',
          name: 'Mes sources',
          route: '/source-videos',
          description: 'Gérer vos vidéos sources',
        },
      ],
    },
    {
      id: 'generated-videos',
      name: 'Vidéos Générées',
      icon: Video,
      isExpanded: false,
      items: [
        {
          id: 'video-list',
          name: 'Mes vidéos',
          route: '/videos',
          description: 'Vos vidéos générées',
        },
      ],
    },
  ]);

  const [standaloneItems] = useState([
    {
      id: 'settings',
      name: 'Paramètres',
      route: '/settings',
      icon: Settings,
    },
  ]);

  const toggleFolder = (folderId: string) => {
    setFolders(prev =>
      prev.map(folder =>
        folder.id === folderId
          ? { ...folder, isExpanded: !folder.isExpanded }
          : folder
      )
    );
  };

  const navigateToRoute = (route: string) => {
    router.push(route as any);
    props.navigation.closeDrawer();
  };

  const renderFolderHeader = (folder: DrawerFolder) => (
    <TouchableOpacity
      key={folder.id}
      style={styles.folderHeader}
      onPress={() => toggleFolder(folder.id)}
    >
      <View style={styles.folderHeaderContent}>
        <View style={styles.folderIcon}>
          <folder.icon size={20} color="#888" />
        </View>
        <Text style={styles.folderName}>{folder.name}</Text>
      </View>
      <View style={styles.chevronIcon}>
        {folder.isExpanded ? (
          <ChevronDown size={16} color="#888" />
        ) : (
          <ChevronRight size={16} color="#888" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFolderItems = (folder: DrawerFolder) => {
    if (!folder.isExpanded) return null;

    return (
      <View style={styles.folderItems}>
        {folder.items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.folderItem}
            onPress={() => navigateToRoute(item.route)}
          >
            <View style={styles.folderItemIcon}>
              <MessageCircle size={16} color="#666" />
            </View>
            <View style={styles.folderItemContent}>
              <Text style={styles.folderItemName}>{item.name}</Text>
              {item.description && (
                <Text style={styles.folderItemDescription}>
                  {item.description}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
        
        {/* Add new conversation button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (folder.id === 'script-generation') {
              navigateToRoute('/chat');
            }
          }}
        >
          <View style={styles.folderItemIcon}>
            <Plus size={16} color="#666" />
          </View>
          <Text style={styles.addButtonText}>Nouvelle conversation</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStandaloneItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.standaloneItem}
      onPress={() => navigateToRoute(item.route)}
    >
      <View style={styles.folderIcon}>
        <item.icon size={20} color="#888" />
      </View>
      <Text style={styles.folderName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>EditIA</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Folders */}
        {folders.map((folder) => (
          <View key={folder.id} style={styles.folderContainer}>
            {renderFolderHeader(folder)}
            {renderFolderItems(folder)}
          </View>
        ))}

        {/* Separator */}
        <View style={styles.separator} />

        {/* Standalone items */}
        {standaloneItems.map(renderStandaloneItem)}
      </ScrollView>

      {/* Footer with user info */}
      <View style={styles.footer}>
        <View style={styles.userInfo}>
          <User size={20} color="#888" />
          <Text style={styles.userName}>Profil utilisateur</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  appName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingTop: 10,
  },
  folderContainer: {
    marginBottom: 5,
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  folderHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  folderIcon: {
    marginRight: 12,
  },
  folderName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  chevronIcon: {
    marginLeft: 10,
  },
  folderItems: {
    paddingLeft: 20,
    paddingBottom: 10,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 2,
  },
  folderItemIcon: {
    marginRight: 12,
  },
  folderItemContent: {
    flex: 1,
  },
  folderItemName: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: '400',
  },
  folderItemDescription: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 5,
  },
  addButtonText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
    marginHorizontal: 20,
  },
  standaloneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 5,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    padding: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: '#888',
    fontSize: 14,
    marginLeft: 10,
  },
}); 