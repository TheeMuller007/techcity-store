/**
 * Shared mobile dashboard shell: sidebar backdrop + bottom tab bar.
 * Safe on desktop (tab bar hidden via CSS); enhances UX when viewport ≤767px.
 */
(function () {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const menuToggle = document.getElementById('menuToggle');

    function openSidebar() {
        sidebar?.classList.add('show');
        backdrop?.classList.add('show');
        if (window.matchMedia('(max-width: 767px)').matches) {
            document.body.classList.add('dashboard-menu-open');
        }
    }

    function closeSidebar() {
        sidebar?.classList.remove('show');
        backdrop?.classList.remove('show');
        document.body.classList.remove('dashboard-menu-open');
    }

    function scrollDashboardToTop() {
        const area = document.querySelector('.content-area');
        if (area) {
            area.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.scrollDashboardToTop = scrollDashboardToTop;

    window.closeDashboardSidebar = closeSidebar;
    window.openDashboardSidebar = openSidebar;

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (sidebar?.classList.contains('show')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    backdrop?.addEventListener('click', closeSidebar);

    document.querySelectorAll('.sidebar .nav-item').forEach((item) => {
        item.addEventListener('click', () => {
            if (window.matchMedia('(max-width: 767px)').matches) {
                closeSidebar();
            }
        });
    });

    function setActiveTab(section) {
        document.querySelectorAll('.app-tab-bar .tab-item').forEach((tab) => {
            tab.classList.toggle('active', tab.dataset.section === section);
        });
    }

    window.syncDashboardTab = setActiveTab;

    document.querySelectorAll('.app-tab-bar .tab-item').forEach((tab) => {
        tab.addEventListener('click', () => {
            const section = tab.dataset.section;
            if (section === 'menu') {
                openSidebar();
                return;
            }
            document.dispatchEvent(
                new CustomEvent('dashboard:navigate', {
                    detail: { section, tab },
                })
            );
            scrollDashboardToTop();
        });
    });

    document.addEventListener('dashboard:navigate', () => {
        closeSidebar();
        scrollDashboardToTop();
    });
})();
