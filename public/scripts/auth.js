const errors = {
  lengthForLogin: "Минимальная длина ника - 4 символа, а максимальная - 12.",
  lengthForPass: "Минимальная длина пароля - 8 символов, а максимальная - 15.",
  lettersForLogin:
    "Разрешены только символы латиницы, кириллицы, знаки дефиса и нижнего подчеркивания.",
};

const form = document.querySelector("form");
const loginInput = document.getElementById("login");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");
const passwordError = document.getElementById("passwordError");
const button = document.querySelector("button");

function checkLogin(login) {
  if (!/^[A-Za-zА-Яа-яёЁ\-_]+$/.test(login)) {
    loginInput.classList.add("inputFail");
    loginError.innerText = errors.lettersForLogin;
    loginError.classList.add("error-Visible");
    return false;
  }
  if (login.length < 4 || login.length > 12) {
    loginInput.classList.add("inputFail");
    loginError.innerText = errors.lengthForLogin;
    loginError.classList.add("error-Visible");
    return false;
  }

  return true;
}

function checkPass(pass) {
  if (pass.length < 8 || pass.length > 15) {
    passwordInput.classList.add("inputFail");
    passwordError.innerText = errors.lengthForPass;
    passwordError.classList.add("error-Visible");
    return false;
  }

  return true;
}

function testValues(login, password) {
  let isValid = true;
  if (!checkLogin(login)) isValid = false;
  if (!checkPass(password)) isValid = false;
  return isValid;
}

function success() {
  loginError.innerText = 0;
  passwordError.innerText = 0;
  loginInput.classList.remove("inputFail");
  passwordInput.classList.remove("inputFail");
  passwordError.classList.remove("error-Visible");
  loginError.classList.remove("error-Visible");
}

async function auth(e) {
  e.preventDefault();
  const path = form.id;

  const login = loginInput.value;
  const password = passwordInput.value;
  success();
  if (!testValues(login, password)) return;
  button.innerHTML = `<div class="spinner-block">
            <div class="spinner spinner-1"></div>
          </div>`;
  form.removeEventListener("submit", auth);

  try {
    const response = await fetch(`/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password }),
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = "http://localhost:3000/index";
    } else {
      for (const err in data.message) {
        alert(data.message[err]);
      }
    }
  } catch (error) {
    console.error(error);
    alert("Ошибка");
  } finally {
    form.addEventListener("submit", auth);
    button.innerHTML = "Отправить";
  }
}

form.addEventListener("submit", (e) => e.preventDefault());
form.addEventListener("submit", auth);
