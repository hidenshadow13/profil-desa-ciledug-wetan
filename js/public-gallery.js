// ======================================================
// PUBLIC GALLERY
// DESA CILEDUG WETAN
// ======================================================

import {
  db
} from "./firebase-config.js";


import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


const gallery =
  document.getElementById(
    "publicGallery"
  );


if (gallery) {

  loadPublicGallery();

}


async function loadPublicGallery() {

  try {


    const snapshot =
      await getDocs(
        collection(
          db,
          "galeri"
        )
      );


    const media = [];


    snapshot.forEach(
      (item) => {

        media.push({

          id:
            item.id,

          ...item.data()

        });

      }
    );


    media.sort(
      (a, b) => {

        const aTime =
          a.createdAt?.seconds || 0;

        const bTime =
          b.createdAt?.seconds || 0;

        return bTime - aTime;

      }
    );


    if (media.length === 0) {

      gallery.innerHTML = `

        <p>
          Belum ada dokumentasi.
        </p>

      `;

      return;

    }


    gallery.innerHTML = "";


    media.forEach(
      (item) => {


        const card =
          document.createElement(
            "article"
          );


        card.className =
          "public-gallery-card";


        if (
          item.mediaType ===
          "video"
        ) {


          card.innerHTML = `

            <div class="gallery-media">

              <video
                src="${escapeHTML(item.url)}"
                controls
                preload="metadata">
              </video>

            </div>

            <div class="gallery-content">

              <h3>
                ${escapeHTML(
                  item.title ||
                  "Dokumentasi"
                )}
              </h3>

              <p>
                ${escapeHTML(
                  item.description ||
                  ""
                )}
              </p>

            </div>

          `;


        } else {


          card.innerHTML = `

            <div class="gallery-media">

              <img
                src="${escapeHTML(item.url)}"
                alt="${escapeHTML(
                  item.title ||
                  "Dokumentasi Desa"
                )}"
                loading="lazy">

            </div>

            <div class="gallery-content">

              <h3>
                ${escapeHTML(
                  item.title ||
                  "Dokumentasi"
                )}
              </h3>

              <p>
                ${escapeHTML(
                  item.description ||
                  ""
                )}
              </p>

            </div>

          `;

        }


        gallery.appendChild(
          card
        );

      }
    );


  } catch (error) {

    console.error(
      "Public gallery error:",
      error
    );


    gallery.innerHTML = `

      <p>
        Galeri belum dapat dimuat.
      </p>

    `;

  }

}


// ======================================================
// ESCAPE
// ======================================================

function escapeHTML(
  text
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    text ?? "";


  return div.innerHTML;

}