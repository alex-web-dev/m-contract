/* Helpers */
function createElem(type, className, options) {
  const $elem = document.createElement(type);
  $elem.className = className;
  for (let key in options) {
    $elem[key] = options[key];
  }

  return $elem;
}

function moveElement(options) {
  const { element, from, to, width, fromInsertType = "append", toInsertType = "append" } = options;

  const $elem = document.querySelector(element);
  const $from = document.querySelector(from);
  const $to = document.querySelector(to);

  if (!$elem || !$from || !$to) {
    return;
  }

  setTimeout(() => {
    if (window.innerWidth <= width && $elem.parentNode === $from) {
      $to[toInsertType]($elem);
    } else if (window.innerWidth >= width && $elem.parentNode !== $from) {
      $from[fromInsertType]($elem);
    }
  });
}

function getScrollbarWidth() {
  const documentWidth = document.documentElement.clientWidth;
  return Math.abs(window.innerWidth - documentWidth);
}

function lockBody(lockBy = "") {
  const scrollbarWidthPX = `${getScrollbarWidth()}px`;

  document.body.classList.add("body--lock");
  document.body.style.paddingRight = scrollbarWidthPX;
  document.body.dataset.lockedBy = lockBy;

  const $absoluteElems = document.querySelectorAll(".lk__fixed-btn-box, .header");
  $absoluteElems.forEach(($elem) => ($elem.style.paddingRight = scrollbarWidthPX));
}

function unlockBody() {
  document.body.classList.remove("body--lock");
  document.body.style.paddingRight = "";
  document.body.removeAttribute("data-locked-by");

  const $absoluteElems = document.querySelectorAll(".lk__fixed-btn-box, .header");
  $absoluteElems.forEach(($elem) => ($elem.style.paddingRight = ""));
}

function isLockedBody() {
  return document.body.classList.contains("body--lock");
}

function getLockedBodyBy() {
  return document.body.dataset.lockedBy;
}

function isTouchDevice() {
  return "ontouchstart" in document.documentElement;
}

/* Accordion */
const $accordions = document.querySelectorAll(".accordion");
$accordions.forEach(($accordion) => {
  const $btn = $accordion.querySelector(".accordion__btn");
  const $content = $accordion.querySelector(".accordion__content");
  const $main = $accordion.querySelector(".accordion__main");
  const delay = $accordion.dataset.accordionDelay || 500;
  let animated = false;

  $content.style.transition = `height ${delay / 1000}s`;

  $btn.addEventListener("click", () => {
    if (animated) {
      return;
    }

    animated = true;

    if (!$accordion.classList.contains("accordion--active")) {
      $btn.classList.add("accordion__btn--active");
      $accordion.classList.add("accordion--activating");
      $content.style.height = `${$main.getBoundingClientRect().height}px`;
    } else {
      $btn.classList.remove("accordion__btn--active");
      $content.style.height = `${$content.scrollHeight}px`;
      $accordion.classList.add("accordion--activating");
      setTimeout(() => ($content.style.height = "0px"));
    }

    if ($btn.dataset.toggleText) {
      const $btnSpan = $btn.querySelector("span");
      const toggleText = $btnSpan.innerText;
      $btnSpan.innerText = $btn.dataset.toggleText;
      $btn.dataset.toggleText = toggleText;
    }

    setTimeout(() => {
      animated = false;
      $accordion.classList.remove("accordion--activating");

      if (!$accordion.classList.contains("accordion--active")) {
        $content.style.height = "";
        $accordion.classList.add("accordion--active");
      } else {
        $accordion.classList.remove("accordion--active");
      }
    }, delay);
  });
});

/* Scrollbar */
const $scrollbarElems = document.querySelectorAll("[data-scrollbar]");
$scrollbarElems.forEach(($scrollbarElem) => {
  const continuousScrolling = $scrollbarElem.dataset.scrollbarContinue !== undefined;
  const scrollbar = Scrollbar.init($scrollbarElem, {
    damping: 0.1,
    alwaysShowTracks: false,
    continuousScrolling,
  });

  $scrollbarElem.scrollbar = scrollbar;
  $scrollbarElem.addEventListener("mouseenter", () => $scrollbarElem.focus());
});

/* Dialog */
const dialogListsScrollbars = [];
const $dialogLists = document.querySelectorAll(".dialog__list");
$dialogLists.forEach(($popupDialogList) => {
  const continuousScrolling = $popupDialogList.dataset.scrollbarContinue !== undefined;
  const dialogListScrollbar = Scrollbar.init($popupDialogList, {
    damping: 0.1,
    alwaysShowTracks: false,
    continuousScrolling,
  });

  dialogListScrollbar.scrollTo(0, dialogListScrollbar.limit.y, 0);
  dialogListsScrollbars.push(dialogListScrollbar);
  $popupDialogList.addEventListener("mouseenter", () => $popupDialogList.focus());
});

/* Messages popup */
const $messagesPopupDialog = document.querySelector(".messages-popup__dialog");
const $messagesPopupItems = document.querySelectorAll(".messages-popup__item");
$messagesPopupItems.forEach(($item) => {
  $item.addEventListener("click", () => {
    $messagesPopupDialog.classList.add("messages-popup__dialog--active");
  });
});

const $messagesPopupDialogBack = document.querySelector(".messages-popup__dialog-back");
$messagesPopupDialogBack?.addEventListener("click", () => {
  $messagesPopupDialog.classList.remove("messages-popup__dialog--active");
});

/* Messages */
const $messages = document.querySelector(".messages");
const $messagesDialog = $messages?.querySelector(".messages__dialog");
if ($messages && $messagesDialog) {
  const $messagesDialogBox = $messages.querySelector(".messages__dialog-box");
  const $messagesDialogEmpty = $messages.querySelector(".messages__dialog-empty");
  const $messagesItems = $messages.querySelectorAll(".messages__item");
  const $messagesDialogList = $messagesDialog.querySelector(".dialog__list");
  const messagesDialogListScrollbar = dialogListsScrollbars.find((scrollbar) => scrollbar.containerEl === $messagesDialogList);

  $messagesItems.forEach(($item) => {
    $item.addEventListener("click", () => {
      $messagesDialogBox.classList.add("messages__dialog-box--active");
      $messagesDialog.classList.add("messages__dialog--active");
      $messagesDialogEmpty.classList.add("messages__dialog-empty--hide");

      messagesDialogListScrollbar.update();
      messagesDialogListScrollbar.scrollTo(0, messagesDialogListScrollbar.limit.y, 0);
    });
  });

  const $messagesDialogBack = $messages.querySelector(".messages__dialog .dialog__back");
  $messagesDialogBack.addEventListener("click", () => {
    $messagesDialogBox.classList.remove("messages__dialog-box--active");
  });

  const $messagesHeaderBack = $messages.querySelector(".messages .messages-header__back");
  $messagesHeaderBack.addEventListener("click", () => {
    $messagesDialogBox.classList.remove("messages__dialog-box--active");
  });
}

/* Switch items */
const $switchBoxes = document.querySelectorAll(".js-switch");
$switchBoxes.forEach(($switchBox) => {
  const $input = $switchBox.querySelector(".js-switch-input");
  const $items = $switchBox.querySelectorAll(".js-switch-item");

  $input.addEventListener("change", () => {
    $items.forEach(($item) => {
      if ($input.checked) {
        $item.classList.add("js-switch-item--active");
      } else {
        $item.classList.remove("js-switch-item--active");
      }
    });
  });
});

/* Search */
const $searchElems = document.querySelectorAll(".search");
$searchElems.forEach(($search) => {
  const $toggle = $search.querySelector(".search__toggle");
  $toggle?.addEventListener("click", () => {
    $search.classList.toggle("search--active");
  });

  const $close = $search.querySelector(".search__btn--close");
  $close?.addEventListener("click", () => {
    $search.classList.remove("search--active");
  });
});

/* Input */
const $eyeBtns = document.querySelectorAll(".input__eye-btn");
$eyeBtns.forEach(($eyeBtn) => {
  $eyeBtn.addEventListener("click", () => {
    $eyeBtn.classList.toggle("input__eye-btn--active");

    const $field = $eyeBtn.closest(".input").querySelector(".input__field");
    const type = $field.getAttribute("type") === "password" ? "text" : "password";
    $field.setAttribute("type", type);
  });
});

const $inputs = document.querySelectorAll(".input");
$inputs.forEach(($input) => inputHandler($input));

