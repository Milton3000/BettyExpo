import { Client, Account, ID, Databases, Avatars, Query, Storage } from "react-native-appwrite";

export const config = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.betty.bettybooth",
  projectId: "66cb8ec3002c3277268c",
  databaseId: "66cb906c0036e0448ba6",
  userCollectionId: "66cb90980004fa174798",
  imageCollectionId: "66cb90c4000336e9af4d",
  videoCollectionId: "66cb91cc000b179560cc",
  storageId: "6702e78e000034570113",
  galleriesCollectionId: "66f06208002c5f6d7f3b",
};

const {
endpoint,
platform,
projectId,
databaseId,
userCollectionId,
imageCollectionId,
videoCollectionId,
storageId,
galleriesCollectionId,
} = config;

// Init React Native SDK
const client = new Client();

client
  .setEndpoint(config.endpoint) // Appwrite Endpoint
  .setProject(config.projectId) // Project ID
  .setPlatform(config.platform) // Application ID or bundle ID.

export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Function to check if there is an active session
export const checkActiveSession = async () => {
  try {
    const session = await account.getSession('current'); // Get the current session
    return session !== null; // Return true if there is an active session
  } catch (error) {
    // If there's an error (e.g., no active session), handle it appropriately
    if (error.code === 401) {
      return false; // No active session
    }
    throw error; // Re-throw other unexpected errors
  }
};

// Function to delete all sessions for the current user
export const deleteSessions = async () => {
  try {
    // Get the list of all sessions
    const sessions = await account.listSessions();

    // Delete each session
    await Promise.all(
      sessions.sessions.map(async (session) => {
        await account.deleteSession(session.$id);
      })
    );

    console.log('All sessions deleted successfully');
  } catch (error) {
    console.error('Error deleting sessions:', error.message);
    throw error; // Re-throw the error for further handling
  }
};

// Register user
export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      databaseId,
      userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

// ORIGINAL Sign In
export const signIn = async (email, password) => {
  try {
        // await account.deleteSessions(); KEEP THIS COMMENTED OUT
    const session = await account.createEmailPasswordSession(email, password);
    // console.log('Session created:', session); CAN SKIP THIS LINE
    return session;
  } catch (error) {
    console.error('Sign In Error:', error.response ? error.response.data : error.message);
    throw new Error(error.message || 'Failed to sign in.');
  }
};

// Get Account
export const getAccount = async () => {
  try {
    // await account.deleteSessions(); 
    console.log('Checking session...');
    const currentAccount = await account.get();
    console.log("Logged in as:", currentAccount.email);
    // console.log('Current Account:', currentAccount); CAN SKIP THIS LINE
    return currentAccount;
  } catch (error) {
    console.error('Get Account Error:', error.message || error);
    throw new Error(error.message || 'Failed to fetch account details.');
  }
};

// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Get All Posts (Videos + Images)
export const getAllPosts = async () => {
  try {
    // Fetch videos
    const videos = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.orderDesc('$createdAt')]
    );
    
    // Fetch images
    const images = await databases.listDocuments(
      databaseId,
      imageCollectionId,
      [Query.orderDesc('$createdAt')]
    );

    // Combine videos and images
    const posts = [...videos.documents, ...images.documents];

    // Sort combined posts by creation date (newest first)
    posts.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));

    return posts;
  } catch (error) {
    console.error("Error fetching all posts:", error);
    throw error;
  }
}

// Get Latest Posts (Videos + Images)
export const getLatestPosts = async () => {
  try {
    // Fetch latest videos
    const videos = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(7)]
    );

    // Fetch latest images
    const images = await databases.listDocuments(
      databaseId,
      imageCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(7)]
    );

    // Combine and sort all posts
    const posts = [...videos.documents, ...images.documents];
    posts.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));

    // Return only the latest 7 posts
    return posts.slice(0, 7);
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    throw error;
  }
}


// GET ALL POSTS
export const getUserPosts = async (userId) => {
  try {
    // Fetch videos
    const videos = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [
        Query.equal('creator', userId),
        Query.orderDesc('$createdAt')
      ]
    );

    // Fetch images
    const images = await databases.listDocuments(
      databaseId,
      imageCollectionId,
      [
        Query.equal('creator', userId),
        Query.orderDesc('$createdAt')
      ]
    );

    // Combine results
    const combinedPosts = [...videos.documents, ...images.documents];
    
    // Sort combined posts by creation date (newest first)
    combinedPosts.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));

    return combinedPosts;
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
}

// ORIGINAL LOGOUT FUNCTION
export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error)
  }
}


// GET FILE PREVIEW + VIDEO VIEW
// export async function getFilePreview(fileId, type) {
//   let fileUrl;

