import { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const topics = [
  {
    id: 1,
    title: 'Present Perfect',
    preview: ['Formation', 'Usage with "ya"', 'Time expressions'],
  },
  {
    id: 2,
    title: 'Subjunctive Mood',
    preview: ['When to use', 'Common triggers', 'Expressing wishes'],
  },
  {
    id: 3,
    title: 'Por vs Para',
    preview: ['Basic differences', 'Time expressions', 'Common phrases'],
  },
  {
    id: 4,
    title: 'Preterite vs Imperfect',
    preview: ['Past actions', 'Ongoing states', 'Interruptions'],
  },
  {
    id: 5,
    title: 'Conditional Tense',
    preview: ['Formation', 'Hypothetical situations', 'Polite requests'],
  },
];

export default function TopicsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleTopicPress = useCallback((topicId: number) => {
    router.push(`/topic/${topicId}`);
  }, [router]);

  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top },
      { backgroundColor: isDark ? '#000000' : '#ffffff' }
    ]}>
      <Text style={[
        styles.header,
        { color: isDark ? '#ffffff' : '#000000' }
      ]}>
        B1 Mexican Spanish
      </Text>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {topics.map((topic, index) => (
          <Animated.View
            key={topic.id}
            entering={FadeInUp.delay(index * 100)}
          >
            <Pressable
              style={[
                styles.card,
                { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }
              ]}
              onPress={() => handleTopicPress(topic.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={[
                  styles.topicNumber,
                  { color: isDark ? '#6366f1' : '#4f46e5' }
                ]}>
                  {topic.id.toString().padStart(2, '0')}
                </Text>
                <Text style={[
                  styles.topicTitle,
                  { color: isDark ? '#ffffff' : '#000000' }
                ]}>
                  {topic.title}
                </Text>
              </View>
              <View style={styles.previewContainer}>
                {topic.preview.map((item, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.previewItem,
                      { color: isDark ? '#888888' : '#666666' }
                    ]}
                  >
                    • {item}
                  </Text>
                ))}
              </View>
              <ChevronRight
                size={20}
                color={isDark ? '#6366f1' : '#4f46e5'}
                style={styles.chevron}
              />
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  topicNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  topicTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  previewContainer: {
    marginTop: 8,
  },
  previewItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  chevron: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
});