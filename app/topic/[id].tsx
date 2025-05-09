import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { generateText } from '@/utils/openai';

interface Example {
  spanish: string;
  english: string;
  note?: string;
}

const topics = {
  1: {
    title: 'Present Perfect',
    sections: [
      {
        title: 'Formation',
        content: 'The present perfect is formed with haber + past participle',
      },
      {
        title: 'Usage with "ya"',
        content: 'Ya is commonly used to emphasize completion',
      },
      {
        title: 'Time expressions',
        content: 'Common expressions: ya, todavía no, nunca, alguna vez',
      },
    ],
  },
  // Add other topics...
};

export default function TopicScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [examples, setExamples] = useState<Example[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topic = topics[id as keyof typeof topics];

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const generateExamples = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const prompt = `Generate 5 examples of Mexican Spanish sentences at B1 level using the present perfect tense (${topic.title}). 
      Each example should:
      - Use common Mexican expressions and vocabulary
      - Include both formal and informal usage
      - Be practical and useful in everyday situations
      - Include the English translation
      - Optionally add a brief note about Mexican Spanish usage

      Format each example as JSON with these fields:
      {
        "spanish": "Spanish sentence",
        "english": "English translation",
        "note": "(optional) Usage note"
      }

      Return ONLY a JSON array of 5 examples, no other text.`;

      const response = await generateText(prompt, {
        model: 'gpt-3.5-turbo',
        maxTokens: 500,
        temperature: 0.7,
      });

      // Parse the response as JSON
      const parsedExamples = JSON.parse(response) as Example[];
      setExamples(parsedExamples);
    } catch (err) {
      console.error('Error generating examples:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate examples. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [topic]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        { backgroundColor: isDark ? '#000000' : '#ffffff' },
      ]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={isDark ? '#ffffff' : '#000000'} />
        </Pressable>
        <Text
          style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
          {topic?.title}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {topic?.sections.map((section, index) => (
          <Animated.View
            key={section.title}
            entering={FadeInDown.delay(index * 100)}
            style={[
              styles.section,
              { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' },
            ]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? '#ffffff' : '#000000' },
              ]}>
              {section.title}
            </Text>
            <Text
              style={[
                styles.sectionContent,
                { color: isDark ? '#888888' : '#666666' },
              ]}>
              {section.content}
            </Text>
          </Animated.View>
        ))}

        <Pressable
          style={[
            styles.generateButton,
            { backgroundColor: isDark ? '#6366f1' : '#4f46e5' },
            loading && { opacity: 0.7 },
          ]}
          onPress={generateExamples}
          disabled={loading}>
          <Text style={styles.generateButtonText}>
            {loading ? 'Generating...' : 'Generate Examples'}
          </Text>
          {loading && (
            <Animated.View entering={FadeIn} style={styles.loadingIcon}>
              <RefreshCw size={20} color="#ffffff" />
            </Animated.View>
          )}
        </Pressable>

        {error && (
          <Animated.View
            entering={FadeInDown}
            style={[
              styles.errorContainer,
              { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' },
            ]}>
            <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text>
          </Animated.View>
        )}

        {examples.length > 0 && (
          <Animated.View
            entering={FadeInDown}
            style={[
              styles.examplesContainer,
              { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' },
            ]}>
            <Text
              style={[
                styles.examplesTitle,
                { color: isDark ? '#ffffff' : '#000000' },
              ]}>
              Examples
            </Text>
            {examples.map((example, index) => (
              <View key={index} style={styles.example}>
                <Text
                  style={[
                    styles.exampleText,
                    { color: isDark ? '#ffffff' : '#000000' },
                  ]}>
                  {example.spanish}
                </Text>
                <Text
                  style={[
                    styles.exampleTranslation,
                    { color: isDark ? '#888888' : '#666666' },
                  ]}>
                  {example.english}
                </Text>
                {example.note && (
                  <Text
                    style={[
                      styles.exampleNote,
                      { color: isDark ? '#6366f1' : '#4f46e5' },
                    ]}>
                    Note: {example.note}
                  </Text>
                )}
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingIcon: {
    marginLeft: 8,
  },
  errorContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  examplesContainer: {
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
  examplesTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  example: {
    marginBottom: 20,
  },
  exampleText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  exampleTranslation: {
    fontSize: 14,
    marginBottom: 4,
  },
  exampleNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
});