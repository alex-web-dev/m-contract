const $confirmInputs = document.querySelectorAll(".input--confirm");
$confirmInputs.forEach(($input) => {
  const $field = $input.querySelector(".input__field");
  const $confirmBtn = $input.querySelector(".input__confirm-btn");
  const confirmName = $input.dataset.confirmName;
  const $popup = document.querySelector(`.popup[data-popup-name="${confirmName}"]`);

  $confirmBtn.addEventListener("click", () => {
    if ($input.classList.contains("input--validated") && $input.classList.contains('NEW_CLASS')) {
      openPopup($popup);
      $input.dataset.confirmedValue = $field.value;
    }
  });
});

document.addEventListener("formSuccess", (e) => {
  const $form = e.detail.form;
  if (!$form.dataset.confirmName) {
    return;
  }

  const $confirmedInput = document.querySelector(`.input[data-confirm-name="${$form.dataset.confirmName}"]`);
  if (!$confirmedInput) {
    return;
  }
  
  $confirmedInput.classList.remove("input--error");
  $confirmedInput.classList.add("input--confirmed");

  const $formPopup = $form.closest(".popup");
  closePopup($formPopup);
});