function inputHandler($input) {
  const $clearBtn = $input.querySelector(".input__clear-field");
  const $field = $input.querySelector(".input__field");

  if ($field?.value !== "") {
    $clearBtn?.classList.add("input__clear-field--active");
  }

  $clearBtn?.addEventListener("click", () => {
    $field.value = "";
    $clearBtn.classList.remove("input__clear-field--active");
    $field.focus();
  });

  $field?.addEventListener("input", () => {
    if ($field.value !== "") {
      $clearBtn?.classList.add("input__clear-field--active");
    } else {
      $clearBtn?.classList.remove("input__clear-field--active");
    }
  });

  const $tippyIcons = $input.querySelectorAll("[data-tippy-content]");
  $tippyIcons.forEach(($tippyIcon) => {
    $tippyIcon.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
}

const $fileInputs = document.querySelectorAll(".file-input");
$fileInputs.forEach(($fileInput) => {
  const $field = $fileInput.querySelector(".file-input__field");
  const $name = $fileInput.querySelector(".file-input__info-name");

  $field.addEventListener("change", () => {
    const file = $field.files[0];
    if (file) {
      $name.textContent = file.name;
      $fileInput.classList.add("file-input--active");
    } else {
      $name.textContent = "";
      $fileInput.classList.remove("file-input--active");
    }
  });

  const $delete = $fileInput.querySelector(".file-input__info-delete");
  $delete.addEventListener("click", () => {
    $field.value = "";
    $name.textContent = "";
    $fileInput.classList.remove("file-input--active");
  });
});

/* Update input buttons */
const $updateInputBtns = document.querySelectorAll(".js-update-input");
$updateInputBtns.forEach(($btn) => {
  $btn.addEventListener("click", () => {
    const $input = document.getElementById($btn.dataset.inputId);
    $input.value = $btn.dataset.inputValue || "";
  });
});

/* Textarea */
const $textareas = document.querySelectorAll(".input__field--area");
$textareas.forEach(($textarea) => {
  textareaSizeHandler($textarea);
  $textarea.addEventListener("input", () => textareaSizeHandler($textarea));
  window.addEventListener("resize", () => textareaSizeHandler($textarea));
});

function textareaSizeHandler($textarea) {
  const minHeight = $textarea.dataset.minHeight ? +$textarea.dataset.minHeight : 86;
  $textarea.style.height = `${minHeight}px`;

  const height = Math.max(minHeight, $textarea.scrollHeight);
  $textarea.style.height = `${height}px`;
}

/* IMask js */
const $imaskInputs = document.querySelectorAll(".js-imask");
$imaskInputs.forEach(($input) => imaskInputHandler($input));

function imaskInputHandler($input) {
  const mask = $input.dataset.mask;
  if (mask === "num") {
    IMask($input, {
      mask: Number,
      scale: 2,
      signed: false,
      thousandsSeparator: " ",
      padFractionalZeros: true,
      normalizeZeros: true,
      radix: ",",
      mapToRadix: ["."],
    });
  } else if (mask === "int") {
    const min = $input.dataset.maskMin ? parseInt($input.dataset.maskMin, 10) : null;
    const max = $input.dataset.maskMax ? parseInt($input.dataset.maskMax, 10) : null;

    IMask($input, {
      mask: Number,
      scale: 0,
      signed: false,
      min: min,
      max: max,
    });
  } else {
    IMask($input, { mask });
  }
}

/* Select */
const SELECT_CLASS = "simple-select";
const SELECT_ACTIVE_CLASS = "simple-select--active";

const INPUT_CLASS = "simple-select__input";

const FIELD_CLASS = "simple-select__field";
const FIELD_ACTIVE_CLASS = "simple-select__field--active";
const FIELD_PLACEHOLDER_CLASS = "simple-select__field--placeholder";

const LIST_CLASS = "simple-select__list";
const LIST_ACTIVE_CLASS = "simple-select__list--active";
const LIST_NO_FILTER_CLASS = "simple-select__list--no-filter";

const ITEM_CLASS = "simple-select__item";
const ITEM_ACTIVE_CLASS = "simple-select__item--active";
const ITEM_PLACEHOLDER_CLASS = "simple-select__item--placeholder";
const ITEM_HOVER_CLASS = "simple-select__item--hover";
const ITEM_NO_FILTER_CLASS = "simple-select__item--no-filter";

const GROUP_CLASS = "simple-select__group";
const GROUP_NO_FILTER_CLASS = "simple-select__group--no-filter";

const $selectFields = document.querySelectorAll(".select__field");
$selectFields.forEach(($selectField) => {
  initializeCustomSelect($selectField);
});

function initializeCustomSelect($selectField) {
  const $selectBox = $selectField.closest(".select");

  const $existingCustomSelect = $selectBox.querySelector(`.${SELECT_CLASS}`);
  if ($existingCustomSelect) {
    const $errorBlock = $selectBox.querySelector(".select__error");
    $selectBox.insertBefore($selectField, $errorBlock);
    $selectBox.removeChild($existingCustomSelect);
  }

  const $simpleSelect = createElem("div", SELECT_CLASS);
  $selectField.parentNode.insertBefore($simpleSelect, $selectField);
  $selectField.classList.add(INPUT_CLASS);
  $simpleSelect.append($selectField);
  $simpleSelect.tabIndex = 0;

  const $input = $selectBox.querySelector(".select__input");
  const $inputField = $input?.querySelector(".input__field");

  /* Select field */
  const $simpleSelectField = createElem("div", FIELD_CLASS);
  $simpleSelectField.innerText = $selectField.options[0].innerText;
  if ($selectField.options[0].value === "") {
    $simpleSelectField.classList.add(FIELD_PLACEHOLDER_CLASS);
  }
  $simpleSelectField.addEventListener("click", () => {
    $simpleSelectList.classList.toggle(LIST_ACTIVE_CLASS);
    $simpleSelectField.classList.toggle(FIELD_ACTIVE_CLASS);
    $simpleSelect.classList.toggle(SELECT_ACTIVE_CLASS);
  });
  $simpleSelect.append($simpleSelectField);

  /* Select items */
  const $elems = $selectField.querySelectorAll("optgroup, option");
  const $simpleSelectList = createElem("div", LIST_CLASS);
  $elems.forEach(($elem, index) => {
    if ($elem.nodeName === "OPTGROUP") {
      const $optgroup = $elem;
      const $group = createElem("div", GROUP_CLASS, {
        innerHTML: $optgroup.label,
      });
      $simpleSelectList.append($group);
      return;
    }

    const $option = $elem;
    const $itemValue = createElem("span", "text text--3xs text--iflex simple-select__item-value");
    const $itemValueSpan = createElem("span", "", {
      innerText: $option.innerText,
    });
    $itemValue.append($itemValueSpan);

    if ($option.dataset.icons) {
      const $iconsBox = createElem("span", "simple-select__item-icons");
      const icons = $option.dataset.icons.split(", ");
      icons.forEach((icon) => {
        const $icon = createElem("img", "simple-select__item-icon", {
          src: icon,
        });
        $iconsBox.append($icon);
      });

      $itemValue.append($iconsBox);
    }

    if ($option.dataset.tippyText) {
      const $tippyIcon = createElem("img", "text__icon", {
        src: "img/icons/info-blue-500.svg",
      });
      $tippyIcon.dataset.tippyContent = $option.dataset.tippyText;
      $tippyIcon.dataset.tippyPlacement = "bottom";
      $tippyIcon.setAttribute("alt", "");
      $tippyIcon.addEventListener("click", (e) => {
        if (isTouchDevice()) {
          e.stopPropagation();
        }
      });
      $itemValue.append($tippyIcon);
    }

    const $item = createElem("div", ITEM_CLASS);
    $item.append($itemValue);

    if ($option.dataset.text) {
      const $itemText = createElem("simple-select__item-text", {
        innerText: $option.dataset.text,
      });
      $item.append($itemText);
    }

    if ($option.value === "") {
      $item.classList.add(ITEM_PLACEHOLDER_CLASS);
    }

    $item.dataset.selectIndex = index;
    $item.addEventListener("click", () => {
      const $oldActiveItem = $simpleSelectList.querySelector(`.${ITEM_ACTIVE_CLASS}`);
      $oldActiveItem?.classList.remove(ITEM_ACTIVE_CLASS);
      $item.classList.add(ITEM_ACTIVE_CLASS);

      const $hoverItem = $simpleSelectList.querySelector(`.${ITEM_HOVER_CLASS}`);
      $hoverItem?.classList.remove(ITEM_HOVER_CLASS);

      $selectBox.classList.remove("select--error");

      $selectField.selectedIndex = +$item.dataset.selectIndex;

      $simpleSelectField.innerText = $option.innerText;
      $simpleSelectField.classList.remove(FIELD_PLACEHOLDER_CLASS);
      $simpleSelect.blur();
      $simpleSelectList.classList.remove(LIST_ACTIVE_CLASS);
      $simpleSelectField.classList.remove(FIELD_ACTIVE_CLASS);
      $simpleSelect.classList.remove(SELECT_ACTIVE_CLASS);

      if ($inputField) {
        $inputField.value = $option.innerText;
      }

      if ($selectField.dataset.updateInputIdText && $option.dataset.text) {
        const $updateInputField = document.getElementById($selectField.dataset.updateInputIdText);
        $updateInputField.value = $option.dataset.text;

        const $updateInput = $updateInputField.closest(".input");
        $updateInput.classList.remove("input--error");
      }

      if ($selectField.classList.contains("js-select-update-btn-text") && $option.dataset.btnText) {
        const $form = $selectField.closest(".js-form");
        if ($form) {
          const $btn = $form.querySelector(".js-form-submit");
          $btn.textContent = $option.dataset.btnText;
        }
      }

      $selectField.dispatchEvent(new Event("change"));
    });

    $item.addEventListener("mouseover", () => {
      const $oldHoverItem = $simpleSelect.querySelector(`.${ITEM_HOVER_CLASS}`);
      if ($oldHoverItem) {
        swapHoverItem($oldHoverItem, $item);
      }
      $item.classList.add(ITEM_HOVER_CLASS);
    });

    $simpleSelectList.append($item);

    if ($option.selected && $option.value !== "") {
      $item.click();
    }
  });
  $simpleSelect.append($simpleSelectList);

  Scrollbar.init($simpleSelectList, {
    damping: 0.1,
    alwaysShowTracks: true,
    continuousScrolling: false,
  });

  /* Select input filter */
  $inputField?.addEventListener("click", () => {
    $simpleSelectList.classList.add(LIST_ACTIVE_CLASS);
    $simpleSelectField.classList.add(FIELD_ACTIVE_CLASS);
    $simpleSelect.classList.add(SELECT_ACTIVE_CLASS);
  });
  $inputField?.addEventListener("focus", () => {
    $simpleSelectList.classList.add(LIST_ACTIVE_CLASS);
    $simpleSelectField.classList.add(FIELD_ACTIVE_CLASS);
    $simpleSelect.classList.add(SELECT_ACTIVE_CLASS);
  });
  $inputField?.addEventListener("focus", () => {
    $simpleSelectList.classList.add(LIST_ACTIVE_CLASS);
    $simpleSelectField.classList.add(FIELD_ACTIVE_CLASS);
    $simpleSelect.classList.add(SELECT_ACTIVE_CLASS);
  });

  const $firstItem = $simpleSelectList.querySelector(`.${ITEM_CLASS}`);
  const firstItemValue = $firstItem.querySelector(`.${ITEM_CLASS}-value`)?.innerText;
  if ($inputField && firstItemValue && !$firstItem.classList.contains(ITEM_PLACEHOLDER_CLASS)) {
    $inputField.value = firstItemValue;
    $firstItem.classList.add(ITEM_ACTIVE_CLASS);
  }

  const $simpleSelectElems = $simpleSelectList.querySelectorAll(`.${ITEM_CLASS}, .${GROUP_CLASS}`);
  const $itemsSortedByGroups = [];
  let currentItem = { group: null, items: [] };
  $simpleSelectElems.forEach(($elem) => {
    if ($elem.classList.contains(GROUP_CLASS)) {
      if (currentItem.items.length > 0 || currentItem.group !== null) {
        $itemsSortedByGroups.push(currentItem);
      }

      currentItem = { group: $elem, items: [] };
    } else {
      currentItem.items.push($elem);
    }
  });
  if (currentItem.items.length > 0 || currentItem.group !== null) {
    $itemsSortedByGroups.push(currentItem);
  }

  $inputField?.addEventListener("input", () => {
    $selectField.selectedIndex = -1;
    $simpleSelectField.innerText = "";
    let isEmptyFilter = true;

    const $activeItem = $simpleSelectList.querySelector(`.${ITEM_ACTIVE_CLASS}`);
    $activeItem?.classList.remove(ITEM_ACTIVE_CLASS);

    $itemsSortedByGroups.forEach(($itemSorterByGroups) => {
      let isAllItemsNoFilter = true;
      $itemSorterByGroups.items.forEach(($item) => {
        const searchText = $inputField.value.toLowerCase().trim();
        if ($item.innerText.toLowerCase().includes(searchText)) {
          isAllItemsNoFilter = false;
          isEmptyFilter = false;
          $item.classList.remove(ITEM_NO_FILTER_CLASS);
        } else {
          $item.classList.add(ITEM_NO_FILTER_CLASS);
        }
      });

      if (isAllItemsNoFilter && $itemSorterByGroups.group) {
        $itemSorterByGroups.group.classList.add(GROUP_NO_FILTER_CLASS);
      } else if ($itemSorterByGroups.group) {
        $itemSorterByGroups.group.classList.remove(GROUP_NO_FILTER_CLASS);
      }
    });

    if (isEmptyFilter) {
      $simpleSelectList.classList.add(LIST_NO_FILTER_CLASS);
    } else {
      $simpleSelectList.classList.remove(LIST_NO_FILTER_CLASS);
    }
  });

  /* Select key controls */
  $simpleSelect.addEventListener("keyup", (e) => {
    if (e.code === "Enter") {
      if ($simpleSelectList.classList.contains(LIST_ACTIVE_CLASS)) {
        const $oldActiveItem = $simpleSelectList.querySelector(`.${ITEM_ACTIVE_CLASS}`);
        $oldActiveItem?.classList.remove(ITEM_ACTIVE_CLASS);

        $selectBox.classList.remove("select--error");

        const $hoverItem = $simpleSelect.querySelector(`.${ITEM_HOVER_CLASS}`);
        $hoverItem.classList.add(ITEM_ACTIVE_CLASS);
        $hoverItem.classList.remove(ITEM_HOVER_CLASS);

        $hoverItem?.click();
        $simpleSelectField.classList.remove(FIELD_PLACEHOLDER_CLASS);

        $selectField.dispatchEvent(new Event("change"));
      } else {
        $simpleSelectList.classList.toggle(LIST_ACTIVE_CLASS);
        $simpleSelectField.classList.toggle(FIELD_ACTIVE_CLASS);
        $simpleSelect.classList.toggle(SELECT_ACTIVE_CLASS);
      }
    } else if (e.code === "Escape") {
      $simpleSelectList.classList.remove(LIST_ACTIVE_CLASS);
      $simpleSelectField.classList.remove(FIELD_ACTIVE_CLASS);
      $simpleSelect.classList.remove(SELECT_ACTIVE_CLASS);
    } else if (e.code === "ArrowDown") {
      const $oldHoverItem = $simpleSelect.querySelector(`.${ITEM_HOVER_CLASS}`);
      if (!$oldHoverItem) {
        const $newItem = $simpleSelect.querySelectorAll(`.${ITEM_CLASS}:not(.${ITEM_PLACEHOLDER_CLASS})`)[0];
        $newItem.classList.add(ITEM_HOVER_CLASS);
        return;
      }

      const oldIndex = +$oldHoverItem.dataset.selectIndex;
      if (oldIndex >= $simpleSelect.querySelectorAll(`.${ITEM_CLASS}`).length - 1) {
        return;
      }

      const $newItem = $simpleSelect.querySelectorAll(`.${ITEM_CLASS}`)[oldIndex + 1];
      if (!$newItem.classList.contains(ITEM_PLACEHOLDER_CLASS)) {
        swapHoverItem($oldHoverItem, $newItem);
      }
    } else if (e.code === "ArrowUp") {
      const $oldHoverItem = $simpleSelect.querySelector(`.${ITEM_HOVER_CLASS}`);
      if (!$oldHoverItem) {
        const $newItem = $simpleSelect.querySelectorAll(`.${ITEM_CLASS}:not(.${ITEM_PLACEHOLDER_CLASS})`)[0];
        $newItem.classList.add(ITEM_HOVER_CLASS);
        return;
      }

      const oldIndex = +$oldHoverItem.dataset.selectIndex;
      if (oldIndex < 1) {
        return;
      }

      const $newItem = $simpleSelect.querySelectorAll(`.${ITEM_CLASS}`)[oldIndex - 1];
      if (!$newItem.classList.contains(ITEM_PLACEHOLDER_CLASS)) {
        swapHoverItem($oldHoverItem, $newItem);
      }
    }
  });
}

/* Select close when click outside */
window.addEventListener("click", (e) => {
  const $activeSelect = document.querySelector(`.${SELECT_ACTIVE_CLASS}`);
  if (!$activeSelect) {
    return;
  }

  const isInnerSelect = e.target.classList.contains(".select") || e.target.closest(`.select`);
  const $list = $activeSelect.querySelector(`.${LIST_CLASS}`);
  const $field = $activeSelect.querySelector(`.${FIELD_CLASS}`);

  if (!isInnerSelect) {
    $list.classList.remove(LIST_ACTIVE_CLASS);
    $field.classList.remove(FIELD_ACTIVE_CLASS);
    $activeSelect.classList.remove(SELECT_ACTIVE_CLASS);
    return;
  }

  const $simpleSelect = e.target.closest(`.simple-select`);
  if (!$simpleSelect) {
    return;
  }

  const $activeSelects = document.querySelectorAll(".simple-select--active");
  $activeSelects.forEach(($activeSelect) => {
    if ($activeSelect !== $simpleSelect) {
      const $list = $activeSelect.querySelector(`.${LIST_CLASS}`);
      const $field = $activeSelect.querySelector(`.${FIELD_CLASS}`);

      $list.classList.remove(LIST_ACTIVE_CLASS);
      $field.classList.remove(FIELD_ACTIVE_CLASS);
      $activeSelect.classList.remove(SELECT_ACTIVE_CLASS);
    }
  });
});

function swapHoverItem($oldItem, $newItem) {
  $oldItem.classList.remove(ITEM_HOVER_CLASS);
  $newItem.classList.add(ITEM_HOVER_CLASS);
}

/* Validate patterns */
const validatePatterns = [
  {
    name: "empty",
    defaultMessage: "Поле не может быть пустым",
    validate: (value) => {
      if (value.length < 1) {
        return false;
      }

      return true;
    },
  },
  {
    name: "phone",
    defaultMessage: "Некорректный номер телефона",
    validate: (value) => {
      if (!/(?:\+|\d)[\d\-\(\) ]{16,}\d/g.test(value)) {
        return false;
      }

      return true;
    },
  },
  {
    name: "phone-optional",
    defaultMessage: "Некорректный номер телефона",
    validate: (value) => {
      if (value === "") {
        return true;
      }

      if (!/(?:\+|\d)[\d\-\(\) ]{16,}\d/g.test(value)) {
        return false;
      }

      return true;
    },
  },
  {
    name: "email",
    defaultMessage: "Некорректный email",
    validate: (value) => {
      return String(value)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    },
  },
  {
    name: "password",
    defaultMessage: "Некорректный пароль",
    validate: (value) => {
      if (value.length < 6 || value.length > 24) {
        return false;
      }

      const hasDigit = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(value);
      const hasLatinLetter = /[a-zA-Z]/.test(value);

      if (!hasDigit || !hasSpecialChar || !hasLatinLetter) {
        return false;
      }

      return true;
    },
  },
  {
    name: "password-length",
    defaultMessage: "Некорректный пароль",
    validate: (value) => {
      if (value.length < 6 || value.length > 24) {
        return false;
      }

      return true;
    },
  },
  {
    name: "code",
    defaultMessage: "Неверный код",
    validate: (value) => {
      if (value.length < 6 || value.length > 6) {
        return false;
      }

      return true;
    },
  },
];

/* Form */
const $forms = document.querySelectorAll(".js-form");
$forms.forEach(($form) => {
  $form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validateFields($form)) {
    } else {
      // const formData = new FormData($form);
      // for (var pair of formData.entries()) {
      //   console.log(pair[0] + ", " + pair[1]);
      // }

      const successFormEvent = new CustomEvent("formSuccess", {
        detail: {
          form: $form,
        },
      });
      document.dispatchEvent(successFormEvent);

      if ($form.dataset.formNoClear === undefined) {
        clearInputs($inputs);

        const $selects = $form.querySelectorAll(".select");
        clearSelects($selects);

        const $submit = $form.querySelector(".js-form-submit");
        if ($submit && $submit.dataset.disableEmpty !== undefined) {
          $submit.disabled = true;
        }
      }
    }
  });

  const $inputs = $form.querySelectorAll(".input");
  $inputs.forEach(($input) => formInputHandler($input, $form));

  const $simpleSelects = $form.querySelectorAll(".simple-select");
  $simpleSelects.forEach(($simpleSelect) => formSimpleSelectHandler($simpleSelect, $form));

  /* Form steps */
  const $steps = $form.querySelectorAll(".form__step");
  const $stepsRoutes = $form.querySelectorAll(".form__steps-route");
  let stepValue = 0;
  let stepsLength = $stepsRoutes.length;
  const $stepsNextBtns = $form.querySelectorAll(".form__steps-btn--next");
  $stepsNextBtns.forEach(($btn) => {
    $btn.addEventListener("click", () => {
      if (stepValue >= stepsLength - 1) {
        return;
      }

      if (!validateFields($steps[stepValue])) {
        return;
      }

      stepValue++;

      const $activeRoute = $form.querySelector(".form__steps-route--active");
      $activeRoute.classList.remove("form__steps-route--active");

      const $activeStep = $form.querySelector(".form__step--active");
      $activeStep.classList.remove("form__step--active");

      $steps[stepValue].classList.add("form__step--active");

      $stepsRoutes[stepValue].classList.add("form__steps-route--active");
    });
  });

  const $stepsPrevBtns = $form.querySelectorAll(".form__steps-btn--prev");
  $stepsPrevBtns.forEach(($btn) => {
    $btn.addEventListener("click", () => {
      if (stepValue <= 0) {
        return;
      }

      stepValue--;

      const $activeRoute = $form.querySelector(".form__steps-route--active");
      $activeRoute.classList.remove("form__steps-route--active");

      const $activeStep = $form.querySelector(".form__step--active");
      $activeStep.classList.remove("form__step--active");

      $steps[stepValue].classList.add("form__step--active");

      $stepsRoutes[stepValue].classList.add("form__steps-route--active");
    });
  });
});

