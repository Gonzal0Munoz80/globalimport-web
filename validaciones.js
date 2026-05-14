const form = document.querySelector('.registro-form');
const successPanel = document.getElementById('registro-success');
const successMessage = document.getElementById('success-message');
const referencia = document.getElementById('referencia');
const referenciaCounter = document.getElementById('referencia-counter');

const fieldMap = {
  nombre: document.getElementById('nombre'),
  nacimiento: document.getElementById('nacimiento'),
  documento: document.getElementById('documento'),
  genero: document.getElementById('genero'),
  nacionalidad: document.getElementById('nacionalidad'),
  email: document.getElementById('email'),
  confirmarEmail: document.getElementById('confirmar-email'),
  password: document.getElementById('password'),
  confirmarPassword: document.getElementById('confirmar-password'),
  telefono: document.getElementById('telefono'),
  paisEntrega: document.getElementById('pais-entrega'),
  provincia: document.getElementById('provincia'),
  ciudad: document.getElementById('ciudad'),
  calle: document.getElementById('calle'),
  codigoPostal: document.getElementById('codigo-postal'),
  referencia,
  interes: Array.from(document.querySelectorAll('input[name="interes"]')),
  tipoCliente: Array.from(document.querySelectorAll('input[name="tipo-cliente"]')),
  terminos: document.querySelector('input[name="terminos"]'),
  privacidad: document.querySelector('input[name="privacidad"]')
};

const patterns = {
  nombre: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{3,60}$/, 
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/, 
  telefono: /^[\d+\-\s]{8,}$/,
  ciudad: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{2,}$/, 
  codigoPostal: /^[A-Za-z0-9\s]{4,10}$/
};

function normalizeRut(value) {
  return value.toString().replace(/[^0-9kK]/g, '').toUpperCase();
}

function validateRut(rut) {
  const clean = normalizeRut(rut);
  if (!/^[0-9]{7,8}[0-9K]$/.test(clean)) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const rest = 11 - (sum % 11);
  const expected = rest === 11 ? '0' : rest === 10 ? 'K' : String(rest);
  return expected === dv;
}

function insertError(element, message) {
  clearError(element);
  element.classList.add('campo-error');
  element.classList.remove('campo-ok');
  const errorText = document.createElement('p');
  errorText.className = 'error-message';
  errorText.textContent = message;
  if (element.parentElement) {
    element.parentElement.appendChild(errorText);
  }
}

function clearError(element) {
  element.classList.remove('campo-error');
  element.classList.remove('campo-ok');
  const parent = element.parentElement;
  if (!parent) return;
  const existing = parent.querySelector('.error-message');
  if (existing) existing.remove();
}

function markValid(element) {
  element.classList.remove('campo-error');
  element.classList.add('campo-ok');
  clearError(element);
}

function getSelectedValue(group) {
  return group.some(input => input.checked);
}

function showGroupError(group, message) {
  const container = group[0].closest('.form-card') || group[0].closest('.form-section');
  if (!container) return;
  let errorText = container.querySelector('.error-message');
  if (!errorText) {
    errorText = document.createElement('p');
    errorText.className = 'error-message';
    container.appendChild(errorText);
  }
  errorText.textContent = message;
}

function clearGroupError(group) {
  const container = group[0]?.closest('.form-card') || group[0]?.closest('.form-section');
  if (!container) return;
  const existing = container.querySelector('.error-message');
  if (existing) existing.remove();
}

function updateReferenciaCounter() {
  const length = referencia.value.length;
  referenciaCounter.textContent = `${length} / 200 caracteres`;
  if (length > 200) {
    referencia.classList.add('campo-error');
    showGroupError([referencia], 'La referencia no puede superar 200 caracteres.');
  } else {
    referencia.classList.remove('campo-error');
    clearGroupError([referencia]);
  }
}

