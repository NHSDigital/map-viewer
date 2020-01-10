/**
 * Sidebar Menu Logic
 */

const menuIcon = document.getElementById("menu-icon");
const sidebar = document.getElementById("sidebar");

const activeClass = "is-active";

menuIcon.addEventListener("click", ({ currentTarget }) => {
  const sidebarOpen = currentTarget.classList.contains(activeClass);
  if (sidebarOpen) {
    currentTarget.classList.remove(activeClass);
    sidebar.classList.remove(activeClass);
  } else {
    currentTarget.classList.add(activeClass);
    sidebar.classList.add(activeClass);
  }
});
