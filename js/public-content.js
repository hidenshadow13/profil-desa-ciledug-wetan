// ============================================================
// public-content.js
// Profil Desa Ciledug Wetan
// Sinkronisasi Firestore -> Website Publik
// ============================================================

import { db } from "./firebase-config.js";

import {
    collection,
    doc,
    onSnapshot,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ============================================================
// HELPER
// ============================================================

function $(id) {
    return document.getElementById(id);
}


function escapeHTML(value = "") {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function showLoading(element, text = "Memuat...") {

    if (element) {
        element.innerHTML =
            `<div class="loading-state">${text}</div>`;
    }

}


// ============================================================
// PEMERINTAHAN DESA
// ============================================================

function loadPublicGovernment() {

    const ref =
        doc(
            db,
            "konten",
            "pemerintahan"
        );


    onSnapshot(
        ref,

        (snapshot) => {

            if (!snapshot.exists()) {
                return;
            }


            const data =
                snapshot.data();


            const image =
                $("publicGovernmentImage");

            const name =
                $("publicGovernmentName");

            const role =
                $("publicGovernmentRole");

            const description =
                $("publicGovernmentDescription");


            if (name) {

                name.textContent =
                    data.name ||
                    "Belum tersedia";

            }


            if (role) {

                role.textContent =
                    data.role ||
                    "Belum tersedia";

            }


            if (description) {

                description.textContent =
                    data.description ||
                    "";

            }


            if (image) {

                if (data.imageUrl) {

                    image.src =
                        data.imageUrl;

                    image.alt =
                        data.name ||
                        "Pemerintahan Desa";

                    image.style.display =
                        "block";

                } else {

                    image.removeAttribute(
                        "src"
                    );

                    image.alt =
                        "Belum ada foto";

                }

            }

        },

        (error) => {

            console.error(
                "Gagal memuat pemerintahan:",
                error
            );

        }
    );

}


// ============================================================
// PERANGKAT DESA
// ============================================================

function loadPublicOfficials() {

    const container =
        $("publicOfficials");

    if (!container) {
        return;
    }


    showLoading(
        container,
        "Memuat perangkat desa..."
    );


    onSnapshot(

        collection(
            db,
            "perangkat"
        ),

        (snapshot) => {

            if (snapshot.empty) {

                container.innerHTML =
                    `
                    <div class="empty-state">
                        Data perangkat desa belum tersedia.
                    </div>
                    `;

                return;
            }


            const items =
                snapshot.docs.map(
                    item => ({
                        id: item.id,
                        ...item.data()
                    })
                );


            items.sort(
                (a, b) =>
                    String(a.name || "")
                        .localeCompare(
                            String(b.name || ""),
                            "id"
                        )
            );


            container.innerHTML =
                items.map(
                    item => `

                    <article class="person-card">

                        <div class="person-image">

                            ${
                                item.imageUrl

                                    ? `
                                    <img
                                        src="${escapeHTML(item.imageUrl)}"
                                        alt="${escapeHTML(item.name || "Perangkat Desa")}"
                                        loading="lazy"
                                    >
                                    `

                                    : `
                                    <div class="no-image">
                                        Foto belum tersedia
                                    </div>
                                    `
                            }

                        </div>


                        <div class="person-info">

                            <h3>
                                ${escapeHTML(item.name || "-")}
                            </h3>

                            <p>
                                ${escapeHTML(item.position || "-")}
                            </p>

                        </div>

                    </article>

                    `
                ).join("");

        },

        (error) => {

            console.error(
                "Gagal memuat perangkat desa:",
                error
            );

            container.innerHTML =
                `
                <div class="empty-state">
                    Gagal memuat data perangkat desa.
                </div>
                `;

        }
    );

}


// ============================================================
// POTENSI DESA
// ============================================================

function loadPublicPotentials() {

    const container =
        $("publicPotentials");

    if (!container) {
        return;
    }


    showLoading(
        container,
        "Memuat potensi desa..."
    );


    onSnapshot(

        collection(
            db,
            "potensi"
        ),

        (snapshot) => {

            if (snapshot.empty) {

                container.innerHTML =
                    `
                    <div class="empty-state">
                        Data potensi desa belum tersedia.
                    </div>
                    `;

                return;
            }


            const items =
                snapshot.docs.map(
                    item => ({
                        id: item.id,
                        ...item.data()
                    })
                );


            items.sort(
                (a, b) => {

                    const aTime =
                        a.createdAt?.seconds ||
                        a.updatedAt?.seconds ||
                        0;

                    const bTime =
                        b.createdAt?.seconds ||
                        b.updatedAt?.seconds ||
                        0;

                    return bTime - aTime;

                }
            );


            container.innerHTML =
                items.map(
                    item => `

                    <article
                        class="potential-card"
                        data-id="${escapeHTML(item.id)}"
                    >

                        <div class="potential-media">

                            ${
                                item.mediaUrl

                                    ? (
                                        item.mediaType === "video"

                                            ? `
                                            <video
                                                src="${escapeHTML(item.mediaUrl)}"
                                                muted
                                                playsinline
                                                preload="metadata"
                                            ></video>
                                            `

                                            : `
                                            <img
                                                src="${escapeHTML(item.mediaUrl)}"
                                                alt="${escapeHTML(item.title || "Potensi Desa")}"
                                                loading="lazy"
                                            >
                                            `
                                      )

                                    : `
                                    <div class="no-image">
                                        Media belum tersedia
                                    </div>
                                    `
                            }

                        </div>


                        <div class="potential-content">

                            <span class="potential-location">

                                📍
                                ${escapeHTML(item.location || "Lokasi belum tersedia")}

                            </span>


                            <h3>
                                ${escapeHTML(item.title || "-")}
                            </h3>


                            <p>
                                ${escapeHTML(item.description || "")}
                            </p>


                            <button
                                type="button"
                                class="text-link potential-detail-btn"
                                data-id="${escapeHTML(item.id)}"
                            >
                                Lihat Detail →
                            </button>

                        </div>

                    </article>

                    `
                ).join("");


            /*
             * Event tombol detail
             */

            container
                .querySelectorAll(
                    ".potential-detail-btn"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                const id =
                                    button.dataset.id;

                                const item =
                                    items.find(
                                        data =>
                                            data.id === id
                                    );

                                if (item) {

                                    openPotentialModal(
                                        item
                                    );

                                }

                            }
                        );

                    }
                );

        },

        (error) => {

            console.error(
                "Gagal memuat potensi:",
                error
            );

            container.innerHTML =
                `
                <div class="empty-state">
                    Gagal memuat data potensi desa.
                </div>
                `;

        }
    );

}