function formInputHandler($input, $form) {
  const $field = $input.querySelector(".input__field");
  $field?.addEventListener("focus", () => {
    $input.classList.remove("input--error");

    const $passwordsMatch = $input.closest(".js-passwords-match");
    if (!$passwordsMatch) {
      return;
    }

    const $passwordSecond = $passwordsMatch.querySelectorAll(".input")[1];
    const $passwordSecondError = $passwordSecond.querySelector(`.input__error`);
    if ($passwordSecondError.innerText === "Пароли должны совпадать") {
      $passwordSecond.classList.remove("input--error");
    }
  });

  $field?.addEventListener("input", () => {
    if ($input.classList.contains("select__input")) {
      return;
    }

    const validateType = $field.dataset.validate;
    const pattern = validatePatterns.find((pattern) => pattern.name === validateType);
    if (validateType && pattern.validate($field.value)) {
      $input.classList.add("input--validated");
    } else if (validateType) {
      $input.classList.remove("input--validated");
    }

    const $submit = $form.querySelector(".js-form-submit");
    if ($submit?.dataset.disableEmpty !== undefined) {
      submitDisableHandler($form);
    }

    setTimeout(() => {
      if ($input.dataset.confirmedValue === $field.value) {
        $input.classList.add("input--confirmed");
      } else {
        $input.classList.remove("input--confirmed");
      }
    });
  });

  const $fieldFile = $input.querySelector(".input__field-file");
  const $btnFile = $input.querySelector(".input__file .file-input__btn");
  const $btnDeleteFile = $input.querySelector(".input__file .file-input__info-delete");
  $btnFile?.addEventListener("click", () => $input.classList.remove("input--error"));
  $btnDeleteFile?.addEventListener("click", () => $input.classList.remove("input--error"));
  $fieldFile?.addEventListener("change", () => {
    const $submit = $form.querySelector(".js-form-submit");
    if ($submit?.dataset.disableEmpty !== undefined) {
      submitDisableHandler($form);
    }
  });
}

function addAllHandlersToInputArea($input, $form) {
  const $inputField = $input.querySelector(".input__field");

  addAllHandlersToInput($input, $form);

  textareaSizeHandler($inputField);
  $inputField.addEventListener("input", () => textareaSizeHandler($inputField));
  window.addEventListener("resize", () => textareaSizeHandler($inputField));
}

function addAllHandlersToInput($input, $form) {
  inputHandler($input);
  formInputHandler($input, $form);
}

function formSimpleSelectHandler($simpleSelect, $form) {
  const $select = $simpleSelect.closest(".select");
  const simpleSelectField = $simpleSelect.querySelector(".simple-select__field");
  simpleSelectField.addEventListener("click", () => $select.classList.remove("select--error"));

  const $inputField = $select.querySelector(".select__input .input__field");
  $inputField?.addEventListener("focus", () => $select.classList.remove("select--error"));

  const $items = $simpleSelect.querySelectorAll(`.${ITEM_CLASS}`);
  $items.forEach(($item) => {
    $item.addEventListener("click", () => {
      setTimeout(() => submitDisableHandler($form));
    });
  });
}

function validateFields($form) {
  let isError = false;

  const $passwordsMatch = $form.querySelector(".js-passwords-match");
  if ($passwordsMatch) {
    const $passwordFirst = $passwordsMatch.querySelectorAll(".input")[0];
    const $passwordSecond = $passwordsMatch.querySelectorAll(".input")[1];
    const $passwordFirstField = $passwordFirst.querySelector(".input__field");
    const $passwordSecondField = $passwordSecond.querySelector(".input__field");
    if ($passwordFirstField.value !== $passwordSecondField.value) {
      const $passwordSecondError = $passwordSecond.querySelector(`.input__error`);
      $passwordSecondError.innerText = "Пароли должны совпадать";
      $passwordSecond.classList.add("input--error");
      isError = true;
    }
  }

  const $inputs = $form.querySelectorAll(".input");
  $inputs.forEach(($input, i) => {
    let isValidated = true;
    if (
      !validateItem({
        $item: $input,
        itemErrorClass: "input--error",
        fieldClass: "input__field",
        fieldFileClass: "input__field-file",
        errorLabelClass: "input__error",
      })
    ) {
      isError = true;
      isValidated = false;
    }

    const $field = $input.querySelector(".input__field");
    const isNeedConfirm = isValidated && $input.classList.contains("input--confirm") && !$input.classList.contains("input--confirmed");
    if ($field && $field.value !== "" && isNeedConfirm) {
      $input.classList.add("input--error");

      const $error = $input.querySelector(".input__error");
      if ($error) {
        $error.innerText = $input.dataset.confirmErrorText;
      }

      isError = true;
    }
  });

  const $selects = $form.querySelectorAll(".select");
  $selects.forEach(($select) => {
    if (
      !validateItem({
        $item: $select,
        itemErrorClass: "select--error",
        fieldClass: "select__field",
        errorLabelClass: "select__error",
      })
    ) {
      isError = true;
    }
  });

  return !isError;
}

function validateItem({ $item, itemErrorClass, fieldClass, fieldFileClass, errorLabelClass }) {
  const $field = $item.querySelector(`.${fieldClass}`) || $item.querySelector(`.${fieldFileClass}`);

  if (!$field) {
    return true;
  }

  const $error = $item.querySelector(`.${errorLabelClass}`);
  const validateType = $field.dataset.validate;

  if ($field.disabled) {
    return true;
  }

  const pattern = validatePatterns.find((pattern) => pattern.name === validateType);
  if (validateType && !pattern.validate($field.value)) {
    $item.classList.add(itemErrorClass);

    if ($error) {
      $error.innerText = $field.dataset.validateText || pattern.defaultMessage;
    }

    return false;
  }

  return true;
}

function clearInputs($inputs) {
  $inputs.forEach(($input) => {
    $input.classList.remove("input--confirmed", "input--validated");
    $input.removeAttribute("data-confirmed-value");

    const $field = $input.querySelector(".input__field");
    if ($field) {
      $field.value = "";
    }

    const $inputFile = $input.querySelector(".input__file");
    if ($inputFile) {
      $inputFile.classList.remove("file-input--active");

      const $fieldFile = $inputFile.querySelector(".file-input__field");
      $fieldFile.value = "";

      const $fileName = $inputFile.querySelector(".file-input__info-name");
      $fileName.textContent = "";
    }
  });
}

function clearSelects($selects) {
  $selects.forEach(($select) => {
    const $field = $select.querySelector(".select__field");
    $field.selectedIndex = 0;

    const $simpleSelectField = $select.querySelector(`.${FIELD_CLASS}`);
    const $firstItem = $select.querySelector(`.${ITEM_CLASS}[data-select-index="0"`);
    $simpleSelectField.innerText = $firstItem.innerText;
    if ($field.options[0].value === "") {
      $simpleSelectField.classList.add(FIELD_PLACEHOLDER_CLASS);
    }

    const $hoverItem = $select.querySelector(`.${ITEM_HOVER_CLASS}`);
    $hoverItem?.classList.remove(ITEM_HOVER_CLASS);

    const $activeItem = $select.querySelector(`.${ITEM_ACTIVE_CLASS}`);
    $activeItem?.classList.remove(ITEM_ACTIVE_CLASS);
  });
}

function submitDisableHandler($form) {
  const $submit = $form.querySelector(".js-form-submit");
  if (!$submit) {
    return;
  }

  let fieldsFilled = true;

  const $fields = $form.querySelectorAll(".input__field[data-validate]");
  $fields.forEach(($field) => {
    if ($field.value === "+7") {
      $field.value = "";
    }

    if (!$field.disabled && $field.value === "") {
      fieldsFilled = false;
    }
  });

  const $fieldsFile = $form.querySelectorAll(".input__field-file[data-validate]");
  $fieldsFile.forEach(($field) => {
    if (!$field.disabled && $field.value === "") {
      fieldsFilled = false;
    }
  });

  const $selectFields = $form.querySelectorAll(".select__field");
  $selectFields.forEach(($selectField) => {
    if ($selectField.value === "") {
      fieldsFilled = false;
    }
  });

  $submit.disabled = !fieldsFilled;
}

/* Select tabs */
const $selectTabsBoxes = document.querySelectorAll(".select-tabs");
$selectTabsBoxes.forEach(($selectTabs) => {
  const $items = $selectTabs.querySelectorAll(".select-tabs__item");
  $items.forEach(($item) => {
    const $field = $item.querySelector(".input__field");
    $field?.setAttribute("disabled", "");

    const $fieldFile = $item.querySelector(".input__field-file");
    $fieldFile?.setAttribute("disabled", "");
  });

  const $select = $selectTabs.querySelector(".select-tabs__main");
  const $field = $select.querySelector(".select__field");
  const $simpleSelectItems = $select.querySelectorAll(".simple-select__item");
  $simpleSelectItems.forEach(($simpleSelectItem) => {
    $simpleSelectItem.addEventListener("click", () => {
      const $oldActiveItem = $selectTabs.querySelector(".select-tabs__item--active");
      $oldActiveItem?.classList.remove("select-tabs__item--active");
      $oldActiveItem?.querySelector(".input__field")?.setAttribute("disabled", "");
      $oldActiveItem?.querySelector(".input__field-file")?.setAttribute("disabled", "");
      $items.forEach(($item) => {
        const values = $item.dataset.selectValues.split(",");
        if (values.findIndex(($value) => $value === $field.value) !== -1) {
          $item.classList.add("select-tabs__item--active");
          $item.querySelector(".input__field")?.removeAttribute("disabled");
          $item.querySelector(".input__field-file")?.removeAttribute("disabled");
        }
      });
    });
  });
});

document.addEventListener("formSuccess", (e) => {
  const $form = e.detail.form;

  const $selectTabsItems = $form.querySelectorAll(".select-tabs__item");
  $selectTabsItems.forEach(($item) => {
    $item.classList.remove("select-tabs__item--active");
    const $field = $item.querySelector(".input__field");
    $field?.setAttribute("disabled", "");

    const $fieldFile = $item.querySelector(".input__field-file");
    $fieldFile?.setAttribute("disabled", "");
  });
});

/* Smooth scroll */
const $anchors = document.querySelectorAll('a[href*="#"]');
$anchors.forEach(($anchor) => {
  $anchor.addEventListener("click", (e) => {
    const id = $anchor.getAttribute("href");

    if (id[0] === "#") {
      e.preventDefault();
    }

    if (id === "#") {
      return;
    }

    const $elem = document.querySelector(id);
    if ($elem) {
      const offsetTop = $elem.getBoundingClientRect().top;
      window.scrollBy({ top: offsetTop, left: 0, behavior: "smooth" });
    }
  });
});

/* Tabs */
const $tabsBtnsBoxes = document.querySelectorAll(".tabs-btns");
$tabsBtnsBoxes.forEach(($tabsBtnsBox) => {
  const $btns = $tabsBtnsBox.querySelectorAll(".tabs-btns__btn");
  $btns.forEach(($btn, index) => {
    $btn.addEventListener("click", () => {
      changeTab($tabsBtnsBox.dataset.tabsName, index);
    });
  });
});

function changeTab(name, index) {
  const $oldActiveBtn = document.querySelector(`.tabs-btns[data-tabs-name="${name}"] .tabs-btns__btn--active`);
  const $oldActiveTab = document.querySelector(`.tabs-list[data-tabs-name="${name}"] > .tabs-list__item--active`);
  const $newActiveBtn = document.querySelectorAll(`.tabs-btns[data-tabs-name="${name}"] .tabs-btns__btn`)[index];
  const $newActiveTab = document.querySelectorAll(`.tabs-list[data-tabs-name="${name}"] > .tabs-list__item`)[index];

  $oldActiveTab.classList.remove("tabs-list__item--active");
  $oldActiveBtn.classList.remove("tabs-btns__btn--active");

  $newActiveBtn.classList.add("tabs-btns__btn--active");
  $newActiveTab.classList.add("tabs-list__item--active");

  const $tabTextareas = $newActiveTab.querySelectorAll(".input__field--area");
  $tabTextareas.forEach(($textarea) => setTimeout(() => textareaSizeHandler($textarea), 50));
}

/* Features */
const $featuresItems = document.querySelectorAll(".feature-item");
$featuresItems.forEach(($feature, index) => {
  const desktopDelay = 500;
  const mobileDelay = 400;
  let animated = false;
  let timer;

  const $text = $feature.querySelector(".feature-item__text");
  const $moreBtn = $feature.querySelector(".feature-item__more");

  $feature.addEventListener("mouseenter", () => {
    if (window.innerWidth < 992) {
      return;
    }

    animated = true;
    $feature.classList.add("feature-item--hover");
    $text.style.height = `${$text.scrollHeight}px`;
    $text.classList.add("feature-item__text--active");
    $moreBtn.classList.add("feature-item__more--active");
  });

  $feature.addEventListener("mouseleave", () => {
    if (window.innerWidth < 992) {
      return;
    }

    clearInterval(timer);
    animated = false;

    $feature.classList.remove("feature-item--hover");
    $text.style.height = "";
    $moreBtn.classList.remove("feature-item__more--active");

    timer = setTimeout(() => {
      if (!animated) {
        $text.classList.remove("feature-item__text--active");
      }
    }, desktopDelay);
  });

  $moreBtn.addEventListener("click", () => {
    if (!$feature.classList.contains("feature-item--hover")) {
      animated = true;
      $feature.classList.add("feature-item--hover");
      $text.style.height = `${$text.scrollHeight}px`;
      $text.classList.add("feature-item__text--active");
      $moreBtn.classList.add("feature-item__more--active");
    } else {
      clearInterval(timer);
      animated = false;

      $feature.classList.remove("feature-item--hover");
      $text.style.height = "";
      $moreBtn.classList.remove("feature-item__more--active");

      timer = setTimeout(() => {
        if (!animated) {
          $text.classList.remove("feature-item__text--active");
        }
      }, mobileDelay);
    }
  });
});

