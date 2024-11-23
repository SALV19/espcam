// frontend/scripts/home.js
function analyzeImg() {
  fetch("http://localhost:3000/whereAmI")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("result").textContent = data;
      console.log("Respuesta:", data);
    })
    .catch((error) => {
      document.getElementById("result").textContent = "Error: " + error;
      console.error("Error:", error);
    });
}
