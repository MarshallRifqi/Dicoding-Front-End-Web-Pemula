const books = [];
const RENDER_EVENT = 'render-book';


document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('input-buku');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        tambahBuku();
    });

    const searchForm = document.getElementById('cari-buku');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const jdl = document.getElementById('search-judul').value;
        const teks = JSON.parse(localStorage.getItem("BOOKSHELF_APPS"));

        Array.from(teks).forEach((book) => {
            const titleBook = book.judulBuku;

            if (titleBook.indexOf(jdl) != -1) {
                const uncompletedListBuku = document.getElementById('incomplete-list-kondisi');
                uncompletedListBuku.innerHTML = '';

                const completedListBuku = document.getElementById('complete-list-kondisi');
                completedListBuku.innerHTML = '';
                const bookElement = buatBuku(book);

                if (!book.isCompleted)
                    uncompletedListBuku.append(bookElement);
                else
                    completedListBuku.append(bookElement);
            }
        });
    });


    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function generateId() {
    return +new Date();
}


function tambahBuku() {
    const judulBuku = document.getElementById('input-judul').value;
    const penulisBuku = document.getElementById('input-penulis').value;
    const tahunTerbit = parseInt(document.getElementById('input-tahun').value);
    const isComplete = document.getElementById('input-kondisi').checked;

    const generatedID = generateId();
    const bookObject = generateBukuObject(generatedID, judulBuku, penulisBuku, tahunTerbit, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateBukuObject(id, judulBuku, penulisBuku, tahunTerbit, isCompleted) {
    return {
        id,
        judulBuku,
        penulisBuku,
        tahunTerbit,
        isCompleted
    }
}

function buatBuku(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.judulBuku;

    const textPenulis = document.createElement('p');
    textPenulis.innerText = 'Penulis : ' + bookObject.penulisBuku;

    const textTahun = document.createElement('p');
    textTahun.innerText = 'Tahun Terbit : ' + bookObject.tahunTerbit;

    const actionContainer = document.createElement('div');
    actionContainer.setAttribute('class', 'action');

    const container = document.createElement('article');
    container.setAttribute('class', 'book_item');
    container.classList.add('item', 'shadow');
    container.append(textTitle, textPenulis, textTahun);
    container.setAttribute('id', `book-${bookObject.id}`);

    if (bookObject.isCompleted) {

        const incompletedButton = document.createElement('button');
        incompletedButton.classList.add('green');
        incompletedButton.innerText = 'Belum selesai dibaca';
        incompletedButton.addEventListener('click', function () {
            undoBukuCompleted(bookObject.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('red');
        deleteButton.innerText = 'Hapus';
        deleteButton.addEventListener('click', function () {
            if (confirm("Yakin ingin menghapus?")) {
                hapusBukuCompleted(bookObject.id);
            }
        });

        actionContainer.append(incompletedButton, deleteButton);
        container.append(actionContainer);
    } else {
        const completedButton = document.createElement('button');
        completedButton.classList.add('green');
        completedButton.innerText = 'Selesai dibaca';

        completedButton.addEventListener('click', function () {
            tambahBukuCompleted(bookObject.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('red');
        deleteButton.innerText = 'Hapus';
        deleteButton.addEventListener('click', function () {
            if (confirm("Yakin ingin menghapus?")) {
                hapusBukuCompleted(bookObject.id);
            }
        });

        actionContainer.append(completedButton, deleteButton);
        container.append(actionContainer);
    }

    return container;
}

function tambahBukuCompleted(bookId) {
    const targetBuku = cariBuku(bookId);

    if (targetBuku == null) return;

    targetBuku.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function hapusBukuCompleted(bookId) {
    const targetBuku = Index(bookId);

    if (targetBuku === -1) return;

    books.splice(targetBuku, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBukuCompleted(bookId) {
    const targetBuku = cariBuku(bookId);

    if (targetBuku == null) return;

    targetBuku.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function cariBuku(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}


function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function Index(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedListBuku = document.getElementById('incomplete-list-kondisi');
    uncompletedListBuku.innerHTML = '';

    const completedListBuku = document.getElementById('complete-list-kondisi');
    completedListBuku.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = buatBuku(bookItem);

        if (!bookItem.isCompleted)
            uncompletedListBuku.append(bookElement);
        else
            completedListBuku.append(bookElement);
    }
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}