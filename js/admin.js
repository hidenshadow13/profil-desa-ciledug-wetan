import { auth, db } from "./firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   CLOUDINARY
========================================================= */

const CLOUDINARY_CLOUD_NAME = "qfps4ngo";
const CLOUDINARY_UPLOAD_PRESET = "profil_ciledug_wetan";
const CLOUDINARY_FOLDER = "profil-ciledug-wetan";


/* =========================================================
   STATE
========================================================= */

let currentUser = null;
let dashboardInitialized = false;


/* =========================================================
   HELPER
========================================================= */

const $ = (id) => document.getElementById(id);


function escapeHTML(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function safeUrl(url = "") {

    try {

        const parsed =
            new URL(
                url,
                window.location.origin
            );

        if (
            parsed.protocol === "https:" ||
            parsed.protocol === "http:"
        ) {
            return parsed.href;
        }

        return "";

    } catch {

        return "";
    }
}


/* =========================================================
   ALERT
========================================================= */

function showAlert(
    message,
    type = "success"
) {

    const box =
        $("alertBox");

    if (!box) {

        alert(message);

        return;
    }

    box.textContent =
        message;

    box.className = "";

    box.classList.add(type);

    box.style.display =
        "block";

    clearTimeout(
        window.adminAlertTimer
    );

    window.adminAlertTimer =
        setTimeout(() => {

            box.style.display =
                "none";

        }, 4000);
}


/* =========================================================
   CLOUDINARY UPLOAD
========================================================= */

async function uploadToCloudinary(
    file,
    mediaType = "image"
) {

    if (!file) {

        throw new Error(
            "File belum dipilih."
        );
    }


    const resourceType =
        mediaType === "video"
            ? "video"
            : "image";


    const endpoint =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    formData.append(
        "folder",
        CLOUDINARY_FOLDER
    );


    const response =
        await fetch(
            endpoint,
            {
                method: "POST",
                body: formData
            }
        );


    const result =
        await response.json();


    if (!response.ok) {

        throw new Error(
            result?.error?.message ||
            "Upload Cloudinary gagal."
        );
    }


    return {

        url:
            result.secure_url ||
            result.url ||
            "",

        publicId:
            result.public_id ||
            ""
    };
}


/* =========================================================
   VALIDASI FILE
========================================================= */

function validateImage(file) {

    if (!file) {
        return true;
    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        showAlert(
            "File harus berupa gambar.",
            "error"
        );

        return false;
    }


    return true;
}


function validateMedia(
    file,
    mediaType
) {

    if (!file) {
        return true;
    }


    if (mediaType === "video") {

        if (
            !file.type.startsWith(
                "video/"
            )
        ) {

            showAlert(
                "Untuk jenis video, pilih file video.",
                "error"
            );

            return false;
        }

    } else {

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            showAlert(
                "Untuk jenis foto, pilih file gambar.",
                "error"
            );

            return false;
        }
    }


    return true;
}


/* =========================================================
   PEMERINTAHAN
========================================================= */