// ============================================================
// MODAL POTENSI
// ============================================================

function openPotentialModal(item) {

    const modal =
        $("potentialModal");

    const media =
        $("potentialModalMedia");

    const location =
        $("potentialModalLocation");

    const title =
        $("potentialModalTitle");

    const description =
        $("potentialModalDescription");


    if (!modal) {
        return;
    }


    if (location) {

        location.textContent =
            item.location ||
            "Lokasi belum tersedia";

    }


    if (title) {

        title.textContent =
            item.title ||
            "Potensi Desa";

    }


    if (description) {

        description.textContent =
            item.description ||
            "";

    }


    if (media) {

        if (
            item.mediaType === "video"
        ) {

            media.innerHTML =
                `
                <video
                    src="${escapeHTML(item.mediaUrl || "")}"
                    controls
                    autoplay
                    playsinline
                ></video>
                `;

        } else {

            media.innerHTML =
                `
                <img
                    src="${escapeHTML(item.mediaUrl || "")}"
                    alt="${escapeHTML(item.title || "Potensi Desa")}"
                >
                `;

        }

    }


    modal.classList.add(
        "active"
    );

    modal.style.display =
        "flex";

    document.body.classList.add(
        "modal-open"
    );

}


function closePotentialModal() {

    const modal =
        $("potentialModal");

    const media =
        $("potentialModalMedia");


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "active"
    );

    modal.style.display =
        "none";

    document.body.classList.remove(
        "modal-open"
    );


    if (media) {
        media.innerHTML = "";
    }

}


$("closePotentialModal")
    ?.addEventListener(
        "click",
        closePotentialModal
    );


$("potentialModalOverlay")
    ?.addEventListener(
        "click",
        closePotentialModal
    );


document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            closePotentialModal();

        }

    }
);


// ============================================================
// KONTAK DESA
// ============================================================