//   try {
//     if (type === "video") {
//       fileUrl = storage.getFileView(config.storageId, fileId);
//     } else if (type === "image") {
//       fileUrl = storage.getFilePreview(
//         config.storageId,
//         fileId,
//         2000,
//         2000,
//         "top",
//         100
//       );
//     } else {
//       throw new Error("Invalid file type");
//     }

//     if (!fileUrl) throw Error;

//     return fileUrl;
//   } catch (error) {
//     throw new Error(error);
//   }
// }

// UPLOAD FUNCTION TO STORAGE BUCKETS
export const uploadFile = async (file, mimeType) => {
  if (!file || !file.uri) {
    throw new Error('File or URI is missing');
  }

  try {
    // Generate a unique file ID
    const fileId = ID.unique();

    // Create a FormData object to hold the file
    const formData = new FormData();
    formData.append('fileId', fileId); // Include the fileId parameter
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: mimeType,
    });

    // Upload the file using fetch
    const response = await fetch(`${config.endpoint}/storage/buckets/${config.storageId}/files`, {
      method: 'POST',
      headers: {
        'X-Appwrite-Project': config.projectId,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.$id) {
      throw new Error('File upload failed: No $id in response');
    }

    // Generate the correct file URL with the project ID
    const fileUrl = `${config.endpoint}/storage/buckets/${config.storageId}/files/${responseData.$id}/view?project=${config.projectId}`;
    return fileUrl;
  } catch (error) {
    console.error("Error during file upload:", error.message || error);
    throw new Error('Failed to upload file.');
  }
};

  
// UPLOADING TO APPWRITE DATABASE (Video or Image based on the type)
export async function createPost(form, type) {
  try {
    const [thumbnailUrl, assetUrl] = await Promise.all([
      form.thumbnail ? uploadFile(form.thumbnail, "image") : null,
      form.asset ? uploadFile(form.asset, type) : null,
    ]);

    const collectionId = type === "video" ? config.videoCollectionId : config.imageCollectionId;

    const newPost = await databases.createDocument(
      config.databaseId,
      collectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        [type]: assetUrl, // dynamically store the asset as either video or image
        creator: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
}


// GALLERIES FUNCTIONS
export const createGallery = async ({ title, thumbnail, assets, assetType, userId }) => {
  try {
    let thumbnailUrl = null;

    // Only upload the thumbnail if it's provided
    if (thumbnail && thumbnail.uri) {
      thumbnailUrl = await uploadFile(thumbnail, 'image/jpeg');
    }

    // Upload each asset using the updated uploadFile logic (if assets are provided)
    const assetUrls = await Promise.all(assets.map(async (asset) => {
      const assetUrl = await uploadFile(asset, 'image/jpeg');
      return assetUrl;
    }));

    const eventDate = new Date().toISOString();

    // Prepare the data for the new gallery
    const galleryData = {
      title,
      [assetType === 'image' ? 'images' : 'videos']: assetUrls,
      users: userId,
      eventDate,
    };

    // Only include the thumbnail URL if it's not null
    if (thumbnailUrl) {
      galleryData.thumbnail = thumbnailUrl;
    }

    // Create the new gallery in the database
    const newGallery = await databases.createDocument(
      config.databaseId,
      config.galleriesCollectionId,
      ID.unique(),
      galleryData
    );

    // console.log('Gallery created successfully:', newGallery);

    // Fetch updated galleries after successful creation
    const updatedGalleries = await fetchGalleries();
    return { newGallery, updatedGalleries }; // Return both the new gallery and updated galleries list
  } catch (error) {
    console.error('Error creating gallery:', error.message);
    throw new Error(error.message || 'Failed to create gallery.');
  }
};



// FETCH THE GALLERIES AFTER CREATING ONE
export const fetchGalleries = async () => {
  try {
    const response = await databases.listDocuments(
      config.databaseId,
      config.galleriesCollectionId,
      [], // No filters, get all galleries
      { expand: ['users'] } // Explicitly expand the 'users' relationship
    );
    return response.documents; // Return the list of galleries
  } catch (error) {
    console.error("Error fetching galleries:", error.message);
    throw new Error(error.message || "Failed to fetch galleries.");
  }
};




// Add images to a gallery (using the gallery ID)
// Add images to a gallery (using the gallery ID)
export const addImagesToGallery = async (galleryId, newImageUrls) => {
  try {
    // Validate galleryId
    if (!galleryId || typeof galleryId !== 'string' || galleryId.length > 36) {
      throw new Error('Invalid gallery ID');
    }

    // Validate newImageUrls
    if (!Array.isArray(newImageUrls) || newImageUrls.length === 0) {
      throw new Error('No valid image URLs provided');
    }

    // First, fetch the current gallery data
    const currentGallery = await databases.getDocument(
      config.databaseId,
      config.galleriesCollectionId,
      galleryId
    );

    if (!currentGallery) {
      throw new Error('Gallery not found');
    }

    // Filter out any invalid URLs
    const validImageUrls = newImageUrls.filter(url => 
      typeof url === 'string' && url.startsWith('http')
    );

    if (validImageUrls.length === 0) {
      throw new Error('No valid image URLs to add');
    }

    // Append the new images to the existing array
    const updatedImages = [...(currentGallery.images || []), ...validImageUrls];

    // Update the gallery with the appended images array
    const gallery = await databases.updateDocument(
      config.databaseId,
      config.galleriesCollectionId,
      galleryId,
      {
        images: updatedImages,
      }
    );
    
    return gallery;
  } catch (error) {
    console.error("Error adding images to gallery:", error);
    throw error;
  }
};


// Add videos to a gallery (using the gallery ID)
export const addVideosToGallery = async (galleryId, newVideoUrls) => {
  try {
    // First, fetch the current gallery data
    const currentGallery = await databases.getDocument(
      config.databaseId,
      config.galleriesCollectionId,
      galleryId
    );

    // Append the new videos to the existing array
    const updatedVideos = [...(currentGallery.videos || []), ...newVideoUrls];

    // Update the gallery with the appended videos array
    const gallery = await databases.updateDocument(
      config.databaseId,
      config.galleriesCollectionId,
      galleryId,
      {
        videos: updatedVideos,
      }
    );
    return gallery;
  } catch (error) {
    console.error("Error adding videos to gallery:", error);
    throw new Error(error);
  }
};


export const getLatestGalleries = async () => {
  try {
    // Fetch the latest galleries
    const galleries = await databases.listDocuments(
      databaseId,
      galleriesCollectionId,  // Use your galleries collection ID
      [Query.orderDesc('$createdAt'), Query.limit(10)]  // Sort by creation date and limit to 7
    );

    // Sort galleries by creation date (already sorted in the query, but just in case)
    const sortedGalleries = galleries.documents.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));

    // Return only the latest 7 galleries
    return sortedGalleries.slice(0, 10);
  } catch (error) {
    console.error("Error fetching latest galleries:", error);
    throw error;
  }
};