async function loadGovernment() {

    try {

        const reference =
            doc(
                db,
                "konten",
                "pemerintahan"
            );


        const snapshot =
            await getDoc(
                reference
            );


        if (!snapshot.exists()) {

            if ($("governmentStatus")) {

                $("governmentStatus")
                    .textContent =
                    "Belum";
            }

            return;
        }


        const data =
            snapshot.data();


        if ($("governmentName")) {

            $("governmentName")
                .value =
                data.name || "";
        }


        if ($("governmentRole")) {

            $("governmentRole")
                .value =
                data.role || "";
        }


        if ($("governmentDescription")) {

            $("governmentDescription")
                .value =
                data.description || "";
        }


        const preview =
            $("governmentPreview");


        if (preview) {

            if (data.imageUrl) {

                preview.innerHTML = `
                    <img
                        src="${escapeHTML(
                            safeUrl(
                                data.imageUrl
                            )
                        )}"
                        alt="${escapeHTML(
                            data.name ||
                            "Foto Pemerintahan"
                        )}"
                    >
                `;

            } else {

                preview.innerHTML = `
                    <div class="empty-state">
                        Belum ada foto
                    </div>
                `;
            }
        }


        if ($("governmentPreviewName")) {

            $("governmentPreviewName")
                .textContent =
                data.name ||
                "Belum diatur";
        }


        if ($("governmentPreviewRole")) {

            $("governmentPreviewRole")
                .textContent =
                data.role ||
                "-";
        }


        if ($("governmentStatus")) {

            $("governmentStatus")
                .textContent =
                "Aktif";
        }


    } catch (error) {

        console.error(
            "loadGovernment:",
            error
        );


        showAlert(
            "Gagal memuat pemerintahan: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   SIMPAN PEMERINTAHAN
========================================================= */

async function saveGovernment(event) {

    event.preventDefault();


    if (!currentUser) {

        showAlert(
            "Anda belum login.",
            "error"
        );

        return;
    }


    const name =
        $("governmentName")
            ?.value
            .trim() || "";


    const role =
        $("governmentRole")
            ?.value
            .trim() || "";


    const description =
        $("governmentDescription")
            ?.value
            .trim() || "";


    const file =
        $("governmentImage")
            ?.files?.[0];


    if (!name || !role) {

        showAlert(
            "Nama dan jabatan wajib diisi.",
            "error"
        );

        return;
    }


    if (!validateImage(file)) {
        return;
    }


    try {

        const button =
            $("governmentForm")
                ?.querySelector(
                    'button[type="submit"]'
                );


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Menyimpan...";
        }


        const reference =
            doc(
                db,
                "konten",
                "pemerintahan"
            );


        const oldSnapshot =
            await getDoc(
                reference
            );


        let imageUrl =
            oldSnapshot.exists()
                ? oldSnapshot.data()
                    .imageUrl || ""
                : "";


        let publicId =
            oldSnapshot.exists()
                ? oldSnapshot.data()
                    .publicId || ""
                : "";


        if (file) {

            const uploaded =
                await uploadToCloudinary(
                    file,
                    "image"
                );


            imageUrl =
                uploaded.url;


            publicId =
                uploaded.publicId;
        }


        await setDoc(
            reference,
            {
                name,
                role,
                description,
                imageUrl,
                publicId,

                updatedAt:
                    serverTimestamp(),

                updatedBy:
                    currentUser.uid,

                updatedByEmail:
                    currentUser.email || ""
            },
            {
                merge: true
            }
        );


        if ($("governmentPreview")) {

            $("governmentPreview")
                .innerHTML =
                imageUrl
                    ? `
                        <img
                            src="${escapeHTML(
                                safeUrl(
                                    imageUrl
                                )
                            )}"
                            alt="${escapeHTML(
                                name
                            )}"
                        >
                    `
                    : `
                        <div class="empty-state">
                            Belum ada foto
                        </div>
                    `;
        }


        if ($("governmentPreviewName")) {

            $("governmentPreviewName")
                .textContent =
                name;
        }


        if ($("governmentPreviewRole")) {

            $("governmentPreviewRole")
                .textContent =
                role;
        }


        if ($("governmentImage")) {

            $("governmentImage")
                .value = "";
        }


        if ($("governmentStatus")) {

            $("governmentStatus")
                .textContent =
                "Aktif";
        }


        showAlert(
            "Data pemerintahan berhasil disimpan."
        );


    } catch (error) {

        console.error(
            "saveGovernment:",
            error
        );


        showAlert(
            "Gagal menyimpan pemerintahan: " +
            error.message,
            "error"
        );


    } finally {

        const button =
            $("governmentForm")
                ?.querySelector(
                    'button[type="submit"]'
                );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "💾 Simpan Pemerintahan";
        }
    }
}


/* =========================================================
   PERANGKAT DESA
========================================================= */

async function getOfficials() {

    try {

        const q =
            query(
                collection(
                    db,
                    "perangkat"
                ),
                orderBy(
                    "createdAt",
                    "asc"
                )
            );


        const snapshot =
            await getDocs(q);


        return snapshot.docs.map(
            item => ({

                id:
                    item.id,

                ...item.data()
            })
        );


    } catch {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "perangkat"
                )
            );


        return snapshot.docs.map(
            item => ({

                id:
                    item.id,

                ...item.data()
            })
        );
    }
}


