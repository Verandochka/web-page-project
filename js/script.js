const jsonSelect = document.getElementById('json-select');
const brandSelect = document.getElementById('brand-select');
const modelSelect = document.getElementById('model-select');
const yearSelect = document.getElementById('year-select');
const fetchButton = document.getElementById('fetch-json-btn');
const tableBody = document.querySelector('#car-table tbody');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modal-image');
const closeModal = document.getElementById('close-modal');

let carData = {}; // Змінна для збереження JSON-даних

// Функція для завантаження JSON і оновлення фільтрів
function loadJsonData(jsonFile) {
    fetch(`js/${jsonFile}`)
        .then(response => response.json())
        .then(data => {
            carData = data;

            // Оновлення списку брендів
            const brands = new Set();
            Object.keys(carData).forEach(key => {
                const [brand] = key.split('/');
                brands.add(brand);
            });

            brandSelect.innerHTML = '<option value="all">All</option>';
            Array.from(brands).sort().forEach(brand => {
                const option = document.createElement('option');
                option.value = brand;
                option.textContent = brand;
                brandSelect.appendChild(option);
            });

            modelSelect.innerHTML = '<option value="all">All</option>';
            yearSelect.innerHTML = '<option value="all">All</option>';
            modelSelect.disabled = true;
            yearSelect.disabled = true;
        })
        .catch(error => console.error('Error loading JSON:', error));
}

// Завантаження початкового JSON
loadJsonData(jsonSelect.value);

// Зміна JSON-файлу
jsonSelect.addEventListener('change', () => {
    loadJsonData(jsonSelect.value);
});

// Увімкнення вибору моделі при зміні бренду
brandSelect.addEventListener('change', () => {
    const selectedBrand = brandSelect.value;
    modelSelect.innerHTML = '<option value="all">All</option>';
    yearSelect.innerHTML = '<option value="all">All</option>';

    if (selectedBrand !== 'all') {
        const models = new Set();
        const years = new Map();

        Object.keys(carData).forEach(key => {
            const [brand, model, year] = key.split('/');
            if (brand === selectedBrand) {
                models.add(model);
                if (!years.has(year)) {
                    years.set(year, new Set());
                }
                years.get(year).add(model);
            }
        });

        Array.from(models).sort().forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });

        Array.from(years.keys()).sort().forEach(year => {
            if (years.get(year).size > 0) {
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
    yearSelect.innerHTML = '<option value="all">All</option>';

    if (selectedModel !== 'all') {
        const years = new Set();

        Object.keys(carData).forEach(key => {
            const [brand, model, year] = key.split('/');
            if (brand === selectedBrand && model === selectedModel) {
                years.add(year);
            }
        });

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

// Функція для фільтрації та виведення даних
fetchButton.addEventListener('click', () => {
    const selectedBrand = brandSelect.value;
    const selectedModel = modelSelect.value;
    const selectedYear = yearSelect.value;

    tableBody.innerHTML = ''; // Очищення таблиці

    let hasData = false;

    Object.entries(carData).forEach(([key, value]) => {
        const [brand, model, year] = key.split('/');

        // Пропускаємо записи без фотографій або з "rendered size"
        if (!value || value.trim() === '' || value.includes('rendered size')) {
            return;
        }

        if (
            (selectedBrand === 'all' || brand === selectedBrand) &&
            (selectedModel === 'all' || model === selectedModel) &&
            (selectedYear === 'all' || year === selectedYear)
        ) {
            const cell = document.createElement('td');
            cell.innerHTML = `<img src="${value}" alt="${model}" class="thumbnail" />`;
            tableBody.appendChild(cell);
            hasData = true;
        }
    });

    const carTable = document.getElementById('car-table');
    carTable.classList.remove('hidden');

    if (!hasData) {
        alert('No data found for the selected filters.');
    }
});

// Відкриття модального вікна при натисканні на зображення
tableBody.addEventListener('click', (event) => {
    if (event.target.tagName === 'IMG') {
        modalImage.src = event.target.src;
        modal.classList.remove('hidden');
    }
});

// Закриття модального вікна
closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Закриття модального вікна при натисканні поза зображенням
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.classList.add('hidden');
    }
});