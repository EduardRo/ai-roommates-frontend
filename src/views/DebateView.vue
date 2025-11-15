<template>
  <div class="history-viewer">
    <h1>Debate History Viewer</h1>

    <!-- Input for the file path -->
    <div class="file-input-container">
      <label for="filePath">Enter JSON File Path:</label>
      <input id="filePath" v-model="filePath" type="text"
        placeholder="e.g., E:\AI-SYNTIA-V2\backend\DebateSaved\15-11-2025\e237c5b0-5578-4df6-af59-f0123ab90e5b_05-10-17.json"
        @keyup.enter="loadHistory" />
      <button @click="loadHistory">Load</button>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Loading indicator -->
    <div v-if="loading" class="loading">Loading...</div>

    <!-- Display the debate data if loaded -->
    <div v-if="debateData && !loading" class="debate-display">
      <h2>Topic: {{ debateData.topic }}</h2>
      <p><strong>Debate ID:</strong> {{ debateData.debate_id }}</p>

      <div class="turns-container">
        <div v-for="(turn, index) in debateData.debate" :key="index" class="turn">
          <div class="turn-header">
            <span class="turn-id">#{{ turn.id }}</span>
            <span class="character-name">{{ turn.character_name }}</span>
            <span class="timestamp">{{ new Date(turn.timestamp).toLocaleString() }}</span>
          </div>
          <div class="response">{{ turn.response }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Reactive state
const filePath = ref('');
const debateData = ref(null);
const loading = ref(false);
const error = ref('');

// Function to load the history from the provided file path
const loadHistory = async () => {
  // Clear previous error and data
  error.value = '';
  debateData.value = null;

  // Validate input
  if (!filePath.value.trim()) {
    error.value = 'Please enter a file path.';
    return;
  }

  // Check if it's a .json file
  if (!filePath.value.toLowerCase().endsWith('.json')) {
    error.value = 'Please provide a valid .json file.';
    return;
  }

  loading.value = true;

  try {
    // In a browser environment, you cannot directly access local file paths like "E:\".
    // This is a security restriction. You would need to use an <input type="file"> element
    // or serve the files via your backend API.

    // For demonstration purposes, this will not work for local C:/ or E:/ paths.
    // Instead, you should place debate files in your public folder (e.g., /debates/)
    // and reference them as "/debates/filename.json".

    const response = await fetch(filePath.value);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Ensure each turn has an 'id' field
    data.debate = data.debate.map((turn, idx) => ({ ...turn, id: idx + 1 }));

    debateData.value = data;
    console.log('Loaded debate data:', data);

  } catch (err) {
    console.error('Error loading debate history:', err);
    error.value = `Failed to load file: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

// Alternative method using a file input dialog (more practical for browser)
// Uncomment this and its template below if you want to use a file picker instead of typing a path.

// const handleFileChange = (event) => {
//   const file = event.target.files[0];
//   if (file) {
//     filePath.value = URL.createObjectURL(file); // Creates a blob URL
//     loadHistory(); // Load the selected file
//   }
// };
</script>

<!-- <template> (Alternative with file input)
<div class="history-viewer">
  <h1>Debate History Viewer</h1>

  <div class="file-input-container">
    <label for="fileInput">Choose a JSON File:</label>
    <input
      id="fileInput"
      type="file"
      accept=".json"
      @change="handleFileChange"
    />
  </div>

  <div v-if="error" class="error">{{ error }}</div>
  <div v-if="loading" class="loading">Loading...</div>

  <div v-if="debateData && !loading" class="debate-display">
    <h2>Topic: {{ debateData.topic }}</h2>
    <p><strong>Debate ID:</strong> {{ debateData.debate_id }}</p>

    <div class="turns-container">
      <div v-for="(turn, index) in debateData.debate" :key="index" class="turn">
        <div class="turn-header">
          <span class="turn-id">#{{ turn.id }}</span>
          <span class="character-name">{{ turn.character_name }}</span>
          <span class="timestamp">{{ new Date(turn.timestamp).toLocaleString() }}</span>
        </div>
        <div class="response">{{ turn.response }}</div>
      </div>
    </div>
  </div>
</div>
</template> -->

<style scoped>
.history-viewer {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.file-input-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-input-container label {
  font-weight: bold;
}

.file-input-container input[type='text'] {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.file-input-container button {
  padding: 8px 16px;
  background-color: #007bff;
  color: rgb(255, 255, 255);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.file-input-container button:hover {
  background-color: #0056b3;
}

.error {
  color: red;
  margin-bottom: 10px;
}

.loading {
  color: #666;
  font-style: italic;
}

.debate-display {
  background-color: #0f2c49;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.turns-container {
  margin-top: 10px;
}

.turn {
  margin-bottom: 20px;
  padding: 15px;
  border-left: 4px solid #007bff;
  background-color: #c2bbbb;
  border-radius: 4px;
}

.turn-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 0.9em;
  color: #555;
}

.turn-id {
  font-weight: bold;
  color: #007bff;
}

.character-name {
  font-weight: bold;
  color: #28a745;
}

.timestamp {
  font-style: italic;
}

.response {
  white-space: pre-wrap;
  /* Preserve line breaks */
  word-wrap: break-word;
  color: #0f2c49;
}
</style>