async function loadOfficials() {

    try {

        const officials =
            await getOfficials();


        if ($("officialCount")) {

            $("officialCount")
                .textContent =
                officials.length;
        }


        const container =
            $("officialList");


        if (!container) {
            return;
        }


        if (!officials.length) {

            container.innerHTML = `
                <div class="empty-state">
                    Belum ada data perangkat desa.
                </div>
            `;

            return;
        }


        container.innerHTML =
            officials.map(
                item => {

                    const image =
                        safeUrl(
                            item.imageUrl ||
                            ""
                        );


                    return `
                        <div class="item-card">

                            <div class="item-media">

                                ${
                                    image
                                        ? `
                                            <img
                                                src="${escapeHTML(
                                                    image
                                                )}"
                                                alt="${escapeHTML(
                                                    item.name ||
                                                    ""
                                                )}"
                                            >
                                        `
                                        : `
                                            <div class="no-media">
                                                Tidak ada foto
                                            </div>
                                        `
                                }

                            </div>


                            <div class="item-body">

                                <h3>
                                    ${escapeHTML(
                                        item.name ||
                                        "-"
                                    )}
                                </h3>


                                <div class="position">
                                    ${escapeHTML(
                                        item.position ||
                                        "-"
                                    )}
                                </div>


                                <div class="item-actions">

                                    <button
                                        type="button"
                                        class="btn btn-warning btn-small"
                                        onclick="window.editOfficial('${item.id}')"
                                    >
                                        ✏️ Edit
                                    </button>


                                    <button
                                        type="button"
                                        class="btn btn-danger btn-small"
                                        onclick="window.deleteOfficial('${item.id}')"
                                    >
                                        🗑️ Hapus
                                    </button>

                                </div>

                            </div>

                        </div>
                    `;

                }
            ).join("");


    } catch (error) {

        console.error(
            "loadOfficials:",
            error
        );


        showAlert(
            "Gagal memuat perangkat desa: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   FORM PERANGKAT
========================================================= */

function openOfficialForm(
    data = null
) {

    const wrapper =
        $("officialFormWrapper");


    if (!wrapper) {
        return;
    }


    wrapper.style.display =
        "block";


    if ($("officialFormTitle")) {

        $("officialFormTitle")
            .textContent =
            data
                ? "Edit Perangkat Desa"
                : "Tambah Perangkat Desa";
    }


    if ($("officialId")) {

        $("officialId")
            .value =
            data?.id || "";
    }


    if ($("officialName")) {

        $("officialName")
            .value =
            data?.name || "";
    }


    if ($("officialPosition")) {

        $("officialPosition")
            .value =
            data?.position || "";
    }


    if ($("officialImage")) {

        $("officialImage")
            .value = "";
    }


    if ($("officialImagePreview")) {

        if (data?.imageUrl) {

            $("officialImagePreview")
                .innerHTML = `
                    <img
                        src="${escapeHTML(
                            safeUrl(
                                data.imageUrl
                            )
                        )}"
                        class="preview-image"
                        alt="Foto perangkat"
                    >
                `;

        } else {

            $("officialImagePreview")
                .innerHTML =
                "";
        }
    }


    wrapper.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function closeOfficialForm() {

    if ($("officialFormWrapper")) {

        $("officialFormWrapper")
            .style.display =
            "none";
    }


    $("officialForm")
        ?.reset();


    if ($("officialId")) {

        $("officialId")
            .value = "";
    }


    if ($("officialImagePreview")) {

        $("officialImagePreview")
            .innerHTML =
            "";
    }
}


/* =========================================================
   SIMPAN PERANGKAT
========================================================= */

async function saveOfficial(event) {

    event.preventDefault();


    if (!currentUser) {

        showAlert(
            "Anda belum login.",
            "error"
        );

        return;
    }


    const id =
        $("officialId")
            ?.value
            .trim() || "";


    const name =
        $("officialName")
            ?.value
            .trim() || "";


    const position =
        $("officialPosition")
            ?.value
            .trim() || "";


    const file =
        $("officialImage")
            ?.files?.[0];


    if (!name || !position) {

        showAlert(
            "Nama dan jabatan wajib diisi.",
            "error"
        );

        return;
    }


    if (!validateImage(file)) {
        return;
    }


    try {

        const button =
            $("officialForm")
                ?.querySelector(
                    'button[type="submit"]'
                );


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Menyimpan...";
        }


        let imageUrl = "";
        let publicId = "";


        if (id) {

            const old =
                await getDoc(
                    doc(
                        db,
                        "perangkat",
                        id
                    )
                );


            if (old.exists()) {

                const data =
                    old.data();


                imageUrl =
                    data.imageUrl ||
                    "";


                publicId =
                    data.publicId ||
                    "";
            }
        }


        if (file) {

            const uploaded =
                await uploadToCloudinary(
                    file,
                    "image"
                );


            imageUrl =
                uploaded.url;


            publicId =
                uploaded.publicId;
        }


        const data = {

            name,
            position,
            imageUrl,
            publicId,

            updatedAt:
                serverTimestamp(),

            updatedBy:
                currentUser.uid,

            updatedByEmail:
                currentUser.email || ""
        };


        if (id) {

            await updateDoc(
                doc(
                    db,
                    "perangkat",
                    id
                ),
                data
            );


            showAlert(
                "Perangkat desa berhasil diperbarui."
            );


        } else {

            await addDoc(
                collection(
                    db,
                    "perangkat"
                ),
                {
                    ...data,

                    createdAt:
                        serverTimestamp(),

                    createdBy:
                        currentUser.uid
                }
            );


            showAlert(
                "Perangkat desa berhasil ditambahkan."
            );
        }


        closeOfficialForm();

        await loadOfficials();


    } catch (error) {

        console.error(
            "saveOfficial:",
            error
        );


        showAlert(
            "Gagal menyimpan perangkat: " +
            error.message,
            "error"
        );


    } finally {

        const button =
            $("officialForm")
                ?.querySelector(
                    'button[type="submit"]'
                );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "💾 Simpan";
        }
    }
}


/* =========================================================
   EDIT PERANGKAT
========================================================= */

async function editOfficial(id) {

    try {

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "perangkat",
                    id
                )
            );


        if (!snapshot.exists()) {

            showAlert(
                "Data perangkat tidak ditemukan.",
                "error"
            );

            return;
        }


        openOfficialForm({

            id:
                snapshot.id,

            ...snapshot.data()
        });


    } catch (error) {

        console.error(
            "editOfficial:",
            error
        );


        showAlert(
            "Gagal membuka perangkat: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   HAPUS PERANGKAT
========================================================= */

async function deleteOfficial(id) {

    if (!currentUser) {
        return;
    }


    if (
        !confirm(
            "Apakah Anda yakin ingin menghapus perangkat desa ini?"
        )
    ) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "perangkat",
                id
            )
        );


        showAlert(
            "Perangkat desa berhasil dihapus."
        );


        await loadOfficials();


    } catch (error) {

        console.error(
            "deleteOfficial:",
            error
        );


        showAlert(
            "Gagal menghapus perangkat: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   POTENSI DESA
========================================================= */

async function getPotentials() {

    try {

        const q =
            query(
                collection(
                    db,
                    "potensi"
                ),
                orderBy(
                    "createdAt",
                    "asc"
                )
            );


        const snapshot =
            await getDocs(q);


        return snapshot.docs.map(
            item => ({

                id:
                    item.id,

                ...item.data()
            })
        );


    } catch {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "potensi"
                )
            );


        return snapshot.docs.map(
            item => ({

                id:
                    item.id,

                ...item.data()
            })
        );
    }
}


