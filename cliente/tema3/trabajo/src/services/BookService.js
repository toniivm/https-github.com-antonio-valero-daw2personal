import { Book } from '../models/Book.js';
import { StorageFactory } from '../storage/StorageFactory.js';

/**
 * Servicio para gestionar la colección de libros
 * Utiliza el patrón AbstractFactory para el almacenamiento
 */
export class BookService {
  constructor(storageType = 'local') {
    // Creo el storage con la factory
    this.storage = StorageFactory.createStorage(storageType);
    this.storageKey = 'mybookshelf_books';
    this.books = this.loadBooks();
    console.log('BookService inicializado con', this.books.length, 'libros');
  }

  /**
   * Carga los libros desde el storage
   */
  loadBooks() {
    const data = this.storage.load(this.storageKey);
    if (data && Array.isArray(data)) {
      return data.map(bookData => Book.fromJSON(bookData));
    }
    // Datos iniciales de ejemplo
    return this.getInitialBooks();
  }

  /**
   * Guarda los libros en el storage
   */
  saveBooks() {
    const booksData = this.books.map(book => book.toJSON());
    return this.storage.save(this.storageKey, booksData);
  }

  /**
   * Obtiene todos los libros
   */
  getAllBooks() {
    return [...this.books];
  }

  /**
   * Obtiene un libro por ID
   */
  getBookById(id) {
    return this.books.find(book => book.id === id);
  }

  // Añade un libro nuevo a la colección
  addBook(bookData) {
    const newId = this.generateId();
    // Si no hay portada uso una por defecto
    const coverUrl = bookData.coverUrl ? bookData.coverUrl : this.getDefaultCover(bookData.category);
    
    const newBook = new Book(
      newId,
      bookData.title,
      bookData.author,
      bookData.category,
      bookData.pages,
      bookData.year,
      coverUrl,
      bookData.isRead || false
    );
    this.books.push(newBook);
    this.saveBooks();
    console.log('Libro añadido:', bookData.title); // debug
    return newBook;
  }

  /**
   * Actualiza un libro existente
   */
  updateBook(id, bookData) {
    const index = this.books.findIndex(book => book.id === id);
    if (index !== -1) {
      const existingBook = this.books[index];
      Object.assign(existingBook, bookData);
      this.saveBooks();
      return existingBook;
    }
    return null;
  }

  /**
   * Elimina un libro
   */
  deleteBook(id) {
    const index = this.books.findIndex(book => book.id === id);
    if (index !== -1) {
      // encontrado, lo borro
      const deletedBook = this.books[index]; // guardo referencia por si acaso
      this.books.splice(index, 1);
      this.saveBooks();
      return true;
    }
    return false;
  }

  /**
   * Marca un libro como leído
   */
  markAsRead(id) {
    const book = this.getBookById(id);
    if (book) {
      console.log('Marcando como leído:', id);
      book.markAsRead();
      this.saveBooks();
      console.log('Guardado. Estado final:', book.isRead);
      return true;
    }
    return false;
  }

  /**
   * Marca un libro como no leído
   */
  markAsUnread(id) {
    const book = this.getBookById(id);
    if (book) {
      console.log('Marcando como no leído:', id);
      book.markAsUnread();
      this.saveBooks();
      console.log('Guardado. Estado final:', book.isRead);
      return true;
    }
    return false;
  }

  // Busco libros por titulo, autor o categoria
  searchBooks(searchTerm) {
    const term = searchTerm.toLowerCase();
    // Filtro por cualquiera de los tres campos
    return this.books.filter(book => 
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      book.category.toLowerCase().includes(term)
    );
  }

  /**
   * Filtra libros por categoría
   */
  filterByCategory(category) {
    // si no hay categoria o es 'all', devuelvo todos
    if (!category || category === 'all') {
      return this.getAllBooks();
    }
    else{
      return this.books.filter(book => book.category === category);
    }
  }

