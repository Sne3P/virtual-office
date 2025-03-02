document.addEventListener("DOMContentLoaded", function () {
  const resultField = document.getElementById("result");

  function liveScreen(value) {
      if (resultField.value === "0" && value !== ".") {
          resultField.value = value; // Remplace le zéro initial
      } else {
          resultField.value += value;
      }
  }

  function calculate(expression) {
      try {
          // Remplace "x" par "*" et s'assure que l'expression est correcte
          expression = expression.replace(/x/g, "*").replace(/÷/g, "/");
          resultField.value = eval(expression);
      } catch {
          resultField.value = "Erreur";
      }
  }

  function clearScreen() {
      resultField.value = "";
  }

  document.querySelectorAll("input[type=button]").forEach(button => {
      button.addEventListener("click", function () {
          const value = this.value;
          if (value === "=") {
              calculate(resultField.value);
          } else if (value === "C") {
              clearScreen();
          } else {
              liveScreen(value);
          }
      });
  });
});
