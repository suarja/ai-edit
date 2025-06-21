import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  X,
} from 'lucide-react-native';

interface SidebarModalProps {
  visible: boolean;
  onClose: () => void;
}

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

export default function SidebarModal({ visible, onClose }: SidebarModalProps) {
  const insets = useSafeAreaInsets();
  const [folders, setFolders] = useState<DrawerFolder[]>([
    {
      id: 'script-generation',
      name: 'Script Generation',
      icon: FileText,
      isExpanded: true,
      items: [
        {
          id: 'create-script',
          name: 'Créer un script',
          route: '/chat',
          description: 'Générer un nouveau script via chat',
        },
        {
          id: 'scripts-list',
          name: 'Liste des scripts',
          route: '/scripts',
          description: 'Voir tous vos scripts',
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
          id: 'upload-video',
          name: 'Uploader une vidéo',
          route: '/source-videos?action=upload',
          description: 'Ajouter une nouvelle vidéo source',
        },
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
          id: 'generate-video',
          name: 'Générer une vidéo',
          route: '/videos?action=generate',
          description: 'Créer une nouvelle vidéo',
        },
        {
          id: 'video-list',
          name: 'Mes vidéos',
          route: '/videos',
          description: 'Vos vidéos générées',
        },
      ],
    },
    {
      id: 'legacy',
      name: 'Autres Actions',
      icon: Plus,
      isExpanded: false,
      items: [
        {
          id: 'create-video-legacy',
          name: 'Créer une vidéo (Legacy)',
          route: '/request-video',
          description: 'Ancienne interface de création',
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
    onClose();
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
        
        {/* Add action button specific to folder */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (folder.id === 'script-generation') {
              navigateToRoute('/chat');
            } else if (folder.id === 'source-videos') {
              navigateToRoute('/source-videos?action=upload');
            } else if (folder.id === 'generated-videos') {
              navigateToRoute('/videos?action=generate');
            }
          }}
        >
          <View style={styles.folderItemIcon}>
            <Plus size={16} color="#666" />
          </View>
          <Text style={styles.addButtonText}>
            {folder.id === 'script-generation' ? 'Nouveau script' :
             folder.id === 'source-videos' ? 'Uploader vidéo' :
             folder.id === 'generated-videos' ? 'Générer vidéo' :
             'Nouvelle action'}
          </Text>
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
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sidebar, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appName}>EditIA</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#888" />
            </TouchableOpacity>
          </View>
          
          {/* Content */}
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

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.userInfo}>
              <User size={20} color="#888" />
              <Text style={styles.userName}>Profil utilisateur</Text>
            </View>
          </View>
                  </View>
        <Pressable style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#1a1a1a',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  closeButton: {
    padding: 5,
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