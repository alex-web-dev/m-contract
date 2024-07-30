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
  Scrollbar.init($scrollbarElem, {
    damping: 0.1,
    alwaysShowTracks: false,
    continuousScrolling,
  });
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
if ($messages) {
  const $messagesDialogBox = $messages.querySelector(".messages__dialog-box");
  const $messagesDialog = $messages.querySelector(".messages__dialog");
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
$inputs.forEach(($input) => {
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
});

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

/* IMask js */
const $imaskInputs = document.querySelectorAll(".js-imask");
$imaskInputs.forEach(($input) => {
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
  } else if (mask === "date") {
    IMask($input, {
      mask: Date,
      pattern: "d{.}m{.}Y",
      blocks: {
        d: {
          mask: IMask.MaskedRange,
          from: 1,
          to: 31,
          maxLength: 2,
        },
        m: {
          mask: IMask.MaskedRange,
          from: 1,
          to: 12,
          maxLength: 2,
        },
        Y: {
          mask: IMask.MaskedRange,
          from: 1900,
          to: 9999,
        },
      },
      format: function (date) {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return [day < 10 ? "0" + day : day, month < 10 ? "0" + month : month, year].join(".");
      },
      parse: function (str) {
        const dayMonthYear = str.split(".");
        return new Date(dayMonthYear[2], dayMonthYear[1] - 1, dayMonthYear[0]);
      },
      autofix: true,
    });
  } else {
    IMask($input, { mask });
  }
});

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
    let itemInnerHTML = `<span class="simple-select__item-value">${$option.innerText}</span>`;
    if ($option.dataset.text) {
      itemInnerHTML += `<span class="simple-select__item-text">${$option.dataset.text}</span>`;
    }
    const $item = createElem("div", ITEM_CLASS, {
      innerHTML: itemInnerHTML,
    });

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

      $selectField.dispatchEvent(new Event('change'));
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

        $selectField.dispatchEvent(new Event('change'));
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

  const $select = e.target.closest(`.select`);
  if (!$select) {
    return;
  }

  const $activeSelects = document.querySelectorAll(".select");
  $activeSelects.forEach(($activeSelect) => {
    if ($activeSelect !== $select) {
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
  $inputs.forEach(($input) => {
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
  });

  const $simpleSelects = $form.querySelectorAll(".simple-select");
  $simpleSelects.forEach(($simpleSelect) => {
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
  });

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

  $searchField.addEventListener("input", () => {
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

  document.addEventListener("click", (event) => {
    if (event.target.matches(".category__checkbox--all .checkbox__input")) {
      const $checkbox = event.target;
      const $category = $checkbox.closest(".category");
      toggleAllCheckboxes($category, $checkbox.checked);
    }
  });
});

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

/* lk sidebar */
const $lkSidebar = document.querySelector(".lk-sidebar");
if ($lkSidebar) {
  const $openBtns = document.querySelectorAll(".js-open-lk-sidebar");
  $openBtns.forEach(($btn) =>
    $btn.addEventListener("click", () => {
      if (window.innerWidth <= 991) {
        openLKSidebar($lkSidebar);
      }
    })
  );

  const $closeBtns = document.querySelectorAll(".js-close-lk-sidebar");
  $closeBtns.forEach(($btn) => $btn.addEventListener("click", () => closeLKSidebar($lkSidebar)));

  window.addEventListener("click", (e) => {
    if (window.innerWidth <= 991 && e.target === $lkSidebar) {
      closeLKSidebar($lkSidebar);
    }
  });
}

function openLKSidebar($lkSidebar) {
  $lkSidebar.classList.add("lk-sidebar--active");
  if (!isLockedBody()) {
    lockBody("lk-sidebar");
  }
}

function closeLKSidebar($lkSidebar) {
  $lkSidebar.classList.remove("lk-sidebar--active");

  if (isLockedBody() && getLockedBodyBy() === "lk-sidebar") {
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
tippy("[data-tippy-content]");

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
const $offerTabsBtns = document.querySelectorAll(".offer-main__tabs .tabs-btns__btn");
const $offerTabsHeaderBtn = document.querySelector(".offer-main__tabs-header-btn");
$offerTabsBtns.forEach(($btn, index) => {
  $btn.addEventListener("click", () => {
    if (index === 1) {
      $offerTabsHeaderBtn.classList.add("offer-main__tabs-header-btn--show");
    } else {
      $offerTabsHeaderBtn.classList.remove("offer-main__tabs-header-btn--show");
    }
  });
});

const $offerMainFiles = document.querySelector(".offer-main__files");
if ($offerMainFiles) {
  const $offerTabsHeaderBtnFileField = $offerTabsHeaderBtn.querySelector(".btn__file-field");
  $offerTabsHeaderBtnFileField?.addEventListener("change", () => {
    const file = $offerTabsHeaderBtnFileField.files[0];
    if (file) {
      const $offerFile = createOfferFile(file.name);
      $offerMainFiles.append($offerFile);
    }
  });

  const $offerMainFilesItems = document.querySelectorAll(".offer-main__file");
  $offerMainFilesItems.forEach(($offerMainFile) => {
    const $delete = $offerMainFile.querySelector(".file__delete");
    $delete?.addEventListener(
      "click",
      () => {
        $offerMainFile.remove();
      },
      { once: true }
    );
  });
}

function createOfferFile(name) {
  const $offerFile = createElem("div", "file file--success offer-main__file", {
    innerHTML: `<a class="file__name" href="#">${name}</a>`,
  });

  const $delete = createElem("button", "file__delete");
  $delete.addEventListener(
    "click",
    () => {
      $offerFile.remove();
    },
    { once: true }
  );

  $offerFile.append($delete);

  return $offerFile;
}

/* Datepicker */
const pickerMinYear = 2000;
const pickerMaxYear = new Date().getFullYear() + 5;
const pickerOffsetTop = 8;
const $datepickerInputs = document.querySelectorAll("[data-datepicker]");

$datepickerInputs.forEach(($datepickerInput) => {
  const datepickerInputAdditionTimeText = $datepickerInput.dataset.datepickerAdditionTimeText;
  let datepickerInputDefaultValue = $datepickerInput.value;
  const range = $datepickerInput.dataset.datepickerRange !== undefined;
  const picker = new AirDatepicker($datepickerInput, {
    inline: true,
    showOtherMonths: false,
    selectOtherMonths: false,
    selectedDates: [new Date()],
    minDate: new Date(pickerMinYear, 0, 1),
    maxDate: new Date(pickerMaxYear, 11, 31),
    dateFormat: "dd.MM.yyyy",
    timeFormat: "HH:mm",
    timepicker: true,
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
        className: "btn btn--gray-100 btn--text-xs",
        attrs: {
          type: "button",
        },
        onClick: () => {
          if (picker.opts.inline) {
            picker.$datepicker.classList.remove("air-datepicker--show");
          } else {
            picker.hide();
          }
        },
      },
      {
        content: "Выбрать",
        className: "btn btn--blue-500 btn--text-xs",
        attrs: {
          type: "button",
        },
        onClick: () => {
          const $timeInput = picker.$datepicker.querySelector('.datepicker-time__field');
          const selectedDates = picker.selectedDates;
          const [hours, minutes] = $timeInput.value.split(":").map(Number);
          const roundedMinutes = Math.round(minutes / 5) * 5;
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

          datepickerInputDefaultValue = $datepickerInput.value;

          if (picker.opts.inline) {
            picker.$datepicker.classList.remove("air-datepicker--show");
          } else {
            picker.hide();
          }
        },
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
    onSelect: () => {
      $datepickerInput.value = datepickerInputDefaultValue;
    },
  });

  setTimeout(() => (picker.$el.value = datepickerInputDefaultValue));

  if (picker.opts.inline) {
    renderDatePicker({
      picker,
      minYear: pickerMinYear,
      maxYear: pickerMaxYear,
    });
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
    const $timeInput = picker.$datepicker.querySelector('.datepicker-time__field');
    $timeInput?.blur();

    if (!e.target.closest(".datepicker-time")) {
      e.preventDefault();
    }
  });
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
  const $timeType = createElem("span", "text text--neutral-400 text--3xs datepicker-time__type", {
    innerText: "мск",
  });

  const thisHours = String(picker.timepicker.hours).padStart(2, "0");
  const thisMinutes = String(picker.timepicker.minutes).padStart(2, "0");
  const thisMinutesRounded = Math.round(thisMinutes / 5) * 5;

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
