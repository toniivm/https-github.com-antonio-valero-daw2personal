// Clase para representar un libro
export class Book {
  constructor(id, title, author, category, pages, year, coverUrl, isRead = false) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.category = category;
    this.pages = pages;
    this.year = year;
    this.coverUrl = coverUrl;
    this.isRead = isRead;
    // Guardo cuando se añadió
    this.addedDate = new Date().toISOString();
    // Si ya está leído, guardo la fecha
    this.readDate = isRead ? new Date().toISOString() : null;
  }

  markAsRead() {
    this.isRead = true;
    this.readDate = new Date().toISOString();
  }

  markAsUnread() {
    this.isRead = false;
    this.readDate = null;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      category: this.category,
      pages: this.pages,
      year: this.year,
      coverUrl: this.coverUrl,
      isRead: this.isRead,
      addedDate: this.addedDate,
      readDate: this.readDate
    };
  }

  static fromJSON(json) {
    const book = new Book(
      json.id,
      json.title,
      json.author,
      json.category,
      json.pages,
      json.year,
      json.coverUrl,
      json.isRead
    );
    book.addedDate = json.addedDate;
    book.readDate = json.readDate;
    return book;
  }
}