  /**
   * Filtra libros por estado de lectura
   */
  filterByReadStatus(isRead) {
    return this.books.filter(book => book.isRead === isRead);
  }

  /**
   * Obtiene todas las categorías únicas
   */
  getCategories() {
    const categories = new Set(this.books.map(book => book.category));
    return Array.from(categories).sort();
  }

  // Estadisticas de la biblioteca
  getStatistics() {
    const totalBooks = this.books.length;
    const readBooks = this.books.filter(book => book.isRead).length;
    const unreadBooks = totalBooks - readBooks;
    // let percentage = (readBooks / totalBooks) * 100; // lo calculo despues
    const totalPages = this.books.reduce((sum, book) => sum + book.pages, 0);
    const pagesRead = this.books
      .filter(book => book.isRead)
      .reduce((sum, book) => sum + book.pages, 0);

    const categoriesCount = {};
    this.books.forEach(book => {
      categoriesCount[book.category] = (categoriesCount[book.category] || 0) + 1;
    });

    return {
      totalBooks,
      readBooks,
      unreadBooks,
      totalPages,
      pagesRead,
      pagesUnread: totalPages - pagesRead,
      readPercentage: totalBooks > 0 ? ((readBooks / totalBooks) * 100).toFixed(1) : 0,
      categoriesCount
    };
  }

  /**
   * Genera un ID único
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Obtiene una portada por defecto según categoría
   */
  getDefaultCover(category) {
    const covers = {
      'Ficción': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      'No Ficción': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=400&fit=crop',
      'Ciencia': 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop',
      'Tecnología': 'https://images.unsplash.com/photo-1485988412941-77a35537dae4?w=300&h=400&fit=crop',
      'Historia': 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=300&h=400&fit=crop',
      'Biografía': 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=300&h=400&fit=crop',
      'Fantasía': 'https://images.unsplash.com/photo-1518373714866-3f1478910cc0?w=300&h=400&fit=crop',
      'Romance': 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=300&h=400&fit=crop'
    };
    return covers[category] || 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=400&fit=crop';
  }

  /**
   * Datos iniciales de ejemplo
   */
  getInitialBooks() {
    // TODO: podria sacar estos libros de ejemplo de una API
    // De momento los dejo hardcodeados
    return [
      new Book(
        this.generateId(),
        'El Quijote',
        'Miguel de Cervantes',
        'Ficción',
        863,
        1605,
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
        true
      ),
      new Book(
        this.generateId(),
        'Sapiens',
        'Yuval Noah Harari',
        'Historia',
        466,
        2011,
        'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=300&h=400&fit=crop',
        false
      ),
      new Book(
        this.generateId(),
        'Clean Code',
        'Robert C. Martin',
        'Tecnología',
        464,
        2008,
        'https://images.unsplash.com/photo-1485988412941-77a35537dae4?w=300&h=400&fit=crop',
        true
      ),
      new Book(
        this.generateId(),
        'El Hobbit',
        'J.R.R. Tolkien',
        'Fantasía',
        310,
        1937,
        'https://images.unsplash.com/photo-1518373714866-3f1478910cc0?w=300&h=400&fit=crop',
        false
      ),
      new Book(
        this.generateId(),
        '1984',
        'George Orwell',
        'Ficción',
        328,
        1949,
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
        true
      ),
      new Book(
        this.generateId(),
        'El Principito',
        'Antoine de Saint-Exupéry',
        'Ficción',
        96,
        1943,
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
        false
      )
    ];
  }

  /**
   * Limpia todos los datos
   */
  clearAllData() {
    this.books = [];
    this.saveBooks();
  }

  /**
   * Reinicia con datos de ejemplo
   */
  resetToDefault() {
    this.books = this.getInitialBooks();
    this.saveBooks();
  }

  // funcion helper para debuggear si hace falta
  debugBooks(){
    console.table(this.books); // console.table es muy util
    return this.books;
  }
}
