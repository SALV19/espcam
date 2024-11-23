// frontend/scripts/home.js
function analyzeImg() {
  fetch("http://localhost:3000/whereAmI")
    .then((response) => response.text())
    .then((data) => {
      const result = document.getElementById("result");
      if (result) {
        result.textContent = data;
        console.log("Respuesta:", data);
      }
    })
    .catch((error) => {
      const result = document.getElementById("result");
      if (result) {
        result.textContent = error;
        console.log("Error:", error);
      }
      console.error("Error:", error);
    });
}
