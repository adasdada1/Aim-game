const leave = document.querySelector(".quitAccount");

leave.addEventListener("click", async (e) => {
  const response = await fetch("/clear-cookie");
  const data = await response.json();
  if (!data || !data.success) return alert("Ошибка при выходе из аккаунта");
  localStorage.clear();
  location.reload();
});