async function loadPotentials() {

    try {

        const potentials =
            await getPotentials();


        if ($("potentialCount")) {

            $("potentialCount")
                .textContent =
                potentials.length;
        }


        const container =
            $("potentialList");


        if (!container) {
            return;
        }


        if (!potentials.length) {

            container.innerHTML = `
                <div class="empty-state">
                    Belum ada data potensi desa.
                </div>
            `;

            return;
        }


        container.innerHTML =
            potentials.map(
                item => {

                    const media =
                        safeUrl(
                            item.mediaUrl ||
                            ""
                        );


                    let mediaHTML = `
                        <div class="no-media">
                            Tidak ada media
                        </div>
                    `;


                    if (
                        media &&
                        item.mediaType ===
                        "video"
                    ) {

                        mediaHTML = `
                            <video
                                src="${escapeHTML(
                                    media
                                )}"
                                controls
                            ></video>
                        `;

                    } else if (media) {

                        mediaHTML = `
                            <img
                                src="${escapeHTML(
                                    media
                                )}"
                                alt="${escapeHTML(
                                    item.title ||
                                    ""
                                )}"
                            >
                        `;
                    }


                    return `
                        <div class="item-card">

                            <div class="item-media">
                                ${mediaHTML}
                            </div>


                            <div class="item-body">

                                <h3>
                                    ${escapeHTML(
                                        item.title ||
                                        "-"
                                    )}
                                </h3>


                                <div class="position">
                                    📍 ${escapeHTML(
                                        item.location ||
                                        "-"
                                    )}
                                </div>


                                <div class="description">
                                    ${escapeHTML(
                                        item.description ||
                                        ""
                                    )}
                                </div>


                                <div class="item-actions">

                                    <button
                                        type="button"
                                        class="btn btn-warning btn-small"
                                        onclick="window.editPotential('${item.id}')"
                                    >
                                        ✏️ Edit
                                    </button>


                                    <button
                                        type="button"
                                        class="btn btn-danger btn-small"
                                        onclick="window.deletePotential('${item.id}')"
                                    >
                                        🗑️ Hapus
                                    </button>

                                </div>

                            </div>

                        </div>
                    `;

                }
            ).join("");


    } catch (error) {

        console.error(
            "loadPotentials:",
            error
        );


        showAlert(
            "Gagal memuat potensi: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   FORM POTENSI
========================================================= */

function openPotentialForm(
    data = null
) {

    const wrapper =
        $("potentialFormWrapper");


    if (!wrapper) {
        return;
    }


    wrapper.style.display =
        "block";


    if ($("potentialFormTitle")) {

        $("potentialFormTitle")
            .textContent =
            data
                ? "Edit Potensi Desa"
                : "Tambah Potensi Desa";
    }


    if ($("potentialId")) {

        $("potentialId")
            .value =
            data?.id || "";
    }


    if ($("potentialTitle")) {

        $("potentialTitle")
            .value =
            data?.title || "";
    }


    if ($("potentialLocation")) {

        $("potentialLocation")
            .value =
            data?.location || "";
    }


    if ($("potentialDescription")) {

        $("potentialDescription")
            .value =
            data?.description || "";
    }


    if ($("potentialMediaType")) {

        $("potentialMediaType")
            .value =
            data?.mediaType ||
            "image";
    }


    if ($("potentialMedia")) {

        $("potentialMedia")
            .value = "";
    }


    const preview =
        $("potentialMediaPreview");


    if (preview) {

        const url =
            safeUrl(
                data?.mediaUrl ||
                ""
            );


        if (
            url &&
            data?.mediaType ===
            "video"
        ) {

            preview.innerHTML = `
                <video
                    src="${escapeHTML(url)}"
                    class="preview-video"
                    controls
                ></video>
            `;

        } else if (url) {

            preview.innerHTML = `
                <img
                    src="${escapeHTML(url)}"
                    class="preview-image"
                    alt="Media potensi"
                >
            `;

        } else {

            preview.innerHTML =
                "";
        }
    }


    wrapper.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


function closePotentialForm() {

    if ($("potentialFormWrapper")) {

        $("potentialFormWrapper")
            .style.display =
            "none";
    }


    $("potentialForm")
        ?.reset();


    if ($("potentialId")) {

        $("potentialId")
            .value = "";
    }


    if ($("potentialMediaPreview")) {

        $("potentialMediaPreview")
            .innerHTML =
            "";
    }
}


/* =========================================================
   SIMPAN POTENSI
========================================================= */

async function savePotential(event) {

    event.preventDefault();


    if (!currentUser) {

        showAlert(
            "Anda belum login.",
            "error"
        );

        return;
    }


    const id =
        $("potentialId")
            ?.value
            .trim() || "";


    const title =
        $("potentialTitle")
            ?.value
            .trim() || "";


    const location =
        $("potentialLocation")
            ?.value
            .trim() || "";


    const description =
        $("potentialDescription")
            ?.value
            .trim() || "";


    const mediaType =
        $("potentialMediaType")
            ?.value ||
        "image";


    const file =
        $("potentialMedia")
            ?.files?.[0];


    if (!title) {

        showAlert(
            "Nama potensi wajib diisi.",
            "error"
        );

        return;
    }


    if (
        !validateMedia(
            file,
            mediaType
        )
    ) {
        return;
    }


    try {

        const button =
            $("potentialForm")
                ?.querySelector(
                    'button[type="submit"]'
                );


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Menyimpan...";
        }


        let mediaUrl = "";
        let publicId = "";


        if (id) {

            const old =
                await getDoc(
                    doc(
                        db,
                        "potensi",
                        id
                    )
                );


            if (old.exists()) {

                const data =
                    old.data();


                mediaUrl =
                    data.mediaUrl ||
                    "";


                publicId =
                    data.publicId ||
                    "";
            }
        }


        if (file) {

            const uploaded =
                await uploadToCloudinary(
                    file,
                    mediaType
                );


            mediaUrl =
                uploaded.url;


            publicId =
                uploaded.publicId;
        }


        const data = {

            title,
            location,
            description,
            mediaUrl,
            mediaType,
            publicId,

            updatedAt:
                serverTimestamp(),

            updatedBy:
                currentUser.uid,

            updatedByEmail:
                currentUser.email || ""
        };


        if (id) {

            await updateDoc(
                doc(
                    db,
                    "potensi",
                    id
                ),
                data
            );


            showAlert(
                "Potensi berhasil diperbarui."
            );


        } else {

            await addDoc(
                collection(
                    db,
                    "potensi"
                ),
                {
                    ...data,

                    createdAt:
                        serverTimestamp(),

                    createdBy:
                        currentUser.uid
                }
            );


            showAlert(
                "Potensi berhasil ditambahkan."
            );
        }


        closePotentialForm();

        await loadPotentials();


    } catch (error) {

        console.error(
            "savePotential:",
            error
        );


        showAlert(
            "Gagal menyimpan potensi: " +
            error.message,
            "error"
        );


    } finally {

        const button =
            $("potentialForm")
                ?.querySelector(
                    'button[type="submit"]'
                );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "💾 Simpan Potensi";
        }
    }
}


/* =========================================================
   EDIT POTENSI
========================================================= */

async function editPotential(id) {

    try {

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "potensi",
                    id
                )
            );


        if (!snapshot.exists()) {

            showAlert(
                "Data potensi tidak ditemukan.",
                "error"
            );

            return;
        }


        openPotentialForm({

            id:
                snapshot.id,

            ...snapshot.data()
        });


    } catch (error) {

        console.error(
            "editPotential:",
            error
        );


        showAlert(
            "Gagal membuka potensi: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   HAPUS POTENSI
========================================================= */

async function deletePotential(id) {

    if (!currentUser) {
        return;
    }


    if (
        !confirm(
            "Apakah Anda yakin ingin menghapus potensi ini?"
        )
    ) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "potensi",
                id
            )
        );


        showAlert(
            "Potensi berhasil dihapus."
        );


        await loadPotentials();


    } catch (error) {

        console.error(
            "deletePotential:",
            error
        );


        showAlert(
            "Gagal menghapus potensi: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   GALERI
========================================================= */

async function getGallery() {

    try {

        const q =
            query(
                collection(
                    db,
                    "galeri"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(q);


        return snapshot.docs.map(
            item => ({

                id:
                    item.id,

                ...item.data()
            })
        );


    } catch {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "galeri"
                )
            );


        return snapshot.docs.map(
            item => ({

                id:
                    item.id,

                ...item.data()
            })
        );
    }
}


async function loadGallery() {

    try {

        const gallery =
            await getGallery();


        if ($("galleryCount")) {

            $("galleryCount")
                .textContent =
                gallery.length;
        }


        const container =
            $("galleryList");


        if (!container) {
            return;
        }


        if (!gallery.length) {

            container.innerHTML = `
                <div class="empty-state">
                    Belum ada foto atau video.
                </div>
            `;

            return;
        }


        container.innerHTML =
            gallery.map(
                item => {

                    const url =
                        safeUrl(
                            item.mediaUrl ||
                            ""
                        );


                    let mediaHTML = `
                        <div class="no-media">
                            Tidak ada media
                        </div>
                    `;


                    if (
                        url &&
                        item.mediaType ===
                        "video"
                    ) {

                        mediaHTML = `
                            <video
                                src="${escapeHTML(
                                    url
                                )}"
                                controls
                            ></video>
                        `;

                    } else if (url) {

                        mediaHTML = `
                            <img
                                src="${escapeHTML(
                                    url
                                )}"
                                alt="${escapeHTML(
                                    item.title ||
                                    ""
                                )}"
                            >
                        `;
                    }


                    return `
                        <div class="item-card">

                            <div class="item-media">
                                ${mediaHTML}
                            </div>


                            <div class="item-body">

                                <h3>
                                    ${escapeHTML(
                                        item.title ||
                                        "Tanpa judul"
                                    )}
                                </h3>


                                <div class="position">
                                    ${
                                        item.mediaType ===
                                        "video"
                                            ? "🎥 Video"
                                            : "🖼️ Foto"
                                    }
                                </div>


                                <div class="item-actions">

                                    <button
                                        type="button"
                                        class="btn btn-warning btn-small"
                                        onclick="window.editGallery('${item.id}')"
                                    >
                                        ✏️ Ganti Media
                                    </button>


                                    <button
                                        type="button"
                                        class="btn btn-danger btn-small"
                                        onclick="window.deleteGallery('${item.id}')"
                                    >
                                        🗑️ Hapus
                                    </button>

                                </div>

                            </div>

                        </div>
                    `;

                }
            ).join("");


    } catch (error) {

        console.error(
            "loadGallery:",
            error
        );


        showAlert(
            "Gagal memuat galeri: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   SIMPAN GALERI
========================================================= */

async function saveGallery(event) {

    event.preventDefault();


    if (!currentUser) {

        showAlert(
            "Anda belum login.",
            "error"
        );

        return;
    }


    const title =
        $("galleryTitle")
            ?.value
            .trim() || "";


    const mediaType =
        $("galleryType")
            ?.value ||
        "image";


    const file =
        $("galleryFile")
            ?.files?.[0];


    if (!title) {

        showAlert(
            "Judul galeri wajib diisi.",
            "error"
        );

        return;
    }


    if (!file) {

        showAlert(
            "Silakan pilih foto atau video.",
            "error"
        );

        return;
    }


    if (
        !validateMedia(
            file,
            mediaType
        )
    ) {
        return;
    }


    try {

        const button =
            $("galleryForm")
                ?.querySelector(
                    'button[type="submit"]'
                );


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Mengupload...";
        }


        const uploaded =
            await uploadToCloudinary(
                file,
                mediaType
            );


        await addDoc(
            collection(
                db,
                "galeri"
            ),
            {

                title,

                mediaUrl:
                    uploaded.url,

                mediaType,

                publicId:
                    uploaded.publicId,

                createdAt:
                    serverTimestamp(),

                createdBy:
                    currentUser.uid,

                createdByEmail:
                    currentUser.email || ""
            }
        );


        $("galleryForm")
            ?.reset();


        if ($("galleryPreview")) {

            $("galleryPreview")
                .innerHTML =
                "";
        }


        showAlert(
            "Media berhasil ditambahkan ke galeri."
        );


        await loadGallery();


    } catch (error) {

        console.error(
            "saveGallery:",
            error
        );


        showAlert(
            "Gagal menyimpan galeri: " +
            error.message,
            "error"
        );


    } finally {

        const button =
            $("galleryForm")
                ?.querySelector(
                    'button[type="submit"]'
                );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "☁️ Upload ke Galeri";
        }
    }
}


/* =========================================================
   EDIT GALERI
   HANYA MENGGANTI MEDIA
   JUDUL TIDAK DIUBAH
========================================================= */

async function editGallery(id) {

    if (!currentUser) {

        showAlert(
            "Anda belum login.",
            "error"
        );

        return;
    }


    try {

        const reference =
            doc(
                db,
                "galeri",
                id
            );


        const snapshot =
            await getDoc(
                reference
            );


        if (!snapshot.exists()) {

            showAlert(
                "Data galeri tidak ditemukan.",
                "error"
            );

            return;
        }


        const data =
            snapshot.data();


        const mediaType =
            data.mediaType === "video"
                ? "video"
                : "image";


        const input =
            document.createElement(
                "input"
            );


        input.type =
            "file";


        input.accept =
            mediaType === "video"
                ? "video/*"
                : "image/*";


        input.style.display =
            "none";


        document.body.appendChild(
            input
        );


        input.addEventListener(
            "change",
            async () => {

                const file =
                    input.files?.[0];


                if (!file) {

                    input.remove();

                    return;
                }


                if (
                    !validateMedia(
                        file,
                        mediaType
                    )
                ) {

                    input.remove();

                    return;
                }


                try {

                    showAlert(
                        "Mengupload media baru..."
                    );


                    const uploaded =
                        await uploadToCloudinary(
                            file,
                            mediaType
                        );


                    await updateDoc(
                        reference,
                        {

                            mediaUrl:
                                uploaded.url,

                            publicId:
                                uploaded.publicId,

                            updatedAt:
                                serverTimestamp(),

                            updatedBy:
                                currentUser.uid,

                            updatedByEmail:
                                currentUser.email ||
                                ""
                        }
                    );


                    showAlert(
                        "Media galeri berhasil diganti."
                    );


                    await loadGallery();


                } catch (error) {

                    console.error(
                        "editGallery:",
                        error
                    );


                    showAlert(
                        "Gagal mengganti media: " +
                        error.message,
                        "error"
                    );


                } finally {

                    input.remove();
                }

            }
        );


        input.click();


    } catch (error) {

        console.error(
            "editGallery:",
            error
        );


        showAlert(
            "Gagal membuka galeri: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   HAPUS GALERI
========================================================= */

async function deleteGallery(id) {

    if (!currentUser) {
        return;
    }


    if (
        !confirm(
            "Apakah Anda yakin ingin menghapus media ini?"
        )
    ) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "galeri",
                id
            )
        );


        showAlert(
            "Media berhasil dihapus."
        );


        await loadGallery();


    } catch (error) {

        console.error(
            "deleteGallery:",
            error
        );


        showAlert(
            "Gagal menghapus galeri: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   KONTAK
========================================================= */

async function loadContact() {

    try {

        const reference =
            doc(
                db,
                "konten",
                "kontak"
            );


        const snapshot =
            await getDoc(
                reference
            );


        if (!snapshot.exists()) {
            return;
        }


        const data =
            snapshot.data();


        /* ALAMAT */

        if ($("contactAddress")) {

            $("contactAddress")
                .value =
                data.address || "";
        }


        /* TELEPON */

        if ($("contactPhone")) {

            $("contactPhone")
                .value =
                data.phone || "";
        }


        /* WHATSAPP */

        if ($("contactWhatsapp")) {

            $("contactWhatsapp")
                .value =
                data.whatsapp || "";
        }


        /* EMAIL */

        if ($("contactEmail")) {

            $("contactEmail")
                .value =
                data.email || "";
        }


        /* JAM PELAYANAN */

        if ($("contactOfficeHours")) {

            $("contactOfficeHours")
                .value =
                data.officeHours || "";
        }


        /* DESKRIPSI */

        if ($("contactDescription")) {

            $("contactDescription")
                .value =
                data.description || "";
        }


    } catch (error) {

        console.error(
            "loadContact:",
            error
        );


        showAlert(
            "Gagal memuat kontak: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   SIMPAN KONTAK
========================================================= */

async function saveContact(event) {

    event.preventDefault();


    if (!currentUser) {

        showAlert(
            "Anda belum login.",
            "error"
        );

        return;
    }


    const address =
        $("contactAddress")
            ?.value
            .trim() || "";


    const phone =
        $("contactPhone")
            ?.value
            .trim() || "";


    const whatsapp =
        $("contactWhatsapp")
            ?.value
            .trim() || "";


    const email =
        $("contactEmail")
            ?.value
            .trim() || "";


    const officeHours =
        $("contactOfficeHours")
            ?.value
            .trim() || "";


    const description =
        $("contactDescription")
            ?.value
            .trim() || "";


    try {

        const button =
            $("contactForm")
                ?.querySelector(
                    'button[type="submit"]'
                );


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Menyimpan...";
        }


        await setDoc(
            doc(
                db,
                "konten",
                "kontak"
            ),
            {

                address,

                phone,

                whatsapp,

                email,

                officeHours,

                description,

                updatedAt:
                    serverTimestamp(),

                updatedBy:
                    currentUser.uid,

                updatedByEmail:
                    currentUser.email || ""
            },
            {
                merge: true
            }
        );


        showAlert(
            "Informasi kontak berhasil disimpan."
        );


    } catch (error) {

        console.error(
            "saveContact:",
            error
        );


        showAlert(
            "Gagal menyimpan kontak: " +
            error.message,
            "error"
        );


    } finally {

        const button =
            $("contactForm")
                ?.querySelector(
                    'button[type="submit"]'
                );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "💾 Simpan Kontak";
        }
    }
}


/* =========================================================
   RESET KONTAK
========================================================= */

function resetContact() {

    loadContact();

}


/* =========================================================
   PREVIEW FILE
========================================================= */

function setupFilePreview() {


    /* -------------------------------------------------------
       PEMERINTAHAN
    ------------------------------------------------------- */

    $("governmentImage")
        ?.addEventListener(
            "change",
            function () {

                const file =
                    this.files?.[0];


                if (!file) {
                    return;
                }


                if (
                    !validateImage(
                        file
                    )
                ) {

                    this.value =
                        "";

                    return;
                }


                const url =
                    URL.createObjectURL(
                        file
                    );


                if ($("governmentPreview")) {

                    $("governmentPreview")
                        .innerHTML = `
                            <img
                                src="${url}"
                                alt="Preview"
                            >
                        `;
                }
            }
        );


    /* -------------------------------------------------------
       PERANGKAT
    ------------------------------------------------------- */

    $("officialImage")
        ?.addEventListener(
            "change",
            function () {

                const file =
                    this.files?.[0];


                if (!file) {
                    return;
                }


                if (
                    !validateImage(
                        file
                    )
                ) {

                    this.value =
                        "";

                    return;
                }


                const url =
                    URL.createObjectURL(
                        file
                    );


                if (
                    $("officialImagePreview")
                ) {

                    $("officialImagePreview")
                        .innerHTML = `
                            <img
                                src="${url}"
                                class="preview-image"
                                alt="Preview"
                            >
                        `;
                }
            }
        );


    /* -------------------------------------------------------
       POTENSI
    ------------------------------------------------------- */

    $("potentialMedia")
        ?.addEventListener(
            "change",
            function () {

                const file =
                    this.files?.[0];


                const type =
                    $("potentialMediaType")
                        ?.value ||
                    "image";


                if (!file) {
                    return;
                }


                if (
                    !validateMedia(
                        file,
                        type
                    )
                ) {

                    this.value =
                        "";

                    return;
                }


                const url =
                    URL.createObjectURL(
                        file
                    );


                if (
                    $("potentialMediaPreview")
                ) {

                    if (
                        type === "video"
                    ) {

                        $("potentialMediaPreview")
                            .innerHTML = `
                                <video
                                    src="${url}"
                                    class="preview-video"
                                    controls
                                ></video>
                            `;

                    } else {

                        $("potentialMediaPreview")
                            .innerHTML = `
                                <img
                                    src="${url}"
                                    class="preview-image"
                                    alt="Preview"
                                >
                            `;
                    }
                }
            }
        );


    /* -------------------------------------------------------
       GALERI
    ------------------------------------------------------- */

    $("galleryFile")
        ?.addEventListener(
            "change",
            function () {

                const file =
                    this.files?.[0];


                const type =
                    $("galleryType")
                        ?.value ||
                    "image";


                if (!file) {
                    return;
                }


                if (
                    !validateMedia(
                        file,
                        type
                    )
                ) {

                    this.value =
                        "";

                    return;
                }


                const url =
                    URL.createObjectURL(
                        file
                    );


                if ($("galleryPreview")) {

                    if (
                        type === "video"
                    ) {

                        $("galleryPreview")
                            .innerHTML = `
                                <video
                                    src="${url}"
                                    class="preview-video"
                                    controls
                                ></video>
                            `;

                    } else {

                        $("galleryPreview")
                            .innerHTML = `
                                <img
                                    src="${url}"
                                    class="preview-image"
                                    alt="Preview"
                                >
                            `;
                    }
                }
            }
        );
}


/* =========================================================
   EVENT LISTENER
========================================================= */

function setupEventListeners() {


    /* PEMERINTAHAN */

    $("governmentForm")
        ?.addEventListener(
            "submit",
            saveGovernment
        );


    $("resetGovernmentBtn")
        ?.addEventListener(
            "click",
            loadGovernment
        );


    /* PERANGKAT */

    $("newOfficialBtn")
        ?.addEventListener(
            "click",
            () =>
                openOfficialForm()
        );


    $("officialForm")
        ?.addEventListener(
            "submit",
            saveOfficial
        );


    $("cancelOfficialBtn")
        ?.addEventListener(
            "click",
            closeOfficialForm
        );


    /* POTENSI */

    $("newPotentialBtn")
        ?.addEventListener(
            "click",
            () =>
                openPotentialForm()
        );


    $("potentialForm")
        ?.addEventListener(
            "submit",
            savePotential
        );


    $("cancelPotentialBtn")
        ?.addEventListener(
            "click",
            closePotentialForm
        );


    /* GALERI */

    $("galleryForm")
        ?.addEventListener(
            "submit",
            saveGallery
        );


    /* KONTAK */

    $("contactForm")
        ?.addEventListener(
            "submit",
            saveContact
        );


    $("resetContactBtn")
        ?.addEventListener(
            "click",
            resetContact
        );


    /* LOGOUT */

    $("logoutBtn")
        ?.addEventListener(
            "click",
            async () => {

                try {

                    await signOut(
                        auth
                    );


                    window.location.href =
                        "index.html";


                } catch (error) {

                    console.error(
                        "logout:",
                        error
                    );


                    showAlert(
                        "Gagal keluar: " +
                        error.message,
                        "error"
                    );
                }
            }
        );


    setupFilePreview();
}


/* =========================================================
   INITIALIZE DASHBOARD
========================================================= */

async function initializeDashboard() {

    if (dashboardInitialized) {
        return;
    }


    dashboardInitialized =
        true;


    setupEventListeners();


    await Promise.all([

        loadGovernment(),

        loadOfficials(),

        loadPotentials(),

        loadGallery(),

        loadContact()

    ]);
}


/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        currentUser =
            user;


        if ($("adminEmail")) {

            $("adminEmail")
                .textContent =
                user.email ||
                "Admin";
        }


        await initializeDashboard();
    }
);


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.editOfficial =
    editOfficial;


window.deleteOfficial =
    deleteOfficial;


window.editPotential =
    editPotential;


window.deletePotential =
    deletePotential;


window.editGallery =
    editGallery;


window.deleteGallery =
    deleteGallery;