/* Steps */
const $stepsTabs = document.querySelectorAll(".steps__tab");
$stepsTabs.forEach(($stepsTab) => {
  const $stepsListBox = $stepsTab.querySelector(".steps__list-box");
  const $stepsList = $stepsListBox.querySelector(".steps__list");
  const $items = $stepsList.querySelectorAll(".steps__item");

  let scrollIndex = 0;
  const scrollbar = Scrollbar.init($stepsListBox, {
    damping: 0.08,
    alwaysShowTracks: false,
    renderByPixels: true,
    continuousScrolling: true,
  });

  let scrolling = false;
  scrollbar.contentEl.addEventListener("wheel", (event) => {
    if (window.innerWidth < 768) {
      return;
    }

    event.preventDefault();

    if (scrolling) {
      return;
    }

    scrolling = true;
    setTimeout(() => (scrolling = false), 500);

    if (event.deltaY > 0) {
      if (!$items[scrollIndex + 1]) {
        return;
      }

      scrollbar.setMomentum(0, $items[scrollIndex].offsetHeight);
      scrollIndex++;
    } else {
      if (!$items[scrollIndex - 1]) {
        return;
      }

      scrollbar.setMomentum(0, -$items[scrollIndex - 1].offsetHeight);
      scrollIndex--;
    }
  });

  const $stepsNavBtns = document.querySelectorAll(".steps__nav-btn");
  $stepsNavBtns.forEach(($btn) => {
    $btn.addEventListener("click", () => {
      stepsScrollHandler();
      scrollbar.update();
      scrollIndex = 0;
    });
  });

  let stepValue = 1;
  const $valueNum = $stepsTab.querySelector(".steps__value-num");
  $valueNum.innerText = stepValue;

  stepsScrollHandler();
  scrollbar.addListener(stepsScrollHandler);

  function stepsScrollHandler() {
    const containerHeight = $stepsListBox.clientHeight;
    const scrollTop = scrollbar.offset.y;
    let elemsUpperBorderCount = 0;

    $items.forEach(function ($item) {
      const offsetTop = $item.offsetTop;

      const distanceFromTop = offsetTop - scrollTop;
      let opacity = 1 - (distanceFromTop / containerHeight) * 1.06;
      opacity = Math.max(0, Math.min(1, opacity));

      $item.style.opacity = opacity.toFixed(2);

      if (distanceFromTop <= -($item.offsetHeight / 2)) {
        elemsUpperBorderCount++;
      }
    });

    if (elemsUpperBorderCount + 1 !== stepValue) {
      stepValue = elemsUpperBorderCount + 1;
      $valueNum.innerText = stepValue;
    }
  }
});

/* About */
let overlay = document.getElementById("overlay");
let closeBtn = document.getElementById("closeBtn");
let modal = document.getElementById("modal");
let modalBody = document.getElementById("modalBody");
let openModalBtn = document.getElementById("subscribeBtn");
let modalForm = document.getElementById("modalForm");
let modalTextblock = document.getElementById("modalTextblock");
let subscribeBlock = document.getElementById("subscribeBlock");
let envelope = document.getElementById("envelope");

openModalBtn?.addEventListener("click", function () {
  overlay.style.display = "block";
  modal.style.display = "block";
  modalBody.style.animation = "scaler .3s ease forwards";
  closeBtn.style.display = "block";
});

closeBtn?.addEventListener("click", closeModal);
overlay?.addEventListener("click", closeModal);

function closeModal() {
  overlay.style.display = "none";
  modalBody.style.animation = "scalerOut .3s ease";
  closeBtn.style.display = "none";
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
}

document.addEventListener("formSuccess", (e) => {
  const $modalForm = document.querySelector(".form--modal");
  if (e.detail.form !== $modalForm) {
    return;
  }

  modalForm.style.display = "none";
  modalTextblock.style.display = "block";
  closeBtn.addEventListener("click", function () {
    overlay.style.display = "none";
    modalBody.style.animation = "scalerOut .3s ease";
  });
});

/* Dropdown */
const $dropdowns = document.querySelectorAll(".dropdown");
$dropdowns.forEach(($dropdown) => {
  const $btn = $dropdown.querySelector(".dropdown__btn");
  $btn.addEventListener("click", (e) => dropdownBtnHandler($btn, $dropdown, e));
});

window.addEventListener("click", (e) => {
  const $activeDropdown = document.querySelector(".dropdown--active");
  const isInner = e.target.closest(".dropdown") && !e.target.classList.contains("dropdown");
  if (!$activeDropdown || isInner) {
    return;
  }

  $activeDropdown.classList.remove("dropdown--active");
});

function dropdownBtnHandler($btn, $dropdown, e) {
  e.stopPropagation();

  const isActive = $dropdown.classList.contains("dropdown--active");

  document.querySelectorAll(".dropdown--active").forEach(($activeDropdown) => {
    $activeDropdown.classList.remove("dropdown--active");
  });

  if (!isActive && (!$btn.dataset.dropdownMinWidth || window.innerWidth > $btn.dataset.dropdownMinWidth)) {
    $dropdown.classList.add("dropdown--active");
  }
}

/* Dropdown sort */
const $dropdownSortBoxes = document.querySelectorAll(".dropdown--sort");
$dropdownSortBoxes.forEach(($dropdownSort) => {
  const $dropdownBtnText = $dropdownSort.querySelector(".dropdown__btn-text");
  const $btns = $dropdownSort.querySelectorAll(".profile-menu__link ");
  $btns.forEach(($btn) => {
    $btn.addEventListener("click", () => {
      const $prevActiveBtn = $dropdownSort.querySelector(".profile-menu__link--active");
      $prevActiveBtn?.classList.remove("profile-menu__link--active");

      $btn.classList.add("profile-menu__link--active");

      const btnText = $btn.querySelector("span").innerText;
      $dropdownBtnText.innerText = btnText;

      $dropdownSort.classList.remove("dropdown--active");
    });
  });
});

/* Categories */
const $categoriesItems = document.querySelectorAll(".category");
$categoriesItems.forEach(($category) => {
  const $btn = $category.querySelector(".category__btn");
  $btn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = $category.classList.contains("category--active");
    closeOtherCategories($category);
    $category.classList.toggle("category--active", !isOpen);
  });
});

const $categoriesBoxes = document.querySelectorAll(".categories");
$categoriesBoxes.forEach(($categoriesBox) => {
  const $searchField = $categoriesBox.querySelector(".categories__search .input__field");
  const $searchClearBtn = $categoriesBox.querySelector(".categories__search .input__clear-field");
  const $categories = $categoriesBox.querySelectorAll(".categories__item");
  const $childCategories = $categoriesBox.querySelectorAll(".category__item");

  $searchField?.addEventListener("input", () => {
    const rawSearchText = $searchField.value.toLowerCase();
    const searchText = rawSearchText.replace(/[\s.,!]/g, "");

    $categories.forEach(($category) => {
      filterCategory($category, searchText, rawSearchText);
    });

    if (searchText === "") {
      resetVisibility($categories);
    }
  });

  $searchClearBtn?.addEventListener("click", () => {
    $searchField.value = "";
    resetVisibility($categories);
    closeOtherCategories();
  });

  $childCategories.forEach(($category) => {
    const $checkboxes = $category.querySelectorAll(".category__checkbox:not(.category__checkbox--all) .checkbox__input");
    $checkboxes.forEach(($checkbox) => {
      $checkbox.addEventListener("change", () => {
        updateSelectAllState($category);
      });
    });
  });
});

document.addEventListener("click", (event) => {
  if (event.target.matches(".category__checkbox--all .checkbox__input")) {
    const $checkbox = event.target;
    const $category = $checkbox.closest(".category");

    toggleAllCheckboxes($category, $checkbox.checked);
  }
});

function updateSelectAllState($category) {
  const $categoryContentChild = [...$category.children].find((child) => child.matches(".category__content"));
  const $allCheckboxChild = [...$categoryContentChild.children].find((child) => child.matches(".category__checkbox"));
  if (!$allCheckboxChild) {
    return;
  }

  const $allCheckboxInput = $allCheckboxChild.querySelector(".checkbox__input");
  const $checkboxes = $category.querySelectorAll(".category__checkbox:not(.category__checkbox--all) .checkbox__input");
  const allChecked = [...$checkboxes].every(($checkbox) => $checkbox.checked);

  $allCheckboxInput.checked = allChecked;

  const $parentCategory = $category.closest(".categories__item");
  if ($parentCategory && $parentCategory !== $category) {
    updateSelectAllState($parentCategory);
  }
}

function filterCategory($category, searchText, rawSearchText) {
  const $checkboxes = $category.querySelectorAll(".category__checkbox:not(.category__checkbox--all)");
  const $buttons = $category.querySelectorAll(".category__item-btn");
  const $childCategories = $category.querySelectorAll(".category__item");
  let anyCheckboxVisible = false;
  let anyButtonVisible = false;
  let anyChildCategoryVisible = false;

  $checkboxes.forEach(($checkbox) => {
    const $labelElement = $checkbox.querySelector(".checkbox__text");
    const labelText = $labelElement.textContent.toLowerCase();
    const normalizedLabelText = labelText.replace(/[\s.,!]/g, "");

    if (normalizedLabelText.includes(searchText) && searchText !== "") {
      $checkbox.classList.remove("category__checkbox--hide");
      anyCheckboxVisible = true;

      const highlightedText = highlightText($labelElement.textContent, rawSearchText);
      $labelElement.innerHTML = highlightedText;
    } else {
      $checkbox.classList.add("category__checkbox--hide");
      $labelElement.innerHTML = $labelElement.textContent;
    }
  });

  $buttons.forEach(($button) => {
    const buttonText = $button.textContent.toLowerCase();
    const normalizedButtonText = buttonText.replace(/[\s.,!]/g, "");

    if (normalizedButtonText.includes(searchText) && searchText !== "") {
      $button.classList.remove("category__checkbox--hide");
      anyButtonVisible = true;

      const highlightedText = highlightText($button.textContent, rawSearchText);
      $button.innerHTML = highlightedText;
    } else {
      $button.classList.add("category__checkbox--hide");
      $button.innerHTML = $button.textContent;
    }
  });

  $childCategories.forEach(($childCategory) => {
    const childVisible = filterCategory($childCategory, searchText, rawSearchText);
    if (childVisible) {
      $childCategory.classList.remove("category--hide");
      anyChildCategoryVisible = true;
    } else {
      $childCategory.classList.add("category--hide");
    }
  });

  if (!anyCheckboxVisible && !anyButtonVisible && !anyChildCategoryVisible) {
    $category.classList.add("category--hide");
    $category.classList.remove("category--active");
  } else {
    $category.classList.remove("category--hide");
    $category.classList.add("category--active");
  }

  updateSelectAllState($category);

  return anyCheckboxVisible || anyButtonVisible || anyChildCategoryVisible;
}

