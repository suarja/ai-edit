import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, MessageCircle, Clock } from 'lucide-react-native';
import DrawerToggle from '@/components/DrawerToggle';

// Mock data for existing conversations
const mockConversations = [
  {
    id: '1',
    title: 'Script vidéo IA',
    preview: 'Créer un script sur les tendances IA...',
    lastModified: '2024-01-15',
  },
  {
    id: '2',
    title: 'Recette healthy',
    preview: 'Script pour une vidéo de recette saine...',
    lastModified: '2024-01-14',
  },
];

export default function ScriptGenerationIndex() {
  const handleNewChat = () => {
    router.push('/script-generation' as any);
  };

  const handleOpenConversation = (conversationId: string) => {
    // TODO: Navigate to specific conversation
    router.push('/script-generation' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <DrawerToggle />
          <Text style={styles.title}>Script Generation</Text>
        </View>
        <Text style={styles.subtitle}>
          Créez et gérez vos scripts vidéo via chat
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* New Chat Button */}
        <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
          <View style={styles.newChatIcon}>
            <Plus size={24} color="#007AFF" />
          </View>
          <View style={styles.newChatContent}>
            <Text style={styles.newChatTitle}>Nouvelle conversation</Text>
            <Text style={styles.newChatSubtitle}>
              Créer un nouveau script vidéo
            </Text>
          </View>
        </TouchableOpacity>

        {/* Conversations List */}
        {mockConversations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Conversations récentes</Text>
            {mockConversations.map((conversation) => (
              <TouchableOpacity
                key={conversation.id}
                style={styles.conversationItem}
                onPress={() => handleOpenConversation(conversation.id)}
              >
                <View style={styles.conversationIcon}>
                  <MessageCircle size={20} color="#888" />
                </View>
                <View style={styles.conversationContent}>
                  <Text style={styles.conversationTitle}>
                    {conversation.title}
                  </Text>
                  <Text style={styles.conversationPreview}>
                    {conversation.preview}
                  </Text>
                  <View style={styles.conversationMeta}>
                    <Clock size={12} color="#666" />
                    <Text style={styles.conversationDate}>
                      {conversation.lastModified}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Empty state if no conversations */}
        {mockConversations.length === 0 && (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color="#666" />
            <Text style={styles.emptyTitle}>Aucune conversation</Text>
            <Text style={styles.emptySubtitle}>
              Commencez par créer votre première conversation de script
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: '#888',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  newChatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  newChatContent: {
    flex: 1,
  },
  newChatTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  newChatSubtitle: {
    color: '#888',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  conversationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  conversationContent: {
    flex: 1,
  },
  conversationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  conversationPreview: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationDate: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 