// GET galleries for a specific user
export const getUserGalleries = async (userId) => {
  try {
    // Query to fetch all galleries created by the specific user
    const response = await databases.listDocuments(
      config.databaseId,
      config.galleriesCollectionId,
      [Query.equal('users', userId)] // Match galleries where 'users' field contains the userId
    );

    return response.documents; // Return the list of galleries
  } catch (error) {
    console.error("Error fetching user's galleries:", error.message);
    throw new Error(error.message || 'Failed to fetch user galleries.');
  }
};



// Function to delete a document and its associated files
// Function to delete a document and its associated files
export const deleteGallery = async (collectionId, documentId, imageUrls = [], videoUrls = [], thumbnailUrl) => {
  try {
    // Combine imageUrls, videoUrls, and thumbnailUrl into one array
    const allUrls = [...imageUrls, ...videoUrls];

    if (thumbnailUrl) {
      allUrls.push(thumbnailUrl); // Add thumbnail URL if available
    }

    // Filter out invalid URLs (must start with 'http' and be of a minimum length)
    const validUrls = allUrls.filter((url) => 
      typeof url === 'string' && url.startsWith('http') && url.includes('files/') && url.length > 20
    );

    console.log('Files to be deleted:', validUrls); // Log valid files for deletion

    // Map through valid URLs, extract file IDs, and delete files
    const promises = validUrls.map(async (url) => {
      const fileId = getFileIdFromUrl(url); // Extract file ID from URL
      if (fileId) {
        console.log('Extracted file ID:', fileId);
        await storage.deleteFile(config.storageId, fileId); // Delete the file from storage
        console.log(`File with ID ${fileId} deleted successfully`);
      }
    });

    // Wait for all files to be deleted
    await Promise.all(promises);

    // Now delete the gallery document from the database
    console.log(`Attempting to delete gallery with ID ${documentId}...`);
    await databases.deleteDocument(config.databaseId, collectionId, documentId);
    console.log(`Gallery with ID ${documentId} deleted successfully.`);
    
  } catch (error) {
    console.error('Error deleting gallery:', error.message);
    throw error;
  }
};

// Helper function to extract the file ID from the file URL
const getFileIdFromUrl = (url) => {
  const regex = /files\/([a-zA-Z0-9]+)\//; // Extract the file ID from the URL using regex
  const match = url.match(regex);
  return match ? match[1] : null;
};



// DELETE ACCOUNT
export const deleteAccount = async () => {
  try {
    await account.delete();  // Assuming you're using the Appwrite account service
  } catch (error) {
    throw new Error('Failed to delete account');
  }
};


export const sendPasswordResetEmail = async (email) => {
  const redirectUrl = "cloud.appwrite.io";  // Adjust if needed for self-hosted
  return account.createRecovery(email, redirectUrl);
};
