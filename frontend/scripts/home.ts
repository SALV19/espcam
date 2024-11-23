const analyzeImg = async () => {
  fetch("http://localhost:3000/whereAmI")
    .then((response) => console.log("response: " + response))
    .catch((error) => console.error("Error: " + error));
};
