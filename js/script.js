// ============================================================
// script.js
// Navigasi Website Profil Desa Ciledug Wetan
// ============================================================


// ============================================================
// ELEMENT
// ============================================================

const menuToggle =
    document.querySelector(".menu-toggle");

const nav =
    document.querySelector(".nav-links");

const navLinks =
    document.querySelectorAll(
        ".nav-links a"
    );


// ============================================================
// MOBILE MENU
// ============================================================

if (menuToggle && nav) {

    menuToggle.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            const isOpen =
                nav.classList.toggle("open");

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuToggle.setAttribute(
                "aria-label",
                isOpen
                    ? "Tutup menu"
                    : "Buka menu"
            );

            document.body.classList.toggle(
                "menu-open",
                isOpen
            );

        }
    );

}


// ============================================================
// KLIK MENU
// ============================================================

navLinks.forEach(
    (link) => {

        link.addEventListener(
            "click",
            (event) => {

                const href =
                    link.getAttribute("href");


                // --------------------------------------------
                // LINK INTERNAL
                // --------------------------------------------

                if (
                    href &&
                    href.startsWith("#")
                ) {

                    const targetId =
                        href.substring(1);

                    const target =
                        document.getElementById(
                            targetId
                        );


                    if (target) {

                        event.preventDefault();


                        const header =
                            document.querySelector(
                                ".site-header"
                            );


                        const headerHeight =
                            header
                                ? header.offsetHeight
                                : 0;


                        const targetPosition =
                            target.getBoundingClientRect().top +
                            window.scrollY -
                            headerHeight;


                        window.scrollTo(
                            {
                                top:
                                    Math.max(
                                        0,
                                        targetPosition
                                    ),

                                behavior:
                                    "smooth"
                            }
                        );


                        /*
                         * Update URL tanpa
                         * membuat halaman reload.
                         */

                        history.pushState(
                            null,
                            "",
                            href
                        );

                    }

                }


                // --------------------------------------------
                // TUTUP MOBILE MENU
                // --------------------------------------------

                if (nav) {

                    nav.classList.remove(
                        "open"
                    );

                }


                if (menuToggle) {

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    menuToggle.setAttribute(
                        "aria-label",
                        "Buka menu"
                    );

                }


                document.body.classList.remove(
                    "menu-open"
                );

            }
        );

    }
);


// ============================================================
// KLIK DI LUAR MENU
// ============================================================

document.addEventListener(
    "click",
    (event) => {

        if (
            !nav ||
            !menuToggle
        ) {
            return;
        }


        const clickedInsideNav =
            nav.contains(event.target);

        const clickedMenuButton =
            menuToggle.contains(event.target);


        if (
            !clickedInsideNav &&
            !clickedMenuButton
        ) {

            nav.classList.remove(
                "open"
            );

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle.setAttribute(
                "aria-label",
                "Buka menu"
            );

            document.body.classList.remove(
                "menu-open"
            );

        }

    }
);


// ============================================================
// TOMBOL ESCAPE
// ============================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            nav?.classList.remove(
                "open"
            );

            menuToggle?.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle?.setAttribute(
                "aria-label",
                "Buka menu"
            );

            document.body.classList.remove(
                "menu-open"
            );

        }

    }
);


// ============================================================
// ACTIVE NAVIGATION
// ============================================================

const sections =
    Array.from(
        document.querySelectorAll(
            "main section[id]"
        )
    );


function setActiveLink(id) {

    navLinks.forEach(
        (link) => {

            const href =
                link.getAttribute("href");


            link.classList.toggle(
                "active",
                href === `#${id}`
            );

        }
    );

}


// ============================================================
// INTERSECTION OBSERVER
// ============================================================

if (
    sections.length &&
    navLinks.length
) {

    const observer =
        new IntersectionObserver(

            (entries) => {

                const visibleSections =
                    entries
                        .filter(
                            entry =>
                                entry.isIntersecting
                        )
                        .sort(
                            (a, b) =>
                                b.intersectionRatio -
                                a.intersectionRatio
                        );


                if (
                    visibleSections.length
                ) {

                    setActiveLink(
                        visibleSections[0]
                            .target
                            .id
                    );

                }

            },

            {
                root: null,

                rootMargin:
                    "-25% 0px -60% 0px",

                threshold: [
                    0,
                    0.1,
                    0.25,
                    0.5
                ]

            }

        );


    sections.forEach(
        (section) => {

            observer.observe(
                section
            );

        }
    );

}


// ============================================================
// HANDLE HASH SAAT HALAMAN DIBUKA
// ============================================================

window.addEventListener(
    "load",
    () => {

        const hash =
            window.location.hash;


        if (
            hash &&
            hash !== "#"
        ) {

            const target =
                document.querySelector(
                    hash
                );


            if (target) {

                setTimeout(
                    () => {

                        const header =
                            document.querySelector(
                                ".site-header"
                            );


                        const headerHeight =
                            header
                                ? header.offsetHeight
                                : 0;


                        const position =
                            target.getBoundingClientRect().top +
                            window.scrollY -
                            headerHeight;


                        window.scrollTo(
                            {
                                top:
                                    Math.max(
                                        0,
                                        position
                                    ),

                                behavior:
                                    "smooth"
                            }
                        );

                    },
                    100
                );

            }

        } else {

            setActiveLink(
                "beranda"
            );

        }

    }
);


// ============================================================
// HANDLE BACK / FORWARD BROWSER
// ============================================================

window.addEventListener(
    "popstate",
    () => {

        const hash =
            window.location.hash;


        if (!hash) {

            window.scrollTo(
                {
                    top: 0,
                    behavior: "smooth"
                }
            );

            setActiveLink(
                "beranda"
            );

            return;
        }


        const target =
            document.querySelector(
                hash
            );


        if (!target) {
            return;
        }


        const header =
            document.querySelector(
                ".site-header"
            );


        const headerHeight =
            header
                ? header.offsetHeight
                : 0;


        const position =
            target.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;


        window.scrollTo(
            {
                top:
                    Math.max(
                        0,
                        position
                    ),

                behavior:
                    "smooth"
            }
        );


        setActiveLink(
            hash.substring(1)
        );

    }
);


// ============================================================
// HEADER SHADOW SAAT SCROLL
// ============================================================

const header =
    document.querySelector(
        ".site-header"
    );


function updateHeader() {

    if (!header) {
        return;
    }


    if (
        window.scrollY > 20
    ) {

        header.classList.add(
            "scrolled"
        );

    } else {

        header.classList.remove(
            "scrolled"
        );

    }

}


window.addEventListener(
    "scroll",
    updateHeader,
    {
        passive: true
    }
);


updateHeader();


// ============================================================
// RESET MENU SAAT PINDAH KE DESKTOP
// ============================================================

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth > 900
        ) {

            nav?.classList.remove(
                "open"
            );

            menuToggle?.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle?.setAttribute(
                "aria-label",
                "Buka menu"
            );

            document.body.classList.remove(
                "menu-open"
            );

        }

    }
);