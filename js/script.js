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

        // Заповнення списку брендів
        brands.forEach(brand => {
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
                const years = new Set();

                Object.keys(carData).forEach(key => {
                    const [brand, model, year] = key.split('/');
                    if (brand === selectedBrand) {
                        models.add(model);
                        years.add(year);
                    }
                });

                models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model;
                    option.textContent = model;
                    modelSelect.appendChild(option);
                });

                years.forEach(year => {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    yearSelect.appendChild(option);
                });

                modelSelect.disabled = false;
                yearSelect.disabled = false;
            } else {
                modelSelect.disabled = true;
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
                <td><img src="${value}" alt="${model}"></td>
            `;
            tableBody.appendChild(row);
            hasData = true; // Дані знайдено
        }
    });

    // Показати таблицю, якщо є дані
    const carTable = document.getElementById('car-table');
    if (hasData) {
        carTable.classList.remove('hidden');
    } else {
        carTable.classList.add('hidden');
        alert('No data found for the selected filters.');
    }
});