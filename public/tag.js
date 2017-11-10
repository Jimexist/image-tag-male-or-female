Mousetrap.bind(["1", "left"], function(e1) {
  document.getElementById("male").submit();
  return false;
});

Mousetrap.bind(["2", "right"], function(e2) {
  document.getElementById("female").submit();
  return false;
});

console.info("深度炼丹，精确调参");
