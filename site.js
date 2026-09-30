/**
 * Posts each enquiry to the Cloudflare Worker, which emails
 * travis_gm@live.co.uk. FormSubmit was returning a server error, so the
 * page no longer posts there.
 */
const ENQUIRY_URL = "https://enquiry.travis-gm.workers.dev/";

const form = document.querySelector("#enquiry");
const thanks = document.querySelector("#thanks");
const status = document.querySelector("#form-status");
const submitButton = form.querySelector('[type="submit"]');

const fields = {
  name: {
    input: form.elements.name,
    error: document.querySelector("#name-error"),
    validate(value) {
      if (value.trim().length < 2) return "Please add your name.";
      return "";
    },
  },
  contact: {
    input: form.elements.contact,
    error: document.querySelector("#contact-error"),
    validate(value) {
      const text = value.trim();
      const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
      const digits = text.replace(/\D/g, "");
      if (!hasEmail && digits.length < 7) {
        return "Add a phone number or email so we can contact you.";
      }
      return "";
    },
  },
  message: {
    input: form.elements.message,
    error: document.querySelector("#message-error"),
    validate(value) {
      if (value.trim().length < 20) {
        return "Add a few more words about what happened.";
      }
      return "";
    },
  },
};

function setFieldError(field, message) {
  field.error.hidden = !message;
  field.error.textContent = message;
  field.input.setAttribute("aria-invalid", message ? "true" : "false");
  field.input.closest(".field").classList.toggle("is-invalid", Boolean(message));
}

function validate() {
  let valid = true;
  Object.values(fields).forEach((field) => {
    const message = field.validate(field.input.value);
    setFieldError(field, message);
    if (message) valid = false;
  });
  return valid;
}

Object.values(fields).forEach((field) => {
  field.input.addEventListener("input", () => {
    if (field.input.getAttribute("aria-invalid") === "true") {
      setFieldError(field, field.validate(field.input.value));
    }
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.textContent = "";

  if (form.elements._honey.value) {
    form.hidden = true;
    thanks.hidden = false;
    return;
  }

  if (!validate()) {
    status.textContent = "Check the fields above, then send it again.";
    return;
  }

  const contact = fields.contact.input.value.trim();
  const payload = {
    name: fields.name.input.value.trim(),
    contact,
    message: fields.message.input.value.trim(),
  };

  submitButton.disabled = true;
  submitButton.textContent = "Sending…";

  try {
    const response = await fetch(ENQUIRY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Request failed");

    form.hidden = true;
    thanks.hidden = false;
    thanks.focus?.();
  } catch {
    status.textContent =
      "That didn't send. Check your connection and try again in a moment.";
    submitButton.disabled = false;
    submitButton.textContent = "Send";
  }
});
