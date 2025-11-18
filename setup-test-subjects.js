#!/usr/bin/env node

/**
 * Setup Test Subjects Data for Homeschool App
 *
 * This script populates the Firebase Realtime Database with sample curriculum data
 * for testing the subjects feature.
 *
 * Usage:
 *   node setup-test-subjects.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin with local emulator
process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';

admin.initializeApp({
  projectId: 'homeschool-quiz-app',
  databaseURL: 'http://localhost:9000?ns=homeschool-quiz-app-default-rtdb'
});

const db = admin.database();

// Test curriculum data
const testCurriculum = {
  mathematics: {
    id: 'mathematics',
    title: 'Mathematics',
    description: 'Numbers, algebra, geometry, and problem-solving',
    icon: '🔢',
    color: 'blue',
    enabled: true,
    order: 1,
    sections: {
      arithmetic: {
        id: 'arithmetic',
        title: 'Basic Arithmetic',
        description: 'Addition, subtraction, multiplication, and division',
        type: 'lessons',
        enabled: true,
        order: 1,
        itemCount: 12
      },
      algebra: {
        id: 'algebra',
        title: 'Beginning Algebra',
        description: 'Variables, equations, and expressions',
        type: 'lessons',
        enabled: true,
        order: 2,
        itemCount: 8
      },
      geometry: {
        id: 'geometry',
        title: 'Geometry Basics',
        description: 'Shapes, angles, and measurements',
        type: 'lessons',
        enabled: true,
        order: 3,
        itemCount: 10
      }
    }
  },

  science: {
    id: 'science',
    title: 'Science',
    description: 'Biology, chemistry, physics, and earth science',
    icon: '🔬',
    color: 'green',
    enabled: true,
    order: 2,
    sections: {
      biology: {
        id: 'biology',
        title: 'Life Science',
        description: 'Plants, animals, and ecosystems',
        type: 'lessons',
        enabled: true,
        order: 1,
        itemCount: 15
      },
      chemistry: {
        id: 'chemistry',
        title: 'Matter & Chemistry',
        description: 'Elements, compounds, and reactions',
        type: 'lessons',
        enabled: true,
        order: 2,
        itemCount: 10
      },
      physics: {
        id: 'physics',
        title: 'Forces & Motion',
        description: 'Energy, forces, and simple machines',
        type: 'lessons',
        enabled: true,
        order: 3,
        itemCount: 12
      }
    }
  },

  history: {
    id: 'history',
    title: 'History',
    description: 'World history, American history, and geography',
    icon: '📚',
    color: 'orange',
    enabled: true,
    order: 3,
    sections: {
      ancient: {
        id: 'ancient',
        title: 'Ancient Civilizations',
        description: 'Egypt, Greece, Rome, and early empires',
        type: 'lessons',
        enabled: true,
        order: 1,
        itemCount: 14
      },
      american: {
        id: 'american',
        title: 'American History',
        description: 'Colonial period through modern times',
        type: 'lessons',
        enabled: true,
        order: 2,
        itemCount: 18
      },
      world: {
        id: 'world',
        title: 'World Geography',
        description: 'Countries, continents, and cultures',
        type: 'lessons',
        enabled: true,
        order: 3,
        itemCount: 12
      }
    }
  },

  literature: {
    id: 'literature',
    title: 'Literature & Reading',
    description: 'Reading comprehension, writing, and book studies',
    icon: '📖',
    color: 'purple',
    enabled: true,
    order: 4,
    sections: {
      reading: {
        id: 'reading',
        title: 'Reading Comprehension',
        description: 'Stories, passages, and analysis',
        type: 'lessons',
        enabled: true,
        order: 1,
        itemCount: 20
      },
      writing: {
        id: 'writing',
        title: 'Creative Writing',
        description: 'Essays, stories, and composition',
        type: 'lessons',
        enabled: true,
        order: 2,
        itemCount: 15
      },
      classics: {
        id: 'classics',
        title: 'Classic Literature',
        description: 'Famous books and authors',
        type: 'book-studies',
        enabled: true,
        order: 3,
        itemCount: 8
      }
    }
  },

  language: {
    id: 'language',
    title: 'Language Arts',
    description: 'Grammar, vocabulary, and language skills',
    icon: '✍️',
    color: 'pink',
    enabled: true,
    order: 5,
    sections: {
      grammar: {
        id: 'grammar',
        title: 'Grammar & Mechanics',
        description: 'Parts of speech, punctuation, and syntax',
        type: 'lessons',
        enabled: true,
        order: 1,
        itemCount: 16
      },
      vocabulary: {
        id: 'vocabulary',
        title: 'Vocabulary Building',
        description: 'Word roots, prefixes, and meanings',
        type: 'lessons',
        enabled: true,
        order: 2,
        itemCount: 12
      },
      spelling: {
        id: 'spelling',
        title: 'Spelling & Phonics',
        description: 'Word patterns and spelling rules',
        type: 'practice',
        enabled: true,
        order: 3,
        itemCount: 10
      }
    }
  },

  arts: {
    id: 'arts',
    title: 'Arts & Music',
    description: 'Visual arts, music theory, and creative expression',
    icon: '🎨',
    color: 'teal',
    enabled: true,
    order: 6,
    sections: {
      visual: {
        id: 'visual',
        title: 'Visual Arts',
        description: 'Drawing, painting, and art history',
        type: 'projects',
        enabled: true,
        order: 1,
        itemCount: 10
      },
      music: {
        id: 'music',
        title: 'Music Theory',
        description: 'Notes, rhythm, and musical concepts',
        type: 'lessons',
        enabled: true,
        order: 2,
        itemCount: 8
      },
      drama: {
        id: 'drama',
        title: 'Drama & Theater',
        description: 'Performance, storytelling, and plays',
        type: 'projects',
        enabled: true,
        order: 3,
        itemCount: 6
      }
    }
  }
};

async function setupTestSubjects() {
  try {
    console.log('🔧 Setting up test subjects data...\n');

    // Write curriculum data to Firebase
    await db.ref('curriculum').set(testCurriculum);

    console.log('✅ Successfully created test curriculum with the following subjects:\n');

    Object.keys(testCurriculum).forEach(key => {
      const subject = testCurriculum[key];
      const sectionCount = Object.keys(subject.sections || {}).length;
      console.log(`   ${subject.icon} ${subject.title}`);
      console.log(`      → ${sectionCount} sections`);
      console.log(`      → ${subject.description}`);
      console.log('');
    });

    console.log('📊 Total: 6 subjects with multiple sections each\n');
    console.log('🌐 Access at: http://localhost:5050/subjects\n');
    console.log('💡 Tip: Each subject has 3 sections with various content types\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up test subjects:', error);
    process.exit(1);
  }
}

// Run the setup
setupTestSubjects();
