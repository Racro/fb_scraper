console.log('Content script has loaded.');

function printProcessedPosts() {
  // Select all posts with the 'processed' class
  const processedPosts = document.querySelectorAll('.processed');
  
  console.log(`Found ${processedPosts.length} processed posts.`);
  // processedPosts.forEach((post, index) => {
  //     // Assuming you want to print some identifiable information from each post
  //     // For example, the first 100 characters of its text content
  //     // console.log(`Processed Post ${index + 1}: ${post.innerText.slice(0, 100)}`);
  // });
}

function highlightTextInPost(postElement, textToHighlight, highlightColor) {
  // Ensure the text to highlight is actually present in the postElement
  if (postElement.innerText.includes(textToHighlight)) {
      // Use innerHTML to replace the target text with the same text wrapped in a span with a specific style
      const highlightedText = `<span style="background-color: ${highlightColor};">${textToHighlight}</span>`;
      postElement.innerHTML = postElement.innerHTML.replace(textToHighlight, highlightedText);
  }
}

async function callApiWithText(text) {
  try {
      const response = await fetch('YOUR_API_ENDPOINT', {
          method: 'POST', // or 'GET', depending on your API
          headers: {
              'Content-Type': 'application/json',
              // Include other headers as required by your API
          },
          body: JSON.stringify({ text: text }) // Adjust based on your API's expected request format
      });

      if (!response.ok) {
          throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data; // Return the response data for further processing
  } catch (error) {
      console.error('Error calling the API:', error);
      return null; // Return null or appropriate error indication
  }
}


// // This function runs once the DOM is fully loaded
// document.addEventListener('DOMContentLoaded', scrapePosts);

async function scrapePosts(){
  // Facebook uses various attributes and classes for posts. This might need to be updated.
  const container = document.querySelector('div[data-pagelet*="ProfileTimeline"]');

  // const posts = document.querySelectorAll('div[data-pagelet*="ProfileTimeline"]:not(.processed)');
  // const posts = document.querySelectorAll('div[data-pagelet="ProfileTimeline"]');
  if (container) {
    // Query for child div elements with the specific class name within this container
    const posts = container.querySelectorAll('div.x1a2a7pz:not(.processed)');
    // printProcessedPosts();
    for (const post of posts) {
      // Check if the post contains an SVG with the title "Shared with Public"
      post.classList.add('processed');
      const isPublic = post.querySelector('svg[title="Shared with Public"]') !== null;

      if (isPublic) {
        // Assuming you only want to log the content of public posts
        const postText = post.innerText;
        console.log(`Public Post: ${postText.slice(0, 50)}`);

        // request chatGPT
        const apiResponse = await callApiWithText(postText); // Wait for the API response

        if (apiResponse) {
            console.log('API Response:', apiResponse);
            // Process the API response here, e.g., highlight text based on response
        } else {
            console.log('No response or error calling API for post:', text);
        }


        // Example text to highlight and color
        const textToHighlight = `${postText.slice(50, 75)}`;
        const highlightColor = "yellow"; // You can specify any CSS color here

        highlightTextInPost(post, textToHighlight, highlightColor);
      }
    };
  } else{
    console.log("Container with data-pagelet='xyz' not found.");
  }
};



// Function to call when mutations are observed
const callback = function(mutationsList, observer) {
  for(let mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Call scrapePosts or handle the new nodes directly here
          console.log('1111')
          scrapePosts();
      }
  }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
const targetNode = document.body; // You might need to target a more specific parent element

// Use the following config to observe additions to the DOM
const config = { childList: true, subtree: true };

observer.observe(targetNode, config);

// Remember to disconnect the observer when it's no longer needed to avoid memory leaks
// observer.disconnect();