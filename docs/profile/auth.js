document.addEventListener('DOMContentLoaded', () => {
    // Общие функции для login.html и register.html
    
    // Обработка формы входа
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                
                if (data.success) {
                    localStorage.setItem('authToken', data.token);
                    window.location.href = 'index.html';
                } else {
                    showError(data.error || 'Ошибка входа');
                }
            } catch (error) {
                showError('Ошибка соединения с сервером');
            }
        });
    }

    // Обработка формы регистрации
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                showError('Пароли не совпадают');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                
                if (data.success) {
                    window.location.href = 'login.html';
                } else {
                    showError(data.error || 'Ошибка регистрации');
                }
            } catch (error) {
                showError('Ошибка соединения с сервером');
            }
        });
    }

    function showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = 'red';
        errorElement.style.marginTop = '10px';
        
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            const existingError = form.querySelector('.error-message');
            if (existingError) existingError.remove();
            form.appendChild(errorElement);
        });
    }
});
