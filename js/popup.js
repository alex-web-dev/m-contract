const $openBtns = document.querySelectorAll(".js-open-popup");
$openBtns.forEach(($btn) => {
  $btn.addEventListener("click", () => {
    const name = $btn.dataset.popupName;
    const $popup = document.querySelector(`.popup[data-popup-name="${name}"`);
    if (!name || !$popup || $popup.classList.contains("popup--active")) {
      return;
    }

    openPopup($popup);
  });
});

const $popups = document.querySelectorAll(".popup");
$popups.forEach(($popup) => {
  $popup.classList.add("popup--show");

  const $closeBtns = $popup.querySelectorAll(".js-close-popup");
  $closeBtns.forEach(($closeBtn) => {
    $closeBtn?.addEventListener("click", () => closePopup($popup));
  });

  const $backdrop = $popup.querySelector(".popup__backdrop");
  $backdrop?.addEventListener("click", () => closePopup($popup));

  const $dialog = $popup.querySelector(".popup__dialog");
  $dialog?.addEventListener("click", (e) => {
    if (e.target === $dialog) {
      closePopup($popup);
    }
  });
});

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("js-open-popup") || e.target.closest(".js-open-popup")) {
    return;
  }

  const $activePopup = document.querySelector(".popup--active.popup--close-outside");
  const isInner = e.target.closest(".popup") && !e.target.classList.contains("popup");
  if (!$activePopup || isInner) {
    return;
  }

  closePopup($activePopup);
});

function closePopup($popup, isLockBody = true) {
  $popup.classList.remove("popup--active");
  $popup.addEventListener(
    "transitionend",
    () => {
      if (isLockBody && isLockedBody() && getLockedBodyBy() === `popup-${$popup.dataset.popupName}`) {
        unlockBody();
      }
    },
    { once: true }
  );

  const $categoriesSearchField = $popup.querySelector(".categories__search .input__field");
  if ($categoriesSearchField) {
    $categoriesSearchField.value = "";

    const $clearBtnActive = $popup.querySelector(".input__clear-field--active");
    $clearBtnActive?.classList.remove("input__clear-field--active");
  }

  const $categoriesBoxes = document.querySelectorAll(".categories");
  $categoriesBoxes.forEach(($categoriesBox) => {
    const $categories = $categoriesBox.querySelectorAll(".categories__item");

    if ($popup.dataset.popupName !== "custom") {
      closeOtherCategories();
      resetVisibility($categories);
    }
  });
}

function openPopup($popup) {
  $popup.classList.add("popup--active");
  if ($popup.dataset.popupLock === "no" || ($popup.dataset.popupLock === "mobile" && window.innerWidth >= 768)) {
    return;
  }

  if (!isLockedBody()) {
    lockBody(`popup-${$popup.dataset.popupName}`);
  }
}

