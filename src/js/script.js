// script.js
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    const activeMenuItem = Array.from(menuItems).find(item => item.textContent.trim() === sectionId.charAt(0).toUpperCase() + sectionId.slice(1));
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');

    if (sidebar.style.transform === 'translateX(-100%)') {
        sidebar.style.transform = 'translateX(0)';
        mainContent.style.marginLeft = '250px';
    } else {
        sidebar.style.transform = 'translateX(-100%)';
        mainContent.style.marginLeft = '0';
    }
}

// Set the default section
document.addEventListener('DOMContentLoaded', () => {
    showSection('home');
});
