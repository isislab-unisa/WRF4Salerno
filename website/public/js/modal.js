
document.addEventListener("DOMContentLoaded", function () {
  // Quando cambia il time slider
  document.getElementById("timeSlider").addEventListener("input", function () {
    loadForecast();
  });

  // Quando cambia uno dei radio button
  document.querySelectorAll('input[name="forecastType"]').forEach(function (el) {
    el.addEventListener("change", function () {
      loadForecast();
    });
  });
});