function createPopup({
  name = "custom",
  title,
  text = "",
  btnText,
  btnCallback,
  btnSize,
  className = "",
  btnDangerText,
  btnDangerCallback,
  btnCancelText,
  btnCancelCallback,
  btnCancelSize,
  link,
  linkCallback,
  $cropperImg,
  mobileFull,
  closeCallback,
  unlockBody = true
}) {
  if (document.querySelector('.popup--active[data-popup-name="custom"]')) {
    return;
  }

  const $closeBtn = createElem("button", "popup__close");
  $closeBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.0675 12.1829C13.1256 12.241 13.1717 12.3099 13.2031 12.3858C13.2345 12.4617 13.2507 12.543 13.2507 12.6251C13.2507 12.7072 13.2345 12.7885 13.2031 12.8644C13.1717 12.9403 13.1256 13.0092 13.0675 13.0673C13.0095 13.1254 12.9405 13.1714 12.8647 13.2029C12.7888 13.2343 12.7075 13.2505 12.6253 13.2505C12.5432 13.2505 12.4619 13.2343 12.386 13.2029C12.3102 13.1714 12.2412 13.1254 12.1832 13.0673L7.00035 7.8837L1.81754 13.0673C1.70026 13.1846 1.5412 13.2505 1.37535 13.2505C1.2095 13.2505 1.05044 13.1846 0.93316 13.0673C0.815885 12.95 0.75 12.791 0.75 12.6251C0.75 12.4593 0.815885 12.3002 0.93316 12.1829L6.11675 7.0001L0.93316 1.81729C0.815885 1.70002 0.75 1.54096 0.75 1.3751C0.75 1.20925 0.815885 1.05019 0.93316 0.932916C1.05044 0.81564 1.2095 0.749756 1.37535 0.749756C1.5412 0.749756 1.70026 0.81564 1.81754 0.932916L7.00035 6.11651L12.1832 0.932916C12.3004 0.81564 12.4595 0.749756 12.6253 0.749756C12.7912 0.749756 12.9503 0.81564 13.0675 0.932916C13.1848 1.05019 13.2507 1.20925 13.2507 1.3751C13.2507 1.54096 13.1848 1.70002 13.0675 1.81729L7.88394 7.0001L13.0675 12.1829Z"
        fill="#5D606F" />
    </svg>
  `;

  const $popup = createElem("div", `popup popup--show ${className}`);
  $popup.dataset.popupName = name;

  const $popupBody = createElem("div", "popup__body");
  const $popupDialog = createElem("div", "popup__dialog");
  const $popupMain = createElem("div", "popup-content__main popup-content__main--p-lg");
  const $popupText = createElem("div", "text text--xxs text--lh-14 popup-content__text popup-content__text--sm", {
    innerHTML: text,
  });
  const $popupContent = createElem("div", "popup-content popup-content--sm popup__content");
  if (mobileFull) {
    $popupContent.classList.add('popup-content--mobile-full');
    $popup.classList.add('popup--mobile-full');
  }

  $popupMain.append($popupText);

  if (title) {
    const $popupHeader = createElem("div", "popup-content__header");
    const $title = createElem("div", "text text--xxs text--upper text--lh-14 text--medium");
    $title.innerText = title;
    $popupHeader.append($title);
    $popupContent.append($popupHeader);
  }

  if ($cropperImg) {
    const $popupCropper = createElem("div", "popup-content__cropper");
    $popupCropper.append($cropperImg);
    $popupContent.append($popupCropper);
  }

  $popupContent.append($popupMain);
  $popupContent.append($closeBtn);
  $popupDialog.append($popupContent);
  $popupBody.append($popupDialog);

  const $btns = createElem("div", "popup-content__btns popup-content__btns--end popup-content__btns--mt-20");

  if (btnDangerText) {
    const $btnDanger = createElem("div", "btn btn--px-sm btn--orange-100 btn--text-xs popup-content__btns-btn", {
      innerHTML: btnDangerText,
    });

    if (btnDangerCallback) {
      $btnDanger.addEventListener("click", btnDangerCallback);
    }
    $btns.append($btnDanger);
  }

  if (btnCancelText) {
    const $btnCancel = createElem("div", "btn btn--px-sm btn--gray-100 btn--text-xs popup-content__btns-btn", {
      innerHTML: btnCancelText,
    });

    if (btnCancelSize === 'xxs') {
      $btnCancel.classList.remove('btn--px-sm')
      $btnCancel.classList.add('btn--px-xs')
      $btnCancel.classList.add('btn--py-xxs')
    }

    if (btnCancelCallback) {
      $btnCancel.addEventListener("click", btnCancelCallback);
    }
    $btns.append($btnCancel);
  }

  if (btnText) {
    const $btnConfirm = createElem("div", "btn btn--px-sm btn--blue-500 btn--color-white btn--text-xs popup-content__btns-btn", {
      innerHTML: btnText,
    });

    if (btnSize === 'xxs') {
      $btnConfirm.classList.remove('btn--px-sm')
      $btnConfirm.classList.add('btn--px-xs')
      $btnConfirm.classList.add('btn--py-xxs')
    }

    if (btnCallback) {
      $btnConfirm.addEventListener("click", btnCallback);
    }

    $btns.append($btnConfirm);
  }

  if (link) {
    const $bottom = createElem("div", "popup-content__bottom");
    const $link = createElem("button", "link link--blue-500 link--xs", {
      innerText: link,
    });
    if (linkCallback) {
      $link.addEventListener("click", linkCallback);
    }

    $btns.classList.remove("popup-content__btns--mt-20");
    $bottom.append($link);
    $bottom.append($btns);
    $popupMain.append($bottom);
  } else {
    $popupMain.append($btns);
  }

  const $popupBackdrop = createElem("div", "popup__backdrop");
  $popupBackdrop.addEventListener("click", () => {
    removePopup($popup, unlockBody), { once: true }
    if (closeCallback) closeCallback();
  });

  $popup.append($popupContent);
  $popup.append($popupBackdrop);

  $closeBtn.addEventListener("click", () => {
    removePopup($popup, unlockBody);
    if (closeCallback) closeCallback();
  }, { once: true });

  document.body.append($popup);
  showPopup($popup);
  return $popup;
}

function removePopup($popup, isLockBody = true) {
  closePopup($popup, isLockBody);
  setTimeout(() => $popup.remove(), 600);
}

function showPopup($popup) {
  setTimeout(() => $popup.classList.add("popup--active"));

  document.body.dataset.lockedBy = `popup-${$popup.dataset.popupName}`;

  if ($popup.dataset.popupLock === "no" || ($popup.dataset.popupLock === "mobile" && window.innerWidth >= 768)) {
    return;
  }

  if (!isLockedBody()) {
    lockBody(`popup-${$popup.dataset.popupName}`);
  }
}
