// Firebase setup
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

// Your web app's Firebase configuration
const firebaseConfig = {
  // Your Firebase config here
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to validate YouTube video ID
function isValidYouTubeId(id) {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  // YouTube video IDs can only contain alphanumeric characters, hyphens, and underscores
  const validChars = /^[a-zA-Z0-9_-]+$/;
  if (!validChars.test(id)) {
    return false;
  }
  
  // YouTube video IDs are typically 11 characters, but can be slightly different
  if (id.length < 10 || id.length > 20) {
    return false;
  }
  
  return true;
}

// Function to extract YouTube video ID from URL
function extractYouTubeId(url) {
  if (!url) return null;
  
  // Handle youtu.be short URLs
  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    const id = parts[1].split(/[?&#]/)[0];
    return id;
  }
  
  // Handle youtube.com URLs
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  
  return (match && match[1]) ? match[1] : null;
}

// Function to fix video IDs in the database
async function fixVideoIds() {
  try {
    console.log('Fetching videos from Firestore...');
    
    // Get all videos from Firestore
    const videosCollection = collection(db, 'videos');
    const querySnapshot = await getDocs(videosCollection);
    
    console.log(`Found ${querySnapshot.size} videos`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process each video
    for (const docSnapshot of querySnapshot.docs) {
      const videoData = docSnapshot.data();
      const videoId = docSnapshot.id;
      const videoUrl = videoData.url || '';
      
      console.log(`\nProcessing video: ${videoData.title || 'Untitled'}`);
      console.log(`Current ID: ${videoId}`);
      console.log(`Current URL: ${videoUrl}`);
      
      // Skip if the current ID is already valid
      if (isValidYouTubeId(videoId)) {
        console.log('✅ Video ID is already valid');
        skippedCount++;
        continue;
      }
      
      // Try to extract a valid ID from the URL
      const extractedId = extractYouTubeId(videoUrl);
      
      if (extractedId && isValidYouTubeId(extractedId)) {
        console.log(`🔧 Found valid ID in URL: ${extractedId}`);
        
        try {
          // Create a new document with the correct ID
          await updateDoc(doc(db, 'videos', docSnapshot.id), {
            id: extractedId,
            // Preserve all existing data
            ...videoData
          });
          
          console.log(`✅ Updated video ID to: ${extractedId}`);
          fixedCount++;
          
          // Optional: Delete the old document if the ID changed
          // await deleteDoc(doc(db, 'videos', docSnapshot.id));
          
        } catch (error) {
          console.error('❌ Error updating video:', error);
          errorCount++;
        }
      } else {
        console.log('⚠️  No valid ID found in URL');
        skippedCount++;
      }
    }
    
    console.log('\n--- Summary ---');
    console.log(`Total videos processed: ${querySnapshot.size}`);
    console.log(`Fixed videos: ${fixedCount}`);
    console.log(`Skipped (already valid): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('Error in fixVideoIds:', error);
  } finally {
    // Close the connection
    process.exit(0);
  }
}

// Run the function
fixVideoIds();