function loadPublicContact() {

    const ref =
        doc(
            db,
            "konten",
            "kontak"
        );


    onSnapshot(

        ref,

        (snapshot) => {

            if (!snapshot.exists()) {

                return;

            }


            const data =
                snapshot.data();


            const address =
                $("publicContactAddress");

            const phone =
                $("publicContactPhone");

            const whatsapp =
                $("publicContactWhatsapp");

            const email =
                $("publicContactEmail");

            const emailLink =
                $("publicContactEmailLink");

            const officeHours =
                $("publicContactOfficeHours");

            const description =
                $("publicContactDescription");


            // --------------------------------------------
            // ALAMAT
            // --------------------------------------------

            if (address) {

                address.textContent =
                    data.address ||
                    "Belum tersedia";

            }


            // --------------------------------------------
            // TELEPON
            // --------------------------------------------

            if (phone) {

                phone.textContent =
                    data.phone ||
                    "Belum tersedia";

            }


            // --------------------------------------------
            // WHATSAPP
            // --------------------------------------------

            if (whatsapp) {

                whatsapp.textContent =
                    data.whatsapp ||
                    "Belum tersedia";

            }


            // --------------------------------------------
            // EMAIL
            // --------------------------------------------

            if (email) {

                email.textContent =
                    data.email ||
                    "Belum tersedia";

            }


            if (emailLink) {

                if (data.email) {

                    emailLink.href =
                        `mailto:${data.email}`;

                    emailLink.style.display =
                        "inline-block";

                } else {

                    emailLink.removeAttribute(
                        "href"
                    );

                    emailLink.style.display =
                        "none";

                }

            }


            // --------------------------------------------
            // JAM PELAYANAN
            // --------------------------------------------

            if (officeHours) {

                officeHours.textContent =
                    data.officeHours ||
                    "Belum tersedia";

            }


            // --------------------------------------------
            // DESKRIPSI
            // --------------------------------------------

            if (description) {

                description.textContent =
                    data.description ||
                    "";

            }

        },

        (error) => {

            console.error(
                "Gagal memuat kontak:",
                error
            );

        }

    );

}


// ============================================================
// GALERI DESA
// ============================================================

function loadPublicGallery() {

    const container =
        $("publicGallery");

    if (!container) {
        return;
    }


    showLoading(
        container,
        "Memuat galeri..."
    );


    onSnapshot(

        collection(
            db,
            "galeri"
        ),

        (snapshot) => {

            if (snapshot.empty) {

                container.innerHTML =
                    `
                    <div class="empty-state">
                        Galeri belum memiliki foto atau video.
                    </div>
                    `;

                return;
            }


            const items =
                snapshot.docs.map(
                    item => ({
                        id: item.id,
                        ...item.data()
                    })
                );


            items.sort(
                (a, b) => {

                    const aTime =
                        a.createdAt?.seconds ||
                        a.updatedAt?.seconds ||
                        0;

                    const bTime =
                        b.createdAt?.seconds ||
                        b.updatedAt?.seconds ||
                        0;

                    return bTime - aTime;

                }
            );


            container.innerHTML =
                items.map(
                    (item, index) => {

                        let className =
                            "gallery-item";


                        if (index === 0) {
                            className += " large";
                        }


                        if (
                            index > 0 &&
                            index % 4 === 3
                        ) {
                            className += " wide";
                        }


                        if (
                            item.mediaType === "video"
                        ) {

                            return `

                            <div
                                class="${className}"
                                data-id="${escapeHTML(item.id)}"
                            >

                                <video
                                    src="${escapeHTML(item.mediaUrl || "")}"
                                    controls
                                    preload="metadata"
                                ></video>

                                <div class="gallery-caption">
                                    ${escapeHTML(item.title || "")}
                                </div>

                            </div>

                            `;

                        }


                        return `

                        <div
                            class="${className}"
                            data-id="${escapeHTML(item.id)}"
                        >

                            <img
                                src="${escapeHTML(item.mediaUrl || "")}"
                                alt="${escapeHTML(item.title || "Galeri Desa")}"
                                loading="lazy"
                            >

                            ${
                                item.title
                                    ? `
                                    <div class="gallery-caption">
                                        ${escapeHTML(item.title)}
                                    </div>
                                    `
                                    : ""
                            }

                        </div>

                        `;

                    }
                ).join("");

        },

        (error) => {

            console.error(
                "Gagal memuat galeri:",
                error
            );

            container.innerHTML =
                `
                <div class="empty-state">
                    Gagal memuat galeri.
                </div>
                `;

        }

    );

}


// ============================================================
// INISIALISASI
// ============================================================

function initializePublicContent() {

    loadPublicGovernment();

    loadPublicOfficials();

    loadPublicPotentials();

    loadPublicContact();

    loadPublicGallery();

}


// Jalankan setelah DOM siap

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializePublicContent
    );

} else {

    initializePublicContent();

}