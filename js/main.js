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

function lockBody(absoluteElems) {
  const scrollbarWidthPX = `${getScrollbarWidth()}px`;

  document.body.classList.add("body--lock");
  document.body.style.paddingRight = scrollbarWidthPX;

  const $absoluteElems = document.querySelectorAll(absoluteElems);
  $absoluteElems.forEach(($elem) => ($elem.style.paddingRight = scrollbarWidthPX));
}

function unlockBody(absoluteElems) {
  document.body.classList.remove("body--lock");
  document.body.style.paddingRight = "";

  const $absoluteElems = document.querySelectorAll(absoluteElems);
  $absoluteElems.forEach(($elem) => ($elem.style.paddingRight = ""));
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

/* Form */
const $forms = document.querySelectorAll(".js-form");
$forms.forEach(($form) => {
  $form.addEventListener("submit", (e) => {
    e.preventDefault();

    let isError = false;
    const $inputs = $form.querySelectorAll(".input");
    $inputs.forEach(($input) => {
      if (
        !validateItem({
          $item: $input,
          itemErrorClass: "input--error",
          fieldClass: "input__field",
          errorLabelClass: "input__error",
        })
      ) {
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

    if (isError) {
    } else {
      // const formData = new FormData($form);

      clearInputs($inputs);
      clearSelects($selects);
    }
  });

  const $inputs = $form.querySelectorAll(".input");
  $inputs.forEach(($input) => {
    const $field = $input.querySelector(".input__field");
    $field.addEventListener("focus", () => {
      $input.classList.remove("input--error");
    });
  });

  const $simpleSelects = $form.querySelectorAll(".simple-select");
  $simpleSelects.forEach(($simpleSelect) => {
    const $select = $simpleSelect.closest(".select");
    const $field = $simpleSelect.querySelector(".simple-select__field");
    $field.addEventListener("click", () => {
      $select.classList.remove("select--error");
    });
  });
});

function validateItem({ $item, itemErrorClass, fieldClass, errorLabelClass }) {
  const $field = $item.querySelector(`.${fieldClass}`);
  const $error = $item.querySelector(`.${errorLabelClass}`);
  const validateType = $field.dataset.validate;

  if (validateType !== undefined && !validateEmpty($field)) {
    $item.classList.add(itemErrorClass);
    $error.innerText = `Error`;
    return false;
  }

  if (validateType === "phone" && !validatePhone($field)) {
    $item.classList.add(itemErrorClass);
    $error.innerText = `Error`;
    return false;
  }

  return true;
}

function validateEmpty($field) {
  if ($field.value.length < 1) {
    return false;
  }

  return true;
}

function validatePhone($field) {
  if (!/(?:\+|\d)[\d\-\(\) ]{16,}\d/g.test($field.value)) {
    return false;
  }

  return true;
}

function clearInputs($inputs) {
  $inputs.forEach(($input) => {
    const $field = $input.querySelector(".input__field");
    $field.value = "";
  });
}

function clearSelects($selects) {
  $selects.forEach(($select) => {
    const $field = $select.querySelector(".select__field");
    $field.selectedIndex = 0;

    const $simpleSelectField = $select.querySelector(".simple-select__field");
    const $firstItem = $select.querySelector('.simple-select__item[data-select-index="0"');
    $simpleSelectField.innerText = $firstItem.innerText;
    if ($field.options[0].value === "") {
      $simpleSelectField.classList.add("simple-select__field--placeholder");
    }

    const $hoverItem = $select.querySelector(".simple-select__item--hover");
    $hoverItem?.classList.remove("simple-select__item--hover");
  });
}

/* IMask js */
const $inputs = document.querySelectorAll(".js-imask");
$inputs.forEach(($input) => {
  const mask = $input.dataset.mask;
  IMask($input, { mask });
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
  const $oldActiveBtn = document.querySelector(`.tabs-btns[data-tabs-name="${name}"] > .tabs-btns__btn--active`);
  const $oldActiveTab = document.querySelector(`.tabs-list[data-tabs-name="${name}"] > .tabs-list__item--active`);
  const $newActiveBtn = document.querySelectorAll(`.tabs-btns[data-tabs-name="${name}"] > .tabs-btns__btn`)[index];
  const $newActiveTab = document.querySelectorAll(`.tabs-list[data-tabs-name="${name}"] > .tabs-list__item`)[index];

  $oldActiveTab.classList.remove("tabs-list__item--active");
  $oldActiveBtn.classList.remove("tabs-btns__btn--active");

  $newActiveBtn.classList.add("tabs-btns__btn--active");
  $newActiveTab.classList.add("tabs-list__item--active");
}

/* Features */
const $featuresItems = document.querySelectorAll(".feature-item");
$featuresItems.forEach(($feature, index) => {
  const delay = 500;
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
    }, delay);
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
      }, delay);
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
    });
  });

  stepsScrollHandler();
  scrollbar.addListener(stepsScrollHandler);

  function stepsScrollHandler() {
    const containerHeight = $stepsListBox.clientHeight;
    const scrollTop = scrollbar.offset.y;

    $items.forEach(function (item) {
      const offsetTop = item.offsetTop;

      const distanceFromTop = offsetTop - scrollTop;
      let opacity = 1 - (distanceFromTop / containerHeight) * 1.06;
      opacity = Math.max(0, Math.min(1, opacity));

      item.style.opacity = opacity.toFixed(2);
    });
  }
});