function highlightText(text, searchText) {
  const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

function resetVisibility($categories) {
  $categories.forEach(($category) => {
    $category.classList.remove("category--hide");
    const $checkboxes = $category.querySelectorAll(".category__checkbox");
    $checkboxes.forEach(($checkbox) => {
      $checkbox.classList.remove("category__checkbox--hide");
      const $labelElement = $checkbox.querySelector(".checkbox__text");
      $labelElement.innerHTML = $labelElement.textContent;
    });

    const $buttons = $category.querySelectorAll(".category__item-btn");
    $buttons.forEach(($button) => {
      $button.classList.remove("category__checkbox--hide");
      $button.innerHTML = $button.textContent;
    });

    const $childCategories = $category.querySelectorAll(".category__item");
    $childCategories.forEach(($childCategory) => {
      $childCategory.classList.remove("category--hide");
    });
  });
}

function toggleAllCheckboxes($category, isChecked) {
  const $checkboxes = $category.querySelectorAll(".category__checkbox:not(.category__checkbox--hide) .checkbox__input");

  $checkboxes.forEach(($checkbox) => {
    $checkbox.checked = isChecked;
  });

  const $childCategories = $category.querySelectorAll(".category__item");
  $childCategories.forEach(($childCategory) => {
    toggleAllCheckboxes($childCategory, isChecked);
  });

  const $allCheckboxes = $category.querySelectorAll(".category__checkbox--all .checkbox__input");
  $allCheckboxes.forEach(($checkbox) => {
    $checkbox.checked = isChecked;
  });

  updateSelectAllState($category);
}

function closeOtherCategories($currentCategory = null) {
  const $allCategories = document.querySelectorAll(".category");
  $allCategories.forEach(($category) => {
    if ($currentCategory && $category.contains($currentCategory)) {
      return;
    }

    $category.classList.remove("category--active");
  });
}

/* lk */
const $lkBookmarkBtn = document.querySelector(".lk__bookmark-btn");
$lkBookmarkBtn?.addEventListener("click", () => {
  if ($lkBookmarkBtn.classList.contains("lk__bookmark-btn--active")) {
    $lkBookmarkBtn.classList.remove("lk__bookmark-btn--active");
  } else {
    $lkBookmarkBtn.classList.add("lk__bookmark-btn--active");
  }
});

/* lk sidebar */
const $openLkSidebarBtns = document.querySelectorAll(".js-open-lk-sidebar");
$openLkSidebarBtns.forEach(($btn) => {
  $btn.addEventListener("click", () => {
    const sidebarName = $btn.dataset.sidebarName;
    const $lkSidebar = sidebarName
      ? document.querySelector(`.lk-sidebar[data-sidebar-name="${sidebarName}"]`)
      : document.querySelector(".lk-sidebar");

    if (window.innerWidth <= 991) {
      openLKSidebar($lkSidebar);
    }
  });
});

const $closeLkSidebarBtns = document.querySelectorAll(".js-close-lk-sidebar");
$closeLkSidebarBtns.forEach(($btn) => {
  const sidebarName = $btn.dataset.sidebarName;
  let $lkSidebar = sidebarName
    ? document.querySelector(`.lk-sidebar[data-sidebar-name="${sidebarName}"]`)
    : document.querySelector(".lk-sidebar");

  $btn.addEventListener("click", () => {
    const isLockBody = !$btn.classList.contains("js-open-popup");
    if (!isLockBody) {
      document.body.dataset.lockedBy = `popup-${$btn.dataset.popupName}`;
    }

    closeLKSidebar($lkSidebar, isLockBody);
  });
});

window.addEventListener("click", (e) => {
  const $activeLkSidebar = document.querySelector(".lk-sidebar--active");
  if ($activeLkSidebar && window.innerWidth <= 991 && e.target === $activeLkSidebar) {
    closeLKSidebar($activeLkSidebar);
  }
});

function openLKSidebar($lkSidebar) {
  $lkSidebar.classList.add("lk-sidebar--active");
  if (!isLockedBody()) {
    lockBody("lk-sidebar");
  }
}

function closeLKSidebar($lkSidebar, isUnlockBody = true) {
  $lkSidebar.classList.remove("lk-sidebar--active");

  if (isUnlockBody && isLockedBody() && getLockedBodyBy() === "lk-sidebar") {
    unlockBody();
  }
}

/* Search items */
const $searchItemsBoxes = document.querySelectorAll(".search-items");
$searchItemsBoxes.forEach(($searchItemsBox) => {
  const $searchInput = $searchItemsBox.querySelector(".search-items__input .input__field");
  const $clearButton = $searchItemsBox.querySelector(".input__clear-field");
  let $searchItems = $searchItemsBox.querySelectorAll(".search-items__item");

  const resetSearch = () => {
    $searchItems.forEach(($item) => {
      const $textElements = $item.querySelectorAll(".search-items__text");
      $textElements.forEach(($textElement) => {
        $textElement.innerHTML = $textElement.textContent;
      });
      $item.classList.remove("search-items__item--hide");
    });
  };

  $searchInput.addEventListener("input", () => {
    const query = $searchInput.value.trim().toLowerCase();

    if (query === "") {
      resetSearch();
      return;
    }

    $searchItems = $searchItemsBox.querySelectorAll(".search-items__item");
    $searchItems.forEach(($item) => {
      const $textElements = $item.querySelectorAll(".search-items__text");
      let itemMatches = false;

      $textElements.forEach(($textElement) => {
        const originalText = $textElement.textContent;
        const text = originalText.toLowerCase();

        if (text.includes(query)) {
          itemMatches = true;
          const startIndex = text.indexOf(query);
          const endIndex = startIndex + query.length;
          $textElement.innerHTML = `${originalText.substring(0, startIndex)}<mark>${originalText.substring(
            startIndex,
            endIndex
          )}</mark>${originalText.substring(endIndex)}`;
        } else {
          $textElement.innerHTML = originalText;
        }
      });

      if (itemMatches) {
        $item.classList.remove("search-items__item--hide");
      } else {
        $item.classList.add("search-items__item--hide");
      }
    });
  });

  $clearButton.addEventListener("click", () => {
    resetSearch();
  });
});

/* Tippy.js */
const $tippyBoxes = document.querySelectorAll("[data-tippy-content]");
$tippyBoxes.forEach(($tippyBox) => {
  const maxWidth = +$tippyBox.dataset.maxWidth || "none";

  tippy($tippyBox, {
    maxWidth,
  });
});

/* Groups */
const $groups = document.querySelectorAll(".groups");
$groups.forEach(($group) => {
  const $addBtn = $group.querySelector(".groups__add");
  const $list = $group.querySelector(".groups__list");
  $addBtn.addEventListener("click", () => {
    const $newItem = createGroupItem("groups__item search-items__item");
    $list.prepend($newItem);

    const $newItemInputField = $newItem.querySelector(".group-item__input .input__field");
    $newItemInputField.focus();
  });
});

function createGroupItem(className) {
  const $groupItem = createElem("div", `group-item group-item--edit ${className}`);
  $groupItem.innerHTML = `
    <div class="text text--3xs text--lh-14 group-item__value search-items__text"></div>
    <div class="input group-item__input">
      <input
        class="input__field input__field--xxs"
        type="text"
        value="" />
    </div>`;

  const $inputField = $groupItem.querySelector(".group-item__input .input__field");
  const $valueText = $groupItem.querySelector(".group-item__value");
  let defaultValue = "";
  let isCreating = true;

  const $saveBtn = createElem("button", "group-item__btn group-item__btn--save");
  $saveBtn.innerHTML = '<img class="group-item__btn-icon" src="img/icons/check-green-400.svg" alt="" />';
  $saveBtn.addEventListener("click", () => {
    const value = $inputField.value;
    if (value !== "") {
      $groupItem.classList.remove("group-item--edit");
      $valueText.textContent = value;
      defaultValue = value;
      isCreating = false;
    }
  });

  const $editBtn = createElem("button", "group-item__btn group-item__btn--edit");
  $editBtn.innerHTML = '<img class="group-item__btn-icon" src="img/icons/edit-neutral-500.svg" alt="" />';
  $editBtn.addEventListener("click", () => {
    $groupItem.classList.add("group-item--edit");
  });

  const $deleteBtn = createElem("button", "group-item__btn group-item__btn--delete");
  $deleteBtn.innerHTML = '<img class="group-item__btn-icon" src="img/icons/trash-orange-500.svg" alt="" />';
  $deleteBtn.addEventListener("click", () => {
    $groupItem.remove();
  });

  const $cancelBtn = createElem("button", "group-item__btn group-item__btn--cancel");
  $cancelBtn.innerHTML = '<img class="group-item__btn-icon group-item__btn-icon--sm" src="img/icons/exit-neutral-500.svg" alt="" />';
  $cancelBtn.addEventListener("click", () => {
    if (isCreating) {
      $groupItem.remove();
    } else {
      $groupItem.classList.remove("group-item--edit");
      $inputField.value = defaultValue;
    }
  });

  $groupItem.prepend($saveBtn);
  $groupItem.prepend($editBtn);
  $groupItem.append($deleteBtn);
  $groupItem.append($cancelBtn);

  return $groupItem;
}

/* Group items */
const $groupItems = document.querySelectorAll(".group-item");
$groupItems.forEach(($groupItem) => {
  const $inputField = $groupItem.querySelector(".group-item__input .input__field");
  const $valueText = $groupItem.querySelector(".group-item__value");
  let defaultValue = $inputField.value;

  const $editBtn = $groupItem.querySelector(".group-item__btn--edit");
  $editBtn.addEventListener("click", () => {
    $groupItem.classList.add("group-item--edit");
  });

  const $cancelBtn = $groupItem.querySelector(".group-item__btn--cancel");
  $cancelBtn.addEventListener("click", () => {
    $groupItem.classList.remove("group-item--edit");
    $inputField.value = defaultValue;
  });

  const $saveBtn = $groupItem.querySelector(".group-item__btn--save");
  $saveBtn.addEventListener("click", () => {
    const value = $inputField.value;
    if (value !== "") {
      $groupItem.classList.remove("group-item--edit");
      $valueText.textContent = value;
      defaultValue = value;
    }
  });

  const $deleteBtn = $groupItem.querySelector(".group-item__btn--delete");
  $deleteBtn.addEventListener("click", () => {
    $groupItem.remove();
  });
});

/* Info */
const $infoSidebarMenuLinks = document.querySelectorAll(".info__sidebar .lk-menu .lk-menu__link");
$infoSidebarMenuLinks.forEach(($link) => {
  $link.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* Partners */
const $partnersDeleteBtn = document.getElementById("partner-delete");
$partnersDeleteBtn?.addEventListener("click", () => {
  const $deletePopup = createPopup({
    text: "Вы уверены, что хотите удалить из группы?",
    btnText: "Отменить",
    btnCallback: () => {
      console.log("cancel");
      removePopup($deletePopup);
    },
    btnDangerText: "Удалить из группы",
    btnDangerCallback: () => {
      console.log("delete");
      removePopup($deletePopup, false);
      createConfirmPopup();
    },
  });
});

function createConfirmPopup() {
  const $popup = createPopup({
    text: "Требуется подтвердить",
    btnDangerText: "Удалить",
    btnDangerCallback: () => {
      console.log("delete confirmed");
      removePopup($popup);
    },
  });
}

/* Profile data phone confirm */
document.addEventListener("formSuccess", (e) => {
  const $form = e.detail.form;
  if ($form.dataset.confirmName !== "profile-data-phone-confirm") {
    return;
  }

  const $lkDataValuePhone = document.querySelector(".lk-data__item-value--phone");
  $lkDataValuePhone.classList.add("lk-data__item-value--confirmed");

  const $formPopup = $form.closest(".popup");
  closePopup($formPopup);
});

/* Offers list */
const $offersLists = document.querySelectorAll(".offers-list");
$offersLists.forEach(($offersList) => {
  const $submit = $offersList.querySelector(".offers-list__btns-btn--submit");
  if (!$submit) {
    return;
  }

  let checkedCount = 0;

  const $tableOffersTrList = document.querySelectorAll(".table-offers tr");
  $tableOffersTrList.forEach(($tableOffersTr) => {
    const $checkboxInput = $tableOffersTr.querySelector(".table-offers__checkbox .checkbox__input");
    if (!$checkboxInput) {
      return;
    }

    if ($checkboxInput.checked) {
      checkedCount++;
    }

    $checkboxInput?.addEventListener("change", () => {
      if ($checkboxInput.checked) {
        checkedCount++;
        $tableOffersTr.classList.add("table-offers__tr--active");
      } else {
        checkedCount--;
        $tableOffersTr.classList.remove("table-offers__tr--active");
      }

      updateOffersListSubmit($submit, checkedCount);
    });
  });

  updateOffersListSubmit($submit, checkedCount);
});

function updateOffersListSubmit($submit, count = 0) {
  $submit.innerText = `Заключить контракт (${count})`;

  if (count > 0) {
    $submit.removeAttribute("disabled");
  } else {
    $submit.setAttribute("disabled", "");
  }
}

/* Offer */
const $offerMainBoxes = document.querySelectorAll(".offer-main");
$offerMainBoxes.forEach(($offerMain) => {
  const $addImgFileField = $offerMain.querySelector(".js-offer-add-img");
  const $offerMainImages = $offerMain.querySelector(".offer-main__images");
  const $offerMainImagesEmpty = $offerMain.querySelector(".offer-main__empty--images");
  let $offerMainImagesItems = $offerMain.querySelectorAll(".offer-img");

  const $offerImagesList = $offerMain.querySelector(".offer-images__list");
  $addImgFileField?.addEventListener("change", () => {
    const file = $addImgFileField.files[0];
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const url = URL.createObjectURL(file);
    const $imgBlock = createElem("div", "offer-img offer-images__item");
    const $img = createElem("img", "offer-img__main", {
      src: url,
    });
    const $deleteBtn = createElem("button", "offer-img__delete", {
      innerHTML: '<img src="img/icons/exit-blue-500.svg" alt="" />',
    });

    $deleteBtn.addEventListener(
      "click",
      () => {
        $imgBlock.remove();
        $offerMainImagesItems = $offerMain.querySelectorAll(".offer-img");
        offerMainEmptyHandler($offerMainImages, $offerMainImagesItems, $offerMainImagesEmpty);
      },
      { once: true }
    );

    $imgBlock.append($img);
    $imgBlock.append($deleteBtn);

    $offerImagesList.append($imgBlock);

    $addImgFileField.value = "";
    $offerMainImagesItems = $offerMain.querySelectorAll(".offer-img");
    offerMainEmptyHandler($offerMainImages, $offerMainImagesItems, $offerMainImagesEmpty);
  });
});

//Редактирование/размещение - Фото - Переключение блока "Данные не заполнены"
const $offerMainImagesList = document.querySelectorAll(".offer-main__images");
$offerMainImagesList.forEach(($offerMainImages) => {
  const $offerMain = $offerMainImages.closest(".offer-main");
  const $offerMainImagesEmpty = $offerMain.querySelector(".offer-main__empty--images");
  let $offerMainImagesItems = $offerMainImages.querySelectorAll(".offer-img");

  offerMainEmptyHandler($offerMainImages, $offerMainImagesItems, $offerMainImagesEmpty);

  $offerMainImagesItems.forEach(($offerMainImg) => {
    const $delete = $offerMainImg.querySelector(".offer-img__delete");
    $delete?.addEventListener(
      "click",
      () => {
        $offerMainImg.remove();
        $offerMainImagesItems = $offerMain.querySelectorAll(".offer-img");
        offerMainEmptyHandler($offerMainImages, $offerMainImagesItems, $offerMainImagesEmpty);
      },
      { once: true }
    );
  });
});

//Редактирование/размещение - Комментарий/Описание - Переключение блока "Данные не заполнены"
const $offerMainCommentsList = document.querySelectorAll(".offer-main__comment");
$offerMainCommentsList.forEach(($offerMainComments) => {
  const $offerMain = $offerMainComments.closest(".offer-main");
  const $offerMainCommentsEmpty = $offerMain.querySelector(".offer-main__empty--comment");

  if ($offerMainComments.innerText.trim() === "") {
    $offerMainCommentsEmpty.classList.add("offer-main__empty--show");
  }
});

//Редактирование/размещение - Документы - Переключение блока "Данные не заполнены"
const $offerMainFilesList = document.querySelectorAll(".offer-main__files");
$offerMainFilesList.forEach(($offerMainFiles) => {
  const $offerMain = $offerMainFiles.closest(".offer-main");
  const $offerMainFilesEmpty = $offerMain.querySelector(".offer-main__empty--files");

  let $offerMainFilesItems = $offerMainFiles.querySelectorAll(".offer-main__file");

  offerMainEmptyHandler($offerMainFiles, $offerMainFilesItems, $offerMainFilesEmpty);
});

//Редактирование/размещение - Переключение видимости кнопок Скачать архив/Добавить документ/Добавить фото
const $offerTabsBtns = document.querySelectorAll(".offer-main__tabs .tabs-btns__btn");
const $offerTabsHeaderBtn = document.querySelector(".offer-main__tabs-header-btn");
$offerTabsBtns.forEach(($btn) => {
  $btn.addEventListener("click", () => {
    const $offerMain = $btn.closest(".offer-main");

    const $oldShowedBtn = $offerMain.querySelector(".offer-main__tabs-header-btn--show");
    $oldShowedBtn?.classList.remove("offer-main__tabs-header-btn--show");

    const additionBtnName = $btn.dataset.additionBtn;
    const $additionBtn = $offerMain.querySelector(`.offer-main__tabs-header-btn--${additionBtnName}`);
    if (!$additionBtn) {
      return;
    }

    const $offerMainFilesItems = $offerMain.querySelectorAll(".offer-main__file");
    if (additionBtnName === "files" && $additionBtn.dataset.btnType === "download") {
      if ($offerMainFilesItems.length !== 0) {
        $additionBtn.classList.add("offer-main__tabs-header-btn--show");
      }
    } else {
      $additionBtn.classList.add("offer-main__tabs-header-btn--show");
    }
  });
});

// Обработчик отображение/скрытия блока "Данные не заполнены"
function offerMainEmptyHandler($offerMainList, $offerMainItems, $empty) {
  if ($offerMainItems.length === 0) {
    $offerMainList.classList.add("offer-main__hidden");
    $empty.classList.add("offer-main__empty--show");
  } else {
    $offerMainList.classList.remove("offer-main__hidden");
    $empty.classList.remove("offer-main__empty--show");
  }
}

/* Datepicker */
const pickerMinYear = 2000;
const pickerMaxYear = new Date().getFullYear() + 5;
const pickerOffsetTop = 8;
const $datepickerInputs = document.querySelectorAll("[data-datepicker]");

$datepickerInputs.forEach(($datepickerInput) => {
  $datepickerInput.pickerDefaultValue = $datepickerInput.value;

  const range = $datepickerInput.dataset.datepickerRange !== undefined;
  const picker = new AirDatepicker($datepickerInput, {
    inline: true,
    showOtherMonths: false,
    selectOtherMonths: false,
    minDate: new Date(pickerMinYear, 0, 1),
    maxDate: new Date(pickerMaxYear, 11, 31),
    dateFormat: "dd.MM.yyyy",
    timeFormat: "HH:mm",
    timepicker: true,
    keyboardNav: false,
    position: ({ $datepicker, $target, $pointer }) => {
      const coords = $target.getBoundingClientRect();
      const top = coords.y + coords.height + window.scrollY + pickerOffsetTop;
      const left = coords.x;

      $datepicker.style.left = `${left}px`;
      $datepicker.style.top = `${top}px`;

      $pointer.style.display = "none";
    },
    range,
    multipleDatesSeparator: " - ",
    locale: {
      daysMin: ["В", "П", "В", "С", "Ч", "П", "С"],
    },
    buttons: [
      {
        content: "Отменить",
        className: "btn btn--gray-100 btn--text-xs air-datepicker-button--cancel",
        attrs: {
          type: "button",
        },
        onClick: () => {
          if (picker.opts.inline) {
            picker.$datepicker.classList.remove("air-datepicker--show");
          } else {
            picker.hide();
          }

          picker.clear();
          picker.$datepicker.querySelectorAll(".-in-range-").forEach(($rangeItem) => $rangeItem.classList.remove("-in-range-"));

          if ($datepickerInput.dataset.datepickerCancelClickClearField !== undefined) {
            $datepickerInput.value = "";
            $datepickerInput.dispatchEvent(new Event("input"));
            $datepickerInput.pickerDefaultValue = "";
          }
        },
      },
      {
        content: "Выбрать",
        className: "btn btn--blue-500 btn--text-xs air-datepicker-button--submit",
        attrs: {
          type: "button",
        },
        onClick: () => updateDatepickerValue(picker, $datepickerInput),
      },
    ],
    onShow: (isFinished) => {
      if (isFinished) {
        return;
      }

      renderDatePicker({
        picker,
        minYear: pickerMinYear,
        maxYear: pickerMaxYear,
      });

      pickerBottomOffsetHandler($datepickerInput, picker);
    },
    onHide: (isFinished) => {
      if (isFinished) {
        return;
      }

      resetBottomOffset();
    },
    onChangeViewDate: ({ month, year }) => {
      updateDateDropdown({
        picker,
        type: "month",
        newIndex: month,
        newItemName: getMonthName(month),
      });
      updateDateDropdown({
        picker,
        type: "year",
        newIndex: year,
        newItemName: year,
      });
    },
    onSelect: (date) => {
      $datepickerInput.value = $datepickerInput.pickerDefaultValue;
      verifyData(date);
    },
  });

  $datepickerInput.picker = picker;

  setTimeout(() => (picker.$el.value = $datepickerInput.pickerDefaultValue));

  if (picker.opts.inline) {
    renderDatePicker({
      picker,
      minYear: pickerMinYear,
      maxYear: pickerMaxYear,
    });
  }

  if ($datepickerInput.dataset.datepickerAlwaysShow !== undefined) {
    picker.$datepicker.classList.add("air-datepicker--visible");
  }

  $datepickerInput.addEventListener("click", () => {
    const $otherActiveDatepicker = document.querySelector(".air-datepicker--show");
    $otherActiveDatepicker?.classList.remove("air-datepicker--show");

    picker.$datepicker.classList.add("air-datepicker--show");

    pickerBottomOffsetHandler($datepickerInput, picker);
  });

  window.addEventListener("click", (e) => {
    if (e.target.dataset.datepicker === "" || e.target.closest("[data-datepicker]")) {
      return;
    }

    if (picker.opts.inline && !e.target.closest(".air-datepicker")) {
      picker.$datepicker.classList.remove("air-datepicker--show");
      resetBottomOffset();
    } else if (picker.visible && !e.target.closest(".air-datepicker")) {
      picker.hide();
    }
  });
});

function renderDatePicker({ picker, minYear, maxYear }) {
  const $nav = picker.$nav.querySelector(".air-datepicker-nav");
  const $navTitle = $nav.querySelector(".air-datepicker-nav--title");
  $navTitle?.remove();

  const $monthsDropdown = createDateDropdown({
    picker,
    type: "month",
    items: getMonthsNames(),
    currentIndex: new Date().getMonth(),
    currentItemName: getMonthName(new Date().getMonth()),
  });
  const $yearsDropdown = createDateDropdown({
    picker,
    type: "year",
    items: getYearsArray(minYear, maxYear),
    currentIndex: new Date().getFullYear(),
    currentItemName: new Date().getFullYear(),
  });
  const $timeInput = createTimeInput(picker);
  const $prevBtn = $nav.querySelector(".air-datepicker-nav--action");

  const monthsDropdownAdded = !!$nav.querySelector(".dropdown-month");
  if (!monthsDropdownAdded) {
    $prevBtn.after($yearsDropdown);
    $prevBtn.after($monthsDropdown);
  }

  const $timePicker = picker.$timepicker;
  const timeInputAdded = !!$timePicker.querySelector(".datepicker-time");
  if (!timeInputAdded) {
    $timePicker.append($timeInput);
  }

  picker.$datepicker.addEventListener("mousedown", (e) => {
    const $timeInput = picker.$datepicker.querySelector(".datepicker-time__field");
    $timeInput?.blur();

    if (!e.target.closest(".datepicker-time")) {
      e.preventDefault();
    }
  });
}

function updateDatepickerValue(picker, $datepickerInput) {
  const datepickerInputAdditionTimeText = $datepickerInput.dataset.datepickerAdditionTimeText;
  const $timeInput = picker.$datepicker.querySelector(".datepicker-time__field");
  const selectedDates = picker.selectedDates;
  const [hours, minutes] = $timeInput.value.split(":").map(Number);
  let roundedMinutes = Math.round(minutes / 5) * 5;
  if (roundedMinutes > 55) {
    roundedMinutes = 55;
  }

  selectedDates.forEach((selectedDate) => {
    selectedDate.setHours(hours);
    selectedDate.setMinutes(roundedMinutes);
  });

  const updateOnlyDate = $datepickerInput.dataset.datepickerUpdateOnlyDate !== undefined;
  const formattedDates = selectedDates.map((date) => {
    if (updateOnlyDate) {
      return picker.formatDate(date, `${picker.opts.dateFormat}`);
    } else {
      return picker.formatDate(date, `${picker.opts.dateFormat} ${picker.opts.timeFormat}`);
    }
  });
  const joinDates = formattedDates.join(" - ");
  if (datepickerInputAdditionTimeText && !updateOnlyDate) {
    $datepickerInput.value = `${joinDates} ${datepickerInputAdditionTimeText}`;
  } else {
    $datepickerInput.value = `${joinDates}`;
  }

  $datepickerInput.pickerDefaultValue = $datepickerInput.value;
  $datepickerInput.dispatchEvent(new Event("input"));

  const $input = $datepickerInput.closest(".input");
  const $inputTime = $input.querySelector(".js-input-time");
  if ($inputTime) {
    $inputTime.innerText = `${hours}:${roundedMinutes}`;
  }

  if (picker.opts.inline) {
    picker.$datepicker.classList.remove("air-datepicker--show");
  } else {
    picker.hide();
  }

  if (selectedDates.length === 1) {
    clearPickerCells(picker);
  }
}

function createDateDropdown({ picker, type, items, currentIndex, currentItemName }) {
  const $dropdown = createElem("div", `dropdown dropdown-${type}`);
  const $btn = createElem("button", `select-btn select-btn--py-sm dropdown-${type}__btn dropdown__btn`, {
    innerText: currentItemName,
  });
  $btn.setAttribute("type", "button");

  const $dropdownMain = createElem("div", "dropdown__main dropdown__main--full");
  const $dateMenu = createElem("div", "date-menu dropdown__date");
  const $dateMenuList = createElem("ul", "date-menu__list");

  items.forEach((item, index) => {
    const $dateMenuItem = createElem("li", "date-menu__item");
    const $dateMenuLink = createElem("button", "date-menu__link");
    if ((type === "month" && index === currentIndex) || (type === "year" && item === currentIndex)) {
      $dateMenuLink.classList.add("date-menu__link--active");
    }
    $dateMenuLink.setAttribute("type", "button");
    $dateMenuLink.innerHTML = `<span>${item}</span>`;
    $dateMenuLink.addEventListener("click", () => {
      const selectedDate = type === "month" ? new Date(picker.viewDate.getFullYear(), index) : new Date(item, picker.viewDate.getMonth());
      picker.setViewDate(selectedDate);
      $dropdown.classList.remove("dropdown--active");
      $btn.innerText = item;
    });
    $dateMenuLink.dataset.index = type === "month" ? index : item;
    $dateMenuItem.append($dateMenuLink);
    $dateMenuList.append($dateMenuItem);
  });

  $dateMenu.append($dateMenuList);
  $dropdownMain.append($dateMenu);

  const scrollbar = Scrollbar.init($dateMenu, {
    damping: 0.1,
    continuousScrolling: false,
  });

  $btn.addEventListener("click", (e) => {
    dropdownBtnHandler($btn, $dropdown, e);

    const $activeLink = $dropdown.querySelector(".date-menu__link--active");
    if ($activeLink) {
      scrollbar.update();
      scrollbar.scrollTo(0, $activeLink.offsetTop);
    }
  });

  $dropdown.append($btn);
  $dropdown.append($dropdownMain);

  return $dropdown;
}

function getDistanceToElementEnd(fromElement, toElement) {
  const fromRect = fromElement.getBoundingClientRect();
  const toRect = toElement.getBoundingClientRect();
  const distance = toRect.bottom - fromRect.bottom;

  return distance;
}

function addBottomOffset(offset) {
  const $main = document.querySelector(".main");
  const $lkBody = document.querySelector(".lk__body");
  if ($lkBody) {
    $lkBody.style.height = `${$lkBody.getBoundingClientRect().height + offset}px`;
  } else {
    $main.style.height = `${$main.getBoundingClientRect().height + offset}px`;
  }
}

function resetBottomOffset() {
  const $main = document.querySelector(".main");
  const $lkBody = document.querySelector(".lk__body");
  if ($lkBody) {
    $lkBody.style.height = "";
  } else {
    $main.style.height = "";
  }
}

function pickerBottomOffsetHandler($elem, picker) {
  const $input = $elem.closest(".input");
  if ($input && $input.classList.contains("input--picker-desktop-top")) {
    return;
  }

  const $popup = $input.closest(".popup");
  if ($popup) {
    return;
  }

  const $footer = document.querySelector(".footer");
  const offsetToBottom = getDistanceToElementEnd($elem, $footer) - pickerOffsetTop;
  const pickerHeight = picker.$datepicker.offsetHeight;
  const pickerBottomOffsetReserve = 20;
  const bottomOffset = pickerHeight - offsetToBottom + pickerBottomOffsetReserve;
  if (bottomOffset > 0) {
    addBottomOffset(bottomOffset);
  }
}

function updateDateDropdown({ picker, type, newIndex, newItemName }) {
  const $dropdown = picker.$datepicker.querySelector(`.dropdown-${type}`);
  const $activeLink = $dropdown.querySelector(".date-menu__link--active");
  $activeLink?.classList.remove("date-menu__link--active");

  const $newActiveLink = $dropdown.querySelector(`.date-menu__link[data-index="${newIndex}"]`);
  $newActiveLink.classList.add("date-menu__link--active");

  const $btn = $dropdown.querySelector(`.dropdown-${type}__btn`);
  $btn.innerText = newItemName;
}

function createTimeInput(picker) {
  const $timeInputContainer = createElem("div", "input datepicker-time");
  if (picker.$el.dataset.datepickerHideTime !== undefined) {
    $timeInputContainer.classList.add("datepicker-time--hide");
  }

  const $timeType = createElem("span", "text text--neutral-400 text--3xs datepicker-time__type", {
    innerText: "мск",
  });

  const thisHours = String(picker.timepicker.hours).padStart(2, "0");
  const thisMinutes = String(picker.timepicker.minutes).padStart(2, "0");
  let thisMinutesRounded = String(Math.round(thisMinutes / 5) * 5).padStart(2, "0");
  if (thisMinutesRounded > 55) {
    thisMinutesRounded = 55;
  }

  const $timeInput = createElem("input", "input__field input__field--sm datepicker-time__field", {
    type: "time",
    value: `${thisHours}:${thisMinutesRounded}`,
  });

  $timeInput.addEventListener("mouseup", (e) => {
    e.stopPropagation();
    e.preventDefault();
  });

  $timeInput.addEventListener("input", () => {
    if (!$timeInput.value) {
      $timeInput.value = "00:00";
    }
  });

  $timeInput.addEventListener("blur", () => {
    if (!$timeInput.value) {
      $timeInput.value = "00:00";
    }

    const [hours, minutes] = $timeInput.value.split(":").map(Number);
    let roundedMinutes = Math.round(minutes / 5) * 5;
    if (roundedMinutes > 55) {
      roundedMinutes = 55;
    }

    $timeInput.value = `${String(hours).padStart(2, "0")}:${String(roundedMinutes).padStart(2, "0")}`;

    const selectedDates = picker.selectedDates;

    if (selectedDates.length === 0) {
      selectedDates.push(new Date());
    }

    selectedDates.forEach((selectedDate) => {
      selectedDate.setHours(hours);
      selectedDate.setMinutes(roundedMinutes);
    });
  });

  $timeInputContainer.append($timeInput);
  $timeInputContainer.append($timeType);

  return $timeInputContainer;
}

function clearPickerCells(picker) {
  picker.$datepicker.querySelectorAll(".-in-range-").forEach(($rangeItem) => $rangeItem.classList.remove("-in-range-"));
  picker.$datepicker.querySelectorAll(".-range-to-").forEach(($rangeItem) => $rangeItem.classList.remove("-range-to-"));
}

function getMonthName(index) {
  const months = getMonthsNames();
  return months[index];
}

function getMonthsNames() {
  return ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
}

function getYearsArray(minYear, maxYear) {
  return Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
}

/* Catalog filter */
const $catalogFilters = document.querySelectorAll(".filter-content");
const checkboxConfigs = [
  { key: "period" },
  { key: "categories" },
  { key: "regions" },
  { key: "names" },
  { key: "statuses" },
  { key: "contractor" },
];
$catalogFilters.forEach(($catalogFilter) => {
  const $popup = $catalogFilter.closest(".popup");
  const $popupContent = $popup.querySelector(".popup__content");
  const $filterGlobalCount = $popupContent.querySelector(".popup-content__header .count-circle");
  const filterName = $catalogFilter.dataset.filterName;

  const $sections = $catalogFilter.querySelectorAll(".filter-content__section");
  $sections.forEach(($section) => {
    const $sectionCheckboxes = $section.querySelectorAll(".checkbox__input");

    //Кнопка "Выбрать все"
    const $linkSelectAll = $section.querySelector(".filter-content__section-link--all");
    $linkSelectAll?.addEventListener("click", () => {
      $sectionCheckboxes.forEach(($checkbox) => ($checkbox.checked = true));
    });

    //Кнопка "Очистить"
    const $linkClear = $section.querySelector(".filter-content__section-link--clear");
    $linkClear?.addEventListener("click", () => {
      $sectionCheckboxes.forEach(($checkbox) => ($checkbox.checked = false));

      const $sectionTags = $section.querySelectorAll(".filter-tag");
      $sectionTags.forEach(($tag) => $tag.remove());
    });

    const $tagsList = $section.querySelector(".filter-content__tags-list");
    const $btnAddTag = $section.querySelector(".filter-content__add-tag");
    $btnAddTag?.addEventListener("click", () => {
      const $inputField = $btnAddTag.closest(".input").querySelector(".input__field");
      if ($inputField.value === "") {
        return;
      }

      const $filterTag = createFilterTag($inputField.value, "filter-content__tag", "gray-100");
      $tagsList.append($filterTag);

      $inputField.value = "";
      $inputField.dispatchEvent(new Event("input"));
    });
  });

  //Цикл кнопок табов (Период, Категории, Контрагенты, Наименование / ИНН)
  const $sidebarTabsBtnsBox = $catalogFilter.querySelector(".filter-content__sidebar-btns.tabs-btns");
  if (!$sidebarTabsBtnsBox) {
    return;
  }

  let filterSaves = getFilterStorage(filterName);

  const $sidebarTabsBtns = $sidebarTabsBtnsBox.querySelectorAll(".filter-content__sidebar-btn");
  $sidebarTabsBtns.forEach(($tabsBtn, index) => {
    const $delete = $tabsBtn.querySelector(".lk-menu-link__delete");

    //По нажатию на кнопку крестик - очистка содержимого таба
    $delete.addEventListener("click", (e) => {
      e.stopPropagation();

      $tabsBtn.classList.remove("filter-content__sidebar-btn--selected");

      const $tabItem = $catalogFilter.querySelectorAll(".filter-content__tabs-item")[index];
      clearCatalogFilter($tabItem);
      updateFilterGlobalCount(checkboxConfigs, $catalogFilter, $filterGlobalCount);
    });

    $tabsBtn.addEventListener("click", () => {
      $catalogFilter.classList.add("filter-content--active");
      $popupContent.classList.add("popup-content--filter-active");
    });
  });

  //Обновление счетчиков и состояний кнопок при клике на чекбоксы
  checkboxConfigs.forEach(({ key }) => {
    const $section = $catalogFilter.querySelector(`.filter-content__section--${key}`);
    if (!$section) {
      return;
    }
    const $checkboxes = $section.querySelectorAll(`.filter-content__checkbox .checkbox__input`);
    const $checkboxesNotAll = $section.querySelectorAll(`.filter-content__checkbox .checkbox__input:not(.category__check-all)`);
    const $tabBtn = $sidebarTabsBtnsBox.querySelector(`.filter-content__sidebar-btn[data-filter-btn-name="${key}"]`);

    $checkboxes.forEach(($checkbox) => {
      $checkbox.addEventListener("change", () => {
        // Количество выбранных чекбоксов
        const checkedCount = [...$checkboxesNotAll].reduce((accumulator, $checkbox) => {
          return $checkbox.checked ? accumulator + 1 : accumulator;
        }, 0);

        const $tabBtnCount = $tabBtn.querySelector(".count-circle");
        $tabBtnCount.innerText = checkedCount;
        if (checkedCount !== 0) {
          // Если выбрано чекбоксов 0 - скрываем кнопку крестика и счетчик выбранных чекбоксов у кнопки таба
          $tabBtn.classList.add("filter-content__sidebar-btn--selected");
        } else {
          // Иначе отображаем счетчик и кнопку очистки
          $tabBtn.classList.remove("filter-content__sidebar-btn--selected");
        }

        updateFilterGlobalCount(checkboxConfigs, $catalogFilter, $filterGlobalCount);
      });
    });

    //Обновление счетчиков и состояний кнопок при работе с календарем
    const $dateInput = $section.querySelector(".filter-content__date-input");
    if ($dateInput) {
      const $dateInputField = $dateInput.querySelector(".input__field");
      const picker = $dateInputField.picker;

      picker.update({
        onSelect: (date) => {
          $dateInputField.value = $dateInputField.pickerDefaultValue;
          updateDatepickerValue(picker, $dateInputField);

          if ($dateInputField.value !== "") {
            $tabBtn.classList.add("filter-content__sidebar-btn--selected");
          } else {
            $tabBtn.classList.remove("filter-content__sidebar-btn--selected");
          }

          updateFilterGlobalCount(checkboxConfigs, $catalogFilter, $filterGlobalCount);

          verifyData(date);
        },
      });

      const $datepickerCancel = picker.$buttons.querySelector(".air-datepicker-button--cancel");
      $datepickerCancel.addEventListener("click", () => {
        closePopup($popup);
        updateFilterGlobalCount(checkboxConfigs, $catalogFilter, $filterGlobalCount);
      });
    }
  });

  const $sidebarSectionSaves = $catalogFilter.querySelector(".filter-content__sidebar-section--saves");
  const $sidebarSectionSavesBtns = $sidebarSectionSaves?.querySelector(".filter-content__sidebar-btns");
  if ($sidebarSectionSavesBtns) {
    updateFilterSidebarSaves(filterSaves, $sidebarSectionSaves);

    filterSaves.forEach((filterSave) => {
      const saveCount = getSaveCount(filterSave);
      const $saveBtn = createSaveBtn(filterSave, saveCount);

      $sidebarSectionSavesBtns.append($saveBtn);
    });
  }

  // Кнопка "Сохранить фильтр"
  const $saveFilterBtn = $catalogFilter.querySelector(".js-filter-content-save");
  $saveFilterBtn?.addEventListener("click", () => {
    if (getFilterGlobalCount(checkboxConfigs, $catalogFilter) === 0) {
      return;
    }

    const activeSaveId = +$catalogFilter.dataset.activeSaveId;
    if (!activeSaveId) {
      const filterSave = saveFilter($catalogFilter, checkboxConfigs, filterName);
      const saveCount = getSaveCount(filterSave);

      filterSaves = getFilterStorage(filterName);

      const $saveBtn = createSaveBtn(filterSave, saveCount);

      $sidebarSectionSavesBtns.append($saveBtn);

      updateFilterSidebarSaves(filterSaves, $sidebarSectionSaves);

      return;
    }

    const $savePopup = createPopup({
      text: "Вы хотите создать новый фильтр или перезаписать выбранный?",
      btnCancelText: "Перезаписать",
      btnCancelCallback: () => {
        removePopup($savePopup, false);

        createFilterRewriteConfirmPopup({
          callback: () => {
            const newSave = generateSave($catalogFilter, checkboxConfigs, filterName, activeSaveId);
            updateFilterStorageItem(filterName, activeSaveId, newSave);

            const $saveBtn = $catalogFilter.querySelector(`.filter-content__sidebar-btn--save[data-id="${activeSaveId}"]`);
            $saveBtn.querySelector(".count-circle").innerText = getSaveCountById(filterName, activeSaveId);
            $saveBtn.save = newSave;

            updateFilterSidebarSaves(filterSaves, $sidebarSectionSaves);
          },
        });
      },
      btnText: "Создать новый ",
      btnCallback: () => {
        const newSave = saveFilter($catalogFilter, checkboxConfigs, filterName);
        const saveCount = getSaveCount(newSave);
        filterSaves = getFilterStorage(filterName);

        const $saveBtn = createSaveBtn(newSave, saveCount);
        $sidebarSectionSavesBtns.append($saveBtn);

        updateFilterSidebarSaves(filterSaves, $sidebarSectionSaves);

        removePopup($savePopup, false);
      },
      unlockBody: false,
    });
  });

  // Кнопка "Сбросить фильтры"
  const $clearFilterBtn = $popup.querySelector(".js-filter-content-clear");
  $clearFilterBtn?.addEventListener("click", () => {
    clearCatalogFilter($catalogFilter);

    $sidebarTabsBtns.forEach(($tabBtn) => {
      $tabBtn.classList.remove("filter-content__sidebar-btn--selected");
    });

    delete $catalogFilter.dataset.activeSaveId;
    const $activeSaveBtn = $catalogFilter.querySelector(".filter-content__sidebar-btn--save.lk-menu-link--active");
    $activeSaveBtn?.classList.remove("lk-menu-link--active");

    updateFilterGlobalCount(checkboxConfigs, $catalogFilter, $filterGlobalCount);
  });

  /* Кнопка Назад */
  const $filterBack = $popupContent.querySelector(".popup-content__filter-back");
  $filterBack.addEventListener("click", () => {
    $catalogFilter.classList.remove("filter-content--active");
    $popupContent.classList.remove("popup-content--filter-active");
  });

  function createSaveBtn(filterSave, saveCount) {
    const $saveBtn = createElem(
      "button",
      "lk-menu-link lk-menu-link--px-lg lk-menu-link--active-blue-500 filter-content__sidebar-btn filter-content__sidebar-btn--save"
    );
    $saveBtn.dataset.id = filterSave.id;
    $saveBtn.save = filterSave;

    const $saveBtnText = createElem("span", "lk-menu-link__text", { innerText: `Сборка ${$saveBtn.save.id}` });
    const $saveBtnCount = createElem("span", "count-circle count-circle--neutral-50 lk-menu-link__count", { innerText: saveCount });

    const $saveBtnDelete = createElem("span", "icon icon--lg lk-menu-link__delete lk-menu-link__delete--trash");
    $saveBtnDelete.addEventListener("click", () => {
      filterSaves = filterSaves.filter((save) => save.id !== $saveBtn.save.id);
      updateFilterStorage(filterName, filterSaves);
      delete $catalogFilter.dataset.activeSaveId;

      updateFilterSidebarSaves(filterSaves, $sidebarSectionSaves);

      $saveBtn.remove();
    });

    $saveBtn.addEventListener("click", (e) => {
      if (e.target === $saveBtnDelete) {
        return;
      }

      if ($saveBtn.classList.contains("lk-menu-link--active")) {
        delete $catalogFilter.dataset.activeSaveId;
        $saveBtn.classList.remove("lk-menu-link--active");
      } else {
        const $oldActiveSaveBtn = $catalogFilter.querySelector(".filter-content__sidebar-btn--save.lk-menu-link--active");
        $oldActiveSaveBtn?.classList.remove("lk-menu-link--active");

        $saveBtn.classList.add("lk-menu-link--active");

        updateFilterSave($saveBtn.save, $catalogFilter, checkboxConfigs);
        updateFilter($catalogFilter, checkboxConfigs, $filterGlobalCount);
        $catalogFilter.dataset.activeSaveId = $saveBtn.save.id;
        filterSaves = getFilterStorage(filterName);
      }
    });

    $saveBtn.append($saveBtnText);
    $saveBtn.append($saveBtnCount);
    $saveBtn.append($saveBtnDelete);

    return $saveBtn;
  }
});

// Функция для очистки содержимого таба
function clearCatalogFilter($box) {
  //Очистка чекбоксов
  const $categoriesCheckboxes = $box.querySelectorAll(".filter-content__checkbox .checkbox__input");
  $categoriesCheckboxes.forEach(($checkbox) => {
    $checkbox.checked = false;
  });

  //Очистка значения календаря
  const $dateInput = $box.querySelector(".filter-content__date-input");
  if ($dateInput) {
    const $dateInputField = $dateInput.querySelector(".input__field");
    $dateInputField.value = "";
    $dateInputField.pickerDefaultValue = "";
    $dateInputField.dispatchEvent(new Event("input"));

    const picker = $dateInputField.picker;
    picker.clear();
    clearPickerCells(picker);
  }
}

function updateFilter($catalogFilter, checkboxConfigs, $filterGlobalCount) {
  checkboxConfigs.forEach(({ key }) => {
    const $section = $catalogFilter.querySelector(`.filter-content__section--${key}`);
    if (!$section) {
      return;
    }
    const $checkboxesNotAll = $section.querySelectorAll(`.filter-content__checkbox .checkbox__input:not(.category__check-all)`);
    const $tabBtn = $catalogFilter.querySelector(`.filter-content__sidebar-btn[data-filter-btn-name="${key}"]`);

    // Количество выбранных чекбоксов
    const checkedCount = [...$checkboxesNotAll].reduce((accumulator, $checkbox) => {
      return $checkbox.checked ? accumulator + 1 : accumulator;
    }, 0);

    const $tabBtnCount = $tabBtn.querySelector(".count-circle");
    $tabBtnCount.innerText = checkedCount;
    if (checkedCount !== 0) {
      // Если выбрано чекбоксов 0 - скрываем кнопку крестика и счетчик выбранных чекбоксов у кнопки таба
      $tabBtn.classList.add("filter-content__sidebar-btn--selected");
    } else {
      // Иначе отображаем счетчик и кнопку очистки
      $tabBtn.classList.remove("filter-content__sidebar-btn--selected");
    }
  });

  updateFilterGlobalCount(checkboxConfigs, $catalogFilter, $filterGlobalCount);
}

/* Функция для обновления общего счетчика фильтров в заголовке */
function updateFilterGlobalCount(checkboxConfigs, $catalogFilter, $count) {
  const count = getFilterGlobalCount(checkboxConfigs, $catalogFilter);
  $count.innerText = count;
}

function getFilterGlobalCount(checkboxConfigs, $catalogFilter) {
  let count = 0;

  checkboxConfigs.forEach(({ key }) => {
    const $section = $catalogFilter.querySelector(`.filter-content__section--${key}`);
    if (!$section) {
      return;
    }

    const $checkboxesNotAll = $section.querySelectorAll(`.filter-content__checkbox .checkbox__input:not(.category__check-all)`);
    const checkedCount = [...$checkboxesNotAll].reduce((accumulator, $checkbox) => {
      return $checkbox.checked ? accumulator + 1 : accumulator;
    }, 0);
    count += checkedCount;

    const $dateInput = $section.querySelector(".filter-content__date-input");
    const $dateInputField = $dateInput?.querySelector(".input__field");
    if ($dateInputField && $dateInputField.value !== "") {
      count += 1;
    }
  });

  return count;
}

function updateFilterSave(save, $catalogFilter, checkboxConfigs) {
  checkboxConfigs.forEach(({ key }) => {
    const $section = $catalogFilter.querySelector(`.filter-content__section--${key}`);
    if (!$section) {
      return;
    }

    const $checkboxesNotAll = $section.querySelectorAll(`.filter-content__checkbox .checkbox__input:not(.category__check-all)`);
    $checkboxesNotAll.forEach(($checkbox, index) => {
      if (save && save[key]?.includes(index)) {
        $checkbox.checked = true;
      } else {
        $checkbox.checked = false;
      }
    });

    const $categoriesItems = $section.querySelectorAll(".category");
    $categoriesItems.forEach(($category) => {
      updateSelectAllState($category);
    });
  });
}

function getFilterStorage(filterName) {
  return JSON.parse(localStorage.getItem(filterName) || "[]");
}

function getFilterStorageItem(filterName, id) {
  const saves = getFilterStorage(filterName);

  return saves.find((save) => save.id === id);
}

function addFilterToStorage(filterName, save) {
  const saves = getFilterStorage(filterName);
  saves.push(save);

  localStorage.setItem(filterName, JSON.stringify(saves));
}

function updateFilterStorage(filterName, newSaves) {
  localStorage.setItem(filterName, JSON.stringify(newSaves));
}

function updateFilterStorageItem(filterName, id, save) {
  const saves = getFilterStorage(filterName);
  const index = saves.findIndex((saveItem) => saveItem.id === id);

  if (index !== -1) {
    saves[index] = save;
    localStorage.setItem(filterName, JSON.stringify(saves));
  }
}

function getFilterSaveUniqueId(filterName) {
  const saves = getFilterStorage(filterName);

  if (saves.length === 0) {
    return 1;
  }

  const maxId = Math.max(...saves.map((save) => save.id));
  return maxId + 1;
}

function saveFilter($catalogFilter, checkboxConfigs, filterName) {
  const save = generateSave($catalogFilter, checkboxConfigs, filterName);

  addFilterToStorage(filterName, save);

  return save;
}

function generateSave($catalogFilter, checkboxConfigs, filterName, defaultId) {
  const save = {
    id: defaultId || getFilterSaveUniqueId(filterName),
    categories: [],
    regions: [],
    names: [],
    statuses: [],
  };

  // Сохраняем состояния чекбоксов
  checkboxConfigs.forEach(({ key }) => {
    const $section = $catalogFilter.querySelector(`.filter-content__section--${key}`);
    if (!$section) {
      return;
    }

    const $checkboxes = $section.querySelectorAll(`.filter-content__checkbox .checkbox__input:not(.category__check-all)`);
    $checkboxes.forEach(($checkbox, index) => {
      if ($checkbox.checked) {
        save[key].push(index);
      }
    });
  });

  return save;
}

function getSaveCount(save) {
  let saveCount = 0;

  for (const key in save) {
    if (Array.isArray(save[key])) {
      saveCount += save[key].length;
    }
  }

  return saveCount;
}

function getSaveCountById(filterName, id) {
  const save = getFilterStorageItem(filterName, id);

  let saveCount = 0;
  for (const key in save) {
    if (Array.isArray(save[key])) {
      saveCount += save[key].length;
    }
  }

  return saveCount;
}

function updateFilterSidebarSaves(filterSaves, $sidebarSaves) {
  if (filterSaves.length !== 0) {
    $sidebarSaves.classList.add("filter-content__sidebar-section--active");
  } else {
    $sidebarSaves.classList.remove("filter-content__sidebar-section--active");
  }
}

function createFilterRewriteConfirmPopup({ callback }) {
  const $popup = createPopup({
    text: "Выбранный фильтр будет перезаписан? ",
    btnCancelText: "Отмена",
    btnCancelCallback: () => {
      removePopup($popup, false);
    },
    btnText: "Перезаписать ",
    btnCallback: () => {
      removePopup($popup, false);
      callback();
    },
    unlockBody: false,
  });
}

/* Ad placement steps */
const $adPlacements = document.querySelectorAll(".ad-placement");
$adPlacements.forEach(($adPlacement) => {
  let thisStep = 1;

  updatePlacementStep($adPlacement, thisStep);

  const $btns = $adPlacement.querySelectorAll(".ad-placement__btn");
  $btns.forEach(($btn) => {
    $btn.addEventListener("click", () => {
      thisStep = +$btn.dataset.showStep;
      if (thisStep) {
        updatePlacementStep($adPlacement, thisStep);
      }
    });
  });

  const $backBtn = $adPlacement.querySelector(".ad-placement__header-back");
  $backBtn.addEventListener("click", () => {
    thisStep = Math.max(thisStep - 1, 1);
    updatePlacementStep($adPlacement, thisStep);
  });
});

function updatePlacementStep($adPlacement, step) {
  const $oldActiveStep = $adPlacement.querySelector(".ad-placement__step--active");
  $oldActiveStep?.classList.remove("ad-placement__step--active");

  const $stepsItems = $adPlacement.querySelectorAll(".ad-placement__step");
  $stepsItems[step - 1].classList.add("ad-placement__step--active");

  const $backBtn = $adPlacement.querySelector(".ad-placement__header-back");
  if (step > 1) {
    $backBtn.classList.remove("ad-placement__header-back--hide");
  } else {
    $backBtn.classList.add("ad-placement__header-back--hide");
  }
}

/* Ad placement table */
const $tablePlacement = document.querySelector(".table-price--ad-placement");
if ($tablePlacement) {
  const $addBtn = document.querySelector(".js-ad-placement-table-add");
  $addBtn.addEventListener("click", () => {
    addItemToAdPlacementTable($tablePlacement);
  });

  const $deleteBtns = $tablePlacement.querySelectorAll(".table-price__delete");
  $deleteBtns.forEach(($deleteBtn) => {
    $deleteBtn.addEventListener("click", () => {
      const $tr = $deleteBtn.closest("tr");
      $tr.remove();
    });
  });
}

function addItemToAdPlacementTable($table, $originalTr) {
  const $tbody = $tablePlacement.querySelector("tbody");

  const $tr = $originalTr ? $originalTr.cloneNode(true) : $table.querySelector(".table-price__prototype").cloneNode(true);
  $tr.classList.remove("table-price__prototype");

  const $allRows = $table.querySelectorAll("tbody tr:not(.table-price__prototype)");
  const allRowsNums = [...$allRows].map(($row) => {
    return +$row.querySelector(".table-price__row-num").innerText;
  });

  const maxRowsNum = Math.max(...allRowsNums, 0);
  const $trRowNums = $tr.querySelectorAll(".table-price__row-num");
  $trRowNums.forEach(($trRowNum) => ($trRowNum.innerText = maxRowsNum + 1));

  if ($originalTr) {
    $originalTr.after($tr);
  } else {
    $tbody.append($tr);
  }

  const $group = $tr.querySelector(".table-price__select-group");
  const $groupSelect = $group.querySelector(".select-group__select");
  const $groupSelectField = $groupSelect.querySelector(".input__field");
  const $categoriesPopup = document.querySelector('.popup[data-popup-name="categories"]');
  $groupSelectField.addEventListener("click", () => {
    $groupSelect.classList.remove("input--error");
    openPopup($categoriesPopup);
    selectGroupFieldHandler($group);
  });

  const $form = $tr.closest(".js-form");
  const $groupSelectFirstInput = $tr.querySelector(".select-group .input.select-group__item");
  addAllHandlersToInputArea($groupSelectFirstInput, $form);

  const $inputCount = $tr.querySelector(".table-price__input--count");
  const $inputCountField = $inputCount.querySelector(".input__field");
  $inputCountField.dataset.validate = "empty";
  $inputCountField.dataset.mask = "int";
  addAllHandlersToInput($inputCount, $form);
  imaskInputHandler($inputCountField);

  const $inputPriceOne = $tr.querySelector(".table-price__input--price-one");
  const $inputPriceOneField = $inputPriceOne.querySelector(".input__field");
  $inputPriceOneField.dataset.mask = "num";
  addAllHandlersToInput($inputPriceOne, $form);
  imaskInputHandler($inputPriceOneField);

  const $groupSelectFirstInputField = $groupSelectFirstInput.querySelector(".input__field");
  $groupSelectFirstInputField.dataset.validate = "empty";

  const $selectGroup = $tr.querySelector(".select-group");
  $selectGroup.classList.remove("select-group--chosen");
  const $addBtn = $selectGroup.querySelector(".select-group__add");
  $addBtn.addEventListener("click", () => {
    if ($groupSelectField.value !== "") {
      addItemToAdPlacementTable($tablePlacement, $tr);
      updateAdPlacementTableRowsNums($tablePlacement);
    }
  });

  const $deleteBtn = $tr.querySelector(".table-price__delete");
  $deleteBtn.addEventListener("click", () => $tr.remove());

  return $tr;
}

function updateAdPlacementTableRowsNums($tablePlacement) {
  const $trs = $tablePlacement.querySelectorAll("tbody tr:not(.table-price__prototype)");
  $trs.forEach(($tr, index) => {
    const $rowNums = $tr.querySelectorAll(".table-price__row-num");
    $rowNums.forEach(($rowNum) => ($rowNum.innerText = index + 1));
  });
}

/* Select group */
const $selectGroups = document.querySelectorAll(".select-group");
$selectGroups.forEach(($selectGroup) => {
  const $addBtn = $selectGroup.querySelector(".select-group__add");
  const $tr = $selectGroup.closest("tr");
  const $field = $selectGroup.querySelector(".select-group__select .input__field");
  $field?.addEventListener("click", () => selectGroupFieldHandler($selectGroup));

  if ($field.value !== "") {
    $addBtn.classList.add("select-group__add--active");
  }

  $addBtn.addEventListener("click", () => {
    if ($field.value !== "") {
      addItemToAdPlacementTable($tablePlacement, $tr);
      updateAdPlacementTableRowsNums($tablePlacement);
    }
  });
});

const $updateSelectGroupFieldBtns = document.querySelectorAll(".js-update-select-group-field");
$updateSelectGroupFieldBtns.forEach(($btn) => {
  $btn.addEventListener("click", () => {
    const value = $btn.dataset.inputValue;
    const $chosenGroup = document.querySelector(".select-group--chosen");
    const $field = $chosenGroup.querySelector(".select-group__select .input__field");
    $field.value = value;

    const $addBtn = $chosenGroup.querySelector(".select-group__add");
    if ($field.value !== "") {
      $addBtn.classList.add("select-group__add--active");
    }
  });
});

function selectGroupFieldHandler($selectGroup) {
  const $oldChosenGroup = document.querySelector(".select-group--chosen");
  $oldChosenGroup?.classList.remove("select-group--chosen");

  $selectGroup.classList.add("select-group--chosen");
}

function selectGroupAddBtnHandler($selectGroup) {
  const $list = $selectGroup.querySelector(".select-group__list");
  const $form = $list.closest(".js-form");
  const $input = createInputArea({
    className: "select-group__item",
    fieldSize: "xxs",
    dataMinHeight: 32,
    dataValidate: "empty",
    placeholder: "Введите полное наименование товара",
  });
  $list.append($input);
  addAllHandlersToInputArea($input, $form);
}

function createInputArea({ className = "", fieldSize, placeholder = "", value = "", dataMinHeight, dataValidate }) {
  const $input = createElem("div", `input ${className}`);
  const $inputMain = createElem("div", "input__main");
  const $inputField = createElem("textarea", "input__field input__field--xxs input__field--area", {
    placeholder,
    value,
  });
  if (fieldSize) {
    $inputField.classList.add(`input__field--${fieldSize}`);
  }
  if (dataMinHeight) {
    $inputField.dataset.minHeight = dataMinHeight;
  }
  if (dataValidate) {
    $inputField.dataset.validate = dataValidate;
  }

  const $error = createElem("span", "text text--4xs text--lh-125 input__error");

  $inputMain.append($inputField);

  $input.append($inputMain);
  $input.append($error);

  return $input;
}

function createFilterTag(text, className = "", type) {
  const $filterTag = createElem("div", `filter-tag ${className}`);
  if (type) {
    $filterTag.classList.add(`filter-tag--${type}`);
  }

  const $text = createElem("span", "text text--4xs filter-tag__text", {
    innerText: text,
  });
  const $delete = createElem("button", "filter-tag__delete");
  $delete.setAttribute("type", "button");

  $delete.addEventListener(
    "click",
    () => {
      $filterTag.remove();
    },
    { once: true }
  );

  $filterTag.append($text);
  $filterTag.append($delete);

  return $filterTag;
}

const $lkUserImgFiles = document.querySelectorAll(".js-crop-img");
$lkUserImgFiles.forEach(($file) => {
  $file.addEventListener("change", () => {
    const file = $file.files[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      const $img = createElem("img", "");
      $img.src = url;

      const cropper = new Cropper($img, {
        viewMode: 2,
        aspectRatio: 1 / 1,
      });

      const $popup = createPopup({
        title: "Фото профиля",
        btnCancelText: "Отменить",
        btnCancelCallback: () => {
          setTimeout(() => cropper.destroy(), 600);
          removePopup($popup);
          $file.value = "";
        },
        btnCancelSize: "xxs",
        btnText: "Сохранить",
        btnCallback: () => {
          setTimeout(() => cropper.destroy(), 600);
          removePopup($popup);
          $file.value = "";

          const canvas = cropper.getCroppedCanvas({
            width: 200,
            height: 200,
          });

          // Преобразование canvas в Data URL (Base64)
          const canvasBase64 = canvas.toDataURL("image/png");
          console.log(canvasBase64);
        },
        btnSize: "xxs",
        link: "Восстановить",
        linkCallback: () => {
          cropper.reset();
        },
        $cropperImg: $img,
        mobileFull: true,
        closeCallback: () => {
          setTimeout(() => cropper.destroy(), 600);
          removePopup($popup);
          $file.value = "";
        },
      });
    }
  });
});

/* Adverts */
const $adverts = document.querySelectorAll(".advert");
$adverts.forEach(($advert) => {
  const $bookmarkBtn = $advert.querySelector(".advert__options-btn--bookmark");
  $bookmarkBtn?.addEventListener("click", () => {
    if ($bookmarkBtn.classList.contains("advert__options-btn--active")) {
      $bookmarkBtn.classList.remove("advert__options-btn--active");
    } else {
      $bookmarkBtn.classList.add("advert__options-btn--active");
    }
  });
});