function validateField(fieldName) {
  const field = fieldMap[fieldName];
  if (!field) return true;
  const value = field.value.trim();

  if (fieldName === 'nombre') {
    if (!value) {
      insertError(field, 'El nombre no puede quedar vacío.');
      return false;
    }
    if (!patterns.nombre.test(value)) {
      insertError(field, 'El nombre debe tener solo letras y espacios (3-60 caracteres).');
      return false;
    }
    markValid(field);
    return true;
  }

  if (fieldName === 'nacimiento') {
    if (!value) {
      insertError(field, 'Debes seleccionar tu fecha de nacimiento.');
      return false;
    }
    const birthDate = new Date(value);
    const now = new Date();
    const diff = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
    if (birthDate > diff) {
      insertError(field, 'Debes ser mayor de 18 años para registrarte.');
      return false;
    }
    markValid(field);
    return true;
  }

  if (fieldName === 'documento') {
    if (!value) {
      insertError(field, 'El RUT no puede quedar vacío.');
      return false;
    }
    if (!validateRut(value)) {
      insertError(field, 'El RUT debe ser válido y contener 7 u 8 dígitos más dígito verificador.');
      return false;
    }
    markValid(field);
    return true;
  }

  if (fieldName === 'genero' || fieldName === 'nacionalidad') {
    if (!value) {
      insertError(field, `Debes seleccionar una opción válida para ${fieldName === 'genero' ? 'género' : 'nacionalidad'}.`);
      return false;
    }
    markValid(field);
    return true;
  }

  if (fieldName === 'email') {
    if (!value) {
      insertError(field, 'El email no puede quedar vacío.');
      return false;
    }
    if (!patterns.email.test(value)) {
      insertError(field, 'El email no tiene un formato válido.');
      return false;
    }
    markValid(field);
    return true;
  }

  if (fieldName === 'confirmarEmail') {
    const emailValue = fieldMap.email.value.trim();
    if (!value) {
      insertError(field, 'Debes confirmar tu correo.');
      return false;
    }
    if (value !== emailValue) {
      insertError(field, 'Los correos electrónicos no coinciden.');
      return false;
    }
    markValid(field);
    return true;
  }

  if (fieldName === 'password') {
    if (!value) {
      insertError(field, 'La contraseña no puede quedar vacía.');
      return false;
    }
    if (!patterns.password.test(value)) {
      insertError(field, 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.');
      return false;
    }
    markValid(field);
    return true;
  }

  if (fieldName === 'confirmarPassword') {
    const passwordValue = fieldMap.password.value;
    if (!value) {
      insertError(field, 'Debes confirmar la contraseña.');
      return false;
    }
    if (value !== passwordValue) {
      insertError(field, 'Las contraseñas no coinciden.');
      return false;
    }
    markValid(field);
    return true;
  }

  if (fieldName === 'telefono') {
    if (!value) {
      insertError(field, 'El teléfono no puede quedar vacío.');
      return false;
    }
    if (!patterns.telefono.test(value)) {
      insertError(field, 'El teléfono solo puede contener dígitos, +, -, espacios y al menos 8 caracteres.');
      return false;
    }
    const digits = value.replace(/\D/g, '');
    if (digits.length < 8) {
      insertError(field, 'El teléfono debe tener al menos 8 dígitos numéricos.');
      return false;
    }
    markValid(field);
    return true;
  }

  if (fieldName === 'paisEntrega' || fieldName === 'provincia') {
    if (!value) {
      insertError(field, 'Este campo no puede quedar vacío.');
      return false;
    }
    markValid(field);
    return true;
  }

  if (fieldName === 'ciudad') {
    if (!value) {
      insertError(field, 'La ciudad no puede quedar vacía.');
      return false;
    }
    if (!patterns.ciudad.test(value)) {
      insertError(field, 'La ciudad solo puede contener letras y espacios.');
      return false;
    }
    markValid(field);
    return true;
  }

  if (fieldName === 'calle') {
    if (!value) {
      insertError(field, 'La calle y número no pueden quedar vacíos.');
      return false;
    }
    if (value.length < 5) {
      insertError(field, 'La calle y número deben tener al menos 5 caracteres.');
      return false;
    }
    markValid(field);
    return true;
  }

  if (fieldName === 'codigoPostal') {
    if (!value) {
      insertError(field, 'El código postal no puede quedar vacío.');
      return false;
    }
    if (!patterns.codigoPostal.test(value)) {
      insertError(field, 'El código postal debe ser alfanumérico y tener entre 4 y 10 caracteres.');
      return false;
    }
    markValid(field);
    return true;
  }

  if (fieldName === 'referencia') {
    if (value.length > 200) {
      insertError(field, 'La referencia no puede superar los 200 caracteres.');
      return false;
    }
    if (value.length > 0) {
      markValid(field);
    } else {
      clearError(field);
    }
    return true;
  }

  return true;
}

function validateCheckboxGroup() {
  if (!getSelectedValue(fieldMap.interes)) {
    showGroupError(fieldMap.interes, 'Debes seleccionar al menos una categoría de interés.');
    return false;
  }
  clearGroupError(fieldMap.interes);
  return true;
}

function validateRadioGroup() {
  if (!getSelectedValue(fieldMap.tipoCliente)) {
    showGroupError(fieldMap.tipoCliente, 'Debes seleccionar un tipo de cliente.');
    return false;
  }
  clearGroupError(fieldMap.tipoCliente);
  return true;
}

function validateTerms() {
  let valid = true;
  if (!fieldMap.terminos.checked) {
    insertError(fieldMap.terminos, 'Debes aceptar los Términos y Condiciones.');
    valid = false;
  } else {
    clearError(fieldMap.terminos);
    markValid(fieldMap.terminos);
  }
  if (!fieldMap.privacidad.checked) {
    insertError(fieldMap.privacidad, 'Debes aceptar la Política de Privacidad.');
    valid = false;
  } else {
    clearError(fieldMap.privacidad);
    markValid(fieldMap.privacidad);
  }
  return valid;
}

function validateForm() {
  const requiredFields = [
    'nombre',
    'nacimiento',
    'documento',
    'genero',
    'nacionalidad',
    'email',
    'confirmarEmail',
    'password',
    'confirmarPassword',
    'telefono',
    'paisEntrega',
    'provincia',
    'ciudad',
    'calle',
    'codigoPostal',
    'referencia'
  ];

  const results = requiredFields.map(validateField);
  const groups = [validateCheckboxGroup(), validateRadioGroup(), validateTerms()];
  return results.every(Boolean) && groups.every(Boolean);
}

function resetFieldStyles() {
  Object.values(fieldMap).forEach((field) => {
    if (Array.isArray(field)) return;
    if (!field) return;
    field.classList.remove('campo-error', 'campo-ok');
    const error = field.parentElement?.querySelector('.error-message');
    if (error) error.remove();
  });
  const groups = [fieldMap.interes, fieldMap.tipoCliente];
  groups.forEach((group) => {
    if (!group.length) return;
    const container = group[0].closest('.form-card');
    const error = container?.querySelector('.error-message');
    if (error) error.remove();
  });
}

function showSuccess(name) {
  form.classList.add('hidden');
  successPanel.classList.remove('hidden');
  successMessage.textContent = `¡Gracias, ${name}! Tu registro se recibió correctamente.`;
}

referencia.addEventListener('input', () => {
  updateReferenciaCounter();
  validateField('referencia');
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  resetFieldStyles();
  updateReferenciaCounter();
  if (validateForm()) {
    showSuccess(fieldMap.nombre.value.trim());
  }
});

form.addEventListener('reset', () => {
  setTimeout(() => {
    resetFieldStyles();
    referenciaCounter.textContent = '0 / 200 caracteres';
  }, 0);
});

Object.keys(fieldMap).forEach((fieldName) => {
  const field = fieldMap[fieldName];
  if (Array.isArray(field)) return;
  if (!field || fieldName === 'terminos' || fieldName === 'privacidad') return;
  field.addEventListener('blur', () => validateField(fieldName));
});

fieldMap.interes.forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    validateCheckboxGroup();
  });
});

fieldMap.tipoCliente.forEach((radio) => {
  radio.addEventListener('change', () => {
    validateRadioGroup();
  });
});

fieldMap.terminos.addEventListener('change', () => {
  validateTerms();
});

fieldMap.privacidad.addEventListener('change', () => {
  validateTerms();
});
