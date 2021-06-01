const { profile } = require("../../dashboard");

/*==================== SHOW NAVBAR ====================*/
const showMenu = (headerToggle, navbarId) => {
  const toggleBtn = document.getElementById(headerToggle),
    nav = document.getElementById(navbarId);

  // Validate that variables exist
  if (headerToggle && navbarId) {
    toggleBtn.addEventListener("click", () => {
      // We add the show-menu class to the div tag with the nav__menu class
      nav.classList.toggle("show-menu");
      // change icon
      toggleBtn.classList.toggle("bx-x");
    });
  }
};
showMenu("header-toggle", "navbar");

/*==================== LINK ACTIVE ====================*/
const linkColor = document.querySelectorAll(".nav__link");

function colorLink() {
  linkColor.forEach(l => l.classList.remove("active"));
  this.classList.add("active");
}

linkColor.forEach(l => l.addEventListener("click", colorLink));

/* Profile UPdate */
const profileUpdateButton = document.getElementById("update-profile");
const profileDiscardButton = document.getElementById("discard-profile-changes");

profileUpdateButton.addEventListener("click", async () => {
  await fetch("/", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "GET",
  });
});

profileDiscardButton.addEventListener("click", async () => {
  const firstName = getElementById("profile-firstName").value;
  const lastName = getElementById("profile-lastName").value;
  const email = getElementById("eMail").value;
  const phoneNumber = getElementById("phone").value;
  const street = getElementById("Street").value;
  const city = getElementById("cIty").value;
  const state = getElementById("sTate").value;
  const zipCode = getElementById("zIp").value;
  await fetch("/profile", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      phoneNumber,
      address: { street, city, state, zipCode },
    }),
  });
});
