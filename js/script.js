const jsonSelect = document.getElementById('json-select');
const brandSelect = document.getElementById('brand-select');
const modelSelect = document.getElementById('model-select');
const yearSelect = document.getElementById('year-select');
const fetchButton = document.getElementById('fetch-json-btn');
const tableBody = document.querySelector('#car-table tbody');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modal-image');
const closeModal = document.getElementById('close-modal');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');

let carData = {}; // Змінна для збереження JSON-даних
let imageList = []; // Масив для збереження відфільтрованих зображень
let currentIndex = 0; // Індекс поточного зображення

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
        const years = new Set();

        Object.keys(carData).forEach(key => {
            const [brand, model, year] = key.split('/');
            if (brand === selectedBrand) {
                models.add(model);
                years.add(year);
            }
        });

        // Оновлення списку моделей
        Array.from(models).sort().forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });

        // Оновлення списку років
        Array.from(years).sort().forEach(year => {
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

        // Оновлення списку років
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
    imageList = []; // Очищення списку зображень
    currentIndex = 0; // Скидання індексу

    let hasData = false;

    Object.entries(carData).forEach(([key, value]) => {
        const [brand, model, year] = key.split('/');

        // Пропускаємо записи без фотографій або з "rendered size=1x1 px"
        if (!value || value.trim() === '' || value.includes('rendered size') || value.includes('1x1')) {
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

            // Додаємо зображення до списку
            imageList.push(value);
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
        currentIndex = imageList.indexOf(event.target.src); // Встановлюємо індекс поточного зображення
        modalImage.src = event.target.src;
        modal.style.display = 'flex'; // Встановлюємо відображення модального вікна
    }
});

// Закриття модального вікна
closeModal.addEventListener('click', () => {
    modal.style.display = 'none'; // Ховаємо модальне вікно
});

// Закриття модального вікна при натисканні поза зображенням
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none'; // Ховаємо модальне вікно
    }
});

// Перегортання на попереднє зображення
prevButton.addEventListener('click', () => {
    if (imageList.length > 0) {
        currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
        modalImage.src = imageList[currentIndex];
    }
});

// Перегортання на наступне зображення
nextButton.addEventListener('click', () => {
    if (imageList.length > 0) {
        currentIndex = (currentIndex + 1) % imageList.length;
        modalImage.src = imageList[currentIndex];
    }
});