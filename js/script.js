const brandSelect = document.getElementById('brand-select');
const modelSelect = document.getElementById('model-select');
const yearSelect = document.getElementById('year-select');
const fetchButton = document.getElementById('fetch-json-btn');
const tableBody = document.querySelector('#car-table tbody');

let carData = {}; // Змінна для збереження JSON-даних

// Завантаження JSON і заповнення випадаючих списків
fetch('js/image_sources.json')
    .then(response => response.json())
    .then(data => {
        carData = data;

        // Отримання унікальних брендів
        const brands = new Set();
        Object.keys(carData).forEach(key => {
            const [brand] = key.split('/');
            brands.add(brand);
        });

        // Заповнення списку брендів (у алфавітному порядку)
        Array.from(brands).sort().forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandSelect.appendChild(option);
        });

        // Увімкнення вибору моделі при зміні бренду
        brandSelect.addEventListener('change', () => {
            const selectedBrand = brandSelect.value;
            modelSelect.innerHTML = '<option value="all">All</option>'; // Очищення списку моделей
            yearSelect.innerHTML = '<option value="all">All</option>'; // Очищення списку років

            if (selectedBrand !== 'all') {
                const models = new Set();
                const years = new Map(); // Використовуємо Map для зв'язку років із моделями

                Object.keys(carData).forEach(key => {
                    const [brand, model, year] = key.split('/');
                    if (brand === selectedBrand) {
                        models.add(model);
                        if (!years.has(year)) {
                            years.set(year, new Set());
                        }
                        years.get(year).add(model); // Додаємо модель до відповідного року
                    }
                });

                // Заповнення списку моделей (у алфавітному порядку)
                Array.from(models).sort().forEach(model => {
                    const option = document.createElement('option');
                    option.value = model;
                    option.textContent = model;
                    modelSelect.appendChild(option);
                });

                // Заповнення списку років (тільки якщо є моделі для цього року)
                Array.from(years.keys()).sort().forEach(year => {
                    if (years.get(year).size > 0) { // Перевіряємо, чи є моделі для цього року
                        const option = document.createElement('option');
                        option.value = year;
                        option.textContent = year;
                        yearSelect.appendChild(option);
                    }
                });

                modelSelect.disabled = false;
                yearSelect.disabled = false;
            } else {
                modelSelect.disabled = true;
                yearSelect.disabled = true;
            }
        });

        // Увімкнення вибору року при зміні моделі
        modelSelect.addEventListener('change', () => {
            const selectedBrand = brandSelect.value;
            const selectedModel = modelSelect.value;
            yearSelect.innerHTML = '<option value="all">All</option>'; // Очищення списку років

            if (selectedModel !== 'all') {
                const years = new Set();

                Object.keys(carData).forEach(key => {
                    const [brand, model, year] = key.split('/');
                    if (brand === selectedBrand && model === selectedModel) {
                        years.add(year);
                    }
                });

                // Заповнення списку років (у алфавітному порядку)
                Array.from(years).sort().forEach(year => {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    yearSelect.appendChild(option);
                });

                yearSelect.disabled = false;
            } else {
                yearSelect.disabled = true;
            }
        });
    })
    .catch(error => console.error('Error loading JSON:', error));

// Функція для фільтрації та виведення даних
fetchButton.addEventListener('click', () => {
    const selectedBrand = brandSelect.value;
    const selectedModel = modelSelect.value;
    const selectedYear = yearSelect.value;

    tableBody.innerHTML = ''; // Очищення таблиці

    let hasData = false; // Перевірка, чи є дані для відображення

    Object.entries(carData).forEach(([key, value]) => {
        const [brand, model, year] = key.split('/');

        // Фільтрація за брендом, моделлю та роком
        if (
            (selectedBrand === 'all' || brand === selectedBrand) &&
            (selectedModel === 'all' || model === selectedModel) &&
            (selectedYear === 'all' || year === selectedYear)
        ) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${brand}</td>
                <td>${model}</td>
                <td>${year}</td>
                <td>${value ? `<img src="${value}" alt="${model}" />` : 'Фотографія ще не додана'}</td>
            `;
            tableBody.appendChild(row);
            hasData = true; // Дані знайдено
        }
    });

    // Показати таблицю, якщо є дані
    const carTable = document.getElementById('car-table');
    carTable.classList.remove('hidden');

    if (!hasData) {
        alert('No data found for the selected filters.');
    }
});