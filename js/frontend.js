$offerMainFilesList.forEach(($offerMainFiles) => {
  const $offerMain = $offerMainFiles.closest(".offer-main");
  const $offerMainFilesEmpty = $offerMain.querySelector(".offer-main__empty--files");
  
  const $offerTabsHeaderBtnFileField = $offerMain?.querySelector(".offer-main__tabs-header-btn--files .btn__file-field");
  let $offerMainFilesItems = $offerMainFiles.querySelectorAll(".offer-main__file");

  offerMainEmptyHandler($offerMainFiles, $offerMainFilesItems, $offerMainFilesEmpty);

  $offerTabsHeaderBtnFileField?.addEventListener("change", () => {
    const file = $offerTabsHeaderBtnFileField.files[0];
    if (file) {
      const $offerFile = createOfferFile(file.name, {
        deleteCallback: () => {
          $offerMainFilesItems = $offerMainFiles.querySelectorAll(".offer-main__file");
          offerMainEmptyHandler($offerMainFiles, $offerMainFilesItems, $offerMainFilesEmpty);
        },
      });
      $offerMainFiles.append($offerFile);
      $offerMainFilesItems = $offerMainFiles.querySelectorAll(".offer-main__file");
      offerMainEmptyHandler($offerMainFiles, $offerMainFilesItems, $offerMainFilesEmpty);
      $offerTabsHeaderBtnFileField.value = '';
    }
  });

  $offerMainFilesItems.forEach(($offerMainFile) => {
    const $delete = $offerMainFile.querySelector(".file__delete");
    $delete?.addEventListener(
      "click",
      () => {
        $offerMainFile.remove();
        $offerMainFilesItems = $offerMainFiles.querySelectorAll(".offer-main__file");
        offerMainEmptyHandler($offerMainFiles, $offerMainFilesItems, $offerMainFilesEmpty);
      },
      { once: true }
    );
  });
});

const $offerMainCommentsList = document.querySelectorAll(".offer-main__comment");
$offerMainCommentsList.forEach(($offerMainComments) => {
  const $offerMain = $offerMainComments.closest(".offer-main");
  const $offerMainCommentsEmpty = $offerMain.querySelector(".offer-main__empty--comment");
  
  if ($offerMainCommentsEmpty && $offerMainComments.innerText.trim() === "") {
    $offerMainCommentsEmpty.classList.add("offer-main__empty--show");
  } else {
    $offerMainCommentsEmpty.style.display = 'none';
  }
});

function createOfferFile(name, { deleteCallback }) {
  const $offerFile = createElem("div", "file file--success offer-main__file", {
    innerHTML: `<a class="file__name" href="#">${name}</a>`,
  });

  const $delete = createElem("button", "file__delete");
  $delete.addEventListener(
    "click",
    () => {
      $offerFile.remove();
      deleteCallback();
    },
    { once: true }
  );

  $offerFile.append($delete);

  return $offerFile;
}

function verifyData(data) {}