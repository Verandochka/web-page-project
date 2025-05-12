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
const userPageBtn = document.getElementById('user-page-btn');
const mainContainer = document.getElementById('main-container');
const userPageContainer = document.getElementById('user-page-container');
const addCarBtn = document.getElementById('add-car-btn');
const addCarModal = document.getElementById('add-car-modal');
const saveCarBtn = document.getElementById('save-car-btn');
const carBrandInput = document.getElementById('car-brand-input');
const carModelInput = document.getElementById('car-model-input');
const carYearInput = document.getElementById('car-year-input');
const carImageInput = document.getElementById('car-image-input');

let carData = {}; // Змінна для збереження JSON-даних
let imageList = []; // Масив для збереження відфільтрованих зображень
let currentIndex = 0; // Індекс поточного зображення
let userCarData = {}; // Зберігає дані, додані користувачем

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

    // Фільтруємо дані перед перевіркою розміру зображення
    const filteredData = Object.entries(carData).filter(([key, value]) => {
        const [brand, model, year] = key.split('/');
        return (
            value &&
            value.trim() !== '' &&
            (selectedBrand === 'all' || brand === selectedBrand) &&
            (selectedModel === 'all' || model === selectedModel) &&
            (selectedYear === 'all' || year === selectedYear)
        );
    });

    // Перевіряємо розмір зображення тільки для відфільтрованих даних
    let pendingImages = filteredData.length; // Лічильник для асинхронного завантаження
    if (pendingImages === 0) {
        alert('No data found for the selected filters.');
        return;
    }

    filteredData.forEach(([key, value]) => {
        const img = new Image();
        img.src = value;
        img.onload = () => {
            pendingImages--;
            if (img.width !== 1 || img.height !== 1) {
                // Додаємо тільки зображення, які не мають розмір 1x1 px
                const cell = document.createElement('td');
                cell.innerHTML = `<img src="${value}" alt="${key}" class="thumbnail" />`;
                tableBody.appendChild(cell);

                // Додаємо зображення до списку
                imageList.push(value);
                hasData = true;
            }

            // Якщо всі зображення оброблено і жодного не додано
            if (pendingImages === 0 && !hasData) {
                alert('No data found for the selected filters.');
            }
        };

        img.onerror = () => {
            pendingImages--;
            // Якщо всі зображення оброблено і жодного не додано
            if (pendingImages === 0 && !hasData) {
                alert('No data found for the selected filters.');
            }
        };
    });

    const carTable = document.getElementById('car-table');
    carTable.classList.remove('hidden');
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
    showPreviousImage();
});

// Перегортання на наступне зображення
nextButton.addEventListener('click', () => {
    showNextImage();
});

// Перегортання за допомогою клавіш стрілок
document.addEventListener('keydown', (event) => {
    if (modal.style.display === 'flex') {
        if (event.key === 'ArrowLeft') {
            showPreviousImage();
        } else if (event.key === 'ArrowRight') {
            showNextImage();
        }
    }
});

// Функція для показу попереднього зображення
function showPreviousImage() {
    if (imageList.length > 0) {
        currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
        modalImage.src = imageList[currentIndex];
    }
}

// Функція для показу наступного зображення
function showNextImage() {
    if (imageList.length > 0) {
        currentIndex = (currentIndex + 1) % imageList.length;
        modalImage.src = imageList[currentIndex];
    }
}

// Перехід на сторінку користувачів
userPageBtn.addEventListener('click', () => {
    mainContainer.classList.add('hidden');
    userPageContainer.classList.remove('hidden');
});

// Відкриття модального вікна для додавання машини
addCarBtn.addEventListener('click', () => {
    addCarModal.classList.remove('hidden'); // Показуємо модальне вікно
});

// Збереження даних машини
saveCarBtn.addEventListener('click', () => {
    const brand = carBrandInput.value.trim();
    const model = carModelInput.value.trim();
    const year = carYearInput.value.trim();
    const imageFile = carImageInput.files[0];

    if (!brand || !model || !year || !imageFile) {
        alert('Please fill in all fields and select an image.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const imageUrl = event.target.result;

        // Додавання даних до userCarData
        const key = `${brand}/${model}/${year}`;
        userCarData[key] = imageUrl;

        // Оновлення фільтрів
        updateUserFilters();

        // Закриття модального вікна
        addCarModal.classList.add('hidden');
        carBrandInput.value = '';
        carModelInput.value = '';
        carYearInput.value = '';
        carImageInput.value = '';
    };

    reader.readAsDataURL(imageFile);
});

// Оновлення фільтрів на сторінці користувачів
function updateUserFilters() {
    const userBrandSelect = document.getElementById('user-brand-select');
    const userModelSelect = document.getElementById('user-model-select');
    const userYearSelect = document.getElementById('user-year-select');

    const brands = new Set();
    const models = new Set();
    const years = new Set();

    Object.keys(userCarData).forEach((key) => {
        const [brand, model, year] = key.split('/');
        brands.add(brand);
        models.add(model);
        years.add(year);
    });

    userBrandSelect.innerHTML = '<option value="all">All</option>';
    Array.from(brands).sort().forEach((brand) => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        userBrandSelect.appendChild(option);
    });

    userModelSelect.innerHTML = '<option value="all">All</option>';
    Array.from(models).sort().forEach((model) => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        userModelSelect.appendChild(option);
    });

    userYearSelect.innerHTML = '<option value="all">All</option>';
    Array.from(years).sort().forEach((year) => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        userYearSelect.appendChild(option);
    });
}